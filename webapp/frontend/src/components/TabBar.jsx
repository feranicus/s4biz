import { NavLink } from "react-router-dom";
import { useT } from "../i18n.jsx";

/* The phone's bottom navigation. SELF-CONTAINED and route-driven, deliberately.
 *
 * An earlier version of this pattern lived inside the landing page and owned the tab list, the
 * active state and the click handler, so every other page was a dead end: in a standalone
 * progressive web app the Android back button is not always shown, and there was no way out.
 * This component owns its own list and appears on every public page.
 *
 * NOT in a future authenticated area, if one is ever added: two docked bars would cover each
 * other. tests/test_routes.py asserts both directions rather than skipping the question quietly.
 *
 * Labels come from `tab.*`, which is a DIFFERENT key space from `nav.*` and is capped at eight
 * characters in every language. Reusing the nav labels put "Leistungen" in a 360px row shared by
 * six items and wrapped every one of them onto two lines.
 */
const TABS = [
  { to: "/", key: "tab.home", end: true, icon: "M3 10.5 12 3l9 7.5V21H3z" },
  { to: "/ai", key: "tab.ai", icon: "M12 3v4M12 17v4M3 12h4M17 12h4M7.5 7.5 5 5M16.5 7.5 19 5M7.5 16.5 5 19M16.5 16.5 19 19M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" },
  { to: "/cloud", key: "tab.cloud", icon: "M7 18a4 4 0 0 1 .6-8 5.5 5.5 0 0 1 10.5 1.6A3.5 3.5 0 0 1 17.5 18Z" },
  { to: "/cyber", key: "tab.cyber", icon: "M12 3 20 6v6c0 4.4-3.3 7.9-8 9-4.7-1.1-8-4.6-8-9V6Z" },
  { to: "/work", key: "tab.work", icon: "M3 7h18v13H3zM8 7V4h8v3" },
  { to: "/contact", key: "tab.talk", icon: "M3 5h18v12H7l-4 4z" },
];

export default function TabBar() {
  const [, , t] = useT();
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map((x) => (
        <NavLink
          key={x.to}
          to={x.to}
          end={x.end}
          className={({ isActive }) => (isActive ? "on" : "")}
        >
          <span className="pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={x.icon} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <em>{t(x.key)}</em>
        </NavLink>
      ))}
    </nav>
  );
}
