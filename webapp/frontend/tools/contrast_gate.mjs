#!/usr/bin/env node
/* GATE 3 — colour, measured on the SHIPPED stylesheet rather than on a design document.
 *
 * FIVE QUESTIONS, and they are not the same question reflected:
 *   1. Is every text pair readable? (WCAG 2.x contrast)
 *   2. Is the reserved call-to-action fill still reserved to the button?
 *   3. Is any surface still on a retired palette?
 *   4. Is any TEXT light where nothing gives it a dark surface? (the mirror of 3, and a gate that
 *      only asks 3 is structurally blind to a white-on-white menu, which has shipped here.)
 *   5. Does the app chrome agree with itself? The manifest theme colour, the meta theme-color and
 *      the page canvas are one value in three files and they WILL drift.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

// fileURLToPath, never new URL(...).pathname: a file URL is percent encoded, so a folder with a
// space in its name arrives as %20 and every read fails on a path that visibly exists.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FE = path.join(HERE, "..");
// Strip comments first: a selector capture starts at the previous closing brace, so a comment
// above a rule is read as part of its selector list, and every commas in that prose becomes a
// phantom selector. Same rule as every other source grep here.
const CSS = readFileSync(path.join(FE, "src", "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const HTML = readFileSync(path.join(FE, "index.html"), "utf8");
const MANIFEST = JSON.parse(readFileSync(path.join(FE, "public", "manifest.webmanifest"), "utf8"));

const fails = [];
const fail = (m) => fails.push(m);

// ---- palette, read from :root ---------------------------------------------------------------
const VARS = {};
for (const m of CSS.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) VARS["--" + m[1]] = m[2].trim();

function hex(v) {
  const s = String(v).trim();
  const m = /^#([0-9a-f]{6})$/i.exec(s) || /^#([0-9a-f]{3})$/i.exec(s);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function resolve(v) {
  const m = /var\((--[a-z0-9-]+)\)/i.exec(String(v));
  return hex(m ? VARS[m[1]] : v);
}
function lum([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// ---- 1. text pairs ---------------------------------------------------------------------------
// AA is 4.5:1 for body text and 3:1 for large text. Everything used for a PARAGRAPH is held to
// 4.5 regardless of the size it happens to be rendered at, because a size can change later.
const PAIRS = [
  ["--txt", "--ink", 4.5, "body text on the canvas"],
  ["--txt", "--ink-2", 4.5, "body text on the alternating section"],
  ["--txt", "--ink-3", 4.5, "body text on a card"],
  ["--muted", "--ink", 4.5, "secondary body text"],
  ["--muted", "--ink-2", 4.5, "secondary text on the alternating section"],
  ["--muted", "--ink-3", 4.5, "secondary text on a card"],
  ["--faint", "--ink", 4.5, "labels on the canvas"],
  ["--faint", "--ink-2", 4.5, "labels on the alternating section"],
  ["--cyan", "--ink", 4.5, "accent text on the canvas"],
  ["--cyan", "--ink-3", 4.5, "accent text on a card"],
  ["--cta-ink", "--cta", 4.5, "the call-to-action label on its fill"],
];
for (const [fg, bg, min, what] of PAIRS) {
  const a = resolve(VARS[fg]);
  const b = resolve(VARS[bg]);
  if (!a || !b) {
    fail(`cannot read ${fg} or ${bg}. A check that cannot see its subject is not a check.`);
    continue;
  }
  const r = ratio(a, b);
  const line = `  ${what.padEnd(44)} ${r.toFixed(2)}:1  (min ${min})`;
  if (r < min) fail(`${what}: ${fg} on ${bg} is ${r.toFixed(2)}:1, below ${min}`);
  else console.log(line);
}

// ---- 1b. the brand field ---------------------------------------------------------------------
// A gradient is not one colour, and text on it has to clear the minimum against EVERY stop, not
// against an average. The magenta stop is the one that fails first, and it is exactly the stop
// that makes the palette distinctive, so it is the one worth measuring.
//
// This is also why --field-ink is pure white rather than the off-white used elsewhere: measured,
// #F2F3FF drops to 4.27:1 over the magenta and fails, while #FFFFFF holds at 4.71:1.
const FIELD_STOPS = ["#4F46E5", "#5B3BD4", "#3B2E9E", "#C026D3"];
const fieldInk = resolve(VARS["--field-ink"]);
if (!fieldInk) {
  fail("cannot read --field-ink. Text on the brand field is unmeasured.");
} else {
  let worst = 99;
  let worstStop = "";
  for (const stop of FIELD_STOPS) {
    const r = ratio(fieldInk, hex(stop));
    if (r < worst) {
      worst = r;
      worstStop = stop;
    }
  }
  if (worst < 4.5) {
    fail(
      `--field-ink (${VARS["--field-ink"]}) is only ${worst.toFixed(2)}:1 on the ${worstStop} stop ` +
        `of the brand field. Only pure white clears 4.5 across every stop.`
    );
  } else {
    console.log(`  ${"text on the brand field (worst stop)".padEnd(44)} ${worst.toFixed(2)}:1  (min 4.5)`);
  }
}
// The field must actually BE a gradient with the magenta in it. A palette change that quietly
// flattened it would pass every pair check above while removing the thing that makes the site
// recognisable.
const field = VARS["--field"] || "";
for (const [needle, what] of [
  ["radial-gradient", "a radial glow"],
  ["192, 38, 211", "the magenta glow"],
  ["34, 211, 238", "the cyan glow"],
]) {
  if (!field.includes(needle)) fail(`--field no longer contains ${what}`);
}

// MAGENTA IS A SURFACE, NOT A TEXT COLOUR. Measured at 3.88:1 on the canvas, so it fails body
// text everywhere. --magenta-lt exists for the cases that want magenta text.
for (const m of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const body = m[2];
  const col = (body.match(/(?:^|;)\s*color:\s*([^;]+)/) || [])[1];
  if (col && /var\(--magenta\)/.test(col)) {
    fail(
      `${m[1].split(",")[0].trim()} uses --magenta as TEXT (3.88:1 on the canvas, below 4.5). ` +
        `Use --magenta-lt for text; --magenta is for fills, glows and borders.`
    );
  }
}

// ---- 2. the reserved fill --------------------------------------------------------------------
// The button MUST use it. A negative test that only asked "does anything use --cta" once passed a
// site whose primary call to action had been blanked to white on white: a check has to name its
// subject.
const btnCta = (CSS.match(/\.btn\.cta\s*\{([^}]*)\}/) || [])[1] || "";
if (!/background:\s*var\(--cta\)/.test(btnCta)) {
  fail(".btn.cta does not use `background: var(--cta)`. The primary call to action has no fill.");
}
// And nothing else may. Share the fill and it stops meaning "click this".
for (const m of CSS.matchAll(/([^{}]+)\{([^{}]*background:\s*var\(--cta\)[^{}]*)\}/g)) {
  const sels = m[1].split(",").map((s) => s.trim());
  for (const s of sels) {
    if (s !== ".btn.cta" && s !== ".skip") {
      fail(`${s} uses the reserved call-to-action fill. Only .btn.cta and .skip may.`);
    }
  }
}

// ---- 3. no surface on a retired palette ------------------------------------------------------
const RETIRED = [/#0C544E/i, /#00B2A9/i, /#0a1526/i];
for (const re of RETIRED) {
  if (re.test(CSS) || re.test(HTML) || re.test(JSON.stringify(MANIFEST))) {
    fail(`a retired brand colour (${re.source}) is still present.`);
  }
}

// ---- 4. no INVISIBLE text --------------------------------------------------------------------
// The mirror of check 3, and it has to be asked in the direction this theme actually fails.
//
// On a LIGHT site the danger is light text left over from a dark theme. This site is DARK, so
// light text on the canvas is the norm and flagging it would fire on almost every rule, which is
// a gate that gets switched off within a week. The danger HERE is the opposite: DARK text with no
// light surface under it is invisible, and a dark-on-dark rule is exactly what a palette change
// leaves behind.
//
// The question is not "is this text dark". It is "does anything give this text a light or
// saturated surface", from the rule itself, from a prefix in the selector, or from a named
// exception. A button label is dark ON PURPOSE, because it sits on the cyan fill.
const LIGHT_SURFACE =
  /background(?:-image)?(?:-color)?:\s*(?:var\(--cta\)|var\(--grad\)|var\(--cyan\)|var\(--violet\)|linear-gradient|#[cdef][0-9a-f]{5}|#f{3,6}\b|white)/i;
const ON_LIGHT = [".btn.cta", ".pnum", ".bio-mark", ".skip"];
let checkedText = 0;
for (const m of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const sels = m[1].split(",").map((s) => s.trim()).filter(Boolean);
  const body = m[2];
  const col = (body.match(/(?:^|;)\s*color:\s*([^;]+)/) || [])[1];
  if (!col) continue;
  const c = resolve(col) || hex(col.trim());
  if (!c) continue;
  checkedText++;
  if (lum(c) > 0.18) continue; // not dark text, so it cannot be invisible on this canvas
  const ok =
    LIGHT_SURFACE.test(body) ||
    sels.some((s) => ON_LIGHT.some((p) => s === p || s.startsWith(p + " ") || s.includes(" " + p)));
  if (!ok) {
    fail(
      `${sels[0]} sets DARK text (${col.trim()}) and nothing gives it a light surface. ` +
        `On this canvas that is invisible.`
    );
  }
}
console.log(`  ${checkedText} text rules examined for a surface`);

// ---- 5. the app chrome agrees with itself ----------------------------------------------------
const metaTheme = (HTML.match(/name="theme-color"\s+content="([^"]+)"/) || [])[1];
if (!metaTheme) fail("index.html has no theme-color meta. Android paints the status bar from it.");
else if (metaTheme.toLowerCase() !== String(MANIFEST.theme_color).toLowerCase()) {
  fail(`theme-color disagrees: index.html says ${metaTheme}, the manifest says ${MANIFEST.theme_color}`);
}
if (String(MANIFEST.background_color).toLowerCase() !== String(VARS["--ink"]).toLowerCase()) {
  fail(
    `manifest background_color (${MANIFEST.background_color}) is not the page canvas ` +
      `(${VARS["--ink"]}). The splash screen would flash a different colour.`
  );
}
const bar = (HTML.match(/apple-mobile-web-app-status-bar-style"\s+content="([^"]+)"/) || [])[1];
if (bar === "black-translucent") {
  fail("apple-mobile-web-app-status-bar-style is black-translucent: it forces WHITE status text.");
}
for (const k of ["icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png"]) {
  if (!JSON.stringify(MANIFEST.icons).includes(k)) fail(`the manifest does not list ${k}`);
}

if (fails.length) {
  console.error(`\n[X] ${fails.length} colour defect(s):`);
  fails.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log("  OK  contrast, reserved fill, palette, light-text and app chrome all consistent");
