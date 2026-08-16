import { useEffect, useRef } from "react";
import { makeScene } from "../heroScene.js";

/* The hero canvas: a drifting network of nodes and edges with a scan sweep that lights the links
 * it crosses. It is the estate we spend our working life mapping, drawn honestly as a graph
 * rather than as decoration.
 *
 * The DRAWING lives in ../heroScene.js so it can be executed by a build gate. This component owns
 * only the browser concerns, and there are three that matter:
 *
 *   1. RESPECT prefers-reduced-motion. A drifting background is a known vestibular trigger. We
 *      draw ONE static frame and stop.
 *   2. STOP WHEN NOT VISIBLE. A requestAnimationFrame loop left running behind another tab or
 *      below the fold burns a phone battery for a picture nobody is looking at.
 *   3. DEVICE PIXEL RATIO, CAPPED AT 2. Uncapped, a 3x phone renders nine times the pixels for a
 *      difference nobody can see.
 */
export default function Hero({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(document.documentElement);
    const cyan = (cs.getPropertyValue("--cyan") || "#22D3EE").trim();
    const violet = (cs.getPropertyValue("--violet") || "#8B5CF6").trim();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let scene = null;
    let raf = 0;
    let running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = makeScene({ w, h, cyan, violet });
    }

    function frame() {
      if (!running || !scene) return;
      scene.step(ctx, { drift: !reduce });
      if (reduce) return; // one honest static frame, then stop
      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", resize);

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries[0] && entries[0].isIntersecting;
        if (vis && !running && !reduce) {
          running = true;
          frame();
        } else if (!vis) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(cv);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        running = true;
        frame();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  return (
    <section className="hero">
      <canvas ref={ref} className="hero-cv" aria-hidden="true" />
      <div className="hero-veil" aria-hidden="true" />
      <div className="wrap hero-in">{children}</div>
    </section>
  );
}
