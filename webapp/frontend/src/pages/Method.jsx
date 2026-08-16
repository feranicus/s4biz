import { Link } from "react-router-dom";
import { useT } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";

export default function Method() {
  const [, , t] = useT();

  return (
    <>
      <section className="phead">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            {t("meth.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t("meth.h")}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t("meth.lede")}
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="g2">
            {["r1", "r2", "r3", "r4"].map((r, i) => (
              <Reveal className="rule" key={r} delay={i * 70}>
                <span className="rn mono">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t(`meth.${r}.h`)}</h3>
                  <p>{t(`meth.${r}.b`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- consensus ---------------------------------------------------------------- */}
      <section className="sec alt" id="consensus">
        <div className="wrap">
          <SectionHead eyebrow={t("cons.eyebrow")} h={t("cons.h")} lede={t("cons.lede")} />

          <div className="panel">
            {["s1", "s2", "s3", "s4"].map((s, i) => (
              <Reveal className="pstep" key={s} delay={i * 80}>
                <span className="pnum mono">{i + 1}</span>
                <h3>{t(`cons.${s}.h`)}</h3>
                <p>{t(`cons.${s}.b`)}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="hold mono">{t("cons.hold")}</Reveal>

          {/* THE LIMIT IS ON THE PAGE, NOT IN A FOOTNOTE. If this box were missing, nothing else
              on this page would be believable. It is also the honest position: four engines can
              agree and still be wrong. */}
          <Reveal className="honest" delay={100}>
            <h3>{t("cons.honest.h")}</h3>
            <p>{t("cons.honest.b")}</p>
          </Reveal>
        </div>
      </section>

      {/* ---- our own numbers ---------------------------------------------------------- */}
      <section className="sec">
        <div className="wrap">
          <SectionHead eyebrow={t("proof.eyebrow")} h={t("proof.h")} lede={t("proof.lede")} />
          <div className="g4">
            {["p1", "p2", "p3", "p4"].map((p, i) => (
              <Reveal className="metric" key={p} delay={i * 70}>
                <b>{t(`proof.${p}.v`)}</b>
                <span>{t(`proof.${p}`)}</span>
              </Reveal>
            ))}
          </div>
          <Reveal as="p" className="note" delay={120}>
            {t("proof.note")}
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
