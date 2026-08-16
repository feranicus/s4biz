/* ONE fetch helper, ONE return contract.
 *
 * A module that exports two helpers with DIFFERENT return shapes (one returning the parsed body,
 * one returning {ok, status, data}) is a trap: a call site that destructures the wrong one gets
 * `undefined` for every name, compiles, renders, and simply never works. That defect has cost
 * this codebase two silently disappearing features. So there is exactly one shape here, and
 * every caller can only get it right.
 *
 * RETURNS, always: { ok: boolean, status: number, data: object }
 * It never throws. A network failure is ok:false with status 0.
 */
export async function post(path, body) {
  try {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
      credentials: "same-origin",
    });
    let data = {};
    try {
      data = await r.json();
    } catch {
      data = {};
    }
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: {} };
  }
}

export function sendEnquiry(payload) {
  return post("/api/contact", payload);
}
