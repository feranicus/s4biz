/* ALL legal copy lives in THIS ONE FILE, in both languages.
 *
 * WHY ONE FILE. The privacy page and any privacy notice shown elsewhere must never drift apart:
 * the moment the same promise exists in two places, one of them goes stale and the site is making
 * a false statement about how it handles personal data. Pages render from here and hold no copy.
 *
 * GERMAN IS NORMATIVE for the Imprint. Section 5 of the German Digital Services Act (DDG, which
 * replaced TMG section 5) governs a site that addresses the German market, and the German text is
 * the one that has to be right. The English is a courtesy translation and says so.
 *
 * EVERY CLAIM ON THIS PAGE IS LOAD-BEARING. "Hosted in the European Union", "no third party
 * analytics" and the retention period are statements a regulator can check. If the hosting, the
 * log retention or the tooling changes, this file changes in the SAME commit. tests/test_legal.py
 * asserts the operator entity, the VAT identifier and the contact address here match the ones the
 * footer renders, because two sources for one fact is how they diverge.
 */

/* Fields we have verified. Anything left empty is simply not rendered rather than being filled
 * with a plausible guess: an invented commercial register number on an Imprint is worse than a
 * missing one. tools/legal_gate.mjs lists what is still missing so it cannot be forgotten. */
export const OPERATOR = {
  entity: "Stars4business OÜ",
  form: "Osaühing (Estonian private limited company)",
  addr: "Sepapaja tn 6, 15551 Tallinn, Estonia",
  vat: "EE102156878",
  director: "Evgeny Vainshtein",
  email: "feranicus@s4biz.io",
  // CORRECTED. This read "+49 157 855 1545", which is one digit short and therefore unreachable.
  // The number on the previous site was published as +4915785541545, and cybergod.ai carries the
  // same one, so both independent sources agree on eleven digits after the country code.
  phone: "+49 157 8554 1545",
  regNo: "", // Estonian registry code, to be confirmed

  // --- contact channels ---------------------------------------------------------------------
  // ONE PLACE. The footer, the contact page and the floating button all read from here, so a
  // number can never be right in one of them and stale in another.
  //
  // A wa.me deep link wants the number in INTERNATIONAL form with no plus, spaces or dashes.
  // `whatsappLabel` is the human readable version shown on the page. Keeping the two separate is
  // deliberate: a single field would eventually be formatted for the reader and break the link.
  whatsapp: "https://wa.me/351939994642",
  whatsappLabel: "+351 939 994 642",
  telegram: "https://t.me/feranicus",
  linkedin: "https://www.linkedin.com/in/feranicus",
  github: "https://github.com/feranicus",
};

export const DE_ENTITY = {
  entity: "S4biz UG (haftungsbeschränkt)",
  vat: "DE361822318",
  city: "Pinneberg, Germany",
  street: "", // to be confirmed
  register: "", // Amtsgericht and HRB number, to be confirmed
};

export const HOSTING = {
  provider: "DigitalOcean",
  region: "Frankfurt am Main, Germany (FRA1)",
  retentionDays: 30,
};

