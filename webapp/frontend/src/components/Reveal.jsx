import { useEffect, useRef, useState } from "react";

/* Scroll reveal, with the two properties that make it safe.
 *
 * IT FAILS VISIBLE. If IntersectionObserver is missing, or the observer never fires because the
 * element starts in view, the content is shown. A reveal animation that fails closed hides the
 * page, which is the worst possible failure for a marketing site and is invisible in a build.
 *
 * IT RESPECTS prefers-reduced-motion by rendering shown from the first frame.
 */
export default function Reveal({ children, as: As = "div", delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => {
    if (typeof window === "undefined") return true; // SSR renders the content, always
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (shown) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.02 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <As
      ref={ref}
      className={`rv ${shown ? "in" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </As>
  );
}
