import { useT } from "../i18n.jsx";
import { PRIVACY, localised } from "../legal.jsx";
import Reveal from "../components/Reveal.jsx";

export default function Privacy() {
  const [lang, , t] = useT();
  const p = localised(PRIVACY, lang);
  return (
    <section className="phead legal">
      <div className="wrap narrow">
        <Reveal as="h1">{p.h}</Reveal>
        <Reveal as="p" className="legal-updated mono" delay={40}>
          {t("priv.updated")}
        </Reveal>
        <Reveal as="p" className="lede" delay={80}>
          {p.intro}
        </Reveal>
        {p.sections.map((s, i) => (
          <Reveal key={s.h} delay={Math.min(i, 5) * 40}>
            <h2>{s.h}</h2>
            <p>{s.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
