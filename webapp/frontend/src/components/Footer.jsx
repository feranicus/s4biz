import { Link } from "react-router-dom";
import { useT } from "../i18n.jsx";
import { OPERATOR } from "../legal.jsx";
import Logo from "./Logo.jsx";

/* DERIVED, never restated.
 *
 * This used to be a second copy of the same facts, and the two promptly disagreed: the phone
 * number here was one digit short and therefore unreachable, while legal.jsx had it right. A
 * contact detail with two homes is a contact detail that is wrong in one of them.
 *
 * The export is kept so existing callers do not have to change, but every value now comes from
 * OPERATOR. tests/test_legal_and_caddy.py asserts this file does not restate them.
 */
export const CONTACT = {
  email: OPERATOR.email,
  phone: OPERATOR.phone,
  linkedin: OPERATOR.linkedin,
  whatsapp: OPERATOR.whatsapp,
  whatsappLabel: OPERATOR.whatsappLabel,
  telegram: OPERATOR.telegram,
  entity: OPERATOR.entity,
  vat: OPERATOR.vat,
  addr: OPERATOR.addr,
};

export default function Footer() {
  const [, , t] = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="f-brand">
          <Link to="/" className="brand" aria-label="S4Biz">
            <Logo size={30} />
            <span className="bt">
              S4<b>Biz</b>
            </span>
          </Link>
          <p>{t("foot.tag")}</p>
          <p className="f-eu">{t("foot.built")}</p>
        </div>

        <div className="f-col">
          <h4>{t("foot.nav")}</h4>
          <Link to="/capabilities">{t("nav.capabilities")}</Link>
          <Link to="/method">{t("nav.method")}</Link>
          <Link to="/work">{t("nav.work")}</Link>
          <Link to="/about">{t("nav.about")}</Link>
        </div>

        <div className="f-col">
          <h4>{t("foot.legal")}</h4>
          <Link to="/contact">{t("nav.contact")}</Link>
          <Link to="/privacy">{t("nav.privacy")}</Link>
          <Link to="/impressum">{t("nav.impressum")}</Link>
        </div>

        <div className="f-col">
          <h4>{t("foot.reach")}</h4>
          {/* A mailto and a tel are the real address. A blind search and replace across code once
              produced `mailto:WhatsApp +351...` here, which is a dead link nobody notices, so
              tools/content_gate.mjs asserts every mailto: is followed by an @. */}
          <a className="f-wa" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`tel:${CONTACT.phone.replace(/[\s()-]/g, "")}`}>{CONTACT.phone}</a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer">
            Telegram
          </a>
        </div>
      </div>
      <div className="wrap f-legal">
        <span>
          © {year} {t("foot.rights")}
        </span>
        <span>
          {CONTACT.entity} · VAT {CONTACT.vat} · {CONTACT.addr}
        </span>
      </div>
    </footer>
  );
}
