import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";

export default function Work() {
  const [, , t] = useT();
  const work = useContent("work");
  const [sector, setSector] = useState("");

  const sectors = useMemo(
    () => Array.from(new Set(work.map((w) => w.sector))).sort((a, b) => a.localeCompare(b)),
    [work]
  );
  const shown = sector ? work.filter((w) => w.sector === sector) : work;

  return (
    <>
      <section className="phead">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            {t("work.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t("work.h")}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t("work.lede")}
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="filters" role="group" aria-label={t("work.sector")}>
            <button
              type="button"
              className={sector === "" ? "chip on" : "chip"}
              onClick={() => setSector("")}
            >
              {t("work.all")}
            </button>
            {sectors.map((s) => (
              <button
                key={s}
                type="button"
                className={sector === s ? "chip on" : "chip"}
                onClick={() => setSector(s)}
              >
                {s}
              </button>
            ))}
          </Reveal>

          <div className="cases">
            {shown.map((w, i) => (
              <Reveal className="case" key={w.id} delay={Math.min(i, 6) * 50}>
                <div className="case-h">
                  <h2>{w.client}</h2>
                  <span className="case-meta mono">
                    {w.sector} · {w.geo}
                  </span>
                </div>
                <p>{w.scope}</p>
                <dl className="case-facts">
                  <div>
                    <dt>{t("work.scale")}</dt>
                    <dd className="mono">{w.scale}</dd>
                  </div>
                  <div>
                    <dt>{t("work.stack")}</dt>
                    <dd className="mono">{w.stack}</dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </div>

          <Reveal as="p" className="note">
            {t("work.note")}
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
