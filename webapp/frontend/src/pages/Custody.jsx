import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useT, useContent } from "../i18n.jsx";
import Diagram from "../components/Diagram.jsx";
import { makeJoinScene } from "../custodyScenes.js";
import ArchMap from "../components/ArchMap.jsx";
import CaseWalk from "../components/CaseWalk.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHead from "../components/SectionHead.jsx";
import ServiceHead from "../components/ServiceHead.jsx";

/* Custody observability.
 *
 * ZERO COPY IN THIS FILE. Every string comes from locales/*.custody.js and every list comes from
 * useContent, so a translation can only ever change words. A translator editing the German pack
 * cannot move a section, drop a column or reorder the stack, because none of those things live in
 * the file they edit. Same rule as the three service pages.
 *
 * NO NEW CSS EITHER. The layer stack reuses .life, the refusals reuse .rule, the limits reuse
 * .honest, and the tiers reuse .split. Inventing classes here would mean inventing colours, and
 * every colour on this site has to clear a measured contrast ratio before it ships. Reuse is not
 * laziness: it is the cheapest way to stay inside a gate that has already been proven.
 */

const JUMPS = [
  { id: "stack", key: "cus.jump1" },
  { id: "triangulation", key: "cus.jump2" },
  { id: "cases", key: "cus.jump4" },
];

