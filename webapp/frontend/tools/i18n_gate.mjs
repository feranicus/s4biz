#!/usr/bin/env node
/* GATE 1 — the dictionaries.
 *
 * Two questions, and they are different:
 *   (a) COMPLETENESS. Is every key and every content entry that English has also in German?
 *   (b) CONTENT RULES. Does every locale obey the standing rules (no long dashes, no prices, no
 *       HTML entities, no over-long sentence, tab labels short enough for a 360px row)?
 *
 * A missing key does not crash: tr() falls back to English. That is deliberate, because a
 * white-screen is worse than an English sentence. But it means an incomplete translation is
 * INVISIBLE at runtime, which is exactly why it has to be a build failure.
 *
 * Exit 0 clean, 1 defect, 2 the gate could not run here (missing toolchain). ship.py fails on 1
 * and only notes 2: conflating them would either block the operator over a toolchain he never
 * installed, or silently swallow a real defect.
 */
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

/* fileURLToPath, NEVER new URL(...).pathname.
 *
 * A file URL is PERCENT ENCODED, so a project folder called "S4biz new website" arrives as
 * "S4biz%20new%20website" and every readFileSync below fails with ENOENT on a path that visibly
 * exists. It also leaves the leading slash on a Windows drive letter. fileURLToPath handles both.
 *
 * This shipped broken: the sandbox it was written in had no space in its path, so the gate passed
 * there and could never have run on the operator's machine. Guarded by tests/test_portability.py.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "..", "src");

const fails = [];
const warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);

/* Windows: an absolute path starts "C:", which Node's ESM loader reads as a URL SCHEME and
 * rejects with ERR_UNSUPPORTED_ESM_URL_SCHEME. Every dynamic import of a filesystem path must go
 * through pathToFileURL. */
async function load(rel) {
  const p = path.join(SRC, rel);
  if (!existsSync(p)) {
    // EXIT 1, NOT 2. Exit 2 means "the toolchain cannot run here" and ship.py only NOTES it. A
    // missing source file is a defect, and reporting it as a toolchain problem is how a broken
    // gate looked like an environment quirk for a whole run.
    console.error(`[X] ${p} does not exist. This is a defect, not a missing toolchain.`);
    process.exit(1);
  }
  return import(pathToFileURL(p).href);
}

const { EN } = await load("locales/en.js");
const { DE } = await load("locales/de.js");
const PACKS = { en: EN, de: DE };
const REF = "en";

// ---------------------------------------------------------------------------------------------
// (a) completeness
// ---------------------------------------------------------------------------------------------
const refKeys = Object.keys(EN).filter((k) => k !== "__content");
for (const [lang, pack] of Object.entries(PACKS)) {
  if (lang === REF) continue;
  const missing = refKeys.filter((k) => pack[k] === undefined);
  const extra = Object.keys(pack).filter((k) => k !== "__content" && EN[k] === undefined);
  if (missing.length) fail(`${lang}: ${missing.length} missing key(s): ${missing.slice(0, 8).join(", ")}`);
  if (extra.length) warn(`${lang}: ${extra.length} key(s) not in the reference: ${extra.slice(0, 5).join(", ")}`);
  const empty = refKeys.filter((k) => typeof pack[k] === "string" && !pack[k].trim());
  if (empty.length) fail(`${lang}: ${empty.length} empty string(s): ${empty.slice(0, 5).join(", ")}`);
}

/* Content arrays must be PARALLEL: same length, same ids, same field names.
 *
 * This is what makes i18n.jsx's whole-array fallback safe. `pillars` is an array whose order is
 * the page order, so an index-wise merge across locales would silently pair one section's German
 * heading with another's English body the moment a locale gained an entry. */
const refContent = EN.__content || {};
for (const [lang, pack] of Object.entries(PACKS)) {
  if (lang === REF) continue;
  const c = pack.__content || {};
  for (const [name, refArr] of Object.entries(refContent)) {
    const arr = c[name];
    if (!Array.isArray(arr)) {
      fail(`${lang}: content array "${name}" is missing`);
      continue;
    }
    if (arr.length !== refArr.length) {
      fail(`${lang}: "${name}" has ${arr.length} entries, the reference has ${refArr.length}`);
      continue;
    }
    refArr.forEach((refItem, i) => {
      const item = arr[i];
      if (refItem.id && item.id !== refItem.id) {
        fail(`${lang}: "${name}"[${i}] id is "${item.id}", the reference says "${refItem.id}"`);
      }
      for (const f of Object.keys(refItem)) {
        if (item[f] === undefined) fail(`${lang}: "${name}"[${i}] is missing field "${f}"`);
        else if (Array.isArray(refItem[f]) && refItem[f].length !== (item[f] || []).length) {
          fail(`${lang}: "${name}"[${i}].${f} has a different number of items`);
        }
      }
    });
  }
}

