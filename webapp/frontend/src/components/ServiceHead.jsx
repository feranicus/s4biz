import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import { useT } from "../i18n.jsx";

/* The header shared by the three service pages: the brand field, an action title, and a jump bar.
 *
 * ONE COMPONENT, THREE PAGES. These pages must read as a family, and the fastest way to lose that
 * is three near-identical headers that drift apart one edit at a time. The jump bar also exists
 * for a real reason: these are the longest pages on the site, and a reader who arrived for the
 * seven Rs should not have to scroll past the whole AI argument to find them.
 */
export default function ServiceHead({ eyebrow, h, lede, jumps = [] }) {
  const [, , t] = useT();
  return (
    <section className="phead field">
      <div className="wrap">
        <Reveal as="p" className="eyebrow">
          {eyebrow}
        </Reveal>
        <Reveal as="h1" delay={60}>
          {h}
        </Reveal>
        <Reveal as="p" className="lede" delay={120}>
          {lede}
        </Reveal>
        {jumps.length > 0 && (
          <Reveal className="jump" delay={180}>
            {jumps.map((j) => (
              /* A plain anchor, not a router Link. These target a section on THIS page, and the
                 scroll manager in App.jsx handles the hash on arrival from another page. */
              <a key={j.id} href={`#${j.id}`}>
                {t(j.key)}
              </a>
            ))}
          </Reveal>
        )}
        <Reveal className="phead-cta" delay={240}>
          <Link to="/contact" className="btn cta">
            {t("nav.cta")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
