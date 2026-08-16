/* Deutsch. Vollständige Übersetzung der Referenzsprache (en.js).
 *
 * Es gelten dieselben Regeln wie in en.js, und sie werden in jeder Sprache geprüft:
 * keine Gedankenstriche, keine Preise, keine HTML-Entities, keine Wettbewerbervergleiche ohne
 * Messung, jede Zahl entweder eigene Messung oder benannte externe Quelle, keine Satzlänge
 * über 30 Wörter.
 *
 * Deutsch ist systematisch länger als Englisch. Die Reiterbeschriftungen (tab.*) sind vertraglich
 * auf höchstens acht Zeichen begrenzt, weil eine feste Leiste mit sechs Elementen auf einem
 * 360-Pixel-Telefon eine Rechenaufgabe ist. Geprüft von tools/header_layout.mjs.
 */

import { DE_SERVICES } from "./de.services.js";

export const DE = {
  ...DE_SERVICES.keys,

  /* ---------------- Rahmen ---------------- */
  "nav.ai": "KI",
  "nav.cloud": "Cloud",
  "nav.cyber": "Cyber",
  "nav.capabilities": "Leistungen",
  "nav.method": "Arbeitsweise",
  "nav.work": "Projekte",
  "nav.about": "Über uns",
  "nav.contact": "Kontakt",
  "nav.privacy": "Datenschutz",
  "nav.impressum": "Impressum",
  "nav.more": "Mehr",
  "nav.cta": "Gespräch beginnen",

  "tab.home": "Start",
  "tab.ai": "KI",
  "tab.cloud": "Cloud",
  "tab.cyber": "Cyber",
  "tab.work": "Projekte",
  "tab.talk": "Kontakt",

  "a11y.menu": "Menü öffnen",
  "a11y.lang": "Sprache wechseln",
  "a11y.close": "Schließen",
  "a11y.skip": "Zum Inhalt springen",

  /* ---------------- Kopfbereich ---------------- */
  "hero.eyebrow": "Stars4business OÜ · Tallinn · Frankfurt · Lissabon · Delaware",
  "hero.h1a": "Souveräne Cyber-, Cloud- und KI-Systeme,",
  "hero.h1b": "architektiert und geliefert",
  "hero.h1c": "von einem verantwortlichen Team.",
  "hero.sub":
    "Wir entwerfen und bauen die Systeme, die regulierte Unternehmen nicht blind auslagern können. Externe Angriffsfläche, Angriffssimulation, Cloud- und Rechenzentrumsmigration, digitale Souveränität, und Sicherheit, die im Fundament steckt statt obenauf geklebt zu sein.",
  "hero.claim": "Ein souveräner Partner. Fünf Leistungssäulen. Keine Carrier-Abhängigkeit.",
  "hero.cta1": "Gespräch beginnen",
  "hero.cta2": "Was wir tun",
  "hero.scroll": "Scrollen",

  "stat.years": "Jahre Lieferverantwortung",
  "stat.years.v": "20+",
  "stat.jur": "Rechtsräume",
  "stat.jur.v": "4",
  "stat.prog": "Größtes geführtes Programm",
  "stat.prog.v": "400+ Anwendungen",
  "stat.prog.note": "Drei Rechenzentren in die Public Cloud, 2,5 Jahre",
  "stat.edge": "Orchestrierte Edge-Standorte",
  "stat.edge.v": "10.000+",
  "stat.edge.note": "In mehr als 140 Ländern",

  /* ---------------- Positionierung ---------------- */
  "why.eyebrow": "Warum es uns gibt",
  "why.h": "Die meisten Programme scheitern an den Nahtstellen, nicht an den Teilen.",
  "why.lede":
    "Der Cloud-Anbieter ist kompetent. Der Sicherheitshersteller ist kompetent. Der Integrator ist kompetent. Niemand verantwortet, was dazwischen passiert, und genau dort verschwinden Budget, Termine und Nachweise.",
  "why.c1.h": "Ein verantwortlicher Vertragspartner",
  "why.c1.b":
    "Architektur, Bau, Sicherheit und Übergabe liegen bei demselben Team. Es gibt keinen Carrier dazwischen, keine Beschaffungsebene und keinen Ort, an dem ein Fehler jemand anderem gehört.",
  "why.c2.h": "Ein Architekt, der weiterhin Code schreibt",
  "why.c2.b":
    "Die Person in Ihrem Vorstandstermin ist die Person im Pull Request. Entwurfsentscheidungen halten dem Terminal stand, weil sie dort getroffen wurden.",
  "why.c3.h": "Nachweise statt Behauptungen",
  "why.c3.b":
    "Jede Aussage über Ihre Systeme lässt sich auf etwas Beobachtbares zurückführen. Schlägt eine Abfrage fehl, melden wir unbekannt, denn fehlende Evidenz ist niemals ein Befund.",

  /* ---------------- Säulen ---------------- */
  "pill.eyebrow": "Was wir tun",
  "pill.h": "Fünf Leistungssäulen.",
  "pill.lede":
    "Einzeln oder als ein Programm. Jede Säule trägt ihr eigenes Ergebnis, ihre eigenen Abnahmekriterien und ihre eigene Übergabe.",
  "pill.more": "Mehr lesen",
  "pill.deliver": "Ergebnis",

  "prac.eyebrow": "Die volle Bank",
  "prac.h": "Vier weitere Fachbereiche.",
  "prac.lede":
    "Derselbe leitende Architekt, derselbe Lieferanspruch. Das sind die Disziplinen, auf denen die fünf Säulen stehen, und sie sind auch einzeln verfügbar.",

  /* ---------------- Methode ---------------- */
  "meth.eyebrow": "Arbeitsweise",
  "meth.h": "Alles automatisieren. Fehler sichtbar machen. Das Ergebnis prüfen, nicht die Absicht.",
  "meth.lede":
    "Diese Methode wenden wir auf Ihre Systeme an, und wir wenden sie auf unsere eigenen an. Die vier Regeln unten sind keine Philosophieseite. Jede ist in ausgelieferter Software als Code durchgesetzt.",
  "meth.r1.h": "Ein Befehl, jedes Mal",
  "meth.r1.b":
    "Test, Freigabe, Auslieferung und Prüfung sind eine orchestrierte Kette, keine Folge von Anweisungen, die sich jemand merken muss. Was zweimal zu tun ist, wird ein Skript.",
  "meth.r2.h": "Der Prüfer ist nie der Autor",
  "meth.r2.b":
    "Die Arbeit entsteht in einem System und wird von einem anderen geprüft, von einem anderen Anbieter. Wer die eigene Hausaufgabe korrigiert, erbt den blinden Fleck, der zum Fehler führte.",
  "meth.r3.h": "Code entscheidet, Urteil berät",
  "meth.r3.b":
    "Bestanden oder nicht bestanden ergibt sich aus deterministischen Prüfungen mit messbaren Kriterien. Begründung und Widerspruch werden festgehalten und übergeben. Den Schalter halten sie nie.",
  "meth.r4.h": "Fehlende Evidenz ist niemals ein Befund",
  "meth.r4.b":
    "Schlägt eine Abfrage fehl, melden wir unbekannt und behaupten nichts. Eine falsche Schwachstelle in einer Vorstandsvorlage ist schlimmer als eine Lücke, weil sie sich nach dem Lesen nicht zurücknehmen lässt.",

  "cons.eyebrow": "Konsens als Entscheidungsverfahren",
  "cons.h": "Zwei bauen. Zwei greifen an. Code entscheidet.",
  "cons.lede":
    "Wo eine Entscheidung schwerwiegend ist, wiederholt getroffen wird und heute an einer Person mit einer Methode hängt, bauen wir ein gegnerisches Prüfgremium in den Prozess selbst ein.",
  "cons.s1.h": "Zwei unabhängige Versuche",
  "cons.s1.b":
    "Zwei Systeme von zwei verschiedenen Anbietern erstellen die Arbeit getrennt. Keine Diskussion, sondern zwei getrennte Versuche derselben Aufgabe.",
  "cons.s2.h": "Zwei unabhängige Prüfer",
  "cons.s2.b":
    "Zwei weitere Systeme von zwei anderen Anbietern prüfen das Ergebnis. Der Prüfer ist nie der Autor und nie dessen Anbieter.",
  "cons.s3.h": "Ein deterministisches Tor",
  "cons.s3.b":
    "Code entscheidet anhand messbarer Prüfungen. Ein gedrosselter Prüfer kann gute Arbeit nicht blockieren, und ein gefälliger Prüfer kann fehlerhafte Arbeit nicht durchwinken.",
  "cons.s4.h": "Ein schriftlicher Nachweis",
  "cons.s4.b":
    "Jedes Urteil, jede Zustimmung und jeder Widerspruch wird festgehalten und übergeben. Eine Entscheidung, die festhält wer widersprach und aufgrund welcher Belege, ist gegenüber Vorstand und Aufsicht belastbar.",
  "cons.honest.h": "Die ehrliche Grenze",
  "cons.honest.b":
    "Konsens ist nicht Wahrheit. Vier Systeme können übereinstimmen und trotzdem falsch liegen. Genau deshalb ist das Tor deterministisch und jedes Urteil für einen Menschen nachlesbar.",
  "cons.hold":
    "Zurückstellen ist ein vollwertiges Ergebnis. Es benennt, was erhoben werden müsste, bevor entschieden werden kann.",

  "proof.eyebrow": "Auf unserer eigenen Plattform gemessen",
  "proof.h": "Wir wenden die Methode auf uns selbst an.",
  "proof.lede":
    "Das sind unsere eigenen technischen Messwerte, ausgelesen aus unserem Repository und Kostenbuch im August 2026. Sie beschreiben unsere Plattform, nicht ein Kundenergebnis.",
  "proof.p1": "Deterministische Prüfungen bei jeder Auslieferung",
  "proof.p1.v": "43",
  "proof.p2": "Automatisierte Zusicherungen dahinter",
  "proof.p2.v": "426",
  "proof.p3": "Regressionssuiten, jede aus einem realen Vorfall entstanden",
  "proof.p3.v": "11",
  "proof.p4": "Dokumentierte und dauerhaft abgesicherte Fehlerklassen",
  "proof.p4.v": "170",
  "proof.note":
    "Wir veröffentlichen die Fehlgriffe ebenso wie die Treffer. Ein Anbieter, der nur die Erfolge zeigt, verkauft Ihnen etwas anderes.",

  /* ---------------- Projekte ---------------- */
  "work.eyebrow": "Ausgewählte Projekte",
  "work.h": "Gelieferte Programme.",
  "work.lede":
    "Zwei Jahrzehnte Transformations-, Migrations- und Sicherheitsprogramme in Telekommunikation, Luftfahrt, Energie, Versicherung, Verteidigung, Bankwesen und öffentlichem Sektor. Direkt geliefert oder als leitender Architekt innerhalb der genannten Organisation.",
  "work.scope": "Umfang",
  "work.scale": "Größenordnung",
  "work.stack": "Technologie",
  "work.sector": "Branche",
  "work.all": "Alle Branchen",
  "work.note":
    "Kundennamen werden genannt, soweit sie bereits im veröffentlichten beruflichen Werdegang des Prinzipals stehen. Alles unter Vertraulichkeit wird nur nach Branche und Größenordnung beschrieben.",

  /* ---------------- Über uns ---------------- */
  "about.eyebrow": "Wen Sie tatsächlich beauftragen",
  "about.h": "Ein Prinzipal. Vier Flaggen.",
  "about.lede":
    "S4Biz ist eine Gruppe aus vier eingetragenen Gesellschaften auf zwei Kontinenten, die als ein verantwortlicher Vertragspartner auftritt. Abrechnung in Euro oder US-Dollar, Datenhaltung in der EU und im EWR ab Entwurf.",
  "about.bio.h": "Evgeny \"Jev\" Vainshtein",
  "about.bio.role": "Leitender technischer Architekt und Projektverantwortlicher",
  "about.bio.p1":
    "Zwanzig Jahre Lieferverantwortung für millionenschwere Cloud-, Sicherheits- und KI-Transformationen in Public Cloud, Telekommunikation, Verteidigung und Industrie. Auf Direktorenebene beauftragt von NetApp, Amazon Web Services, Red Hat, Canonical, Enea, Infineon, Luxair, ZEDEDA und Colt.",
  "about.bio.p2":
    "Ich führe Cyber-, Cloud- und KI-Transformationen als Architekt, der weiterhin selbst Code schreibt. Das ist mein Beitrag: Vorstandsetage und Terminal, ohne Übersetzungsschicht dazwischen.",
  "about.bio.p3":
    "Was ich aus dieser Arbeit mitnehme, ist keine Technologieliste. Es ist eine Methode: alles automatisieren, Fehler sichtbar machen, ein Modell nie über eine Nebenwirkung entscheiden lassen, und das Ergebnis prüfen statt der Absicht.",
  "about.langs": "Sprachen",
  "about.langs.v": "Englisch, Deutsch, Russisch, Hebräisch",
  "about.based": "Standort",
  "about.based.v": "Raum Frankfurt, Deutschland. Lieferung in DACH, EMEA und weltweit.",
  "about.edu": "Ausbildung",
  "about.edu.v":
    "B.Sc. Informatik, Champlain College, Vermont. Ingenieurabschluss, technische Schule für Marineoffiziere ORT Aschdod.",
  "about.entities.h": "Eingetragen, wo es zählt",
  "about.entities.lede":
    "Ein europäischer Betriebskern und ein US-Arm, damit ein Programm in dem Rechtsraum beauftragt und geliefert werden kann, in den es gehört.",
  "about.role": "Rolle",
  "about.taxid": "Steuernummer",

  "career.h": "Werdegang in Kürze",
  "career.note": "Ausgewählte Stationen. Der vollständige Werdegang steht auf LinkedIn.",

  /* ---------------- Kontakt ---------------- */
  "ct.eyebrow": "Gespräch beginnen",
  "ct.h": "Sagen Sie uns, wo es klemmt.",
  "ct.lede":
    "Ein Erstgespräch dauert dreißig Minuten, ist kostenfrei und ist technisch. Passt die Aufgabe nicht zu uns, sagen wir das im Gespräch, statt ein Angebot dafür zu schreiben.",
  "ct.name": "Name",
  "ct.email": "Geschäftliche E-Mail",
  "ct.company": "Unternehmen",
  "ct.msg": "Was möchten Sie erreichen?",
  "ct.msg.ph": "Das Vorhaben, die Randbedingung und der Termin, zu dem es laufen muss.",
  "ct.send": "Senden",
  "ct.sending": "Wird gesendet",
  "ct.ok.h": "Angekommen.",
  "ct.ok.b": "Wir antworten von feranicus@s4biz.io, in der Regel am selben Arbeitstag.",
  "ct.err":
    "Das ließ sich nicht senden. Schreiben Sie direkt an feranicus@s4biz.io, es landet an derselben Stelle.",
  /* ---- Kontaktkanäle ---- */
  "wa.msg": "Hallo, ich habe s4biz.io gefunden und möchte über ein Vorhaben sprechen.",
  "wa.aria": "Über WhatsApp schreiben",
  "ch.h": "Jede Tür, und wohin sie führt.",
  "ch.lede":
    "Wählen Sie, was Ihnen passt. WhatsApp steht zuerst, weil dort am schnellsten geantwortet wird, und die Nachricht ist bereits vorbereitet.",
  "ch.soon": "In Kürze",
  "ch.wa": "WhatsApp",
  "ch.wa.d": "Die schnellste Antwort, an einem europäischen Arbeitstag meist innerhalb einer Stunde.",
  "ch.email": "E-Mail",
  "ch.email.d": "Am besten für alles mit Dokument, Leistungsbeschreibung oder Anforderungsliste.",
  "ch.phone": "Telefon",
  "ch.phone.d": "Direkte Leitung zum leitenden Architekten. Deutsch, Englisch oder Russisch.",
  "ch.li": "LinkedIn",
  "ch.li.d": "Der vollständige Werdegang, und wo die meisten Erstgespräche beginnen.",
  "ch.tg": "Telegram",
  "ch.tg.d": "Für alle, die es bevorzugen, und für Partner, die dort bereits mit uns arbeiten.",
  "ch.gh": "GitHub",
  "ch.gh.d": "Quelloffene Arbeit, darunter die passiven Werkzeuge zur Internet-Aufklärung.",

  "ct.direct": "Oder direkt erreichen",
  "ct.privacy":
    "Wir verwenden Ihre Angaben ausschließlich, um Ihnen zu antworten. Sie werden in der Europäischen Union gespeichert und niemals verkauft oder weitergegeben. Siehe Datenschutzhinweis.",
  "ct.required": "Bitte Name, geschäftliche E-Mail und Nachricht ausfüllen.",
  "ct.bademail": "Diese E-Mail-Adresse sieht nicht richtig aus.",

  /* ---------------- Fuß ---------------- */
  "foot.tag": "Souveräne Cyber-, Cloud- und KI-Entwicklung.",
  "foot.rights": "Stars4business OÜ. Alle Rechte vorbehalten.",
  "foot.built": "In der EU gehostet. Keine Drittanbieter-Analytik, keine Werbe-Tracker.",
  "foot.nav": "Seite",
  "foot.legal": "Rechtliches",
  "foot.reach": "Kontakt",

  /* ---------------- Recht ---------------- */
  "priv.h": "Datenschutzhinweis",
  "priv.updated": "Zuletzt aktualisiert am 14. August 2026",
  "imp.h": "Impressum",
  "err.h": "Diese Seite gibt es nicht.",
  "err.b": "Der Link ist womöglich alt, oder die Adresse enthält einen Tippfehler.",
  "err.cta": "Zurück zur Startseite",

  /* ================= strukturierte Inhalte ================= */
  __content: {
    ...DE_SERVICES.content,
    pillars: [
      {
        id: "discovery",
        tag: "A",
        h: "Cyber-Aufklärung und Angriffsfläche",
        lede: "Was das Internet bereits über Sie sieht, ermittelt ohne ein einziges Paket an Ihre Infrastruktur zu senden.",
        body: "Wir ermitteln die gesamte über das Internet erreichbare Landschaft einer Organisation aus öffentlichen Quellen: Routing- und Adressregister, Zertifikatstransparenzprotokolle, passive Namensauflösung, Registrierungsdaten und internetweite Scan-Indizes. Befunde werden korreliert, gegen Kataloge bekannter ausgenutzter Schwachstellen angereichert und zugeordnet. Jede Ausweitung des Umfangs muss Eigentum nachweisen statt nur eine Zeichenkette zu treffen, damit ein Nachbar auf geteiltem Hosting nie in Ihrem Bericht auftaucht.",
        bullets: [
          "Passiv per Vertrag. Keine Freigabe nötig, nichts angefasst.",
          "Eigentum nachgewiesen, nicht angenommen. Geteiltes Hosting und Konzernstrukturen korrekt aufgelöst.",
          "Befunde in Euro bewertet, mit derselben Schadensmathematik wie ein Versicherer.",
        ],
        deliver: "Karte der externen Angriffsfläche, priorisierte Befunde und bezifferte jährliche Schadenserwartung.",
      },
      {
        id: "bas",
        tag: "B",
        h: "Angriffs- und Einbruchssimulation",
        lede: "Wir führen den Angreifer in einer abgeschlossenen Umgebung aus, die Steuerung bleibt bei Ihnen.",
        body: "Die Simulation läuft gegen eine segmentierte Nachbildung mit getrennter Anwendungs- und Betriebsebene, deren Mandantentrennung unter Angriff halten muss. Die Abdeckung ist auf die MITRE-ATT&CK-Matrix abgebildet, von Aufklärung und Erstzugang über Ausführung, Persistenz, laterale Bewegung, Zugangsdaten, Erkundung bis Wirkung. Widerstandsfähigkeit wird gegen Ein-Klick-, Null-Klick- und Zero-Day-Ketten geprüft, nicht gegen eine Prüfliste.",
        bullets: [
          "Die Steuerung bleibt auf Ihrer Infrastruktur, unter Ihrer Aufsicht.",
          "Mandantentrennung unter Last geprüft, nicht im Entwurfsdokument behauptet.",
          "Ergebnis ist ein Maßnahmenplan, keine Punktzahl.",
        ],
        deliver: "ATT&CK-Abdeckungskarte, Zero-Trust-Reifegrad und priorisierter Maßnahmenplan.",
      },
      {
        id: "cloud",
        tag: "C",
        h: "Cloud und Migration",
        lede: "Bauen, verlagern, betreiben. Rechenzentrumsausstieg, Landing Zones und das Netz darunter.",
        body: "Migration über Amazon Web Services, Microsoft Azure, Google Cloud und OpenStack. Dazu die Teile, die die meisten Programme unterschätzen: Wechsel der Datenbank-Engine, Ablösung von Großrechnern, Identitätsmigration, Austausch der Integrationsplattform und Stilllegung. Das Netz ist Teil der Migration und keine Abhängigkeit von fremden Fahrplänen, einschließlich Border Gateway Routing, Label Switching und softwaredefinierter Weitverkehrsnetze.",
        bullets: [
          "Landing Zone, Identität, Netz und Kostenmodell gemeinsam entworfen.",
          "Stilllegung von Anfang an geplant, denn dort liegt die Ersparnis.",
          "Sicherung, Wiederherstellung und Ausfallsicherheit gebaut und danach tatsächlich geprüft.",
        ],
        deliver: "Migrationsarchitektur, umgesetzte Wellen, stillgelegte Altlandschaft und geprüfte Wiederanlauffähigkeit.",
      },
      {
        id: "sovereignty",
        tag: "D",
        h: "Digitale Souveränität",
        lede: "Ihre Plattform, Ihr Rechtsraum, Ihre Schlüssel. Von einem Team gebaut und betrieben.",
        body: "Datenhaltung in der Europäischen Union und im Europäischen Wirtschaftsraum ab dem ersten Diagramm statt nachträglich zertifiziert. Souveräne und private Cloud mit kundeneigenen Schlüsseln, nach dem Modell Bring Your Own Key oder Hold Your Own Key. Keine Carrier-Abhängigkeit im Lieferweg. Ausrichtung an DORA, der NIS-2-Richtlinie, der Datenschutz-Grundverordnung und den bankaufsichtlichen Anforderungen an die IT.",
        bullets: [
          "Datenhaltung ab Entwurf, in der Architektur belegt statt im Datenblatt behauptet.",
          "Sie halten die Schlüssel. Wir bauen das Modell, das das betreibbar macht.",
          "Keine Beschaffungsebene zwischen Architekt und laufendem System.",
        ],
        deliver: "Eine souveräne Architektur, die laufende Plattform und der Nachweisordner, nach dem eine Aufsicht fragt.",
      },
      {
        id: "deep",
        tag: "E",
        h: "Sicherheit ab Entwurf, \"The Deep\"",
        lede: "Sicherheit ist keine Schicht, die man obenauf klebt. Sie ist das Fundament, auf dem alles andere steht.",
        body: "The Deep bedeutet Sicherheit in den untersten Schichten: Identität, Kryptografie, Mandantentrennung, Lieferkette und Firmware-Integrität, damit Vertrauen konstruktiv entsteht statt nachträglich geflickt zu werden. Perimeterschutz versagt, weil Ein-Klick-, Null-Klick- und Zero-Day-Ketten die Oberfläche umgehen. Widerstandsfähigkeit muss architektonisch sein, und Aufsichtsbehörden verlangen heute nachweisbare Sicherheit ab Entwurf.",
        bullets: [
          "Vier Schichten: Oberfläche, Anwendung, Plattform und das Tiefe darunter.",
          "Lieferkette und Firmware-Herkunft als Kerndisziplin, nicht als Beschaffungspapier.",
          "So entworfen, dass die Sicherheitsargumentation eine Prüfung ohne Umbau übersteht.",
        ],
        deliver: "Eine Referenzarchitektur, die umgesetzten Kontrollen und eine belastbare Sicherheitsargumentation.",
      },
    ],

    practices: [
      {
        id: "net",
        n: "01",
        h: "Netz und Anbindung",
        tag: "Technik in Carrier-Qualität",
        bullets: [
          "Backbone und Peering in Carrier-Größe: Border Gateway Protocol, Label Switching, Routenherkunftsprüfung",
          "Entwurf und Ausrollung softwaredefinierter Weitverkehrsnetze",
          "Eingebettete SIM und Mobilfunk als Unterbau, aus der Ferne bereitgestellt ohne Vor-Ort-Einsätze",
          "Internet-Leistungsmessung und Routenoptimierung",
        ],
      },
      {
        id: "ai",
        n: "02",
        h: "KI und agentische Systeme",
        tag: "Abwehr als Produkt",
        bullets: [
          "Agentische Verarbeitungsketten gegen Betrug, Missbrauch und Angriffe auf der Anwendungsschicht im Livebetrieb",
          "Orchestrierung, Bewertung und Beobachtbarkeit mehrstufiger Agentensysteme",
          "Datenströme und Analytik auf Kubernetes: Ereignisprotokoll, spaltenorientierter Speicher und Suche",
          "Modellbetrieb über gehostete Spitzenmodelle und lokal nachtrainierte offene Gewichte",
        ],
      },
      {
        id: "dlt",
        n: "03",
        h: "Blockchain und verteilte Register",
        tag: "Ketten in regulierter Qualität",
        bullets: [
          "Mitgründer eines hybriden Protokolls aus Arbeits-, Autoritäts- und Anteilsnachweis",
          "Plattformarchitekt für eine regulierte Bank mit Digital-Asset-Plattform",
          "Prüfung von Smart Contracts und Architekturaudit",
          "Tokenisierung und Entwurf der Abwicklung auf der Kette",
        ],
      },
      {
        id: "oss",
        n: "04",
        h: "Open-Source-Entwicklung",
        tag: "Läuft auf Ihrer Hardware",
        bullets: [
          "Aufbau und Aktualisierung privater und souveräner OpenStack-Clouds",
          "Passive Internet-Aufklärungswerkzeuge, quelloffen veröffentlicht",
          "Upstream zuerst: keine Lizenz, keine Bindung",
          "Prüfbar ab Entwurf. Der Quellcode bleibt bei Ihnen.",
        ],
      },
    ],

    work: [
      {
        id: "telefonica",
        client: "Telefónica Deutschland",
        sector: "Telekommunikation",
        geo: "Deutschland",
        scope:
          "Migration von mehr als 400 Anwendungen aus drei Rechenzentren in die Public Cloud, einschließlich Warenwirtschaft, Datenbanken sowie Betriebs- und Geschäftsunterstützungssystemen. Ausstieg aus einer proprietären Datenbank-Engine zugunsten von PostgreSQL, begleitet von Cybersicherheit und durchgängiger Auslieferung.",
        scale: "400+ Anwendungen · 3 Rechenzentren · 2,5 Jahre",
        stack: "AWS · PostgreSQL · OSS/BSS · CI/CD",
      },
      {
        id: "zededa",
        client: "Automotive-Edge-Programm",
        sector: "Automobil und Edge",
        geo: "Weltweit",
        scope:
          "Leitende technische Verantwortung in einer der weltweit größten Edge-Computing-Ausrollungen der Automobilbranche, mit verteilter Rechenleistung an Händler- und Werksstandorten und einem sicheren softwaredefinierten Netzverbund.",
        scale: "10.000+ Edge-Standorte · 140+ Länder",
        stack: "Kubernetes am Edge · unveränderliches Edge-Betriebssystem · sicheres SD-WAN",
      },
      {
        id: "luxair",
        client: "Luxair",
        sector: "Luftfahrt",
        geo: "Luxemburg",
        scope:
          "Aufbau eines Cloud Center of Excellence von Grund auf, danach Ausstieg aus zwei Rechenzentren in die Public Cloud. Dazu gehörten Großrechnermigration, Datenbankmigration, Neuarchitektur von Anwendungen, Identitätsmigration, Austausch der Integrationsplattform, Migration der Warenwirtschaft und Stilllegung.",
        scale: "2 Rechenzentren stillgelegt · Cloud Center of Excellence aufgebaut",
        stack: "Microsoft Azure · Logic Apps · Dynamics",
      },
      {
        id: "dt",
        client: "Deutsche Telekom",
        sector: "Telekommunikation",
        geo: "Deutschland",
        scope:
          "Großangelegte digitale Transformation als leitender Projektmanager. Das Programm migrierte außerdem die Alt-Teilnehmerdatenbank auf eine quelloffene Engine und stellte die Lieferorganisation von Wasserfall auf agiles Arbeiten um.",
        scale: "50 Millionen Teilnehmer · Programm in 12 Monaten geliefert",
        stack: "PostgreSQL · agile Lieferung im Großmaßstab",
      },
      {
        id: "redhat",
        client: "Deutsche Telekom und Orange",
        sector: "Telekommunikation",
        geo: "Europa",
        scope:
          "Quelloffenes Portfolio zur Virtualisierung von Netzfunktionen: virtualisierter Paketkern und Sprachdienste auf privater Cloud. Daneben ein zweites Portfolio aus Container-Plattform- und Private-Cloud-Projekten für eine zweite Carrier-Gruppe.",
        scale: "26 Projekte · dazu 24 Plattform- und Private-Cloud-Projekte",
        stack: "OpenStack · OpenShift · vEPC · vIMS · SDN",
      },
      {
        id: "tosca",
        client: "Tosca Services",
        sector: "Logistik",
        geo: "Europa und Asien",
        scope:
          "Übergang und Transformation der IT nach zwei Zukäufen, die die Landschaft verdreifachten. Konsolidierung der Warenwirtschaft, Verlagerung des Anwendungsbestands in die Public Cloud, sichere Entwicklungskette und Führung von Entwicklungs-, Test- und Integrationsteams im Ausland.",
        scale: "3 Unternehmen konsolidiert · 2,5 Jahre",
        stack: "Microsoft Azure · Dynamics · Azure DevOps",
      },
      {
        id: "mod",
        client: "Verteidigungsministerium und Radarhersteller",
        sector: "Verteidigung",
        geo: "Israel",
        scope:
          "Digitale Transformation weg von einem proprietären Stapel aus Rechenleistung, Virtualisierung und Speicher hin zu einer quelloffenen privaten Cloud, unter Aufrechterhaltung des Betriebs während des Übergangs.",
        scale: "Nationale Verteidigungslandschaft",
        stack: "Ubuntu · OpenStack",
      },
      {
        id: "law",
        client: "Strafverfolgungsbehörden",
        sector: "Öffentlicher Sektor und Sicherheit",
        geo: "Mehrere Länder",
        scope:
          "Programme für Cybersicherheitssoftware und -hardware, einschließlich tiefer Paketinspektion in nationalem Maßstab und Sicherheitsarbeit an Mobilfunknetzen, über große Betreiber und Terabytes an Verkehr hinweg.",
        scale: "Nationaler Maßstab · Terabytes an Verkehr",
        stack: "DPI · gesetzliche Überwachung · Netzsicherheit",
      },
      {
        id: "eon",
        client: "E.ON",
        sector: "Energie",
        geo: "Deutschland",
        scope:
          "Modernisierung der Endgeräte im gesamten Bestand, einschließlich Verzeichnisdienst und Endgerätesicherheit, ohne Unterbrechung des laufenden Geschäfts.",
        scale: "25.000+ Arbeitsplätze",
        stack: "Windows · Active Directory · Endgerätesicherheit",
      },
      {
        id: "aon",
        client: "Aon",
        sector: "Versicherung",
        geo: "Vereinigtes Königreich und Deutschland",
        scope:
          "Verlagerung von Anwendungen aus mehreren britischen Rechenzentren in ein Frankfurter Rechenzentrum nach dem Referendum, getrieben von Datenhaltung und aufsichtsrechtlicher Kontinuität.",
        scale: "Verlagerung über mehrere Rechenzentren",
        stack: "Rechenzentrumsmigration · Datenhaltung",
      },
      {
        id: "vbank",
        client: "Privatbank, Deutschland",
        sector: "Bankwesen",
        geo: "Deutschland",
        scope:
          "Plattformleitung für eine regulierte Anlageplattform für digitale Vermögenswerte, mit Anbindung institutioneller Verwahrung an das Kernbankensystem.",
        scale: "Regulierte Digital-Asset-Plattform",
        stack: "Institutionelle Verwahrung · Kernbankenanbindung",
      },
      {
        id: "sonangol",
        client: "Nationale Ölgesellschaft",
        sector: "Öl und Gas",
        geo: "Angola",
        scope:
          "Aufbau eines drahtlosen Internetanbieters von Grund auf: Funkzugang, Anbindung, Abrechnung und Betrieb, dazu eine landesweite Funkspektrumüberwachung zur Lizenzierung und zum Aufspüren unlizenzierter Sender.",
        scale: "7 Millionen Teilnehmer · 300+ Überwachungsstandorte",
        stack: "WiMAX · Funküberwachung · Carrier-Abrechnung",
      },
      {
        id: "infineon",
        client: "Halbleiterhersteller",
        sector: "Halbleiter",
        geo: "Deutschland",
        scope:
          "Inner-Source-Strategie für die weltweite Softwareentwicklung: wie interne Teams gemeinsamen Code veröffentlichen, finden, wiederverwenden und steuern.",
        scale: "Weltweite Entwicklungsorganisation",
        stack: "Inner Source · Entwicklungssteuerung",
      },
      {
        id: "cargill",
        client: "Cargill",
        sector: "Agrar und Rohstoffe",
        geo: "Weltweit",
        scope:
          "Einführung einer Zahlungs- und Treasury-Plattform, integriert über drei getrennte Warenwirtschaftssysteme.",
        scale: "3 Warenwirtschaftssysteme angebunden",
        stack: "Treasury-Automatisierung · ERP-Integration",
      },
    ],

    entities: [
      {
        id: "ee",
        name: "Stars4business OÜ",
        flag: "Estland",
        type: "Osaühing",
        role: "EU-Zentrale. Konzernberatung und europäischer Betriebskern.",
        tax: "USt-ID EE102156878",
        city: "Tallinn",
      },
      {
        id: "de",
        name: "S4biz UG (haftungsbeschränkt)",
        flag: "Deutschland",
        type: "Unternehmergesellschaft",
        role: "Kommerzielle Softwareentwicklung und Lieferung in DACH.",
        tax: "USt-IdNr DE361822318",
        city: "Pinneberg",
      },
      {
        id: "pt",
        name: "S4BIZ Unipessoal Lda",
        flag: "Portugal",
        type: "Sociedade Unipessoal por Quotas",
        role: "Betrieb und Lieferung auf der Iberischen Halbinsel.",
        tax: "NIF 518007596",
        city: "Lissabon",
      },
      {
        id: "us",
        name: "CyberGod LLC",
        flag: "Vereinigte Staaten",
        type: "Limited Liability Company",
        role: "Cyber- und Cloud-Lieferung, Präsenz in den Vereinigten Staaten.",
        tax: "In Delaware eingetragen",
        city: "Lewes, Delaware",
      },
    ],

    career: [
      { y: "2019 bis heute", r: "Gründer, leitender technischer Architekt", o: "S4Biz-Gruppe" },
      { y: "2026 bis heute", r: "Cyber Security Client Partner, DACH", o: "Colt Technology Services" },
      { y: "2025", r: "Principal Technical Account Manager", o: "ZEDEDA" },
      { y: "2024", r: "Principal Cyber Security Customer Success Manager", o: "Intellexa" },
      { y: "2023 bis 2024", r: "Leiter Cloud Center of Excellence", o: "Luxair" },
      { y: "2021 bis 2024", r: "Senior Customer Solutions Manager, Telekommunikation", o: "Amazon Web Services" },
      { y: "2020 bis 2021", r: "Principal Project Manager", o: "Enea Openwave" },
      { y: "2020 bis 2021", r: "Globaler Cloud-Architekt", o: "NetApp" },
      { y: "2019 bis 2020", r: "Principal NFV Telecom Manager", o: "Red Hat" },
      { y: "2017 bis 2018", r: "Direktor Vertrieb und Geschäftsentwicklung, Public Cloud", o: "Canonical" },
      { y: "2014 bis 2016", r: "Senior Solutions Sales Manager, EMEA-Eliteteam", o: "Huawei" },
    ],
  },
};