/* A locale that is a COPY of English passes every structural check perfectly. Long strings must
 * actually differ. */
for (const [lang, pack] of Object.entries(PACKS)) {
  if (lang === REF) continue;
  const longRef = refKeys.filter((k) => typeof EN[k] === "string" && EN[k].length > 60);
  const same = longRef.filter((k) => pack[k] === EN[k]);
  const ratio = longRef.length ? same.length / longRef.length : 0;
  if (ratio > 0.1) {
    fail(
      `${lang}: ${same.length} of ${longRef.length} long strings are identical to English ` +
        `(${Math.round(ratio * 100)}%). That locale looks untranslated.`
    );
  }
}

// ---------------------------------------------------------------------------------------------
// (b) content rules — applied to EVERY string in EVERY locale
// ---------------------------------------------------------------------------------------------
function strings(pack) {
  const out = [];
  const walk = (v, at) => {
    if (typeof v === "string") out.push([at, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${at}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${at}.${k}`);
  };
  walk(pack, "");
  return out;
}

// A price is a negotiating position given away for free, and it goes stale the day a tier changes.
const PRICE = /(?:[€$£]\s?\d|(?<![a-z])\d[\d.,]*\s?(?:eur|euro|usd|dollar)(?![a-z])|per\s+seat|pro\s+Sitzplatz|\bdiscount\b|\bRabatt\b)/i;
const ENTITY = /&(?:[a-z]+|#\d+);/i;
const LONGDASH = /[–—―]/;

for (const [lang, pack] of Object.entries(PACKS)) {
  for (const [at, s] of strings(pack)) {
    if (LONGDASH.test(s)) fail(`${lang}${at}: contains a long dash. Use a comma, a full stop or brackets.`);
    if (ENTITY.test(s))
      fail(
        `${lang}${at}: contains an HTML entity (${(s.match(ENTITY) || [])[0]}). A string that ` +
          `reaches the page through t() is escaped by React, so the entity is printed verbatim. ` +
          `Type the real character.`
      );
    if (PRICE.test(s)) fail(`${lang}${at}: looks like a price or a commercial term. Not on a public page.`);
    // Sentence length. Split on a full stop followed by whitespace, after stripping emphasis
    // markers: measure what the READER sees, not what the source file looks like.
    const plain = s.replace(/\*\*/g, "");
    for (const sent of plain.split(/(?<=[.!?])\s+/)) {
      const words = sent.trim().split(/\s+/).filter(Boolean);
      if (words.length > 30) fail(`${lang}${at}: a ${words.length} word sentence. Split it.`);
    }
  }
}

/* Tab labels are capped at 8 characters IN EVERY LANGUAGE. Six of them share a 360px row; the cap
 * is what stops German wrapping every one of them onto two lines. */
for (const [lang, pack] of Object.entries(PACKS)) {
  for (const k of Object.keys(pack)) {
    if (k.startsWith("tab.") && typeof pack[k] === "string" && pack[k].length > 8) {
      fail(`${lang}.${k} is ${pack[k].length} characters ("${pack[k]}"). Tab labels are capped at 8.`);
    }
  }
}

/* A mailto: with no @ in it is a dead link that nobody notices. A blind search and replace across
 * source has produced exactly that here before. */
for (const f of ["components/Footer.jsx", "pages/Contact.jsx"]) {
  const p = path.join(SRC, f);
  if (!existsSync(p)) continue;
  const src = readFileSync(p, "utf8");
  for (const m of src.matchAll(/mailto:\$\{?([^}"`'\s]+)/g)) {
    if (!/CONTACT\.email|@/.test(m[1])) fail(`${f}: mailto: does not resolve to an address (${m[0]})`);
  }
}

// ---------------------------------------------------------------------------------------------
const total = Object.values(PACKS).reduce((n, p) => n + strings(p).length, 0);
console.log(
  `i18n: ${Object.keys(PACKS).length} locale(s), ${refKeys.length} keys, ` +
    `${Object.keys(refContent).length} content arrays, ${total} strings checked`
);
warns.forEach((w) => console.log("  [!] " + w));
if (fails.length) {
  console.error(`\n[X] ${fails.length} i18n/content defect(s):`);
  fails.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log("  OK  every locale complete, every content rule satisfied");
