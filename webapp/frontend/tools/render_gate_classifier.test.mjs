/* Does render_gate tell a BROKEN APP apart from an UNUSABLE TOOLCHAIN?
 *
 * Exit 1 must mean "this code does not render". Exit 2 must mean "this machine cannot run the
 * check". ship.py fails on 1 and only notes 2, so conflating them either blocks a ship over a
 * local node_modules the operator never touched, or hides a genuine render defect.
 *
 * WHY THIS TESTS THE CLASSIFIER RATHER THAN THE GATE. A real end to end negative test is
 * impossible on a machine whose esbuild is the wrong platform: it fails at the platform check
 * before it ever reaches the broken import, so the toolchain error masks the defect and the test
 * proves nothing. I tried that first and it reported a false pass.
 *
 * The pattern is READ OUT OF render_gate.mjs, never retyped here. A copy would drift, and then
 * this would be testing a regex that no longer ships.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(HERE, "render_gate.mjs"), "utf8");

const m = src.match(/const toolchain =\s*(\/[\s\S]*?\/i)\.test\(/);
if (!m) {
  console.error("[X] could not find the toolchain classifier in render_gate.mjs.");
  console.error("    It was renamed or removed, so this check is measuring nothing.");
  process.exit(1);
}
const body = m[1].slice(1, m[1].lastIndexOf("/"));
const re = new RegExp(body, "i");

/* Real messages. The first two are what esbuild actually prints on a cross platform install and a
   missing package; the rest are what it prints when OUR code is wrong. */
const CASES = [
  ["You installed esbuild for another platform than the one you're currently using.", 2],
  ["Cannot find module 'esbuild'", 2],
  ["ERR_MODULE_NOT_FOUND", 2],
  ["Could not resolve './does_not_exist.jsx'", 1],
  ["Expected '}' but found '<'", 1],
  ["Transform failed with 1 error: unexpected token", 1],
  ["The entry point src/main.jsx cannot be marked as external", 1],
];

let bad = 0;
for (const [msg, want] of CASES) {
  const got = re.test(msg) ? 2 : 1;
  const mark = got === want ? "ok  " : "MISS";
  if (got !== want) bad++;
  console.log("  " + mark + " exit " + got + " (want " + want + ")  " + msg.slice(0, 58));
}

if (bad) {
  console.error("\n[X] " + bad + " message(s) classified wrongly.");
  console.error("    A toolchain problem reported as a defect blocks a ship for no reason.");
  console.error("    A defect reported as a toolchain problem ships a page that does not render.");
  process.exit(1);
}
console.log("  OK  a broken app and an unusable toolchain are told apart");
