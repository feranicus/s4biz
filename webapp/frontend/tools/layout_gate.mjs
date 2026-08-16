#!/usr/bin/env node
/* GATE 2 — the header row is arithmetic, and every route must be reachable.
 *
 * A fixed-height horizontal bar has a WIDTH BUDGET. Brand plus every control plus the gaps has to
 * fit inside it, in the LONGEST language, at the NARROWEST breakpoint. German runs about 30%
 * longer than English and overflows first, and when it overflows the second line escapes the
 * 62px box and lands on the page content. That has shipped here before, twice, because nobody
 * added up the row before adding a control to it.
 *
 * This gate also asserts the two chrome controls are still visibly siblings, and that every
 * public route is reachable from the header nav or the More menu. Three of the four places a
 * route has to be registered fail SILENTLY.
 */
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

// fileURLToPath, never new URL(...).pathname: a file URL is percent encoded, so a folder with a
// space in its name arrives as %20 and every read fails on a path that visibly exists.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "..", "src");
const fails = [];
const fail = (m) => fails.push(m);

/* STRIP COMMENTS BEFORE PARSING.
 *
 * A selector capture runs from the previous closing brace, so it swallows any comment block that
 * sits above the rule. Our comments contain commas, and splitting a selector list on commas then
 * produces fragments like "* / .lang-trigger" which match nothing. The gate then reports "cannot
 * read min-height" about a property that is right there. This is the same rule that applies to
 * every grep over source in this repository: strip the prose first, then read the code. */
const CSS = readFileSync(path.join(SRC, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const { EN } = await import(pathToFileURL(path.join(SRC, "locales", "en.js")).href);
const { DE } = await import(pathToFileURL(path.join(SRC, "locales", "de.js")).href);
const PACKS = { en: EN, de: DE };

/* Merge EVERY rule for a selector, in source order.
 *
 * A selector legitimately has several rules (a base one and a media-query override), and reading
 * only the FIRST is wrong in both directions: it misses a property set later, and it reports a
 * mismatch between two controls that render identically. It also must not match on a substring:
 * `.more-t{` appears inside `#hd .btn,#hd .more-t{`, but `.lang-trigger{` does not, because that
 * entry is followed by a comma. Split the selector list properly. */
function ruleFor(sel) {
  let body = "";
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(CSS))) {
    const selectors = m[1].split(",").map((s) => s.trim());
    if (selectors.includes(sel)) body += m[2] + ";";
  }
  return body;
}

