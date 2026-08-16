import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { LANGS, useT } from "../i18n.jsx";

/* A MENU, not a row of buttons.
 *
 * Two flat buttons ("Deutsch | English") already cost about 110px of a 360px header, and the row
 * is a fixed-height flex bar: brand plus every control plus gaps has to fit, and German is
 * systematically longer so it overflows first. tools/header_layout.mjs computes that row and
 * fails the build. The trigger is therefore a fixed, measurable object: short code plus full name
 * on a wide screen, short code alone on a phone, chosen in CSS so there is no resize listener and
 * no second source of truth.
 *
 * NOT a native <select>: the closed box renders the selected option's full text, which cannot be
 * shortened per breakpoint, so the width would swing between "EN" and "Deutsch".
 *
 * PORTALLED, like MoreMenu, and for the same reason. The header is sticky with a z-index, which
 * makes it a STACKING CONTEXT: a z-index inside it only orders the panel against its siblings,
 * not against the page, so on a page with a composited element the panel opens underneath.
 */
export default function LangToggle() {
  const [lang, setL, t] = useT();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btn = useRef(null);

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (!open && btn.current) setRect(btn.current.getBoundingClientRect());
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="lang-trigger"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("a11y.lang")}
      >
        <span className="lg">{current.label}</span>
        <span className="sm">{current.short}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* A real backdrop ELEMENT, not a document listener added in an effect. A listener
                races the very gesture that opened the menu and has to be reasoned about per
                platform; an element simply receives the tap. */}
            <div className="pop-bd" onClick={() => setOpen(false)} aria-hidden="true" />
            <div
              className="pop-p lang-list"
              role="menu"
              style={
                rect
                  ? { top: rect.bottom + 8, right: Math.max(12, window.innerWidth - rect.right) }
                  : undefined
              }
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={l.code === lang}
                  className={l.code === lang ? "on" : ""}
                  onClick={() => {
                    setL(l.code);
                    setOpen(false);
                  }}
                >
                  <span className="code">{l.short}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
