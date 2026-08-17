import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";

export default function Capabilities() {
  const [, , t] = useT();
  const pillars = useContent("pillars");
  const practices = useContent("practices");

  return (
    <>
      <section className="phead">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            {t("pill.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t("pill.h")}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t("pill.lede")}
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          {pillars.map((p, i) => (
            <Reveal className="pdeep" key={p.id} id={p.id} delay={i * 40}>
              <div className="pdeep-l">
                <span className="ptag big">{p.tag}</span>
                <h2>{p.h}</h2>
                <p className="pdeep-lede">{p.lede}</p>
              </div>
              <div className="pdeep-r">
                <p>{p.body}</p>
                <ul className="ticks">
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="deliver">
                  <span className="mono">{t("pill.deliver")}</span>
                  {p.deliver}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <SectionHead eyebrow={t("prac.eyebrow")} h={t("prac.h")} lede={t("prac.lede")} />
          <div className="g2">
            {practices.map((p, i) => (
              <Reveal className="prac" key={p.id} delay={i * 70}>
                <div className="prac-h">
                  <span className="mono n">{p.n}</span>
                  <div>
                    <h3>{p.h}</h3>
                    <span className="prac-tag">{p.tag}</span>
                  </div>
                </div>
                <ul className="dots">
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- custody observability.
             A TEASER, NOT A SUMMARY. It states the governing rule and gets out of the way. A page
             that is only reachable from the More menu is a page nobody browsing the site will ever
             find, and this is the one piece of work that a practitioner can link to directly. --- */}
      <section className="sec alt" id="custody">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.eyebrow")}
            h={t("cus.idea.h")}
            lede={t("cap.cus.lede")}
          />
          <Reveal className="sec-cta" delay={120}>
            <Link className="btn cta" to="/custody">
              {t("cap.cus.go")}
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="sec close">
        <div className="wrap">
          <Reveal as="h2">{t("ct.h")}</Reveal>
          <Reveal as="p" className="lede" delay={80}>
            {t("ct.lede")}
          </Reveal>
          <Reveal delay={140}>
            <Link to="/contact" className="btn cta lg">
              {t("nav.cta")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
