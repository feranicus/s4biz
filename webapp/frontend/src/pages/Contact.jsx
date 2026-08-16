import { useState } from "react";
import { Link } from "react-router-dom";
import { useT } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import { sendEnquiry } from "../api.js";
import { CONTACT } from "../components/Footer.jsx";
import ContactChannels from "../components/ContactChannels.jsx";
import SectionHead from "../components/SectionHead.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export default function Contact() {
  const [, , t] = useT();
  const [f, setF] = useState({ name: "", email: "", company: "", message: "", website: "" });
  const [state, setState] = useState("idle"); // idle | sending | ok | error
  const [err, setErr] = useState("");

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!f.name.trim() || !f.email.trim() || !f.message.trim()) {
      setErr(t("ct.required"));
      return;
    }
    if (!EMAIL_RE.test(f.email.trim())) {
      setErr(t("ct.bademail"));
      return;
    }
    setState("sending");
    const r = await sendEnquiry(f);
    if (r.ok) {
      setState("ok");
    } else {
      setState("error");
      setErr(t("ct.err"));
    }
  }

  return (
    <>
      <section className="phead">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            {t("ct.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t("ct.h")}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t("ct.lede")}
          </Reveal>
        </div>
      </section>

      {/* ---- the channels, before the form.
             Most people who reach this page want to talk to a person now, not fill in four
             fields. The form is for anyone who would rather write it all down once. ---------- */}
      <section className="sec">
        <div className="wrap">
          <SectionHead h={t("ch.h")} lede={t("ch.lede")} />
          <ContactChannels />
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap ct-grid">
          <Reveal className="ct-form">
            {state === "ok" ? (
              <div className="ct-ok" role="status">
                <h2>{t("ct.ok.h")}</h2>
                <p>{t("ct.ok.b")}</p>
                <Link className="btn ghost" to="/">
                  {t("err.cta")}
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <label>
                  <span>{t("ct.name")}</span>
                  <input
                    value={f.name}
                    onChange={set("name")}
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </label>
                <label>
                  <span>{t("ct.email")}</span>
                  <input
                    type="email"
                    value={f.email}
                    onChange={set("email")}
                    autoComplete="email"
                    required
                    maxLength={180}
                  />
                </label>
                <label>
                  <span>{t("ct.company")}</span>
                  <input
                    value={f.company}
                    onChange={set("company")}
                    autoComplete="organization"
                    maxLength={160}
                  />
                </label>
                <label>
                  <span>{t("ct.msg")}</span>
                  <textarea
                    value={f.message}
                    onChange={set("message")}
                    rows={6}
                    placeholder={t("ct.msg.ph")}
                    required
                    maxLength={4000}
                  />
                </label>

                {/* Honeypot. A real person never sees this field, so anything in it is a bot.
                    Chosen over a third party captcha deliberately: a captcha ships somebody
                    else's script and somebody else's cookie onto a page whose privacy notice
                    promises neither, and it would have to be named as a recipient. */}
                <div className="hp" aria-hidden="true">
                  <label>
                    Website
                    <input value={f.website} onChange={set("website")} tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                {err && (
                  <p className="ct-err" role="alert">
                    {err}
                  </p>
                )}
                <button className="btn cta lg" type="submit" disabled={state === "sending"}>
                  {state === "sending" ? t("ct.sending") : t("ct.send")}
                </button>
                <p className="ct-note">
                  {t("ct.privacy")} <Link to="/privacy">{t("nav.privacy")}</Link>
                </p>
              </form>
            )}
          </Reveal>

          <Reveal className="ct-direct" delay={80}>
            <h2>{t("ct.direct")}</h2>
            <a className="ct-row" href={`mailto:${CONTACT.email}`}>
              <span className="mono">Email</span>
              {CONTACT.email}
            </a>
            <a className="ct-row" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
              <span className="mono">Phone</span>
              {CONTACT.phone}
            </a>
            <a
              className="ct-row"
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="mono">LinkedIn</span>
              /in/feranicus
            </a>
            <div className="ct-legal">
              <p className="mono">{CONTACT.entity}</p>
              <p>{CONTACT.addr}</p>
              <p className="mono">VAT {CONTACT.vat}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
