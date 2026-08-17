/* The two custody diagrams. PURE DRAWING, no DOM, no window, no timers.
 *
 * Everything here takes a 2D context and a time in seconds and paints one frame. That is what lets
 * tools/canvas_smoke.mjs execute both scenes for the whole loop against a stub context and catch a
 * malformed colour before a browser does. A string like "rgba(FF3B57" is legal JavaScript and
 * throws only when the canvas tries to parse it, which is a black rectangle and several thousand
 * console errors on a page that built perfectly.
 *
 * COLOURS ONLY THROUGH rgba(). Never build a colour by string surgery. The one time that was done
 * in this codebase family it produced exactly the failure above.
 *
 * TEXT COMES IN AS A PARAMETER. Both scenes draw labels, and a label is a string a human reads, so
 * it belongs in the locale packs like every other word on this site. Neither scene contains a
 * single English word.
 */
import { rgba } from "./heroScene.js";

const CY = "#22D3EE";
const VI = "#8B5CF6";
const MA = "#C026D3";
const OK = "#34D399";
const NO = "#FB7185";
const INK = "#AEB8E0";

function ease(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/* A value that rises from 0 to 1 between `a` and `b` seconds and stays there. Every animation in
   both scenes is expressed with this, so the whole loop is a pure function of one clock and can be
   sampled at any frame without state. That is also why the smoke test can run 1800 frames. */
function at(t, a, b) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return ease((t - a) / (b - a));
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function label(ctx, text, x, y, size, colour, align) {
  ctx.font =
    size +
    "px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = align || "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = colour;
  ctx.fillText(String(text == null ? "" : text), x, y);
}

/* =============================================================================================
 * DIAGRAM ONE: THE JOIN.
 *
 * The entire product in one picture. Movements arrive on the left, authorisations on the right.
 * Four of them pair up and settle green. The fifth movement arrives, the system reaches across for
 * its authorisation, finds an empty set, and the row turns red. No model, no score, no behaviour:
 * a row that has no partner.
 *
 * It loops on a 14 second clock, which is long enough to read and short enough to see twice.
 * ========================================================================================== */
export const JOIN_LOOP = 14;

export function makeJoinScene({ w, h, labels = {} }) {
  const L = {
    left: labels.left || "",
    right: labels.right || "",
    ok: labels.ok || "",
    bad: labels.bad || "",
    verdict: labels.verdict || "",
    ...labels,
  };

  /* Five rows. The last one is the one with no partner, and it is deliberately not the first: an
     alarm that fires on row one reads as a demo, an alarm on row five reads as a system. */
  /* The identifiers are NOT translated and must never be: a reference is the same string in every
     language, and inventing German-looking ones would imply these are real records. They exist so
     the rows read as data rather than as empty placeholder boxes. */
  const ROWS = [
    { move: 1.0, auth: 1.4, paired: true, m: "MOV 4c1f", a: "AUTH 2291" },
    { move: 2.6, auth: 2.9, paired: true, m: "MOV 7ba0", a: "AUTH 2294" },
    { move: 4.2, auth: 4.7, paired: true, m: "MOV 19e6", a: "AUTH 2301" },
    { move: 5.9, auth: 6.2, paired: true, m: "MOV c3d8", a: "AUTH 2307" },
    { move: 7.6, auth: 0, paired: false, m: "MOV 0af2", a: "" },
  ];

  function step(ctx, t) {
    const time = ((t % JOIN_LOOP) + JOIN_LOOP) % JOIN_LOOP;
    ctx.clearRect(0, 0, w, h);

    const padX = Math.max(14, w * 0.045);
    const colW = Math.min(200, (w - padX * 3) / 2);
    const lx = padX;
    const rx = w - padX - colW;
    const top = 40;
    const foot = 46;                       // reserved for the verdict badge, nothing else
    const rowH = Math.max(20, (h - top - foot) / ROWS.length);

    label(ctx, L.left, lx, 22, 11, rgba(CY, 0.95));
    label(ctx, L.right, rx, 22, 11, rgba(VI, 0.95));

    for (let i = 0; i < ROWS.length; i++) {
      const r = ROWS[i];
      const y = top + i * rowH + rowH / 2;
      const mv = at(time, r.move, r.move + 0.5);
      if (mv <= 0) continue;

      // the movement, sliding in from the left edge
      const mx = lx + (1 - mv) * -30;
      ctx.globalAlpha = mv;
      ctx.strokeStyle = rgba(CY, 0.5);
      ctx.fillStyle = rgba(CY, 0.1);
      roundRect(ctx, mx, y - rowH * 0.34, colW, rowH * 0.68, 7);
      ctx.fill();
      ctx.stroke();
      label(ctx, r.m, mx + 12, y, 10, rgba(CY, 0.8));
      ctx.globalAlpha = 1;

      if (r.paired) {
        const av = at(time, r.auth, r.auth + 0.45);
        if (av > 0) {
          ctx.globalAlpha = av;
          ctx.strokeStyle = rgba(VI, 0.5);
          ctx.fillStyle = rgba(VI, 0.1);
          roundRect(ctx, rx + (1 - av) * 30, y - rowH * 0.34, colW, rowH * 0.68, 7);
          ctx.fill();
          ctx.stroke();
          label(ctx, r.a, rx + (1 - av) * 30 + 12, y, 10, rgba(VI, 0.8));
          ctx.globalAlpha = 1;
        }
        // the join itself: a line drawn from left to right once both sides exist
        const jn = at(time, r.auth + 0.35, r.auth + 0.9);
        if (jn > 0) {
          ctx.strokeStyle = rgba(OK, 0.55 * jn);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(lx + colW, y);
          ctx.lineTo(lx + colW + (rx - lx - colW) * jn, y);
          ctx.stroke();
          if (jn > 0.9) {
            ctx.fillStyle = rgba(OK, 0.9);
            ctx.beginPath();
            ctx.arc((lx + colW + rx) / 2, y, 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        /* THE UNMATCHED ROW. The reach across happens, finds nothing, and comes back. The empty
           bracket on the right is the whole argument: it is the ABSENCE that is the signal. */
        const reach = at(time, r.move + 0.5, r.move + 1.4);
        if (reach > 0) {
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = rgba(NO, 0.5);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(lx + colW, y);
          ctx.lineTo(lx + colW + (rx - lx - colW) * reach, y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        const empty = at(time, r.move + 1.3, r.move + 1.8);
        if (empty > 0) {
          ctx.globalAlpha = empty;
          ctx.strokeStyle = rgba(NO, 0.6);
          ctx.lineWidth = 1.4;
          const bx = rx;
          const by = y - rowH * 0.34;
          const bh = rowH * 0.68;
          ctx.beginPath();
          ctx.moveTo(bx + 10, by);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + 10, by + bh);
          ctx.moveTo(bx + colW - 10, by);
          ctx.lineTo(bx + colW, by);
          ctx.lineTo(bx + colW, by + bh);
          ctx.lineTo(bx + colW - 10, by + bh);
          ctx.stroke();
          label(ctx, L.bad, bx + colW / 2, y, 10, rgba(NO, 0.95), "center");
          ctx.globalAlpha = 1;
        }
        // and the movement itself turns red once the lookup has come back empty
        const flag = at(time, r.move + 1.6, r.move + 2.1);
        if (flag > 0) {
          ctx.strokeStyle = rgba(NO, 0.85 * flag);
          ctx.fillStyle = rgba(NO, 0.16 * flag);
          ctx.lineWidth = 1.6;
          roundRect(ctx, lx, y - rowH * 0.34, colW, rowH * 0.68, 7);
          ctx.fill();
          ctx.stroke();
          label(ctx, r.m, lx + 12, y, 10, rgba(NO, 0.95));
        }
      }
    }

    // the verdict, once the last row has resolved
    const v = at(time, 9.8, 10.5);
    if (v > 0) {
      const bw = Math.min(w - padX * 2, 340);
      const bx = (w - bw) / 2;
      const by = h - 24;
      ctx.globalAlpha = v;
      ctx.fillStyle = rgba(NO, 0.14);
      ctx.strokeStyle = rgba(NO, 0.55);
      ctx.lineWidth = 1.2;
      roundRect(ctx, bx, by - 13, bw, 26, 13);
      ctx.fill();
      ctx.stroke();
      label(ctx, L.verdict, w / 2, by, 11, rgba(NO, 0.98), "center");
      ctx.globalAlpha = 1;
    }
  }

  return { step, loop: JOIN_LOOP };
}

/* =============================================================================================
 * DIAGRAM TWO: THE STACK, DEEP DIVE.
 *
 * Seven bands. Events rise through them, the seam between 03 and 04 is where the join lives and is
 * drawn as the only bright edge in the picture, and every few seconds the second hop fires: a small
 * graph traversal across the HOLD band that finds a person rather than a transaction.
 *
 * The layer NAMES arrive from the locale pack, so the German page shows German bands.
 * ========================================================================================== */
