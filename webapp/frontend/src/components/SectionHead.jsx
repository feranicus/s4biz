import Reveal from "./Reveal.jsx";

/* An eyebrow, an ACTION TITLE and a lede.
 *
 * The heading states a conclusion, it does not name a topic. That is the Minto rule and it is the
 * single largest difference between consulting-grade copy and a features list: "Most programmes
 * fail on the seams, not the parts" tells the reader something; "Our approach" does not.
 */
export default function SectionHead({ eyebrow, h, lede, id }) {
  return (
    <header className="sh" id={id}>
      {eyebrow && (
        <Reveal as="p" className="eyebrow">
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" delay={60}>
        {h}
      </Reveal>
      {lede && (
        <Reveal as="p" className="lede" delay={120}>
          {lede}
        </Reveal>
      )}
    </header>
  );
}