export default function Custody() {
  const [, , t] = useT();
  const layers = useContent("custodyLayers");
  const tiers = useContent("custodyTiers");
  const limits = useContent("custodyLimits");
  const cases = useContent("custodyCases");

  /* MEMOISED ON THE LANGUAGE, and that is not a detail.
     The labels are baked into a scene when it is BUILT, so a scene constructed once would keep
     drawing English after the reader switched to German. A fresh arrow on every render would
     rebuild the canvas on every frame instead. Both are defects this project has already paid for,
     one in each direction. */
  const join = useCallback(
    ({ w, h }) =>
      makeJoinScene({
        w,
        h,
        labels: {
          left: t("cus.dia1.left"),
          right: t("cus.dia1.right"),
          bad: t("cus.dia1.none"),
          verdict: t("cus.dia1.verdict"),
        },
      }),
    [t],
  );
  return (
    <>
      <ServiceHead eyebrow={t("cus.eyebrow")} h={t("cus.h")} lede={t("cus.lede")} jumps={JUMPS} />

      {/* ---- the governing idea, on its own, because everything else is downstream of it ---- */}
      <section className="sec" id="idea">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.idea.eyebrow")}
            h={t("cus.idea.h")}
            lede={t("cus.idea.lede")}
          />
          <Diagram make={join} height={300} label={t("cus.dia1.alt")} />
          <p className="note">{t("cus.dia1.cap")}</p>
          <div className="g3">
            <Reveal className="card">
              <h3>{t("cus.prec.h")}</h3>
              <p>{t("cus.prec.b1")}</p>
            </Reveal>
            <Reveal className="card" delay={60}>
              <h3>{t("cus.prec.eyebrow")}</h3>
              <p>{t("cus.prec.b2")}</p>
            </Reveal>
            <Reveal className="card" delay={120}>
              <h3>{t("cus.tri.contra.h")}</h3>
              <p>{t("cus.prec.b3")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- what analytics can and cannot do, then the orchestration argument.
             These two belong together and in this order: the objection first, the answer second.
             Leading with the answer reads as a pitch; leading with the objection reads as
             somebody who has had the conversation before. ---------------------------------- */}
      <section className="sec alt" id="orchestration">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.chain.eyebrow")}
            h={t("cus.chain.h")}
            lede={t("cus.chain.lede")}
          />
          <div className="split">
            <div className="best">
              <h3>{t("cus.chain.eyebrow")}</h3>
              <Reveal className="item">
                <p>{t("cus.chain.b1")}</p>
              </Reveal>
              <Reveal className="item" delay={50}>
                <p>{t("cus.chain.b2")}</p>
              </Reveal>
              <Reveal className="item" delay={100}>
                <p>{t("cus.chain.b3")}</p>
              </Reveal>
            </div>
            <div className="diff">
              <h3>{t("cus.orch.eyebrow")}</h3>
              <Reveal className="item">
                <b>{t("cus.orch.h")}</b>
                <p>{t("cus.orch.lede")}</p>
              </Reveal>
              <Reveal className="item" delay={50}>
                <p>{t("cus.orch.b1")}</p>
              </Reveal>
              <Reveal className="item" delay={100}>
                <p>{t("cus.orch.b2")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---- the seven layers ------------------------------------------------------------ */}
      <section className="sec" id="stack">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.layers.eyebrow")}
            h={t("cus.layers.h")}
            lede={t("cus.layers.lede")}
          />
          <ArchMap
            rows={[
              { n: layers[6] && layers[6].n, k: layers[6] && layers[6].k, y: 1 },
              { n: layers[5] && layers[5].n, k: layers[5] && layers[5].k, y: 15.5 },
              { n: layers[4] && layers[4].n, k: layers[4] && layers[4].k, y: 30 },
              { n: layers[3] && layers[3].n, k: layers[3] && layers[3].k, y: 45 },
              { n: layers[2] && layers[2].n, k: layers[2] && layers[2].k, y: 59.5 },
              { n: layers[1] && layers[1].n, k: layers[1] && layers[1].k, y: 74 },
              { n: layers[0] && layers[0].n, k: layers[0] && layers[0].k, y: 88.5 },
            ].filter((r) => r.n)}
            joinLabel={t("cus.dia2.join")}
            nodeLabels={{
              chain: t("cus.n.chain"),
              case: t("cus.n.case"),
              vault: t("cus.n.vault"),
              schema: t("cus.n.schema"),
              panel: t("cus.n.panel"),
              recall: t("cus.n.recall"),
              bus: t("cus.n.bus"),
              cdc: t("cus.n.cdc"),
              stream: t("cus.n.stream"),
              vocab: t("cus.n.vocab"),
              entity: t("cus.n.entity"),
              hot: t("cus.n.hot"),
              sql: t("cus.n.sql"),
              graph: t("cus.n.graph"),
              rule: t("cus.n.rule"),
              hop: t("cus.n.hop"),
              queue: t("cus.n.queue"),
            }}
            descs={{
              chain: t("cus.d.chain"),
              case: t("cus.d.case"),
              vault: t("cus.d.vault"),
              schema: t("cus.d.schema"),
              panel: t("cus.d.panel"),
              recall: t("cus.d.recall"),
              bus: t("cus.d.bus"),
              cdc: t("cus.d.cdc"),
              stream: t("cus.d.stream"),
              vocab: t("cus.d.vocab"),
              entity: t("cus.d.entity"),
              hot: t("cus.d.hot"),
              sql: t("cus.d.sql"),
              graph: t("cus.d.graph"),
              rule: t("cus.d.rule"),
              hop: t("cus.d.hop"),
              queue: t("cus.d.queue"),
            }}
          />
          <p className="note">{t("cus.dia2.cap")}</p>
        </div>
      </section>

      {/* ---- deep dive, layer by layer, with a real product mapping.
             The chips are named products because an architecture diagram with unlabelled boxes
             commits to nothing. Substitute freely: the shape is the argument, not the vendor. --- */}
      <section className="sec alt" id="deep">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.deep.eyebrow")}
            h={t("cus.deep.h")}
            lede={t("cus.deep.lede")}
          />
          {layers.map((l, i) => (
            <Reveal className="dlay" key={l.n} delay={Math.min(i, 6) * 40}>
              <div className="dlay-h">
                <span className="dlay-n">{l.n}</span>
                <div>
                  <h3>{l.k}</h3>
                  <p className="dlay-r">{l.role}</p>
                </div>
              </div>
              <p>{l.deep}</p>
              <span className="dlay-lbl">{t("cus.deep.map")}</span>
              <ul className="dlay-p">
                {(l.products || []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <span className="dlay-lbl">{t("cus.deep.inside")}</span>
              <ul className="dlay-c">
                {(l.items || []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- layer 06 in full. It is the layer every reader asks about first, so it gets its own
             section rather than one card in a list. ------------------------------------------ */}
      <section className="sec" id="panel">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.pan.eyebrow")}
            h={t("cus.pan.h")}
            lede={t("cus.pan.lede")}
          />
          <div className="g3">
            {["r1", "r2", "r3", "r4", "r5", "r6"].map((k, i) => (
              <Reveal className="card" key={k} delay={Math.min(i, 5) * 55}>
                <h3>{t("cus.pan." + k + "h")}</h3>
                <p>{t("cus.pan." + k + "b")}</p>
              </Reveal>
            ))}
          </div>
          <div className="honest">
            <p>{t("cus.pan.note")}</p>
          </div>
        </div>
      </section>

      {/* ---- the same stack, entirely open source.
             A second chip row per layer rather than a second page: the reader is comparing, and a
             comparison split across two screens is not one. ------------------------------------ */}
      <section className="sec" id="oss">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.oss.eyebrow")}
            h={t("cus.oss.h")}
            lede={t("cus.oss.lede")}
          />
          <div className="g3">
            <Reveal className="card">
              <h3>{t("cus.oss.v1h")}</h3>
              <p>{t("cus.oss.v1b")}</p>
            </Reveal>
            <Reveal className="card" delay={60}>
              <h3>{t("cus.oss.v2h")}</h3>
              <p>{t("cus.oss.v2b")}</p>
            </Reveal>
            <Reveal className="card" delay={120}>
              <h3>{t("cus.oss.v3h")}</h3>
              <p>{t("cus.oss.v3b")}</p>
            </Reveal>
            <Reveal className="card" delay={180}>
              <h3>{t("cus.oss.v4h")}</h3>
              <p>{t("cus.oss.v4b")}</p>
            </Reveal>
            <Reveal className="card" delay={240}>
              <h3>{t("cus.oss.mixh")}</h3>
              <p>{t("cus.oss.mixb")}</p>
            </Reveal>
          </div>

          {/* The caveat gets its own block, not a bullet in a list of benefits. A page that only
              argues for something is an advertisement. */}
          <div className="honest">
            <h3>{t("cus.oss.v5h")}</h3>
            <p>{t("cus.oss.v5b")}</p>
          </div>

          {layers.map((l, i) => (
            <Reveal className="dlay" key={l.n} delay={Math.min(i, 6) * 40}>
              <div className="dlay-h">
                <span className="dlay-n oss">{l.n}</span>
                <div>
                  <h3>{l.k}</h3>
                  <p className="dlay-r">{l.ossw}</p>
                </div>
              </div>
              <span className="dlay-lbl">{t("cus.oss.stack")}</span>
              <ul className="dlay-o">
                {(l.oss || []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- two investigations, end to end.
             The second one is the important one: it is the night the system stays SILENT. A
             detection story alone reads as a vendor demo, because every product catches the case it
             was demonstrated on. ----------------------------------------------------------- */}
      <section className="sec" id="cases">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.cases.eyebrow")}
            h={t("cus.cases.h")}
            lede={t("cus.cases.lede")}
          />
          {cases.map((c) => (
            <CaseWalk key={c.id} c={c} />
          ))}
        </div>
      </section>

      {/* ---- triangulation, and the arithmetic that makes the queue readable -------------- */}
      <section className="sec alt" id="triangulation">
        <div className="wrap">
          <SectionHead eyebrow={t("cus.tri.eyebrow")} h={t("cus.tri.h")} lede={t("cus.tri.lede")} />
          <div className="g3">
            {tiers.map((x, i) => (
              <Reveal className="card" key={x.t} delay={i * 60}>
                <span className="rn mono">{x.t}</span>
                <h3>{x.n}</h3>
                <p>{x.c}</p>
                <span className="trap">{x.a}</span>
              </Reveal>
            ))}
          </div>
          <div className="split">
            <div className="best">
              <h3>{t("cus.tri.math.h")}</h3>
              <Reveal className="item">
                <p>{t("cus.tri.math.b")}</p>
              </Reveal>
              <div className="honest">
                <p>{t("cus.tri.math.warn")}</p>
              </div>
            </div>
            <div className="diff">
              <h3>{t("cus.graph.eyebrow")}</h3>
              <Reveal className="item">
                <b>{t("cus.graph.h")}</b>
                <p>{t("cus.graph.b1")}</p>
              </Reveal>
              <Reveal className="item" delay={50}>
                <p>{t("cus.graph.b2")}</p>
              </Reveal>
              <Reveal className="item" delay={100}>
                <p>{t("cus.graph.b3")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---- where the models sit. Same doctrine this site's own release pipeline runs on,
             which is why it is stated as practice rather than as opinion. ------------------ */}
      <section className="sec" id="models">
        <div className="wrap">
          <SectionHead eyebrow={t("cus.models.eyebrow")} h={t("cus.models.h")} />
          <div className="g3">
            <Reveal className="card">
              <p>{t("cus.models.b1")}</p>
            </Reveal>
            <Reveal className="card" delay={60}>
              <p>{t("cus.models.b2")}</p>
            </Reveal>
            <Reveal className="card" delay={120}>
              <p>{t("cus.models.b3")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- honest limits, then how it starts. In that order deliberately: the boundary
             before the offer, so the offer is read as a scope rather than a promise. ------- */}
      <section className="sec" id="limits">
        <div className="wrap">
          <SectionHead
            eyebrow={t("cus.limits.eyebrow")}
            h={t("cus.limits.h")}
            lede={t("cus.limits.lede")}
          />
          <div className="g2">
            {limits.map((l, i) => (
              <Reveal className="card" key={l.h} delay={Math.min(i, 5) * 50}>
                <h3>{l.h}</h3>
                <p>{l.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt" id="start">
        <div className="wrap">
          <SectionHead eyebrow={t("cus.start.eyebrow")} h={t("cus.start.h")} />
          <div className="g3">
            <Reveal className="card">
              <p>{t("cus.start.b1")}</p>
            </Reveal>
            <Reveal className="card" delay={60}>
              <p>{t("cus.start.b2")}</p>
            </Reveal>
            <Reveal className="card" delay={120}>
              <p>{t("cus.start.b3")}</p>
            </Reveal>
          </div>
          <div className="sec-cta">
            <Link className="btn cta" to="/contact">
              {t("cus.cta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
