import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useT } from "../i18n.jsx";
import LangToggle from "./LangToggle.jsx";
import MoreMenu from "./MoreMenu.jsx";
import Logo from "./Logo.jsx";

/* THE HEADER ROW IS ARITHMETIC.
 *
 * A fixed-height flex bar has a width budget: brand plus every control plus gaps, measured in the
 * LONGEST language. German runs about 30% longer than English and overflows first. Adding a nav
 * item without re-measuring is how a second line escapes the bar and lands on the page content,
 * which has already happened in this codebase.
 *
 * tools/header_layout.mjs computes that row for both languages at three breakpoints against the
 * budget READ FROM THE CSS, and fails the build. `flex-wrap:nowrap` is also set, so the row can
 * never put a second line over the page even if the measurement is somehow wrong.
 *
 * Plain nav links hide below 1000px, not 720px: there was a band between the two where the row
 * could still overflow and nothing measured it. Below that, the bottom tab bar and MoreMenu carry
 * navigation.
 */
/* The three service pages lead, because they are what people arrive looking for. Capabilities and
 * How we work moved into the More menu when AI, Cloud and Cyber were added: the row is a width
 * budget and seven items does not fit in German at any breakpoint. layout_gate.mjs computes it. */
const NAV = [
  { to: "/ai", key: "nav.ai" },
  { to: "/cloud", key: "nav.cloud" },
  { to: "/cyber", key: "nav.cyber" },
  { to: "/work", key: "nav.work" },
  { to: "/about", key: "nav.about" },
];

export default function SiteHeader() {
  const [, , t] = useT();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header id="hd" className={solid ? "s" : ""}>
      <div className="wrap">
        <Link to="/" className="brand" aria-label="S4Biz">
          <Logo />
          <span className="bt">
            S4<b>Biz</b>
          </span>
        </Link>

        <nav aria-label="Primary">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? "on" : "")}>
              {t(n.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hd-ctl">
          <LangToggle />
          <MoreMenu />
          <Link to="/contact" className="btn sm cta hd-cta">
            {t("nav.cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
