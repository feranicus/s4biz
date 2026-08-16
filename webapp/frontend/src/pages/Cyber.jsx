import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";
import ServiceHead from "../components/ServiceHead.jsx";

const JUMPS = [
  { id: "best", key: "cy.jump1" },
  { id: "different", key: "cy.jump2" },
  { id: "regimes", key: "cy.jump3" },
];

export default function Cyber() {
  const [, , t] = useT();
  const best = useContent("cyberBest");
  const diff = useContent("cyberDiff");
  const regimes = useContent("cyberRegimes");

  return (
    <>
      <ServiceHead eyebrow={t("cy.eyebrow")} h={t("cy.h")} lede={t("cy.lede")} jumps={JUMPS} />

      {/* ---- best and different, side by side.
             They belong on one screen: a capability list on its own is indistinguishable from
             every other security supplier's, and the second column is the part that is ours. --- */}
      <section className="sec" id="best">
        <div className="wrap">
          <SectionHead h={t("cy.best.h")} lede={t("cy.best.lede")} />
          <div className="split">
            <div className="best">
              <h3>{t("cy.best.col")}</h3>
              {best.map((b, i) => (
                <Reveal className="item" key={b.id} delay={Math.min(i, 5) * 40}>
                  <b>{b.h}</b>
                  <p>{b.b}</p>
                </Reveal>
              ))}
            </div>
            <div className="diff" id="different">
              <h3>{t("cy.diff.col")}</h3>
              {diff.map((d, i) => (
                <Reveal className="item" key={d.id} delay={Math.min(i, 5) * 40}>
                  <b>{d.h}</b>
                  <p>{d.b}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- regimes -------------------------------------------------------------------- */}
      <section className="sec alt" id="regimes">
        <div className="wrap">
          <SectionHead h={t("cy.reg.h")} lede={t("cy.reg.lede")} />
          <div className="g4">
            {regimes.map((r, i) => (
              <Reveal className="card" key={r.id} delay={i * 60}>
                <h3>{r.h}</h3>
                <p>{r.b}</p>
              </Reveal>
            ))}
          </div>
          <Reveal as="p" className="note" delay={120}>
            {t("cy.reg.note")}
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
