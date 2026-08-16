import { useLocation } from "react-router-dom";
import { OPERATOR } from "../legal.jsx";
import { useT } from "../i18n.jsx";

/* The floating WhatsApp button.
 *
 * WHY A FLOATING BUTTON AND NOT A SEVENTH TAB. The phone tab bar already carries six items, and a
 * seventh makes every target too small to hit reliably. Contact is also not a PLACE in the page,
 * it is an ACTION, so it belongs above the navigation rather than inside it. Without this, an
 * installed progressive web app has no way to reach a human at all from most screens.
 *
 * `bottom` clears the fixed tab bar plus the iPhone home indicator through the safe area inset.
 * On a wide screen there is no tab bar, so it sits lower.
 *
 * NOT ON /contact. A floating shortcut to WhatsApp on the page that already lists WhatsApp is
 * clutter, and it covers the form.
 */
export default function WhatsAppFab() {
  const [, , t] = useT();
  const { pathname } = useLocation();
  if (pathname === "/contact") return null;
  if (!OPERATOR.whatsapp) return null;

  const href = `${OPERATOR.whatsapp}?text=${encodeURIComponent(t("wa.msg"))}`;
  return (
    <a
      className="wa-fab"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={t("wa.aria")}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.5-4.4a8.5 8.5 0 1 1 15.5-4.5z" />
        <path d="M8.8 8.2c.3-.1.6 0 .8.3l.8 1.3c.1.2.1.5 0 .7l-.5.7c.6 1.1 1.5 2 2.6 2.6l.7-.5c.2-.1.5-.2.7 0l1.3.8c.3.2.4.5.3.8-.3.9-1.2 1.5-2.1 1.3-2.9-.5-5.3-2.9-5.9-5.9-.2-.9.4-1.8 1.3-2.1z" />
      </svg>
      <span>WhatsApp</span>
    </a>
  );
}
