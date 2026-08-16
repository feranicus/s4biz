import { useT } from "../i18n.jsx";
import { IMPRESSUM, localised } from "../legal.jsx";
import Reveal from "../components/Reveal.jsx";

export default function Impressum() {
  const [lang] = useT();
  const p = localised(IMPRESSUM, lang);
  return (
    <section className="phead legal">
      <div className="wrap narrow">
        <Reveal as="h1">{p.h}</Reveal>
        <Reveal as="p" className="lede" delay={60}>
          {p.intro}
        </Reveal>
        <Reveal as="dl" className="imp" delay={100}>
          {p.rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </Reveal>
        <Reveal delay={140}>
          <h2>{lang === "de" ? "Haftung" : "Liability"}</h2>
          <p>{p.liability}</p>
          <h2>{lang === "de" ? "Streitbeilegung" : "Dispute resolution"}</h2>
          <p>{p.disputes}</p>
        </Reveal>
      </div>
    </section>
  );
}
