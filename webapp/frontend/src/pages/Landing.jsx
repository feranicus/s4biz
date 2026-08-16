import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Hero from "../components/Hero.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";

/* The route for each service card lives HERE, keyed by id, and never in a locale file. A path is
 * not copy, and a translator must not be able to break navigation by editing a sentence. */
const SERVICE_ROUTE = { ai: "/ai", cloud: "/cloud", cyber: "/cyber" };

export default function Landing() {
  const [, , t] = useT();
  const pillars = useContent("pillars");
  const work = useContent("work");
  const services = useContent("services");

  return (
    <>
      <Hero>
        <Reveal as="p" className="eyebrow">
          {t("hero.eyebrow")}
        </Reveal>
        <h1>
          <Reveal delay={40}>{t("hero.h1a")}</Reveal>
          <Reveal delay={120}>
            <span className="grad">{t("hero.h1b")}</span>
          </Reveal>
          <Reveal delay={200}>{t("hero.h1c")}</Reveal>
        </h1>
        <Reveal as="p" className="hero-sub" delay={260}>
          {t("hero.sub")}
        </Reveal>
        <Reveal className="hero-cta" delay={320}>
          <Link to="/contact" className="btn cta">
            {t("hero.cta1")}
          </Link>
          <Link to="/capabilities" className="btn ghost">
            {t("hero.cta2")}
          </Link>
        </Reveal>
        <Reveal as="p" className="hero-claim mono" delay={380}>
          {t("hero.claim")}
        </Reveal>
      </Hero>

      {/* ---- proof strip -------------------------------------------------------------- */}
      <section className="strip">
        <div className="wrap strip-in">
          {[
            ["stat.years", "stat.years.v", null],
            ["stat.jur", "stat.jur.v", null],
            ["stat.prog", "stat.prog.v", "stat.prog.note"],
            ["stat.edge", "stat.edge.v", "stat.edge.note"],
          ].map(([label, value, note], i) => (
            <Reveal className="stat" key={label} delay={i * 70}>
              <b>{t(value)}</b>
              <span>{t(label)}</span>
              {note && <em>{t(note)}</em>}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- the three doors ----------------------------------------------------------- */}
      <section className="sec" id="services">
        <div className="wrap">
          <SectionHead eyebrow={t("svc.eyebrow")} h={t("svc.h")} lede={t("svc.lede")} />
          <div className="g3">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <Link className="door" to={SERVICE_ROUTE[s.id] || "/capabilities"}>
                  <h3>{s.h}</h3>
                  <p>{s.b}</p>
                  <span className="door-tags mono">{s.tags}</span>
                  <span className="door-go">
                    {t("svc.open")}
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 12h13M12 5l7 7-7 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- why ---------------------------------------------------------------------- */}
      <section className="sec alt">
        <div className="wrap">
          <SectionHead eyebrow={t("why.eyebrow")} h={t("why.h")} lede={t("why.lede")} />
          <div className="g3">
            {["c1", "c2", "c3"].map((c, i) => (
              <Reveal className="card" key={c} delay={i * 80}>
                <h3>{t(`why.${c}.h`)}</h3>
                <p>{t(`why.${c}.b`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- pillars ------------------------------------------------------------------ */}
      <section className="sec" id="pillars">
        <div className="wrap">
          <SectionHead eyebrow={t("pill.eyebrow")} h={t("pill.h")} lede={t("pill.lede")} />
          <div className="pillars">
            {pillars.map((p, i) => (
              <Reveal className="pillar" key={p.id} delay={i * 60}>
                <span className="ptag">{p.tag}</span>
                <div className="pbody">
                  <h3>{p.h}</h3>
                  <p>{p.lede}</p>
                </div>
                <Link className="parrow" to={`/capabilities#${p.id}`} aria-label={p.h}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5 12h13M12 5l7 7-7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="sec-cta">
            <Link to="/capabilities" className="btn ghost">
              {t("pill.more")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---- method teaser ------------------------------------------------------------ */}
      <section className="sec alt">
        <div className="wrap">
          <SectionHead eyebrow={t("meth.eyebrow")} h={t("meth.h")} lede={t("meth.lede")} />
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
          <Reveal className="sec-cta">
            <Link to="/method" className="btn ghost">
              {t("nav.method")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---- work teaser -------------------------------------------------------------- */}
      <section className="sec">
        <div className="wrap">
          <SectionHead eyebrow={t("work.eyebrow")} h={t("work.h")} lede={t("work.lede")} />
          <div className="g3">
            {work.slice(0, 6).map((w, i) => (
              <Reveal className="wcard" key={w.id} delay={i * 60}>
                <span className="wsec mono">{w.sector}</span>
                <h3>{w.client}</h3>
                <p className="wscale mono">{w.scale}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="sec-cta">
            <Link to="/work" className="btn ghost">
              {t("nav.work")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---- closing CTA -------------------------------------------------------------- */}
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
