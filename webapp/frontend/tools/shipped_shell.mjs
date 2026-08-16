#!/usr/bin/env node
/* GATE 5 — what the world can read.
 *
 * View-source cannot be disabled. It shows bytes the browser already has, and curl, DevTools, the
 * disk cache or any proxy return the same thing. Every single-page app ships its JavaScript to the
 * browser in order to run it, and minification is not secrecy. So the only question that matters
 * is WHAT IS IN THOSE BYTES, and it is answerable.
 *
 * Runs AFTER the build, because it measures dist/, not the source.
 *   * NO SOURCE MAPS. A shipped .map hands over the entire original source, comments included.
 *     This is the one that would be a real finding.
 *   * NO SECRETS, no droplet addresses, no key-shaped strings.
 *   * NO HTML COMMENTS in the shell. Ours explained the bot gate by name and pointed at the file
 *     implementing it, delivered to every visitor including the scanners it exists to refuse.
 *   * THE STRUCTURED DATA AND THE META TAGS SURVIVE, because the comment stripper is a regex and
 *     a greedy version of it would silently cost the whole search result.
 *
 * Exit 2 when dist/ is absent: nothing to measure is not a defect.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

// fileURLToPath, never new URL(...).pathname: a file URL is percent encoded, so a folder with a
// space in its name arrives as %20 and every read fails on a path that visibly exists.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, "..", "dist");

if (!existsSync(DIST)) {
  console.log("[shipped-shell] no dist/ here, skipping (exit 2, not a defect)");
  process.exit(2);
}

const fails = [];
const fail = (m) => fails.push(m);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = walk(DIST);
const rel = (p) => path.relative(DIST, p).replace(/\\/g, "/");

// ---- source maps -----------------------------------------------------------------------------
const maps = files.filter((f) => f.endsWith(".map"));
if (maps.length) fail(`${maps.length} source map(s) shipped: ${maps.map(rel).join(", ")}`);
for (const f of files.filter((f) => /\.(js|css)$/.test(f))) {
  if (/\/\/[#@]\s*sourceMappingURL=/.test(readFileSync(f, "utf8"))) {
    fail(`${rel(f)} carries a sourceMappingURL comment`);
  }
}

// ---- secrets ---------------------------------------------------------------------------------
const SECRET = [
  [/\b64\.225\.108\.200\b/, "the production droplet address"],
  [/\b165\.245\.244\.174\b/, "the staging droplet address"],
  [/\bsk-[A-Za-z0-9]{20,}/, "an OpenAI-shaped key"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, "a GitHub token"],
  [/\bglsa_[A-Za-z0-9]{20,}/, "a Grafana token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "an AWS access key id"],
  [/\b\d{9,10}:[A-Za-z0-9_-]{30,}/, "a Telegram bot token"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
];
for (const f of files.filter((f) => /\.(js|css|html|json|webmanifest|txt|xml)$/.test(f))) {
  const s = readFileSync(f, "utf8");
  for (const [re, what] of SECRET) if (re.test(s)) fail(`${rel(f)} contains ${what}`);
}

// ---- the shell -------------------------------------------------------------------------------
const idx = path.join(DIST, "index.html");
if (!existsSync(idx)) {
  fail("dist/index.html is missing");
} else {
  const html = readFileSync(idx, "utf8");

  const comments = html.match(/<!--[\s\S]*?-->/g) || [];
  if (comments.length) {
    fail(
      `${comments.length} HTML comment(s) survived into the shell, e.g. ` +
        JSON.stringify(comments[0].slice(0, 70))
    );
  }

  // The stripper is a regex, and a greedy one would eat the structured data element too. These
  // are the assertions that keep it honest.
  if (!/<script type="application\/ld\+json">/.test(html)) {
    fail("the JSON-LD structured data did not survive the build. That is the rich search result.");
  } else {
    const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    try {
      const ld = JSON.parse(block);
      const types = JSON.stringify(ld);
      for (const t of ["Organization", "WebSite", "ProfessionalService"]) {
        if (!types.includes(`"${t}"`)) fail(`the structured data has no ${t} node`);
      }
    } catch (e) {
      fail("the JSON-LD block is not valid JSON: " + e.message);
    }
  }

  for (const [re, what] of [
    [/<title>[^<]{15,}<\/title>/, "a title"],
    [/name="description"\s+content="[^"]{60,}"/, "a description of at least 60 characters"],
    [/rel="canonical"/, "a canonical link"],
    [/property="og:image"/, "an og:image"],
    [/property="og:title"/, "an og:title"],
    [/name="twitter:card"/, "a twitter:card"],
    [/rel="manifest"/, "a manifest link"],
    [/name="theme-color"/, "a theme-color"],
  ]) {
    if (!re.test(html)) fail(`the shell has no ${what}`);
  }

  // The content security policy forbids inline script, so an inline block would be silently
  // BLOCKED in the browser and the page would simply not work. The JSON-LD block is data, not
  // script: the browser never executes it and the policy does not apply.
  for (const m of html.matchAll(/<script(?![^>]*application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (m[2].trim()) fail("an inline <script> is in the shell. The content security policy blocks it.");
  }
}

// ---- the assets the manifest promises --------------------------------------------------------
const MAN = path.join(DIST, "manifest.webmanifest");
if (existsSync(MAN)) {
  const man = JSON.parse(readFileSync(MAN, "utf8"));
  for (const ic of man.icons || []) {
    const p = path.join(DIST, ic.src.replace(/^\//, ""));
    if (!existsSync(p)) fail(`the manifest promises ${ic.src}, which is not in dist/`);
    else if (ic.src.endsWith(".png") && statSync(p).size < 1000) {
      fail(`${ic.src} is only ${statSync(p).size} bytes. That is not a real icon.`);
    }
  }
}
for (const must of ["og.png", "robots.txt", "sitemap.xml", "favicon.ico", "apple-touch-icon.png"]) {
  if (!existsSync(path.join(DIST, must))) fail(`dist/${must} is missing`);
}

const bytes = files.reduce((n, f) => n + statSync(f).size, 0);
console.log(`  dist: ${files.length} files, ${Math.round(bytes / 1024)} KB, 0 source maps`);

if (fails.length) {
  console.error(`\n[X] ${fails.length} shipped-shell defect(s):`);
  fails.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log("  OK  no maps, no secrets, no comments, structured data and meta intact");
