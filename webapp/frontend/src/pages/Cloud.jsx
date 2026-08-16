import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";
import ServiceHead from "../components/ServiceHead.jsx";

const JUMPS = [
  { id: "strategies", key: "cl.jump1" },
  { id: "phases", key: "cl.jump2" },
  { id: "different", key: "cl.jump3" },
];

export default function Cloud() {
  const [, , t] = useT();
  const rs = useContent("cloudRs");
  const phases = useContent("cloudPhases");
  const diff = useContent("cloudDiff");

  return (
    <>
      <ServiceHead eyebrow={t("cl.eyebrow")} h={t("cl.h")} lede={t("cl.lede")} jumps={JUMPS} />

      {/* ---- the seven strategies ------------------------------------------------------- */}
      <section className="sec" id="strategies">
        <div className="wrap">
          <SectionHead h={t("cl.rs.h")} lede={t("cl.rs.lede")} />
          <div className="rgrid">
            {rs.map((r, i) => (
              <Reveal className="rcard" key={r.id} delay={Math.min(i, 6) * 45}>
                <div className="rcard-h">
                  <span className="rcard-n">{r.n}</span>
                  <h3>{r.h}</h3>
                </div>
                <p className="rcard-one">{r.one}</p>
                <p>
                  <b>{t("cl.rs.when")}. </b>
                  {r.when}
                </p>
                <span className="trap">
                  <b>{t("cl.rs.trap")}</b>
                  {r.trap}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- how a migration runs -------------------------------------------------------- */}
      <section className="sec alt" id="phases">
        <div className="wrap">
          <SectionHead h={t("cl.ph.h")} lede={t("cl.ph.lede")} />
          <ol className="life">
            {phases.map((p, i) => (
              <Reveal as="li" key={p.id} delay={Math.min(i, 6) * 40}>
                <span className="life-n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{p.h}</h3>
                  <p>{p.we}</p>
                  <span className="trap">
                    <b>{t("cl.rs.trap")}</b>
                    {p.trap}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- what we do differently ------------------------------------------------------ */}
      <section className="sec" id="different">
        <div className="wrap">
          <SectionHead h={t("cl.diff.h")} lede={t("cl.diff.lede")} />
          <div className="g2">
            {diff.map((d, i) => (
              <Reveal className="rule" key={d.id} delay={i * 60}>
                <span className="rn mono">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{d.h}</h3>
                  <p>{d.b}</p>
                </div>
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
