/* The architecture, in the Kvadrocycle shape: real cards with a numbered badge, an icon, a title
 * and a line saying WHAT THE PIECE DOES, connected by dotted lines with traffic moving along them.
 *
 * Cards are HTML, absolutely positioned in percent, so the typography is real: a title and a
 * subtitle, at readable sizes, that reflow and can be selected and translated. Connectors are one
 * SVG layer behind them with a percentage viewBox, so the lines meet the card centres at every
 * width. The traffic is a marching dash plus a dot riding each hot route.
 *
 * The previous version drew everything inside SVG with monospace labels and no room for an
 * explanation, which is why it read as a wireframe rather than a diagram.
 */

const CARD_W = 27; // percent
/* Seven rows now. 06 EXPLAIN was missing entirely, which is exactly the layer a reader asks
   about first, and the row spacing was built for six. */
const R = { see: 88.5, move: 74, agree: 59.5, hold: 45, decide: 30, explain: 15.5, show: 1 };

const NODES = [
  { id: "chain", x: 4, y: R.see, c: "cy", i: "◉", L: "01" },
  { id: "case", x: 36.5, y: R.see, c: "vi", i: "☷", L: "01" },
  { id: "vault", x: 69, y: R.see, c: "cy", i: "⚿", L: "01" },

  /* IDENTITY used to sit here badged 01, which was simply wrong: it is a SEE sensor drawn in the
     MOVE row. The schema registry is the piece that genuinely belongs in 02, and identity is still
     listed among the components of layer 01 below the diagram. */
  { id: "bus", x: 4, y: R.move, c: "cy", i: "⇉", L: "02" },
  { id: "cdc", x: 36.5, y: R.move, c: "vi", i: "⟳", L: "02" },
  { id: "schema", x: 69, y: R.move, c: "cy", i: "⌗", L: "02" },

  { id: "stream", x: 4, y: R.agree, c: "cy", i: "≈", L: "03" },
  { id: "vocab", x: 36.5, y: R.agree, c: "cy", i: "≡", L: "03" },
  { id: "entity", x: 69, y: R.agree, c: "cy", i: "⚯", L: "03" },

  { id: "hot", x: 4, y: R.hold, c: "cy", i: "◔", L: "04" },
  { id: "sql", x: 36.5, y: R.hold, c: "vi", i: "✓", L: "04" },
  { id: "graph", x: 69, y: R.hold, c: "vi", i: "✦", L: "04" },

  { id: "rule", x: 12, y: R.decide, c: "no", i: "⚡", L: "05" },
  { id: "hop", x: 55, y: R.decide, c: "ma", i: "⤳", L: "05" },

  { id: "panel", x: 12, y: R.explain, c: "vi", i: "⚖", L: "06" },
  { id: "recall", x: 55, y: R.explain, c: "vi", i: "⌸", L: "06" },

  { id: "queue", x: 36.5, y: R.show, c: "ma", i: "⚑", L: "07" },
];

/* 1 = the movement route, 2 = the authorisation route, 0 = the rest of the estate. */
const EDGES = [
  ["chain", "bus", 1], ["bus", "stream", 1], ["stream", "hot", 1], ["hot", "rule", 1],
  ["case", "cdc", 2], ["cdc", "sql", 2], ["sql", "rule", 2],
  ["rule", "queue", 1],
  ["vault", "schema", 0], ["schema", "entity", 0], ["entity", "graph", 0], ["graph", "hop", 0],
  ["stream", "vocab", 0], ["vocab", "sql", 0],
  /* The panel reads what the rule and the hop decided, and writes into the queue. Out of band,
     which is why it is grey: it never sits on the detection route. */
  ["rule", "panel", 0], ["hop", "recall", 0], ["panel", "queue", 0], ["hop", "queue", 0],
];

const CH = 11.5; // card height in percent, used to find edges of a card
const cx = (n) => n.x + CARD_W / 2;

function d(a, b) {
  const A = NODES.find((n) => n.id === a);
  const B = NODES.find((n) => n.id === b);
  if (!A || !B) return "";
  const ax = cx(A);
  const bx = cx(B);
  const ay = A.y;                 // top edge of A
  const by = B.y + CH;            // bottom edge of B
  const mid = (ay + by) / 2;
  return `M${ax},${ay} L${ax},${mid} L${bx},${mid} L${bx},${by}`;
}

export default function ArchMap({ nodeLabels = {}, descs = {}, joinLabel = "", rows = [] }) {
  return (
    <div className="amap">
      <svg className="amap-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {rows.map((r) => (
          <g key={r.n}>
            <line className="amap-band" x1="0" x2="100" y1={r.y} y2={r.y} />
          </g>
        ))}
        <line className="amap-join" x1="0" x2="100" y1={R.hold - 4} y2={R.hold - 4} />
        {EDGES.map(([a, b, h]) => (
          <path key={a + b} d={d(a, b)} className={"amap-w" + (h ? " h" + h : "")} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      <span className="amap-joinl" style={{ top: `calc(${R.hold - 4}% - 20px)` }}>
        {joinLabel}
      </span>

      {rows.map((r) => (
        <span className="amap-bandl" key={r.n} style={{ top: `calc(${r.y}% - 18px)` }}>
          {r.n} {r.k}
        </span>
      ))}

      {NODES.map((n) => (
        <div
          className={"amap-card " + n.c}
          key={n.id}
          style={{ left: n.x + "%", top: n.y + "%", width: CARD_W + "%" }}
        >
          <span className="amap-badge">{n.L}</span>
          <span className="amap-ico" aria-hidden="true">
            {n.i}
          </span>
          <b>{nodeLabels[n.id] || n.id}</b>
          <span>{descs[n.id] || ""}</span>
        </div>
      ))}
    </div>
  );
}
