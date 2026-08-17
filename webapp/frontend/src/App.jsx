import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "./components/SiteHeader.jsx";
import TabBar from "./components/TabBar.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppFab from "./components/WhatsAppFab.jsx";
import Landing from "./pages/Landing.jsx";
import AI from "./pages/AI.jsx";
import Cloud from "./pages/Cloud.jsx";
import Cyber from "./pages/Cyber.jsx";
import Custody from "./pages/Custody.jsx";
import Capabilities from "./pages/Capabilities.jsx";
import Method from "./pages/Method.jsx";
import Work from "./pages/Work.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Privacy from "./pages/Privacy.jsx";
import Impressum from "./pages/Impressum.jsx";
import NotFound from "./pages/NotFound.jsx";
import { useT } from "./i18n.jsx";

/* Every route registered here must ALSO be listed in:
 *   webapp/backend/app/main.py  _APP_ROUTES   (or the page is served a 404 as a scanner probe)
 *   webapp/frontend/public/sitemap.xml        (or the page is never offered to a search engine)
 *   webapp/frontend/src/components/MoreMenu.jsx or SiteHeader nav (or it is unreachable on a phone)
 * Three of those four fail SILENTLY. tests/test_routes.py asserts all of them.
 */
export const ROUTES = [
  { path: "/", el: Landing },
  { path: "/ai", el: AI },
  { path: "/cloud", el: Cloud },
  { path: "/cyber", el: Cyber },
  { path: "/custody", el: Custody },
  { path: "/capabilities", el: Capabilities },
  { path: "/method", el: Method },
  { path: "/work", el: Work },
  { path: "/about", el: About },
  { path: "/contact", el: Contact },
  { path: "/privacy", el: Privacy },
  { path: "/impressum", el: Impressum },
];

/* React Router does not restore scroll or honour a #hash on navigation, so without this a link to
 * /#pillars from another page appears to do nothing at all. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [, , t] = useT();
  return (
    <>
      <a className="skip" href="#main">
        {t("a11y.skip")}
      </a>
      <ScrollManager />
      <SiteHeader />
      <main id="main">
        <Routes>
          {ROUTES.map((r) => (
            <Route key={r.path} path={r.path} element={<r.el />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <TabBar />
      {/* Mounted ONCE here rather than per page. Mounting it inside individual pages is how a
          sibling project ended up with the button on three screens and missing from the rest.
          The component hides itself on /contact. */}
      <WhatsAppFab />
    </>
  );
}
