import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useT } from "../i18n.jsx";

/* The routes that are NOT in the header's main nav. On a phone this component is the ONLY way to
 * reach them: `#hd nav a:not(.btn){display:none}` hides plain links, and the bottom tab bar is
 * already full at six items. tests/test_routes.py asserts every public route is reachable from
 * either the nav or this menu. */
export const MORE_LINKS = [
  { to: "/capabilities", key: "nav.capabilities" },
  { to: "/custody", key: "nav.custody" },
  { to: "/method", key: "nav.method" },
  { to: "/contact", key: "nav.contact" },
  { to: "/privacy", key: "nav.privacy" },
  { to: "/impressum", key: "nav.impressum" },
];

export default function MoreMenu() {
  const [, , t] = useT();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btn = useRef(null);

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
    <div className="moremenu">
      {/* NOT a `.btn`. Reusing `.btn.sm.ghost` wrapped a 999px border-radius and a 34px min-height
          around a small glyph, which IS a circle, and it read as a broken element rather than a
          menu. This mirrors `.lang-trigger` field for field so the two controls are visibly
          siblings; tools/header_layout.mjs asserts that they still match. */}
      <button
        ref={btn}
        type="button"
        className="more-t"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("a11y.menu")}
      >
        {t("nav.more")}
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="pop-bd" onClick={() => setOpen(false)} aria-hidden="true" />
            <div
              className="pop-p"
              role="menu"
              style={
                rect
                  ? { top: rect.bottom + 8, right: Math.max(12, window.innerWidth - rect.right) }
                  : undefined
              }
            >
              {MORE_LINKS.map((l) => (
                <Link key={l.to} to={l.to} role="menuitem" onClick={() => setOpen(false)}>
                  {t(l.key)}
                </Link>
              ))}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
