import { OPERATOR } from "../legal.jsx";
import { useT } from "../i18n.jsx";
import Reveal from "./Reveal.jsx";

/* The channel cards on /contact.
 *
 * ORDER IS DELIBERATE: WhatsApp first, because it is the channel with the shortest time to reply
 * and the one a phone visitor can act on in one tap. A contact page should lead with the fastest
 * door, not with the most formal one.
 *
 * A CHANNEL WITH NO HANDLE RENDERS AS "coming soon", NEVER AS A DEAD LINK. An href built from an
 * empty field produces a link that looks live and goes nowhere, and nobody reports it because it
 * looks fine. A blind search and replace across this codebase once produced `mailto:WhatsApp +351
 * 939 994 642`, which is exactly that failure; tools/i18n_gate.mjs now asserts every mailto
 * resolves to an address.
 */
const ICONS = {
  wa: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.5-4.4a8.5 8.5 0 1 1 15.5-4.5z" />
      <path d="M8.8 8.2c.3-.1.6 0 .8.3l.8 1.3c.1.2.1.5 0 .7l-.5.7c.6 1.1 1.5 2 2.6 2.6l.7-.5c.2-.1.5-.2.7 0l1.3.8c.3.2.4.5.3.8-.3.9-1.2 1.5-2.1 1.3-2.9-.5-5.3-2.9-5.9-5.9-.2-.9.4-1.8 1.3-2.1z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />
    </svg>
  ),
  li: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5V17M7.5 7.6v.1M11.5 17v-3.6a2.4 2.4 0 0 1 4.8 0V17" />
    </svg>
  ),
  tg: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 4L3 11l5 2 2 6 3-4 5 4z" />
      <path d="M8 13l9-6" />
    </svg>
  ),
  gh: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 19c-4 1.4-4-2.2-6-2.8m12 4.8v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.7 11.7 0 0 0-6 0C6.5 2.4 5.5 2.7 5.5 2.7a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4 9.2c0 4.6 2.8 5.6 5.5 6a3 3 0 0 0-.8 2.3V21" />
    </svg>
  ),
};

export default function ContactChannels() {
  const [, , t] = useT();

  const cards = [
    {
      k: "wa",
      href: OPERATOR.whatsapp ? `${OPERATOR.whatsapp}?text=${encodeURIComponent(t("wa.msg"))}` : "",
      label: OPERATOR.whatsappLabel,
      ext: true,
    },
    { k: "email", href: OPERATOR.email ? `mailto:${OPERATOR.email}` : "", label: OPERATOR.email },
    {
      k: "phone",
      href: OPERATOR.phone ? `tel:${OPERATOR.phone.replace(/[\s()-]/g, "")}` : "",
      label: OPERATOR.phone,
    },
    { k: "li", href: OPERATOR.linkedin, label: "LinkedIn", ext: true },
    { k: "tg", href: OPERATOR.telegram, label: "Telegram", ext: true },
    { k: "gh", href: OPERATOR.github, label: "GitHub", ext: true },
  ];

  return (
    <div className="ccards">
      {cards.map((c, i) =>
        c.href ? (
          <Reveal key={c.k} delay={Math.min(i, 5) * 50}>
            <a
              className={`ccard ${c.k}`}
              href={c.href}
              target={c.ext ? "_blank" : undefined}
              rel={c.ext ? "noreferrer" : undefined}
            >
              <span className="cico">{ICONS[c.k]}</span>
              <span className="ctit">{t(`ch.${c.k}`)}</span>
              <span className="cdesc">{t(`ch.${c.k}.d`)}</span>
              <span className="clink">
                {c.label}
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h13M12 5l7 7-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </Reveal>
        ) : (
          <Reveal key={c.k} delay={Math.min(i, 5) * 50}>
            <div className="ccard off">
              <span className="cico">{ICONS[c.k]}</span>
              <span className="ctit">{t(`ch.${c.k}`)}</span>
              <span className="cdesc">{t(`ch.${c.k}.d`)}</span>
              <span className="clink">{t("ch.soon")}</span>
            </div>
          </Reveal>
        )
      )}
    </div>
  );
}
