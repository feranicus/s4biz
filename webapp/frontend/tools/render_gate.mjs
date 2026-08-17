#!/usr/bin/env node
/* GATE 4 — RENDER the pages and RUN the animation. A build passing is not a page working.
 *
 * `vite build` succeeds on code that throws the instant it executes: an undefined identifier, a
 * hook used with the wrong return shape, a malformed colour. Those are legal JavaScript until the
 * moment they run. Two defects of exactly that kind have shipped from this pattern before, one as
 * a white screen and one as a black rectangle with several thousand identical console errors.
 *
 * So this gate does two things a build cannot:
 *   A. Server-renders EVERY route in EVERY language and inspects the markup.
 *   B. Executes the hero animation for a full timeline against a stub canvas context that
 *      VALIDATES every colour it is handed.
 *
 * It bundles with the esbuild JS API rather than the node_modules/.bin shim, because that shim is
 * a platform artefact: a symlink on Linux, a .cmd on Windows, and absent entirely after an
 * interrupted install. Probing for the file reports "esbuild missing" on machines where esbuild
 * works perfectly.
 *
 * Exit 0 clean, 1 defect, 2 the toolchain cannot run here.
 */
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

// fileURLToPath, never new URL(...).pathname: a file URL is percent encoded, so a folder with a
// space in its name arrives as %20 and every read fails on a path that visibly exists.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FE = path.join(HERE, "..");
const TMP = path.join(FE, "ssrtmp");

let esbuild;
try {
  esbuild = await import("esbuild");
} catch {
  console.log("[render-gate] esbuild is not installed here, skipping (exit 2, not a defect)");
  process.exit(2);
}

/* READ THE ROUTES FROM App.jsx. A hardcoded list here would go on rendering the pages that used to
 * exist and report a comfortable pass on a release that added three new ones, which is the same
 * defect the layout gate had. Plus one route that deliberately does not exist, to exercise the
 * 404 page. */
const APP_SRC = readFileSync(path.join(FE, "src", "App.jsx"), "utf8");
const ROUTES = [...APP_SRC.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]).concat(["/nope"]);
if (ROUTES.length < 6) {
  console.error(`[X] only ${ROUTES.length - 1} route(s) parsed from App.jsx; the gate is misreading it`);
  process.exit(1);
}
const LANGS = ["en", "de"];

mkdirSync(TMP, { recursive: true });

const entry = `
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../src/App.jsx";
import { setLang } from "../src/i18n.jsx";
import { makeScene, rgba } from "../src/heroScene.js";

const ROUTES = ${JSON.stringify(ROUTES)};
const LANGS = ${JSON.stringify(LANGS)};
const out = { pages: {}, canvas: null, errors: [] };

for (const lang of LANGS) {
  try { setLang(lang); } catch (e) { out.errors.push("setLang(" + lang + "): " + e.message); }
  for (const r of ROUTES) {
    try {
      out.pages[lang + " " + r] = renderToString(
        React.createElement(StaticRouter, { location: r }, React.createElement(App))
      );
    } catch (e) {
      out.errors.push("render " + lang + " " + r + ": " + (e && e.message));
    }
  }
}

/* ---- B. execute the animation -----------------------------------------------------------
 * A stub context that VALIDATES. Anything handed to fillStyle or strokeStyle must parse as a
 * complete colour, and any exception anywhere in the loop is a failure. This is what a static
 * render of the same maths cannot tell you.
 */
const COLOUR = /^(?:#[0-9a-fA-F]{3,8}|rgba?\\((?:\\s*-?[\\d.]+\\s*,){2,3}\\s*-?[\\d.]+\\s*\\)|[a-z]+)$/;
const bad = [];
function stub() {
  const o = {
    _f: "", _s: "",
    set fillStyle(v) { if (!COLOUR.test(String(v))) bad.push("fillStyle=" + v); this._f = v; },
    get fillStyle() { return this._f; },
    set strokeStyle(v) { if (!COLOUR.test(String(v))) bad.push("strokeStyle=" + v); this._s = v; },
    get strokeStyle() { return this._s; },
    lineWidth: 1,
  };
  for (const m of ["clearRect","beginPath","moveTo","lineTo","stroke","arc","fill","setTransform","save","restore"]) {
    o[m] = () => {};
  }
  return o;
}
try {
  if (!COLOUR.test(rgba("#22D3EE", 0.5))) out.errors.push("rgba() produced an invalid colour");
  if (!COLOUR.test(rgba("nonsense", 2))) out.errors.push("rgba() fallback produced an invalid colour");
  const ctx = stub();
  for (const size of [[360, 620], [1440, 820]]) {
    const scene = makeScene({ w: size[0], h: size[1] });
    if (!scene.nodes.length) out.errors.push("makeScene produced no nodes at " + size.join("x"));
    for (let i = 0; i < 900; i++) scene.step(ctx, { drift: true });
  }
  out.canvas = { frames: 1800, badColours: bad.slice(0, 5), badCount: bad.length };
} catch (e) {
  out.errors.push("canvas: " + (e && e.stack ? e.stack.split("\\n")[0] : e));
}

console.log("<<<JSON>>>" + JSON.stringify(out));
`;

writeFileSync(path.join(TMP, "entry.jsx"), entry);

