import Reveal from "./Reveal.jsx";

/* An investigation, start to finish. One step per row: what happens, and WHY that piece is there.
 *
 * The `why` line is the part that was missing from every version of this page so far. A component
 * list tells a reader what you bought. A reason tells them what happens when you leave it out, and
 * that is the only thing that survives a procurement conversation.
 *
 * Two cases are rendered, and the second one matters more: it is the night the system stays SILENT.
 * A detection story on its own reads as a vendor demo, because every product catches the case it
 * was demonstrated on. Showing the false alarm that does not fire is what makes a security team
 * believe the queue is worth reading.
 */
export default function CaseWalk({ c }) {
  if (!c || !c.steps) return null;
  return (
    <div className="cwalk">
      <Reveal className="cwalk-h">
        <span className="cwalk-tag">{c.tag}</span>
        <h3>{c.h}</h3>
        <p>{c.sub}</p>
      </Reveal>
      <ol className="cwalk-s">
        {c.steps.map((s, i) => (
          <Reveal as="li" key={s.n} delay={Math.min(i, 6) * 45}>
            <span className="cwalk-n">{s.n}</span>
            <div>
              <span className="cwalk-at">{s.at}</span>
              <h4>{s.h}</h4>
              <p>{s.b}</p>
              <span className="cwalk-w">{s.w}</span>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
