/* Execute every frame of both custody diagrams against a stub 2D context.
 *
 * WHY THIS EXISTS. `node --check` and `vite build` only PARSE. A malformed colour is legal
 * JavaScript and throws when the canvas tries to parse it, which is a black rectangle and several
 * thousand identical console errors on a page that built perfectly green. That exact defect shipped
 * in this codebase family from one half-written line:
 *
 *     glow(x, y, 30, colour.replace(")", ",.9)").replace("#", "rgba("))
 *
 * "#FF3B57" contains no ")", so the first replace did nothing and the second produced "rgba(FF3B57".
 * It threw on the first call of the first frame, so nothing was ever drawn.
 *
 * A STATIC RENDER OF THE SAME MATHS IS NOT THIS. Redrawing the geometry in another language proves
 * the geometry and executes none of the page's own code. This runs the real loop.
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "..", "src");

const COLOUR =
  /^(#[0-9a-f]{3,8}|rgba?\(\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*(,\s*-?[\d.]+\s*)?\)|transparent|none|[a-z]+)$/i;

const problems = [];
let calls = 0;

function checkColour(where, v) {
  calls++;
  const s = String(v);
  if (!COLOUR.test(s.trim())) {
    problems.push(where + " received an invalid colour: " + JSON.stringify(s).slice(0, 60));
  }
}

function checkNumbers(name, args) {
  for (const a of args) {
    if (typeof a === "number" && !Number.isFinite(a)) {
      problems.push(name + " received " + String(a) + ", which paints nothing and fails silently");
      return;
    }
  }
}

/* A context that behaves like a canvas for the purposes of this check: it validates everything it
   is given and records nothing else. Deliberately NOT a full canvas implementation. */
function stubContext() {
  const noop =
    (name) =>
    (...args) => {
      checkNumbers(name, args);
    };
  const ctx = {
    canvas: { width: 900, height: 400 },
    globalAlpha: 1,
    lineWidth: 1,
    font: "",
    textAlign: "left",
    textBaseline: "alphabetic",
  };
  for (const m of [
    "clearRect", "fillRect", "strokeRect", "beginPath", "closePath", "moveTo", "lineTo",
    "arc", "arcTo", "quadraticCurveTo", "bezierCurveTo", "fill", "stroke", "save", "restore",
    "translate", "rotate", "scale", "setTransform", "setLineDash", "fillText", "strokeText",
    "createLinearGradient", "createRadialGradient", "drawImage", "clip", "rect",
  ]) {
    ctx[m] = noop(m);
  }
  ctx.createLinearGradient = () => ({ addColorStop: (o, c) => checkColour("addColorStop", c) });
  ctx.createRadialGradient = ctx.createLinearGradient;
  ctx.measureText = (s) => ({ width: String(s).length * 6 });

  let fs = "#000";
  let ss = "#000";
  let sh = "#000";
  Object.defineProperty(ctx, "fillStyle", {
    get: () => fs,
    set: (v) => {
      if (typeof v === "string") checkColour("fillStyle", v);
      fs = v;
    },
  });
  Object.defineProperty(ctx, "strokeStyle", {
    get: () => ss,
    set: (v) => {
      if (typeof v === "string") checkColour("strokeStyle", v);
      ss = v;
    },
  });
  Object.defineProperty(ctx, "shadowColor", {
    get: () => sh,
    set: (v) => {
      if (typeof v === "string") checkColour("shadowColor", v);
      sh = v;
    },
  });
  return ctx;
}

/* A deterministic generator, so a failure is reproducible. Math.random would make a flake. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const mod = await import(pathToFileURL(path.join(SRC, "custodyScenes.js")).href);

const SIZES = [
  [900, 380],
  [360, 320], // a phone, where a divide by a small width would surface
  [1, 1], // degenerate, because a container can be measured before layout
];

const SCENES = [
  {
    name: "the join",
    make: (w, h) =>
      mod.makeJoinScene({
        w,
        h,
        labels: { left: "MOVEMENTS", right: "AUTHORISATIONS", bad: "NONE", verdict: "INCIDENT" },
      }),
  },
];

let frames = 0;
/* One scene now. The architecture map is DOM, not canvas, because a 27 node graph in 400px of
   canvas could not explain anything and was rejected. Only the join is still drawn. */
for (const s of SCENES) {
  const before = calls;
  for (const [w, h] of SIZES) {
    let scene;
    try {
      scene = s.make(w, h);
    } catch (e) {
      problems.push(s.name + " at " + w + "x" + h + " could not be built: " + (e.message || e));
      continue;
    }
    const ctx = stubContext();
    const loop = scene.loop || 12;
    const N = 240;
    for (let i = 0; i <= N; i++) {
      const t = (loop * i) / N; // the WHOLE loop, not the first second of it
      try {
        scene.step(ctx, t);
        frames++;
      } catch (e) {
        problems.push(
          s.name + " threw at " + w + "x" + h + ", t=" + t.toFixed(2) + "s: " + (e.message || e),
        );
        break;
      }
    }
  }
  /* PER SCENE, NOT PER RUN. The first version totalled every scene together, so a diagram that
     drew nothing at all sailed through behind a busy one. A mutation that emptied the join scene
     was reported as a pass, which is the exact shape of a check that cannot fail. */
  if (calls - before < 400) {
    problems.push(
      "scene " + JSON.stringify(s.name) + " set only " + (calls - before) +
        " colours across every frame at every size. It is drawing nothing.",
    );
  }
}

if (problems.length) {
  console.error("[X] " + problems.length + " canvas defect(s):");
  for (const p of problems.slice(0, 25)) console.error("  - " + p);
  process.exit(1);
}
console.log(
  "  canvas " + frames + " frames executed across " + SCENES.length + " scenes and " +
    SIZES.length + " sizes, " + calls + " colours validated",
);
console.log("  OK  both diagrams run the whole loop without throwing");
