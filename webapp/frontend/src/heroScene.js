/* The hero animation, as a PURE MODULE with no browser dependency.
 *
 * WHY IT LIVES OUTSIDE THE COMPONENT. Drawing code inside a useEffect can only be exercised by a
 * real browser, so in practice it is never exercised at all: `node --check` PARSES it, and an
 * invalid colour or a typo'd helper is legal JavaScript until the moment it executes. That exact
 * class of defect shipped once as a black rectangle with 3,637 identical console errors, because
 * a malformed colour string threw on the first call of the first frame and killed the loop before
 * anything was drawn.
 *
 * Here, `step()` takes a canvas-like context, so tools/render_gate.mjs can run the whole timeline
 * against a stub that VALIDATES every colour reaching fillStyle and strokeStyle. A parse is not a
 * run.
 */

export const LINK = 148;

/* Build a complete, valid colour string from components. NEVER by string surgery on a hex value:
 * `"rgba(" + hex.replace(...)` produced "rgba(FF3B57" and threw. */
export function rgba(hex, a) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
  if (!m) return `rgba(136,150,190,${clamp(a)})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${clamp(a)})`;
}

function clamp(a) {
  const n = Number(a);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, Math.round(n * 1000) / 1000));
}

export function makeScene({ w, h, cyan = "#22D3EE", violet = "#8B5CF6", rand = Math.random }) {
  const width = Math.max(1, w | 0);
  const height = Math.max(1, h | 0);
  // Density scales with area, so a phone does not get a hairball and a wide monitor is not empty.
  const count = Math.round(Math.min(90, Math.max(26, (width * height) / 17000)));
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: rand() * width,
      y: rand() * height,
      vx: (rand() - 0.5) * 0.16,
      vy: (rand() - 0.5) * 0.16,
      r: rand() * 1.5 + 0.7,
      hub: rand() < 0.14,
    });
  }

  let sweep = -0.25;

  function step(ctx, { drift = true } = {}) {
    ctx.clearRect(0, 0, width, height);
    const sx = sweep * width;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        const d = Math.sqrt(d2);
        const lit = 1 - Math.min(Math.abs((a.x + b.x) / 2 - sx) / 150, 1);
        ctx.strokeStyle = rgba(lit > 0.35 ? cyan : violet, 0.1 * (1 - d / LINK) + lit * 0.3);
        ctx.lineWidth = lit > 0.5 ? 1.05 : 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const n of nodes) {
      const lit = 1 - Math.min(Math.abs(n.x - sx) / 150, 1);
      ctx.fillStyle = rgba(n.hub ? cyan : violet, 0.3 + lit * 0.6);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + (n.hub ? 1.1 : 0) + lit * 1.1, 0, Math.PI * 2);
      ctx.fill();
      if (drift) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }
    }

    sweep += 0.0016;
    if (sweep > 1.3) sweep = -0.3;
  }

  return { nodes, step };
}
