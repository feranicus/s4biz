import { useEffect, useRef } from "react";

/* A canvas host. The DRAWING is not here: it arrives as `make`, a pure factory from
 * ../custodyScenes.js, so a build gate can execute the whole animation with no browser at all.
 *
 * This component owns only the four browser concerns, and every one of them is a defect this
 * codebase family has already shipped once:
 *
 *   1. prefers-reduced-motion. A looping diagram is a vestibular trigger. One static frame, taken
 *      at the moment the loop is most legible, and then stop.
 *   2. Stop when off screen. A requestAnimationFrame loop below the fold burns a phone battery
 *      drawing a picture nobody is looking at.
 *   3. Device pixel ratio, capped at 2. Uncapped, a 3x phone renders nine times the pixels for a
 *      difference no eye can resolve.
 *   4. Rebuild the scene on resize AND on language change. The labels are baked into the scene at
 *      construction, so a scene built in English keeps drawing English until it is rebuilt.
 */
export default function Diagram({ make, height = 320, still = 0, className = "", label }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let scene = null;
    let raf = 0;
    let visible = true;
    let t0 = 0;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = make({ w, h });
      return scene;
    }

    function frame(now) {
      if (!t0) t0 = now;
      if (visible && scene) scene.step(ctx, (now - t0) / 1000);
      raf = window.requestAnimationFrame(frame);
    }

    build();
    if (reduce) {
      // One frame, at the point in the loop where the story has already resolved.
      scene.step(ctx, still || (scene.loop || 10) * 0.85);
    } else {
      raf = window.requestAnimationFrame(frame);
    }

    let io = null;
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver((es) => {
        visible = es.some((e) => e.isIntersecting);
      });
      io.observe(cv);
    }

    let ro = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => {
        build();
        if (reduce) scene.step(ctx, still || (scene.loop || 10) * 0.85);
      });
      ro.observe(cv);
    }

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
    };
  }, [make, still]);

  return (
    <div className={"dia " + className}>
      <canvas ref={ref} style={{ height: height + "px" }} role="img" aria-label={label || ""} />
    </div>
  );
}