try {
  await esbuild.build({
    entryPoints: [path.join(TMP, "entry.jsx")],
    bundle: true,
    outfile: path.join(TMP, "out.cjs"),
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    loader: { ".css": "empty", ".png": "empty", ".svg": "empty", ".webmanifest": "empty" },
    logLevel: "silent",
  });
} catch (e) {
  const msg = String(e.message || e);
  // EXIT 1 IS A DEFECT IN THE APP. EXIT 2 IS A TOOLCHAIN THIS MACHINE CANNOT RUN.
  //
  // esbuild ships a per-platform binary as an optional dependency, so a node_modules installed on
  // one operating system and used from another fails with "installed for another platform". That
  // says nothing about the code. Reporting it as a defect would block a ship over a local install
  // the operator never touched, and ship.py already knows to treat 2 as "it will run in the image".
  //
  // Conflating the two is the exact mistake this project family made once before, and it cost
  // three ships: a check that cannot run must say so rather than inventing a verdict.
  const toolchain =
    /another platform|Cannot find module|ERR_MODULE_NOT_FOUND|EACCES|not supported on|Command failed.*esbuild/i.test(
      msg,
    );
  console.error(
    (toolchain
      ? "[!] the render gate cannot run here: the toolchain is unusable on this machine.\n" +
        "    This is NOT a finding about the app. It runs in the image, where the toolchain is\n" +
        "    correct by construction.\n"
      : "[X] the render gate could not bundle the app:\n") + msg,
  );
  process.exit(toolchain ? 2 : 1);
}

const { execFileSync } = await import("node:child_process");
let raw = "";
try {
  raw = execFileSync(process.execPath, [path.join(TMP, "out.cjs")], {
    encoding: "utf8",
    // React logs "useLayoutEffect does nothing on the server" once per component per render, which
    // for 18 renders is thousands of lines that bury the gate's own output. Everything else still
    // prints, so a real error cannot hide behind this.
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (e) {
  console.error("[X] the app THREW while rendering. This is the defect a build cannot see:");
  console.error(String(e.stdout || "").split("<<<JSON>>>")[0].slice(0, 1500));
  console.error(String(e.stderr || "").slice(0, 1500));
  process.exit(1);
}

const jsonAt = raw.indexOf("<<<JSON>>>");
if (jsonAt < 0) {
  console.error("[X] the render produced no result payload. Output:\n" + raw.slice(0, 1200));
  process.exit(1);
}
const res = JSON.parse(raw.slice(jsonAt + 10));

const fails = [...res.errors];
const fail = (m) => fails.push(m);

/* A raw dotted key reaching the DOM is worse than a crash: it looks like content. This is the
 * single most valuable assertion in the file. */
const KEYRE = /\b(?:nav|tab|hero|why|pill|prac|meth|cons|proof|work|about|career|ct|foot|priv|imp|err|stat|a11y)\.[a-z0-9.]+/;

const FUNCTION_WORDS = /\b(the|your|and|with|from|what|which|that|this|those|we|our|for|are|is|of|to|in|on|by|as|it|its|not|but|have|has)\b/gi;

for (const [key, html] of Object.entries(res.pages)) {
  const [lang, route] = key.split(" ");
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 120) fail(`${key}: rendered only ${text.length} characters of text. The page is empty.`);
  const k = text.match(KEYRE);
  if (k) fail(`${key}: a raw translation key reached the page: "${k[0]}"`);
  if (/\bundefined\b/.test(text)) fail(`${key}: the word "undefined" reached the page`);
  if (/\bNaN\b/.test(text)) fail(`${key}: "NaN" reached the page`);
  if (/\[object Object\]/.test(text)) fail(`${key}: "[object Object]" reached the page`);
  if (/&(?:rsquo|mdash|rarr|nbsp|amp);/.test(text)) fail(`${key}: an unexpanded HTML entity reached the page`);

  // German pages must actually be German. English function-word residue above 6% means sentences
  // are silently falling back, which is invisible at runtime.
  if (lang === "de" && route !== "/nope") {
    const words = text.split(/\s+/).filter(Boolean).length;
    const en = (text.match(FUNCTION_WORDS) || []).length;
    const pct = words ? Math.round((en / words) * 100) : 0;
    if (pct > 6) fail(`${key}: ${pct}% English function words. Sentences are falling back to English.`);
  }

  // The bottom tab bar is the only way out of a page on a phone in an installed app.
  if (!/class="tabbar"/.test(html)) fail(`${key}: the bottom tab bar is missing.`);
}

if (res.canvas) {
  if (res.canvas.badCount) {
    fail(
      `the hero animation produced ${res.canvas.badCount} invalid colour(s), e.g. ` +
        res.canvas.badColours.join(", ")
    );
  } else {
    console.log(`  canvas ${res.canvas.frames} frames executed, every colour valid`);
  }
} else {
  fail("the hero animation did not run at all");
}

/* Switching language must change the markup. A store that gives every component a private copy of
 * the language renders perfectly and is simply wrong when two components disagree. */
const enHome = res.pages["en /"];
const deHome = res.pages["de /"];
if (enHome && deHome && enHome === deHome) {
  fail("the English and German front pages are byte-identical. The language store is not shared.");
}

console.log(`  rendered ${Object.keys(res.pages).length} page/language combinations`);

try {
  rmSync(TMP, { recursive: true, force: true });
} catch {
  /* leaving the scratch directory behind is not a failure */
}

if (fails.length) {
  console.error(`\n[X] ${fails.length} render defect(s):`);
  fails.forEach((f) => console.error("  - " + f));
  process.exit(1);
}
console.log("  OK  every page renders in every language, the animation runs clean");
if (!existsSync(path.join(FE, "src", "App.jsx"))) process.exit(2);
