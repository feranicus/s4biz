/* Die drei Leistungsseiten: KI, Cloud, Cyber. Spiegelt en.services.js Schlüssel für Schlüssel und
 * Eintrag für Eintrag. tools/i18n_gate.mjs prüft Vollständigkeit, gleiche Array-Länge, gleiche ids
 * und gleiche Feldnamen, weil der Sprachrückfall ganze Arrays ersetzt und nicht einzelne Einträge.
 *
 * Es gelten dieselben Regeln: keine Gedankenstriche, keine Preise, keine HTML-Entities, kein Satz
 * über 30 Wörter, jede Zahl entweder eigene Messung oder benannte externe Quelle.
 */

export const DE_SERVICES = {
  keys: {
    /* ---------------- KI ---------------- */
    /* ---------------- die drei Türen auf der Startseite ---------------- */
    "svc.eyebrow": "Drei Fachbereiche, ein Team",
    "svc.h": "Wo die Arbeit tatsächlich landet.",
    "svc.lede":
      "Alles darunter liefert dasselbe Team, weshalb die Grenzen dazwischen kein Problem sind. Eine Cloud-Migration mit Sicherheitsanforderung und KI-Anteil ist hier ein Gespräch und nicht drei Anbieter, die einander die Schuld geben.",
    "svc.open": "Details lesen",

    "ai.eyebrow": "Künstliche Intelligenz",
    "ai.h": "Die meisten KI-Vorhaben scheitern nicht am Modell. Sie scheitern an allem darum herum.",
    "ai.lede":
      "Das Modell ist der einfache Teil und wird jedes Quartal einfacher. Ob ein Vorhaben in den Betrieb kommt, entscheiden die Belege, die Messung, die Prüfung durch jemand anderen und das Verhalten an dem Tag, an dem es selbstsicher falsch liegt. Genau das bauen wir.",
    "ai.jump1": "Was möglich ist",
    "ai.jump2": "Wie es besser geht",
    "ai.jump3": "Der Lebenszyklus",
    "ai.jump4": "Zehn Anwendungsfälle",

    "ai.cap.h": "Was heute wirklich möglich ist.",
    "ai.cap.lede":
      "Sechs Arbeitsklassen, die produktionsreif sind, in dem Sinne, dass ein reguliertes Unternehmen sie betreiben, belegen und verteidigen kann. Was nicht auf dieser Liste steht, nennen wir Forschung.",

    "ai.rules.h": "Sechs Regeln, die über den Produktionsstart entscheiden.",
    "ai.rules.lede":
      "Keine davon betrifft das Modell. Jede beschreibt eine Stelle, an der wir Vorhaben stehenbleiben sehen, und jede ist in ausgelieferter Software als Code durchgesetzt.",

    "ai.life.h": "Von der Idee in den Betrieb, und dann der Teil, den niemand einplant.",
    "ai.life.lede":
      "Acht Phasen. Wir übernehmen alle oder steigen an beliebiger Stelle ein. Jede nennt die Falle, für die sie bekannt ist, denn die Fallen sind nützlicher als der Idealverlauf.",
    "ai.life.trap": "Die Falle",
    "ai.life.we": "Was wir tun",

    "ai.use.h": "Zehn Anwendungsfälle, die der Markt tatsächlich kauft.",
    "ai.use.lede":
      "Sortiert danach, wie oft sie nachgefragt werden, nicht danach, wie interessant sie sind. Jeder nennt messbar, wie ein gutes Ergebnis aussieht, und den Fehlermodus, der ihn wertlos macht.",
    "ai.use.good": "So sieht Erfolg aus",
    "ai.use.bad": "So geht es schief",

    "ai.bench.h": "Das ehrliche Marktbild",
    "ai.bench.p":
      "Das sind veröffentlichte Zahlen Dritter über den Markt, keine Ergebnisse, die wir für einen Kunden erzielt haben. Sie stehen hier, weil sie das Problem beschreiben, für dessen Lösung wir beauftragt werden.",
    "ai.bench.src": "Quellen: Gartner-Mitteilungen vom 25. Juni 2025, 11. März 2026 und 19. Mai 2026. McKinsey, The State of AI 2025.",

    /* ---------------- Cloud ---------------- */
    "cl.eyebrow": "Cloud-Transformation",
    "cl.h": "Für jede Anwendung gibt es eine von sieben Antworten. Die meisten Programme nutzen nur zwei.",
    "cl.lede":
      "Wer alles nur verschiebt, trägt die alten Probleme an einen teureren Ort. Wer alles neu baut, wird nie fertig. Die Arbeit besteht darin, Anwendung für Anwendung zu entscheiden, welche der sieben Strategien gilt, und jede Wahl begründen zu können.",
    "cl.jump1": "Die sieben Strategien",
    "cl.jump2": "Wie eine Migration läuft",
    "cl.jump3": "Was wir anders machen",

    "cl.rs.h": "Die sieben Rs.",
    "cl.rs.lede":
      "Gartner veröffentlichte 2010 fünf Migrationsstrategien. Amazon Web Services erweiterte sie 2016 auf sechs und mit Retain auf sieben. Die folgende Menge ist die heute gebräuchliche, und die Wahl erfolgt je Anwendung, niemals je Landschaft.",
    "cl.rs.when": "Wann sie richtig ist",
    "cl.rs.trap": "Die Falle",

    "cl.ph.h": "Wie eine Migration tatsächlich abläuft.",
    "cl.ph.lede":
      "Sechs Phasen. Die Reihenfolge ist wichtiger als das Werkzeug, und ausgerechnet die Phase, die alle kürzen, entscheidet darüber, ob die Einsparung eintritt.",

    "cl.diff.h": "Was wir anders machen.",
    "cl.diff.lede":
      "Vier ungewöhnliche Entscheidungen, jede davon aus einem Programm, in dem die gegenteilige Entscheidung jemanden viel Geld gekostet hat.",

    /* ---------------- Cyber ---------------- */
    "cy.eyebrow": "Cybersicherheit",
    "cy.h": "Wir sind kein weiterer Scanner. Wir beantworten, was das Internet bereits über Sie weiß.",
    "cy.lede":
      "Die meisten Sicherheitswerkzeuge beantworten, was im Netz falsch ist, und brauchen dafür Zugangsdaten, Agenten und eine unterschriebene Freigabe. Wir beginnen außen, ausschließlich aus öffentlichen Quellen, ohne Installation und ohne Zugriff. Danach beziffern wir den Befund in Euro.",
    "cy.jump1": "Was wir am besten können",
    "cy.jump2": "Was wir anders machen",
    "cy.jump3": "Die Regelwerke",

    "cy.best.h": "Sechs Dinge, die wir besser können als ein Generalist.",
    "cy.best.lede":
      "Diese Liste ist bewusst kurz. Eine Fähigkeit zu nennen, in der wir lediglich solide sind, ist der Weg, ein fachkundiges Publikum an der ganzen Seite zweifeln zu lassen.",
    "cy.best.col": "Was wir am besten können",
    "cy.diff.col": "Was wir anders machen",

    "cy.reg.h": "Die Regelwerke, gegen die wir bewerten.",
    "cy.reg.lede":
      "Compliance wird als Teil der Bewertung eingestuft und nicht als getrennte Beauftragung verkauft. Die Auswahl folgt dem Rechtsraum der bewerteten Gesellschaft. Der falsche Regulator sagt der lesenden Person, dass das Dokument nicht für sie geschrieben wurde.",
    "cy.reg.note":
      "Das ist Ingenieur- und Architekturarbeit, keine Rechtsberatung. Fristen und Sanktionen sind aus den Primärrechtstexten zitiert und sollten geprüft werden, denn die nationale Umsetzung bewegt sich.",
  },

  content: {
    services: [
      {
        id: "ai",
        h: "Künstliche Intelligenz",
        b: "Von der Eingrenzung der Entscheidung bis zum Betrieb, mit einem Prüfdatensatz, der die Wirkung belegt, und einer gegnerischen Prüfung, die eingreift, wenn sie ausbleibt.",
        tags: "Agentische Ketten · Suche · Bewertung · Modellbetrieb",
      },
      {
        id: "cloud",
        h: "Cloud-Transformation",
        b: "Rechenzentrumsausstieg und Plattformwechsel, Anwendung für Anwendung gegen die sieben Strategien entschieden, mit gemeinsam entworfenem Netz, Identität und Kostenmodell.",
        tags: "Migration · Landing Zones · Netz · Stilllegung",
      },
      {
        id: "cyber",
        h: "Cybersicherheit",
        b: "Was das Internet bereits über Sie weiß, ohne Zugriff ermittelt, in Euro beziffert und als Maßnahmenplan übergeben statt als Punktzahl.",
        tags: "Angriffsfläche · Angriffssimulation · Souveränität · Compliance",
      },
    ],

    /* ================= KI ================= */
    aiCapabilities: [
      {
        id: "agentic",
        h: "Agentische Automatisierung eines echten Prozesses",
        b: "Eine Kette, die Belege liest, Werkzeuge aufruft, Zwischenentscheidungen trifft und ein fertiges Ergebnis erzeugt, mit protokolliertem Zwischenschritt. Kein Chatfenster, sondern ein Prozess, der durchläuft und etwas übergibt, das jemand unterschreiben kann.",
      },
      {
        id: "rag",
        h: "Antworten, die in Ihrem eigenen Material verankert sind",
        b: "Suche über Verträge, Richtlinien, Tickets, Zeichnungen und Normen, sodass jede Antwort die Textstelle nennt, aus der sie stammt. Der Nachweis ist das Produkt. Eine Antwort ohne Quellenangabe ist in einem regulierten Prozess unbrauchbar.",
      },
      {
        id: "decide",
        h: "Entscheidungsunterstützung mit Prüfspur",
        b: "Wo ein Urteil schwerwiegend ist und wiederholt gefällt wird, erzeugt ein gegnerisches Gremium ein Ergebnis, eine Konfidenz, die Gründe und den festgehaltenen Widerspruch. Diese Akte macht die Entscheidung gegenüber Vorstand oder Prüfung belastbar.",
      },
      {
        id: "extract",
        h: "Extraktion und Klassifikation im großen Maßstab",
        b: "Unstrukturierte Eingaben werden zu strukturierten Datensätzen: Rechnungen, Schadensfälle, Ausweisdokumente, technische Spezifikationen, Posteingang. Die älteste und verlässlichste Wertklasse, und weiterhin die mit dem kürzesten Weg zu einer messbaren Zahl.",
      },
      {
        id: "code",
        h: "Technik und Verständnis von Altsystemen",
        b: "Ein System erklären, an dessen Entstehung sich niemand erinnert, Tests dafür erzeugen und die Lieferung innerhalb von Leitplanken beschleunigen. Am nützlichsten dort, wo die Dokumentation fehlt und das ursprüngliche Team weg ist, also in den meisten großen Landschaften.",
      },
      {
        id: "defend",
        h: "Erkennung unter laufendem Angriff",
        b: "Betrug, Missbrauch und Abwehr auf der Anwendungsschicht, wo die Eingabe feindlich ist und das Modell absichtlich sondiert wird. In dieser Klasse richtet ein naiver Einsatz aktiv Schaden an, und hier ist unsere eigene Plattform gebaut.",
      },
    ],

    aiRules: [
      {
        id: "decision",
        h: "Von einer Entscheidung ausgehen, nicht von einer Technologie",
        b: "Die Qualifizierungsfrage lautet, ob eine Entscheidung schwerwiegend ist, wiederholt getroffen wird und heute an einer Person mit einer Methode hängt. Dreimal ja, dann schreibt sich der Geschäftsfall selbst. Sonst sagen wir es und bieten nicht an.",
      },
      {
        id: "evals",
        h: "Der Prüfdatensatz ist das Produkt",
        b: "Vor dem Bauen sammeln wir historische Fälle, deren richtige Antwort bereits bekannt ist. Dieser Satz macht aus Meinung Messung, und er ist der einzige Wert im Vorhaben, der beim Wechsel des Modells erhalten bleibt.",
      },
      {
        id: "reviewer",
        h: "Der Prüfer ist nie der Autor",
        b: "Die Arbeit entsteht in einem System und wird von einem anderen geprüft, von einem anderen Anbieter. Wer die eigene Antwort kontrolliert, erbt den blinden Fleck, und Veröffentlichungen zeigen, dass Bewertende die eigene Ausgabe bevorzugen.",
      },
      {
        id: "ground",
        h: "Jede Aussage belegen und Unbelegbares streichen",
        b: "Kennungen, Zahlen und Zitate werden gegen die Quellbelege geprüft, Unbelegbares wird entfernt statt umformuliert. Ein erfundener Verweis in einem Kundendokument lässt sich nach dem Lesen nicht mehr zurücknehmen.",
      },
      {
        id: "cost",
        h: "Die Kosten je Arbeitseinheit begrenzen",
        b: "Kosten werden je abgeschlossener Aufgabe gemessen und ab dem ersten Tag in einem Buch geführt, nicht je Token in einer Tabelle geschätzt. Wer die Stückkosten nicht nennen kann, kann nicht skalieren und wird beim ersten Budgetgespräch gestoppt.",
      },
      {
        id: "fallback",
        h: "Den Rückfallweg vor dem Idealweg entwerfen",
        b: "Jeder Anbieter hat Drosselung, Ausfälle und Richtlinienänderungen. Wenn ein stiller Anbieter Ihren Prozess anhält, haben Sie eine Abhängigkeit gebaut statt einer Fähigkeit. Zwei Anbieter, ein deterministischer Pfad und ein ehrlicher Notbetrieb.",
      },
    ],

    aiLifecycle: [
      {
        id: "frame",
        h: "Die Entscheidung eingrenzen",
        we: "Workshops, um die genaue Entscheidung zu benennen, die dafür nötigen Belege, die Handlungsschwelle und die Form einer Ablehnung. Erfolg wird als Zahl definiert, bevor irgendetwas gebaut wird.",
        trap: "Von einem Anwendungsfall statt von einer Entscheidung ausgehen. Ein Anwendungsfall lässt sich immer vorführen und nie abnehmen, weil vorher niemand festgelegt hat, was als funktionierend gilt.",
      },
      {
        id: "data",
        h: "Datenreife und die Grenze",
        we: "Feststellen, wo die Belege wirklich liegen, in welchem Zustand sie sind und was das Haus rechtlich verlassen darf. Die Grenze für Speicherort und Verarbeitung wird hier in der Architektur gezogen, nicht nachträglich zertifiziert.",
        trap: "Erst bei der Integration merken, dass der Bestand ein Netzlaufwerk mit fünfzehn Jahren Duplikaten ist, oder dass die Daten den Rechtsraum gar nicht verlassen dürfen.",
      },
      {
        id: "spike",
        h: "Machbarkeitstest gegen ein messbares Ziel",
        we: "Ein kurzer, bewusst unfertiger Bau gegen echte Belege, um eine Frage zu beantworten: Erreicht das die in Phase eins vereinbarte Zahl. Wochen statt Monate, und er darf scheitern.",
        trap: "Eine Vorführung an ausgewählten Beispielen. Sie gelingt immer, beweist nichts und erzeugt eine Erwartung, gegen die das spätere System dann anarbeiten muss.",
      },
      {
        id: "harness",
        h: "Den Prüfrahmen bauen",
        we: "Der Referenzsatz historischer Fälle mit bekanntem Ausgang, dazu gegnerische Fälle, die ihn brechen sollen. Jede spätere Änderung wird automatisch dagegen gemessen, sodass ein Rückschritt am Tag seines Entstehens sichtbar ist.",
        trap: "Bewertung durch Stichprobenlesen und Bauchgefühl. Sie erkennt keinen kleinen Rückschritt und übersteht keine Nachprüfung in einer Beschaffung.",
      },
      {
        id: "build",
        h: "Bauen: Suche, Werkzeuge, Orchestrierung",
        we: "Suche über Ihr Material, Werkzeugaufrufe in Ihre Systeme, Orchestrierung über Schritte hinweg und ein strenger Ausgabevertrag, der bei jeder Antwort geprüft wird. Jede Form tolerieren, niemals eine leere Antwort.",
        trap: "Eine wohlgeformte Antwort für eine gute halten. Ein Modell, das gültige, aber leere Ausgabe liefert, gilt im Protokoll als Erfolg und liefert ein leeres Ergebnis aus.",
      },
      {
        id: "review",
        h: "Gegnerische Prüfung und das deterministische Tor",
        we: "Das System eines zweiten Anbieters prüft die Ausgabe gegen die Belege. Code entscheidet über bestanden oder nicht bestanden, nicht Selbstsicherheit. Begründung und Widerspruch werden mit dem Ergebnis übergeben.",
        trap: "Der Prüfung den Schalter überlassen. Ein gedrosselter Prüfer darf gute Arbeit nicht blockieren, und ein gefälliger darf fehlerhafte Arbeit nicht durchwinken.",
      },
      {
        id: "prod",
        h: "Betrieb: Beobachtbarkeit, Kosten und Fehler",
        we: "Strukturierte Ereignisse für jeden Lauf, Kosten je Aufgabe im Buch, Alarmierung auf Qualität statt nur auf Fehler und ein dokumentierter Notbetrieb. Ein Absturz muss so sichtbar sein wie ein Erfolg.",
        trap: "Verfügbarkeit statt Ergebnis überwachen. Der Dienst antwortet, die Anzeigen sind grün, und die Qualität hat sich halbiert, weil ein Anbieter unter demselben Namen das Modell getauscht hat.",
      },
      {
        id: "operate",
        h: "Betreiben: Abweichung, Auffrischung, Nachkalibrierung",
        we: "Der Prüfdatensatz läuft nach Plan und bei jedem Anbieterwechsel erneut. Schwellen werden gegen frische Ergebnisse nachkalibriert, und die Anbieterkette wird neu gemessen statt angenommen.",
        trap: "Annehmen, die Wahl vom Start sei weiterhin richtig. Latenz und Qualität kehren sich zwischen Anbietern binnen Monaten um, und eine ungemessene Kette wird still zur falschen.",
      },
    ],

    aiUseCases: [
      {
        id: "service",
        n: "01",
        h: "Kundenservice: Entlastung und Assistenz",
        sector: "Alle Branchen",
        b: "Routineanfragen aus der eigenen dokumentierten Richtlinie beantworten und für alles andere die Antwort für einen Menschen vorbereiten. Der Assistenzteil bringt meist den Ertrag, weil er das ganze Team hebt und nicht nur die leichten Fälle.",
        good: "Erledigungsquote auf einer benannten Anliegenmenge, mit stichprobengeprüfter und konstanter Qualität. Bearbeitungszeit sinkt, ohne dass Weiterleitungen steigen.",
        bad: "Entlastung wird als vermiedener Kontakt gemessen, also schließt der Bot Vorgänge, die er nicht gelöst hat, und die Kundschaft ruft trotzdem an.",
      },
      {
        id: "docs",
        n: "02",
        h: "Dokumentenverarbeitung im regulierten Backoffice",
        sector: "Versicherung, Bankwesen, Recht",
        b: "Schadensakten, Identitätsprüfungen, Verträge und Schriftverkehr werden zu strukturierten Datensätzen, mit der Quellstelle je Feld. Der Nachweis ist es, was die Verarbeitung prüfbar macht.",
        good: "Dunkelverarbeitungsquote je Dokumentklasse, mit gemessener Ausnahmequote und vollständiger Prüfspur je Feld.",
        bad: "Im Mittel hohe Genauigkeit, ohne erkennen zu können, welcher Einzelfall falsch ist, sodass ein Mensch alles nachliest und nichts gespart wird.",
      },
      {
        id: "bids",
        n: "03",
        h: "Angebote und Ausschreibungen erstellen",
        sector: "Beratung, Technologie, Bau",
        b: "Ein Erstentwurf aus der eigenen Antwortbibliothek, früheren Einreichungen und den konkreten Anforderungen dieser Ausschreibung, mit nachvollziehbarer Quelle für jede Aussage.",
        good: "Zeit bis zum Erstentwurf sinkt bei vergleichbarer Ausschreibung, die Konformitätsmatrix ist vollständig und der Text enthält keine nicht freigegebene Aussage.",
        bad: "Flüssiger Text, der beiläufig eine Fähigkeit oder Zertifizierung behauptet, die es nicht gibt. Das ist ein Ausschluss und kein Fehler.",
      },
      {
        id: "legacy",
        n: "04",
        h: "Altsysteme verstehen und Lieferung beschleunigen",
        sector: "Bankwesen, Telekommunikation, öffentlicher Sektor",
        b: "Ein System erklären, dessen Autoren gegangen sind, vor jeder Änderung beschreibende Tests erzeugen und Routinearbeit innerhalb von Prüfleitplanken beschleunigen.",
        good: "Testabdeckung auf dem Altpfad, bevor die Modernisierung beginnt, und kürzere Durchlaufzeit ohne steigende Fehlerdurchlässigkeit.",
        bad: "Erzeugter Code ohne die Tests zusammengeführt. Das hebt den Durchsatz für ein Quartal und die Fehlerquote für die beiden folgenden.",
      },
      {
        id: "soc",
        n: "05",
        h: "Sicherheitsvorsichtung und Anreicherung",
        sector: "Jede Organisation mit Sicherheitsbetrieb",
        b: "Eine Meldung um Eigentümer, Exposition und Geschäftskontext anreichern und eine Einordnung mit angehängten Belegen vorschlagen. Die Analystin entscheidet, die Maschine trägt zusammen.",
        good: "Zeit bis zur Einordnung sinkt bei gleichbleibender Meldungsmischung, mit gemessener und nicht angenommener Falsch-negativ-Quote.",
        bad: "Meldungen automatisch schließen, um die Warteschlange zu verbessern. Die Kennzahl verbessert sich, und die eine wichtige Meldung ist mitgeschlossen.",
      },
      {
        id: "fraud",
        n: "06",
        h: "Betrugs- und Missbrauchserkennung",
        sector: "Finanzdienstleistung, Marktplätze, Telekommunikation",
        b: "Verhaltensbasierte Erkennung, bei der die Eingabe feindlich ist und der Angreifer sich an Ihre Kontrollen anpasst. Das Ausweichen ist meist das stärkste Signal, weil echte Nutzung es nie erzeugt.",
        good: "Erkennung bei festem Falsch-positiv-Budget, gemessen an bestätigten Fällen, und stabil nachdem der Angreifer sich angepasst hat.",
        bad: "Ein auf den Betrug des Vorjahres abgestimmtes Modell ohne gegnerische Prüfung, das still nachlässt, sobald es sich lohnt, es zu überwinden.",
      },
      {
        id: "knowledge",
        n: "07",
        h: "Wissenssuche über interne Bestände",
        sector: "Technik, Pharma, Industrie",
        b: "Suche, die antwortet statt auflistet, über Normen, Zeichnungen, Spezifikationen und jahrzehntealte Projektarchive, mit Berechtigungen zur Abfragezeit statt nachträglich angebaut.",
        good: "Zeit bis zu einer belastbaren Antwort, gemessen an echten Fragen, mit nachweislich je Dokument durchgesetzten Berechtigungen.",
        bad: "Ein Index, der mit einem allmächtigen Dienstkonto gebaut wurde und bereitwillig eine Frage beantwortet, die die fragende Person nicht stellen durfte.",
      },
      {
        id: "supplier",
        n: "08",
        h: "Lieferanten- und Drittparteienrisiko",
        sector: "Reguliertes Unternehmen, öffentlicher Sektor",
        b: "Laufende Prüfung der Lieferanten, von denen Sie abhängen, aus deren öffentlicher Exposition, Veröffentlichungen und Vorfallhistorie, sortiert danach, was ein Ausfall Sie tatsächlich kostet.",
        good: "Abdeckung der Lieferantenbasis mit datiertem Nachweispaket je Lieferant, und Prüfaufwand konzentriert auf echte Abhängigkeit.",
        bad: "Ein Fragebogenzusammenfasser. Er erzeugt eine Note aus dem, was der Lieferant erzählen wollte, also aus der unzuverlässigsten verfügbaren Quelle.",
      },
      {
        id: "field",
        n: "09",
        h: "Außendienst und Instandhaltung",
        sector: "Fertigung, Energie, Verkehr",
        b: "Die richtige Anweisung, Zeichnung und Historie vor der Technikerin an der Anlage, auch offline, wo es keinen Empfang gibt, und mit deterministisch bleibenden sicherheitskritischen Schritten.",
        good: "Erstlösungsquote steigt und Wiederholungseinsätze sinken, bei unveränderten und überprüfbaren sicherheitskritischen Abläufen.",
        bad: "Eine erzeugte Anweisung für eine sicherheitskritische Aufgabe. Solche Schritte gehören in ein gelenktes Dokument; der Assistent holt sie, er verfasst sie nie.",
      },
      {
        id: "reg",
        n: "10",
        h: "Regulatorische Änderungen verfolgen und zuordnen",
        sector: "Finanzdienstleistung, Gesundheit, kritische Infrastruktur",
        b: "Die für Sie geltenden Regelwerke beobachten, jede Änderung den betroffenen Kontrollen und Systemen zuordnen und die Differenz liefern statt einer weiteren Zusammenfassung der ganzen Vorschrift.",
        good: "Zeit von der Veröffentlichung bis zu einer benannten verantwortlichen Person mit einer konkreten Kontrolländerung, rückführbar auf den Artikel.",
        bad: "Ein monatlicher Auszug, den niemand liest, weil er die Vorschrift wiedergibt statt zu benennen, was sich ändern muss und wer es verantwortet.",
      },
    ],

    aiBench: [
      {
        id: "cancel",
        b: "Gartner erwartet, dass bis Ende 2027 mehr als 40 Prozent der agentischen KI-Vorhaben eingestellt werden. Genannte Gründe sind steigende Kosten, unklarer Geschäftswert und unzureichende Risikokontrollen.",
      },
      {
        id: "value",
        b: "McKinsey berichtet, dass 88 Prozent der Organisationen KI in mindestens einer Funktion nutzen, während nur etwa 39 Prozent überhaupt eine Ergebniswirkung melden, meist unter 5 Prozent.",
      },
      {
        id: "gov",
        b: "Gartner erwartet, dass bis 2030 die Hälfte der Fehlschläge beim Einsatz von KI-Agenten auf unzureichend durchgesetzte Steuerung zur Laufzeit zurückgeht und nicht auf die Modelle selbst.",
      },
      {
        id: "spend",
        b: "Die weltweiten KI-Ausgaben werden für 2026 auf 2,59 Billionen US-Dollar geschätzt. Knappes Budget ist nicht die Beschränkung, und ist es seit einiger Zeit nicht mehr.",
      },
    ],

    /* ================= CLOUD ================= */
    cloudRs: [
      {
        id: "rehost",
        n: "R1",
        h: "Rehost",
        one: "Unverändert verschieben, oft Lift and Shift genannt.",
        when: "Ein fester Termin, ein auslaufender Rechenzentrumsvertrag oder eine Anwendung, die niemand ändern darf. Schnellster Weg von der Fläche und das geringste Lieferrisiko.",
        trap: "Die ganze Landschaft rehosten und das Programm für beendet erklären. Die alte Ineffizienz läuft nun auf abgerechneter Infrastruktur, die Rechnung steigt, und die Einsparung bleibt aus.",
      },
      {
        id: "relocate",
        n: "R2",
        h: "Relocate",
        one: "Die Virtualisierung verschieben, nicht die Anwendung.",
        when: "Eine große virtualisierte Landschaft, die schnell umziehen muss, ohne das Betriebsmodell zu ändern, meist in eine verwaltete Entsprechung derselben Plattform.",
        trap: "Es als Ziel statt als Zwischenschritt behandeln. Es kauft Zeit und ändert fast nichts, braucht also einen datierten Plan für das, was danach kommt.",
      },
      {
        id: "replatform",
        n: "R3",
        h: "Replatform",
        one: "Die Anwendung behalten, den Unterbau tauschen.",
        when: "In den meisten Landschaften der beste Ertrag. Eine verwaltete Datenbank, Laufzeit oder Warteschlange nimmt echte Betriebslast ab, ohne die Anwendungslogik zu berühren.",
        trap: "Ausufern zur Neuentwicklung. Jedes Replatform enthält ein Argument, noch eine Sache umzubauen, und so wird aus sechs Wochen ein Jahr.",
      },
      {
        id: "refactor",
        n: "R4",
        h: "Refactor oder Neuarchitektur",
        one: "Die Anwendung ändern, um ihre Möglichkeiten zu ändern.",
        when: "Die Beschränkung ist die Architektur selbst: sie skaliert nicht, lässt sich nicht unabhängig ausliefern oder erfüllt in dieser Form eine aufsichtsrechtliche Anforderung nicht.",
        trap: "Etwas umbauen, das das Geschäft ohnehin ablösen will, oder um der Eleganz willen umbauen. Nur eine benannte geschäftliche oder regulatorische Beschränkung rechtfertigt Kosten und Risiko.",
      },
      {
        id: "repurchase",
        n: "R5",
        h: "Repurchase",
        one: "Den Betrieb einstellen und die Fähigkeit einkaufen.",
        when: "Die Anwendung ist kein Unterscheidungsmerkmal und es gibt ein ausgereiftes Produkt. Üblich bei Mail, Zusammenarbeit, Personal, Reisekosten und zunehmend im Finanzkern.",
        trap: "Datenmigration und Schnittstellen unterschätzen. Die Lizenz ist die kleine Zahl; an den Schnittstellen und den historischen Daten entscheidet sich das Programm.",
      },
      {
        id: "retire",
        n: "R6",
        h: "Retire",
        one: "Abschalten.",
        when: "Immer zuerst zu fragen. In den meisten großen Landschaften hat ein beachtlicher Anteil der Anwendungen keine echten Nutzer, dupliziert etwas anderes oder existiert nur, weil niemand nachgesehen hat.",
        trap: "Nie ausgeführt werden. Die Stilllegung wird ans Ende geplant, dem Programm geht die Kraft aus, und die Landschaft bezahlt nun alles doppelt.",
      },
      {
        id: "retain",
        n: "R7",
        h: "Retain",
        one: "Bewusst dort lassen, wo es ist, und den Grund aufschreiben.",
        when: "Datenhaltung, Lizenzierung, Latenz zu einem physischen Prozess oder ein System mit bekanntem Ablösetermin. Retain ist eine Entscheidung, und eine legitime.",
        trap: "Retain als undokumentierter Standardfall. Es sieht dann genauso aus wie eine nie bewertete Anwendung und wird zwei Jahre später als Überraschung wiederentdeckt.",
      },
    ],

    cloudPhases: [
      {
        id: "discover",
        h: "Feststellen, was Sie tatsächlich betreiben",
        we: "Bestandsaufnahme aus Netz, Verzeichnis, Abrechnung und Gesprächen, nicht aus der Konfigurationsdatenbank. Abhängigkeiten werden beobachtet, denn das Diagramm ist immer veraltet.",
        trap: "Dem vorhandenen Bestand vertrauen. Jede Landschaft hat Anwendungen, die niemand gelistet hat, und Abhängigkeiten, die niemand gezeichnet hat, und beide erscheinen am Umschaltwochenende.",
      },
      {
        id: "assess",
        h: "Bewerten und das R wählen",
        we: "Eine der sieben Strategien je Anwendung, mit Begründung, Kosten und Risiko schriftlich. Dieser Vermerk macht eine Entscheidung ein Jahr später verteidigbar, wenn jemand nach dem Warum fragt.",
        trap: "Je Landschaft statt je Anwendung entscheiden. Das ist schneller, es machen die meisten Programme, und es ist die Wurzel von Mehrkosten und Verzug.",
      },
      {
        id: "landing",
        h: "Die Landing Zone bauen",
        we: "Konten, Identität, Netz, Protokollierung, Leitplanken und Kostenmodell gemeinsam entworfen. Hier wird auch die Position zu Datenhaltung und Souveränität festgelegt, denn ein Nachrüsten wäre ein Neubau.",
        trap: "Eine Landing Zone, die allein das Plattformteam entwirft. Identität und Netz treffen die Anwendungsanforderungen dann erstmals während der Migration, und eines von beiden verliert.",
      },
      {
        id: "waves",
        h: "In Wellen migrieren",
        we: "Kleine erste Welle, um den Ablaufplan zu beweisen, danach Wellen nach Abhängigkeit statt nach Bequemlichkeit. Jede Welle erzeugt eine geprobte, gestoppte und umkehrbare Umschaltung.",
        trap: "Eine erste Welle, die gewählt wurde, weil sie leicht ist. Sie beweist nichts über die schweren Fälle und gibt dem Programm im falschen Moment falsche Sicherheit.",
      },
      {
        id: "run",
        h: "Umschalten und betreiben",
        we: "Geprobte Umschaltungen mit getestetem Rückweg, danach eine Stabilisierungsphase mit weiterhin verfügbarer Altplattform. Sicherung und Wiederherstellung durch echtes Wiederherstellen belegt, nicht durch ein grünes Häkchen.",
        trap: "Den Erfolg bei der Umschaltung erklären. Im ersten Monat erscheinen die Betriebskosten, die Leistungsüberraschungen und die fehlenden Betriebsanleitungen.",
      },
      {
        id: "optimise",
        h: "Stilllegen und optimieren",
        we: "Die Altlandschaft nach Plan abschalten und belegen, dass sie aus ist. Danach richtig dimensionieren, dort binden, wo die Last vorhersehbar ist, und den verursachenden Teams die Stückkosten zeigen.",
        trap: "Die Stilllegung überspringen. Jeder Geschäftsplan unterstellt, dass das Alte aufhört, und das ist der häufigste Grund, warum die Einsparung nie eintritt.",
      },
    ],

    cloudDiff: [
      {
        id: "network",
        h: "Das Netz gehört zum Umfang, nicht zu den Abhängigkeiten",
        b: "Routing, Label Switching und Weitverkehrsentwurf sind Teil der Migration und kein Ticket an einen fremden Fahrplan. Diese Praxis begann bei Netzen in Carrier-Größe, und dort liegt meist die nicht kalkulierte Beschränkung.",
      },
      {
        id: "decom",
        h: "Die Stilllegung wird zuerst geplant",
        b: "Der Einsparungsfall unterstellt, dass die Altlandschaft aufhört. Wir terminieren und belegen das von Anfang an, weil ein Programm ohne verbleibende Kraft es am Ende schlicht nicht tut.",
      },
      {
        id: "hard",
        h: "Die schweren Teile sind das Programm",
        b: "Wechsel der Datenbank-Engine, Ablösung von Großrechnern, Identitätsmigration und Austausch der Integrationsplattform sind die Stellen, an denen Migrationen scheitern. Sie werden als Hauptarbeit geplant, nicht als Teilaufgaben.",
      },
      {
        id: "cost",
        h: "Das Kostenmodell entsteht mit der Landing Zone",
        b: "Kennzeichnung, Kontenstruktur, Bindungsstrategie und Stückkostenberichte werden von Beginn an eingebaut. Kostentransparenz nachträglich auf eine laufende Landschaft zu setzen ist teuer und bleibt immer lückenhaft.",
      },
    ],

    /* ================= CYBER ================= */
    cyberBest: [
      {
        id: "asm",
        h: "Externe Angriffsfläche, passiv ermittelt",
        b: "Ihre gesamte über das Internet erreichbare Landschaft aus öffentlichen Quellen: Routing-Register, Zertifikatstransparenz, passive Namensdaten und internetweite Scan-Indizes. Keine Freigabe nötig, weil nichts angefasst wird.",
      },
      {
        id: "own",
        h: "Eigentum nachgewiesen statt getroffen",
        b: "Jede Ausweitung des Umfangs muss belegen, dass die Anlage Ihnen gehört. Geteiltes Hosting, Konzernstrukturen und ähnlich klingende Namen werden korrekt aufgelöst, sodass fremde Exposition nie in Ihrem Bericht landet.",
      },
      {
        id: "bas",
        h: "Angriffssimulation mit der Steuerung auf Ihrer Seite",
        b: "Simulation in einer segmentierten Nachbildung, abgebildet auf die MITRE-ATT&CK-Matrix, mit der Steuerung auf Ihrer Infrastruktur unter Ihrer Aufsicht. Geprüft gegen Ein-Klick-, Null-Klick- und Zero-Day-Ketten.",
      },
      {
        id: "deep",
        h: "Sicherheit in den untersten Schichten",
        b: "Identität, Kryptografie, Mandantentrennung, Lieferkette und Firmware-Integrität, damit Vertrauen konstruktiv entsteht. Perimeterschutz versagt, und Widerstandsfähigkeit muss architektonisch sein, um eine Prüfung zu überstehen.",
      },
      {
        id: "sov",
        h: "Souveränität und Schlüsselhoheit, die einer Prüfung standhält",
        b: "Datenhaltung ab dem ersten Diagramm, Schlüssel beim Kunden und kein fremder Carrier im Lieferweg. Der Nachweisordner, nach dem eine Aufsicht fragt, entsteht als Teil der Arbeit.",
      },
      {
        id: "quant",
        h: "Risiko in Euro ausgedrückt",
        b: "Befunde werden in eine jährliche Schadenserwartung überführt, mit derselben Schadensmathematik, die ein Versicherer verwendet. Eine Buchstabennote übersteht kein Gespräch mit der Finanzleitung; eine Zahl mit Rechenweg schon.",
      },
    ],

    cyberDiff: [
      {
        id: "passive",
        h: "Kein einziges Paket, vertraglich zugesichert",
        b: "Wir können ein Unternehmen vor dem ersten Gespräch bewerten, weil nichts davon eine Erlaubnis braucht oder Systeme berührt. Jeder scannerbasierte Ansatz braucht eine Freigabe, und damit hat die Beauftragung bereits begonnen.",
      },
      {
        id: "evidence",
        h: "Fehlende Evidenz ist niemals ein Befund",
        b: "Schlägt eine Abfrage fehl, melden wir unbekannt und behaupten nichts. Eine falsche Schwachstelle in einer Vorstandsvorlage ist schlimmer als eine Lücke, weil sie sich nach dem Lesen nicht zurücknehmen lässt.",
      },
      {
        id: "audit",
        h: "Wir prüfen unsere eigenen Befunde mit einem zweiten Anbieter",
        b: "Das System eines anderen Anbieters prüft jeden Befund gegen die Belege und markiert Unbelegbares. Der Prüfer darf markieren, entschieden wird nach deterministischen Eigentumsdaten, damit ein Filter keinen Bericht leeren kann.",
      },
      {
        id: "fix",
        h: "Das Ergebnis ist ein Maßnahmenplan, keine Punktzahl",
        b: "Jeder Befund nennt die Maßnahme, warum ein Patch die Ursache nicht strukturell schließt und was der Kunde davon hat. Eine Punktzahl sagt jemandem, dass es ein Problem gibt, und nichts über seine nächste Woche.",
      },
      {
        id: "vendor",
        h: "Herstellerneutral, weil Sie Ihren eigenen Stack verkaufen",
        b: "Maßnahmen werden als Kontrolle formuliert, nicht als Produktname. Ein Partner, der einen bestimmten Hersteller vertreibt, kann seiner Kundschaft kein Dokument überreichen, das den Wettbewerb empfiehlt.",
      },
    ],

    cyberRegimes: [
      {
        id: "eu",
        h: "Europäische Union",
        b: "NIS-2, der Digital Operational Resilience Act, der Cyber Resilience Act, die KI-Verordnung und die Datenschutz-Grundverordnung, dazu die bankaufsichtlichen Anforderungen an die IT, soweit einschlägig.",
      },
      {
        id: "ca",
        h: "Kanada",
        b: "Die OSFI-Leitlinien zu Technologie- und Cyberrisiko, operativer Widerstandsfähigkeit und Drittparteien, dazu das föderale Datenschutzrecht und das Regelwerk der Provinz Québec.",
      },
      {
        id: "uk",
        h: "Vereinigtes Königreich",
        b: "Die Basisanforderungen des National Cyber Security Centre und das britische Datenschutzrecht, auf dieselben Kontrollen abgebildet statt getrennt bewertet.",
      },
      {
        id: "intl",
        h: "Anderswo",
        b: "ISO 27001 und das NIST Cybersecurity Framework als Standardmenge, dazu die nationale Grundanforderung des Rechtsraums, in dem die bewertete Gesellschaft eingetragen ist.",
      },
    ],
  },
};