function prop(sel, name) {
  const body = ruleFor(sel);
  if (!body) return null; // "not found" is different from "not set". Never conflate them.
  const m = new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`, "g");
  let last = null;
  let x;
  while ((x = m.exec(body))) last = x[1].trim();
  return last;
}

// --------------------------------------------------------------------------------------------
// 1. the row fits
// --------------------------------------------------------------------------------------------
const wrapMax = Number((prop(".wrap", "max-width") || "1180px").replace(/[^\d]/g, "")) || 1180;
const padRaw = (CSS.match(/--pad:\s*(\d+)px/) || [])[1];
const pad = Number(padRaw || 22);

// Rough but honest metrics for the fonts in use, measured against a rendered sample rather than
// guessed: Inter at 0.93rem averages about 7.4px per character for mixed-case UI text.
const CH_NAV = 7.4;
const CH_CTL = 6.9;

function textW(s, ch) {
  return Math.ceil(s.length * ch);
}

/* THE TIGHTEST CASE IS JUST ABOVE WHERE THE NAV HIDES, and the first version of this table
 * missed it completely.
 *
 * The stylesheet hides plain nav links at max-width 1000px, so the hardest moment for the row is
 * a viewport of 1001px: every nav item is still rendered and the wrap is at its narrowest. The
 * table only had 1180 (maximum room) and 1000 (nav already gone), so a nav label long enough to
 * break the row at 1001px sailed through both. Proven by mutation: a long German label was NOT
 * caught before this row existed, and is caught now. */
const NAV_HIDE = Number((CSS.match(/max-width:\s*(\d+)px\)\s*\{\s*#hd nav a/) || [])[1] || 1000);
const BREAKS = [
  { w: 1180, navVisible: true, ctaVisible: true, langShort: false },
  { w: NAV_HIDE + 1, navVisible: true, ctaVisible: true, langShort: false },
  { w: NAV_HIDE, navVisible: false, ctaVisible: true, langShort: false },
  { w: 360, navVisible: false, ctaVisible: false, langShort: true },
];

/* READ THE NAV FROM THE COMPONENT, never restate it here.
 *
 * This was a hardcoded list, and when the header gained AI, Cloud and Cyber it went on measuring
 * the four items that used to be there and reported a comfortable pass. A check that restates its
 * own expectation instead of reading its subject cannot fail for the right reason, and this file
 * exists precisely because the row is arithmetic. */
const HEADER_SRC = readFileSync(path.join(SRC, "components", "SiteHeader.jsx"), "utf8");
const NAV_KEYS = [...HEADER_SRC.matchAll(/key:\s*"(nav\.[a-z]+)"/g)].map((m) => m[1]);
if (NAV_KEYS.length < 2) {
  fail(`only ${NAV_KEYS.length} nav item(s) parsed from SiteHeader.jsx; the gate is misreading it`);
}

for (const b of BREAKS) {
  const budget = Math.min(b.w, wrapMax) - pad * 2;
  for (const [lang, pack] of Object.entries(PACKS)) {
    let row = 0;
    row += 26 + 9 + textW("S4Biz", 9.5); // logo, gap, wordmark
    const gaps = 18;
    if (b.navVisible) {
      row += gaps;
      row += NAV_KEYS.reduce((n, k) => n + textW(pack[k], CH_NAV) + 22, 0);
    }
    row += gaps;
    // lang trigger: padding 11+11, gap 6, chevron 10, label
    const langLabel = b.langShort ? "DE" : lang === "de" ? "Deutsch" : "English";
    row += 22 + 6 + 10 + textW(langLabel, CH_CTL);
    row += 9;
    row += 22 + 6 + 10 + textW(pack["nav.more"], CH_CTL);
    if (b.ctaVisible) row += 9 + 32 + textW(pack["nav.cta"], CH_CTL);

    const pct = Math.round((row / budget) * 100);
    const tag = `${b.w}px/${lang}`;
    if (row > budget) {
      fail(`header row ${tag}: ${row}px of ${budget}px available (${pct}%). It will wrap.`);
    } else {
      console.log(`  header ${tag.padEnd(12)} ${String(row).padStart(4)}px of ${budget}px (${pct}%)`);
    }
  }
}

// The belt to those braces: the row must be told never to wrap.
if (!/nowrap/.test(ruleFor("#hd .wrap"))) {
  fail("#hd .wrap does not set flex-wrap:nowrap. A wrapped fixed-height row lands on the page.");
}

// --------------------------------------------------------------------------------------------
// 2. the two chrome controls are still siblings
// --------------------------------------------------------------------------------------------
const MATCH = ["min-height", "padding", "border-radius", "border", "font-size", "font-weight"];
for (const p of MATCH) {
  const a = prop(".lang-trigger", p);
  const b = prop(".more-t", p);
  if (a === null || b === null) {
    // A comparison that reads "not found" on BOTH sides reports "match" and proves nothing. This
    // has produced a vacuous pass here before, so an unreadable selector is a failure.
    fail(`cannot read ${p} for .lang-trigger and/or .more-t. The gate cannot see its subject.`);
  } else if (a !== b) {
    fail(`.lang-trigger and .more-t disagree on ${p}: "${a}" vs "${b}"`);
  }
}

// The More trigger must never be a `.btn` again: `.btn` is a 999px radius on a small box, which
// renders as a circle and reads as a broken element rather than a menu.
const MM = readFileSync(path.join(SRC, "components", "MoreMenu.jsx"), "utf8");
const btnEl = MM.match(/<button[\s\S]*?>/);
if (!btnEl) fail("MoreMenu.jsx has no <button>. Aim the check at the element, not the file.");
else if (/className="[^"]*\bbtn\b/.test(btnEl[0])) {
  fail("MoreMenu's trigger is a .btn again. It must mirror .lang-trigger.");
}

// --------------------------------------------------------------------------------------------
// 3. every public route is reachable, and registered everywhere it has to be
// --------------------------------------------------------------------------------------------
const APP = readFileSync(path.join(SRC, "App.jsx"), "utf8");
const routes = [...APP.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);
if (routes.length < 5) fail(`App.jsx: only ${routes.length} route(s) parsed. The gate is misreading it.`);

const HEADER = readFileSync(path.join(SRC, "components", "SiteHeader.jsx"), "utf8");
const navTo = [...HEADER.matchAll(/to:\s*"([^"]+)"/g)].map((m) => m[1]);
const moreTo = [...MM.matchAll(/to:\s*"([^"]+)"/g)].map((m) => m[1]);
const TABS = readFileSync(path.join(SRC, "components", "TabBar.jsx"), "utf8");
const tabTo = [...TABS.matchAll(/to:\s*"([^"]+)"/g)].map((m) => m[1]);
const reachable = new Set([...navTo, ...moreTo, ...tabTo, "/"]);

for (const r of routes) {
  if (!reachable.has(r)) fail(`route ${r} is registered but no header link, menu item or tab reaches it.`);
}
for (const l of [...navTo, ...moreTo, ...tabTo]) {
  if (!routes.includes(l)) fail(`a link points at ${l}, which is not a registered route.`);
}

// The sitemap and the backend route list are the two that fail silently.
const SITEMAP = readFileSync(path.join(HERE, "..", "public", "sitemap.xml"), "utf8");
for (const r of routes) {
  const loc = "https://s4biz.io" + (r === "/" ? "/" : r);
  if (!SITEMAP.includes(`<loc>${loc}</loc>`)) fail(`sitemap.xml does not list ${loc}`);
}

const MAIN = path.join(HERE, "..", "..", "backend", "app", "main.py");
if (existsSync(MAIN)) {
  const py = readFileSync(MAIN, "utf8");
  const m = py.match(/_APP_ROUTES\s*=\s*\{([^}]*)\}/);
  if (!m) fail("main.py has no _APP_ROUTES set. Every page route would be served a 404.");
  else {
    const declared = new Set([...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]));
    for (const r of routes) {
      const seg = r.replace(/^\//, "").split("/")[0];
      if (!declared.has(seg)) {
        fail(`main.py _APP_ROUTES is missing "${seg}" (route ${r}). It would be served a 404.`);
      }
    }
  }
}

console.log(`  routes ${routes.length}, reachable ${routes.filter((r) => reachable.has(r)).length}`);
console.log(`  menu reaches: ${moreTo.join(" ")}`);

if (fails.length) {
  console.error(`\n[X] ${fails.length} layout/route defect(s):`);
  fails.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log("  OK  header row fits in every language, every route reachable and registered");
