import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";
import ServiceHead from "../components/ServiceHead.jsx";

const JUMPS = [
  { id: "possible", key: "ai.jump1" },
  { id: "better", key: "ai.jump2" },
  { id: "lifecycle", key: "ai.jump3" },
  { id: "usecases", key: "ai.jump4" },
];

export default function AI() {
  const [, , t] = useT();
  const caps = useContent("aiCapabilities");
  const rules = useContent("aiRules");
  const life = useContent("aiLifecycle");
  const uses = useContent("aiUseCases");
  const bench = useContent("aiBench");

  return (
    <>
      <ServiceHead eyebrow={t("ai.eyebrow")} h={t("ai.h")} lede={t("ai.lede")} jumps={JUMPS} />

      {/* ---- what is possible --------------------------------------------------------- */}
      <section className="sec" id="possible">
        <div className="wrap">
          <SectionHead h={t("ai.cap.h")} lede={t("ai.cap.lede")} />
          <div className="g3">
            {caps.map((c, i) => (
              <Reveal className="card" key={c.id} delay={i * 60}>
                <h3>{c.h}</h3>
                <p>{c.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- the market picture, labelled as somebody else's numbers -------------------- */}
      <section className="sec alt">
        <div className="wrap">
          <Reveal className="bench">
            <h3>{t("ai.bench.h")}</h3>
            <p>{t("ai.bench.p")}</p>
            <ul>
              {bench.map((b) => (
                <li key={b.id}>{b.b}</li>
              ))}
            </ul>
            <p className="src">{t("ai.bench.src")}</p>
          </Reveal>
        </div>
      </section>

      {/* ---- how to do it better ------------------------------------------------------- */}
      <section className="sec" id="better">
        <div className="wrap">
          <SectionHead h={t("ai.rules.h")} lede={t("ai.rules.lede")} />
          <div className="g2">
            {rules.map((r, i) => (
              <Reveal className="rule" key={r.id} delay={i * 60}>
                <span className="rn mono">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{r.h}</h3>
                  <p>{r.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- the lifecycle -------------------------------------------------------------- */}
      <section className="sec alt" id="lifecycle">
        <div className="wrap">
          <SectionHead h={t("ai.life.h")} lede={t("ai.life.lede")} />
          <ol className="life">
            {life.map((s, i) => (
              <Reveal as="li" key={s.id} delay={Math.min(i, 6) * 40}>
                <span className="life-n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{s.h}</h3>
                  <p>{s.we}</p>
                  <span className="trap">
                    <b>{t("ai.life.trap")}</b>
                    {s.trap}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- top ten use cases ---------------------------------------------------------- */}
      <section className="sec" id="usecases">
        <div className="wrap">
          <SectionHead h={t("ai.use.h")} lede={t("ai.use.lede")} />
          <div className="uses">
            {uses.map((u, i) => (
              <Reveal className="use" key={u.id} delay={Math.min(i, 6) * 40}>
                <span className="use-n">{u.n}</span>
                <div>
                  <div className="use-h">
                    <h3>{u.h}</h3>
                    <span className="use-sector">{u.sector}</span>
                  </div>
                  <p>{u.b}</p>
                  <dl className="use-facts">
                    <div className="good">
                      <dt>{t("ai.use.good")}</dt>
                      <dd>{u.good}</dd>
                    </div>
                    <div className="bad">
                      <dt>{t("ai.use.bad")}</dt>
                      <dd>{u.bad}</dd>
                    </div>
                  </dl>
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