export const PRIVACY = {
  en: {
    h: "Privacy notice",
    intro:
      "This notice explains what personal data this website processes, why, and for how long. It is written for a reader, not for a lawyer. The German version is the reference text.",
    sections: [
      {
        h: "Who is responsible",
        body: `${OPERATOR.entity}, ${OPERATOR.addr}. Contact ${OPERATOR.email}. We have not appointed a data protection officer because we are not required to under Article 37 of the General Data Protection Regulation.`,
      },
      {
        h: "What we collect when you simply read the site",
        body: `Our server records the request: the time, the page requested, the response status, the referring page, the browser identification string, and the network address the request came from. This is ordinary web server logging. It is needed to operate the site and to detect abuse, which is a legitimate interest under Article 6(1)(f). Logs are kept for ${HOSTING.retentionDays} days and then deleted.`,
      },
      {
        h: "What we collect when you write to us",
        body: "The contact form sends us the name, work email address, company and message you type. We use it only to answer you, on the basis of Article 6(1)(b) and (f). We keep an enquiry for as long as the conversation is live and for up to two years afterwards, so that we can pick a thread back up. It is never sold, rented or shared for marketing.",
      },
      {
        h: "What we deliberately do not do",
        body: "There are no advertising trackers, no third party analytics, no social media pixels and no cookie banner, because there is nothing here that would require consent. The site sets no tracking cookies at all. Your language choice is stored in your own browser and never leaves it.",
      },
      {
        h: "Where the data is",
        body: `The site and its logs run on ${HOSTING.provider} infrastructure in ${HOSTING.region}. Nothing is replicated outside the European Union. Web fonts are served from Google Fonts, which means your browser requests the font files from a Google server and Google therefore sees the network address of that request. If you would rather that did not happen, a content blocker will stop it and the site remains fully readable.`,
      },
      {
        h: "Your rights",
        body: "You can ask us what we hold about you, ask for it to be corrected or deleted, ask us to restrict how we use it, ask for a copy in a portable form, and object to processing based on legitimate interest. Write to the address above. You may also complain to a supervisory authority, for example the Estonian Data Protection Inspectorate or the authority where you live.",
      },
    ],
  },
  de: {
    h: "Datenschutzhinweis",
    intro:
      "Dieser Hinweis erklärt, welche personenbezogenen Daten diese Website verarbeitet, warum und wie lange. Er ist für Lesende geschrieben, nicht für Juristen. Die deutsche Fassung ist maßgeblich.",
    sections: [
      {
        h: "Verantwortlich",
        body: `${OPERATOR.entity}, ${OPERATOR.addr}. Kontakt ${OPERATOR.email}. Ein Datenschutzbeauftragter wurde nicht benannt, da hierzu nach Artikel 37 der Datenschutz-Grundverordnung keine Pflicht besteht.`,
      },
      {
        h: "Was beim bloßen Lesen der Seite erhoben wird",
        body: `Unser Server protokolliert die Anfrage: Zeitpunkt, aufgerufene Seite, Antwortstatus, verweisende Seite, Browserkennung und die Netzadresse, von der die Anfrage kam. Das ist übliche Server-Protokollierung. Sie ist für Betrieb und Missbrauchserkennung erforderlich und stützt sich auf das berechtigte Interesse nach Artikel 6 Absatz 1 Buchstabe f. Protokolle werden nach ${HOSTING.retentionDays} Tagen gelöscht.`,
      },
      {
        h: "Was bei einer Nachricht an uns erhoben wird",
        body: "Das Kontaktformular übermittelt Name, geschäftliche E-Mail-Adresse, Unternehmen und Nachricht. Wir verwenden diese Angaben ausschließlich zur Beantwortung, gestützt auf Artikel 6 Absatz 1 Buchstaben b und f. Eine Anfrage bewahren wir für die Dauer des Austauschs und bis zu zwei Jahre danach auf, um ein Gespräch wieder aufnehmen zu können. Sie wird niemals verkauft, vermietet oder für Werbung weitergegeben.",
      },
      {
        h: "Was wir bewusst nicht tun",
        body: "Es gibt keine Werbe-Tracker, keine Analytik von Drittanbietern, keine Social-Media-Pixel und kein Cookie-Banner, weil hier nichts einwilligungsbedürftig ist. Die Seite setzt keinerlei Tracking-Cookies. Ihre Sprachwahl wird in Ihrem eigenen Browser gespeichert und verlässt ihn nicht.",
      },
      {
        h: "Wo die Daten liegen",
        body: `Die Seite und ihre Protokolle laufen auf Infrastruktur von ${HOSTING.provider} in ${HOSTING.region}. Nichts wird außerhalb der Europäischen Union gespiegelt. Schriftarten werden von Google Fonts geladen, das heißt Ihr Browser fordert die Schriftdateien von einem Google-Server an und Google sieht dabei die Netzadresse dieser Anfrage. Wer das nicht möchte, kann es mit einem Inhaltsblocker unterbinden; die Seite bleibt vollständig lesbar.`,
      },
      {
        h: "Ihre Rechte",
        body: "Sie können Auskunft verlangen, Berichtigung oder Löschung fordern, die Verarbeitung einschränken lassen, eine Kopie in übertragbarer Form erhalten und der Verarbeitung auf Grundlage berechtigter Interessen widersprechen. Wenden Sie sich an die oben genannte Anschrift. Sie können sich außerdem bei einer Aufsichtsbehörde beschweren, etwa der estnischen Datenschutzaufsicht oder der Behörde an Ihrem Wohnort.",
      },
    ],
  },
};

export const IMPRESSUM = {
  en: {
    h: "Imprint",
    intro:
      "Information under section 5 of the German Digital Services Act. The German version below is the legally binding text.",
    rows: [
      ["Operator", `${OPERATOR.entity}, ${OPERATOR.form}`],
      ["Address", OPERATOR.addr],
      ["Represented by", OPERATOR.director],
      ["VAT identification number", OPERATOR.vat],
      ["Email", OPERATOR.email],
      ["Telephone", OPERATOR.phone],
      ["German group entity", `${DE_ENTITY.entity}, ${DE_ENTITY.city}, VAT ${DE_ENTITY.vat}`],
    ],
    liability:
      "We are responsible for our own content under the general laws. We are not obliged to monitor transmitted or stored third party information. Links to external sites were checked for unlawful content when they were added; we do not control what those sites publish afterwards and are not responsible for it. If you tell us about an unlawful link we will remove it promptly.",
    disputes:
      "The European Commission provides an online dispute resolution platform at ec.europa.eu/consumers/odr. We are neither obliged nor willing to take part in dispute resolution proceedings before a consumer arbitration board.",
  },
  de: {
    h: "Impressum",
    intro: "Angaben gemäß Paragraf 5 Digitale-Dienste-Gesetz. Diese deutsche Fassung ist maßgeblich.",
    rows: [
      ["Betreiber", `${OPERATOR.entity}, ${OPERATOR.form}`],
      ["Anschrift", OPERATOR.addr],
      ["Vertreten durch", OPERATOR.director],
      ["Umsatzsteuer-Identifikationsnummer", OPERATOR.vat],
      ["E-Mail", OPERATOR.email],
      ["Telefon", OPERATOR.phone],
      ["Deutsche Konzerngesellschaft", `${DE_ENTITY.entity}, ${DE_ENTITY.city}, USt-IdNr ${DE_ENTITY.vat}`],
    ],
    liability:
      "Für eigene Inhalte sind wir nach den allgemeinen Gesetzen verantwortlich. Wir sind nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Links auf externe Seiten wurden bei Aufnahme auf rechtswidrige Inhalte geprüft; auf spätere Veröffentlichungen dieser Seiten haben wir keinen Einfluss und übernehmen dafür keine Haftung. Bei Hinweis auf einen rechtswidrigen Link entfernen wir diesen umgehend.",
    disputes:
      "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung unter ec.europa.eu/consumers/odr bereit. Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  },
};

/* Resolve reader language, then fall back to English, then to German. A missing translation
 * degrades to readable text rather than white-screening on `t.h`. */
export function localised(pack, lang) {
  return pack[lang] || pack.en || pack.de;
}
