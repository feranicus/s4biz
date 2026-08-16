import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";
import { CONTACT } from "../components/Footer.jsx";

export default function About() {
  const [, , t] = useT();
  const entities = useContent("entities");
  const career = useContent("career");

  return (
    <>
      <section className="phead">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            {t("about.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t("about.h")}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t("about.lede")}
          </Reveal>
        </div>
      </section>

      {/* ---- the principal ------------------------------------------------------------ */}
      <section className="sec">
        <div className="wrap bio">
          <Reveal className="bio-card">
            <div className="bio-mark" aria-hidden="true">
              EV
            </div>
            <h2>{t("about.bio.h")}</h2>
            <p className="bio-role mono">{t("about.bio.role")}</p>
            <a className="bio-link" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </Reveal>
          <Reveal className="bio-body" delay={80}>
            <p>{t("about.bio.p1")}</p>
            <p className="pull">{t("about.bio.p2")}</p>
            <p>{t("about.bio.p3")}</p>
            <dl className="facts">
              <div>
                <dt>{t("about.langs")}</dt>
                <dd>{t("about.langs.v")}</dd>
              </div>
              <div>
                <dt>{t("about.based")}</dt>
                <dd>{t("about.based.v")}</dd>
              </div>
              <div>
                <dt>{t("about.edu")}</dt>
                <dd>{t("about.edu.v")}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ---- career ------------------------------------------------------------------- */}
      <section className="sec alt">
        <div className="wrap">
          <SectionHead h={t("career.h")} lede={t("career.note")} />
          <ol className="tl">
            {career.map((c, i) => (
              <Reveal as="li" key={`${c.y}-${c.o}`} delay={Math.min(i, 8) * 40}>
                <span className="tl-y mono">{c.y}</span>
                <span className="tl-r">{c.r}</span>
                <span className="tl-o">{c.o}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- entities ----------------------------------------------------------------- */}
      <section className="sec">
        <div className="wrap">
          <SectionHead h={t("about.entities.h")} lede={t("about.entities.lede")} />
          <div className="g4">
            {entities.map((e, i) => (
              <Reveal className="ent" key={e.id} delay={i * 70}>
                <span className="ent-flag mono">{e.flag}</span>
                <h3>{e.name}</h3>
                <p className="ent-type mono">{e.type}</p>
                <p>{e.role}</p>
                <dl className="ent-facts">
                  <dt>{t("about.taxid")}</dt>
                  <dd className="mono">{e.tax}</dd>
                  <dt>{t("about.based")}</dt>
                  <dd className="mono">{e.city}</dd>
                </dl>
              </Reveal>
            ))}
          </div>
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
