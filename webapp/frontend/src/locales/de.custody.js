/* Custody Observability, Deutsch.
 *
 * Uebersetzung der Referenzsprache en.custody.js. Die Struktur ist dort festgelegt: gleiche
 * Schluessel, gleiche Reihenfolge, gleiche Anzahl Eintraege in jedem Inhaltsblock. Wer hier eine
 * Reihenfolge aendert, paart eine deutsche Ueberschrift mit einem englischen Fliesstext, sobald
 * eine Sprache einen Eintrag mehr hat. Das i18n-Gate prueft genau das.
 *
 * Auch hier gilt: keine langen Gedankenstriche, keine HTML-Entities, kein Satz ueber dreissig
 * Woerter, keine erfundenen Zahlen. Die beiden Studien werden auf der Seite benannt.
 */

export const DE_CUSTODY = {
  keys: {
    "cus.pan.eyebrow":
      "Schicht 06, vollstaendig",
    "cus.pan.h":
      "Vier Modelle, vier Anbieter, und eine Abstimmung, die sie nicht gewinnen duerfen.",
    "cus.pan.lede":
      "Nach dieser Schicht wird zuerst gefragt, also hier genau, wie sie arbeitet. Die deterministische Regel hat bereits entschieden, ob ein Vorfall vorliegt, bevor ein Modell aufgerufen wird. Das Gremium schreibt die Erklaerung, streitet oeffentlich mit sich selbst und haelt keinen Schalter.",
    "cus.pan.r1h":
      "Zwei Soldaten, zwei Pruefer",
    "cus.pan.r1b":
      "Zwei Modelle sollen zusammenfassen, was geschehen ist. Zwei andere Modelle sollen diese Zusammenfassung angreifen und benennen, was die Pruefungen nicht abdecken. Die Rollen sind fest, damit niemand die eigene Arbeit benotet.",
    "cus.pan.r2h":
      "Der Pruefer ist nie der Autor",
    "cus.pan.r2b":
      "Ein Modell, das sein eigenes Ergebnis prueft, stimmt sich selbst zu. Der Pruefer ist immer ein anderes Modell als das schreibende, und moeglichst von einem anderen Anbieter, denn ein blinder Fleck gehoert meist einer Familie und nicht einer Instanz.",
    "cus.pan.r3h":
      "Vier Anbieter, keine gemeinsame Ausfallursache",
    "cus.pan.r3b":
      "Eine Drosselung, ein Ausfall oder eine ueber Nacht geaenderte Richtlinie bei einem Anbieter kann das Gremium nicht zum Schweigen bringen. Vier Modelle eines Hauses sind vier Huete auf einem Kopf und fallen gemeinsam aus.",
    "cus.pan.r4h":
      "Ein Quorum von drei, und der Median",
    "cus.pan.r4b":
      "Unter drei Antworten gilt das Gremium als nicht beschlussfaehig, und seine Meinung zaehlt gar nicht. Schlaegt es eine Zahl vor, wird der Median des Vereinbarten angewendet, damit ein selbstsicheres Modell das Ergebnis nicht verzerrt.",
    "cus.pan.r5h":
      "Einstimmiger Widerspruch stoppt die Linie",
    "cus.pan.r5b":
      "Widersprechen alle Pruefer einem gruenen deterministischen Ergebnis, gilt das als Hinweis darauf, dass die PRUEFUNG falsch ist und nicht das System. Es haelt an und erreicht einen Menschen. In unserer eigenen Auslieferung hiess dieses Muster zweimal, dass eine Pruefung log.",
    "cus.pan.r6h":
      "Der Code entscheidet. Die Modelle erklaeren.",
    "cus.pan.r6b":
      "Ein Modellaufruf dauert zwischen Sekundenbruchteilen und einer Minute und kann im schlechtesten Moment gedrosselt werden. Die entscheidende Regel ist Arithmetik in Mikrosekunden. Ein Modell dort fuegt Latenz und Meinungen hinzu, wo beides nicht gebraucht wird.",
    "cus.pan.note":
      "Wir betreiben unsere eigene Auslieferung genau so, nichts davon ist theoretisch. Vier Modelle pruefen jeden Deploy, die deterministischen Pruefungen entscheiden, und das Gremium hat Fehler gefunden, die unsere eigenen Pruefungen als bestanden werteten. Es lag auch schon selbstsicher daneben, und genau deshalb haelt es nie den Schalter.",
    "cus.d.schema":
      "Vertraege fuer jede Quelle, damit kein Sensor still seine Form aendert und den Join bricht.",
    "cus.d.panel":
      "Vier Modelle von vier Anbietern pruefen die Entscheidung und schreiben den Text. Beratend, nie entscheidend.",
    "cus.d.recall":
      "Frueherer Vorfaelle als Kontext, damit eine Pruefende sieht, was beim letzten Mal geschah.",
    "cus.oss.eyebrow":
      "Dieselbe Architektur, vollstaendig auf Open Source",
    "cus.oss.h":
      "Jede Schicht laesst sich aus Software bauen, die Sie lesen, betreiben und behalten koennen.",
    "cus.oss.lede":
      "Keine billigere Variante. Ein anderer Satz Garantien, und fuer eine Organisation, die fremde Werte unter einem gesetzlichen Auftrag haelt, meist der besser vertretbare. Lizenzen geprueft: nichts auf dieser Seite ist nur quelloffen einsehbar, denn eine Lizenz, die unter Ihnen geaendert werden kann, ist kein Open Source.",
    "cus.oss.stack":
      "Open-Source-Stack",
    "cus.oss.why":
      "Warum es in dieser Schicht zaehlt",
    "cus.oss.v1h":
      "Die Regel muss vor Gericht bestehen",
    "cus.oss.v1b":
      "Eine Erkennung beschuldigt eine Person. Die Verteidigung wird fragen, wie das System entschieden hat, und eine Antwort, die in einer Geheimhaltungsklausel endet, ist keine. Lesbare Software ist Software, die ein Gericht pruefen kann.",
    "cus.oss.v2h":
      "Keine Lizenz kann Ihre Beweise abschalten",
    "cus.oss.v2b":
      "Redis wurde umlizenziert, die Community schuf Valkey. Elasticsearch wurde umlizenziert, die Community schuf OpenSearch. Terraform wurde umlizenziert, die Community schuf OpenTofu. Jeder dieser Forks existiert, weil sich jemand auf ein zurueckgezogenes Versprechen verlassen hatte.",
    "cus.oss.v3h":
      "Die Daten bleiben, wo das Gesetz es verlangt",
    "cus.oss.v3b":
      "Fallmaterial unter europaeischem Mandat darf die Jurisdiktion oft nicht verlassen und haeufig nicht einmal das Haus. Selbst betriebene Software macht daraus eine Konfigurationsfrage statt einer Vertragsverhandlung.",
    "cus.oss.v4h":
      "Ein Archiv ueberlebt das Werkzeug, das es schrieb",
    "cus.oss.v4b":
      "Beweise werden Jahre und manchmal Jahrzehnte aufbewahrt. Ein offenes Format heisst, das Archiv ist noch lesbar, lange nachdem das erzeugende Produkt eingestellt, uebernommen oder neu bepreist wurde.",
    "cus.oss.v5h":
      "Open Source ist nicht kostenlos, und das zu verschweigen laesst es scheitern",
    "cus.oss.v5b":
      "Jemand muss es betreiben, patchen und um drei Uhr nachts dafuer geradestehen. Und die Lieferkette ist eine echte Angriffsflaeche: Abhaengigkeiten werden gepinnt, Pruefsummen vor der Ausfuehrung verifiziert, und ein Scanner, der nie einen Build stoppt, ist eine Logdatei mit Lizenz.",
    "cus.oss.mixh":
      "Gemischt ist meist die richtige Antwort",
    "cus.oss.mixb":
      "Niemand sollte einen funktionierenden Analytik-Vertrag aus Prinzip ersetzen. Die nuetzliche Frage ist, welche Schichten Ihnen gehoeren muessen. Die Antwort ist fast immer der Speicher, die Regel und der Pruefpfad. Diese drei bestimmen, was ein Vorfall bedeutet und wer ihn vertreten muss.",
    "cus.deep.eyebrow":
      "Tiefer Einstieg, Schicht fuer Schicht",
    "cus.deep.h":
      "Wofuer jede Schicht da ist, und womit Sie sie tatsaechlich bauen wuerden.",
    "cus.deep.lede":
      "Konkrete Produkte, denn ein Bild aus unbeschrifteten Kaesten legt sich auf nichts fest. Tauschen Sie frei: das Argument ist die Form, nicht die Herstellerliste. Die meisten betreiben drei oder vier davon bereits.",
    "cus.deep.map":
      "Produktzuordnung",
    "cus.deep.inside":
      "Was in dieser Schicht sitzt",
    "cus.d.chain":
      "Beobachtet die Wallets, die Sie ohnehin ueberwachen. Meldet eine Bewegung, nennt einen Dienst, nie eine Person.",
    "cus.d.case":
      "Haelt Beschluesse und Autorisierungen. Das ist die andere Haelfte des Joins.",
    "cus.d.vault":
      "Erfasst, wer Schluesselmaterial geoeffnet hat und wann. Oft die einzige Spur.",
    "cus.d.idp":
      "Wer sich angemeldet hat, von wo, mit welchem Geraet. Verbindet Handlung und Konto.",
    "cus.d.bus":
      "Ein Topic je Quelle, von jedem Punkt wiederholbar. Nichts geht verloren.",
    "cus.d.cdc":
      "Streamt Aenderungen aus der Falldatenbank, sobald sie geschrieben werden.",
    "cus.d.stream":
      "Fenstert und korreliert. Hier bekommt eine verspaetete Autorisierung ihre Zeit.",
    "cus.d.vocab":
      "Ein Vokabular fuer ein Dutzend Quellen, damit zwei Systeme vergleichbar werden.",
    "cus.d.entity":
      "Loest eine Person ueber viele Datensaetze auf. Falsch gemacht ist der Graph wertlos.",
    "cus.d.hot":
      "Die letzten Minuten im Arbeitsspeicher. Schnell genug, bevor etwas geschrieben wird.",
    "cus.d.sql":
      "Die verbindliche Antwort auf die Frage nach der Erlaubnis. Nie ein Cache, nie eine Kopie.",
    "cus.d.graph":
      "Beziehungen als eigenstaendige Objekte. Das macht den zweiten Schritt lesbar.",
    "cus.d.rule":
      "Bewegt und nicht autorisiert. Arithmetik, Mikrosekunden, kein Modell in der Naehe.",
    "cus.d.hop":
      "Wer sonst diesen Fall ohne Erlaubnis beruehrt hat. Die Abfrage, die eine Person findet.",
    "cus.d.queue":
      "Eine Zeile, mit Bewegung, leerer Autorisierungsmenge und angehaengten Belegen.",
    "cus.jump4":
      "Zwei Ermittlungen",
    "cus.cases.eyebrow":
      "Zwei Ermittlungen, von Anfang bis Ende",
    "cus.cases.h":
      "Was das System in der entscheidenden Nacht tut, und was in der anderen.",
    "cus.cases.lede":
      "In beiden Faellen kommt dieselbe Bewegung an. Einmal fehlt die Autorisierung und binnen Minuten steht eine Person fest. Einmal ist sie nur verspaetet, und niemand wird geweckt. Eine Kontrolle misst sich an beidem.",
    "cus.n.chain": "CHAIN",
    "cus.n.case": "FALL",
    "cus.n.vault": "TRESOR",
    "cus.n.idp": "IDENTITAET",
    "cus.n.edr": "ENDPUNKT",
    "cus.n.siem": "LOGS",
    "cus.n.bus": "BUS",
    "cus.n.schema": "SCHEMA",
    "cus.n.cdc": "CAPTURE",
    "cus.n.dlq": "DEAD LETTER",
    "cus.n.stream": "STROM",
    "cus.n.vocab": "VOKABULAR",
    "cus.n.entity": "ENTITAETEN",
    "cus.n.graph": "GRAPH",
    "cus.n.sql": "AUTORISIERUNGEN",
    "cus.n.ts": "EREIGNISSE",
    "cus.n.obj": "BEWEISE",
    "cus.n.hot": "HEISSES FENSTER",
    "cus.n.rule": "DIE REGEL",
    "cus.n.hop": "ZWEITER SCHRITT",
    "cus.n.policy": "RICHTLINIE",
    "cus.n.flow": "ABLAUF",
    "cus.n.panel": "VIER MODELLE",
    "cus.n.recall": "FRUEHERE FAELLE",
    "cus.n.board": "BOARD",
    "cus.n.queue": "QUEUE",
    "cus.n.audit": "WER SAH HIN",
    "cus.dia2.hot": "DER ERKENNUNGSPFAD",
    "cus.dia1.cap":
      "Bewegungen kommen links an, Autorisierungen rechts. Vier finden ein Gegenstueck. Die fuenfte nicht, und genau dieses Fehlen ist der Alarm.",
    "cus.dia1.alt":
      "Eine animierte Darstellung: Bewegungen von Vermoegenswerten treffen auf Autorisierungen, und eine Bewegung ohne passende Autorisierung loest einen Vorfall aus.",
    "cus.dia1.left":
      "BEWEGUNGEN",
    "cus.dia1.right":
      "AUTORISIERUNGEN",
    "cus.dia1.none":
      "KEIN TREFFER",
    "cus.dia1.verdict":
      "VORFALL",
    "cus.dia2.cap":
      "Ereignisse steigen durch die sieben Schichten. Die helle Naht ist der Join, und die Traversierung durch den Speicher ist der zweite Schritt, der eine Person findet statt einer Transaktion.",
    "cus.dia2.alt":
      "Eine animierte Darstellung des Sieben-Schichten-Stacks, mit hervorgehobenem Join zwischen dritter und vierter Schicht und einer Graph-Traversierung durch den Speicher.",
    "cus.dia2.join":
      "DER JOIN",
    "cus.dia2.hop":
      "ZWEITER SCHRITT",
    "cap.cus.lede":
      "Eine Referenzarchitektur, um den Diebstahl eines Vermoegenswerts durch die bewachende Person zu erkennen, gebaut aus Systemen, die die meisten Verwahrer bereits besitzen. Geschrieben fuer Sicherstellungsstellen, Verwahrer, Boersen und Treuhaender.",
    "cap.cus.go":
      "Architektur lesen",
    "cus.jump1": "Der Stack",
    "cus.jump2": "Triangulation",
    "nav.custody": "Verwahrung",
    "tab.custody": "Verwahr.",
    "cus.eyebrow": "Custody Observability",
    "cus.h": "Wer den Vermoegenswert bewacht, kann ihn bewegen. Fast nichts in Ihrer Umgebung sucht danach.",
    "cus.lede":
      "Sicherstellungsstellen, Verwahrer, Boersen, Treuhaender und Insolvenzverwalter halten Werte fuer andere. Die Kontrollen darum herum sind meist dafuer gebaut, Aussenstehende fernzuhalten. Das schwierigere Problem ist die Person, die bereits drinnen und bereits vertrauenswuerdig ist.",
    "cus.cta": "Sprechen Sie uns auf Verwahrung an",

    "cus.idea.eyebrow": "Der Leitgedanke",
    "cus.idea.h": "Jede Bewegung eines verwahrten Vermoegenswerts braucht eine passende Autorisierung. Keine Uebereinstimmung ist ein Vorfall.",
    "cus.idea.lede":
      "Diese eine Regel ist das gesamte System. Alles Weitere auf dieser Seite ist Technik, Bestaetigung oder Darstellung. Das Erkennungssignal liegt nicht auf der Blockchain und nicht im Verhalten der Mitarbeiterin. Es ist das Fehlen einer Autorisierung zu einer bereits erfolgten Bewegung, und das ist ein Datenbank-Join statt einer Vermutung.",

    "cus.prec.eyebrow": "Das Prinzip ist nicht neu",
    "cus.prec.h": "Eine Asservatenkammer setzt diese Regel seit hundert Jahren durch.",
    "cus.prec.b1":
      "Nichts verlaesst sie ohne unterschriebenen Beleg, und der fehlende Beleg ist der Alarm. Niemand muss zuerst die Beamtin identifizieren, ihr Verhalten modellieren oder beurteilen, ob sie nervoes wirkte. Der Eintrag existiert, oder er existiert nicht.",
    "cus.prec.b2":
      "Kryptowerte in einem laufenden Verfahren sind Asservate. Es handelt sich nur um eine Kammer, die jede Person mit der Kombination von zuhause aus oeffnen kann, um drei Uhr morgens, ohne dass die Tuer ein Geraeusch macht. Die Kontrolle wurde nicht ueberfluessig. Die Tuer hat nur aufgehoert zu quietschen.",
    "cus.prec.b3":
      "Die Buchhaltung hat eine Variante davon im fuenfzehnten Jahrhundert geloest. Luca Pacioli beschrieb die doppelte Buchfuehrung 1494 in Venedig, venezianische Kaufleute nutzten sie bereits. Jede Bewegung traegt eine Gegenbuchung, ein Posten ohne Gegenstueck ist damit per Definition ein Fehler und nicht Ermessenssache.",

    "cus.chain.eyebrow": "Der haeufigste erste Irrtum",
    "cus.chain.h": "Chain-Analytik ist eine Bestaetigungsschicht. Der Detektor war sie nie.",
    "cus.chain.lede":
      "Das ist die Antwort, zu der die meisten zuerst greifen, und eine Compliance-Fachkraft widerspricht innerhalb eines Satzes. Zu Recht.",
    "cus.chain.b1":
      "Analysewerkzeuge ordnen auf Ebene des Dienstes zu. Sie gruppieren Adressen und beschriften die Gruppe: diese gehoert zu einer Boerse, jene zu einem Mixer, diese zu einer sanktionierten Einheit. Das ist wirklich schwer, und darin sind sie gut.",
    "cus.chain.b2":
      "Was sie nicht koennen, ist den wirtschaftlich Berechtigten einer Einzahlungsadresse zu nennen. Die Boerse weiss es, denn sie hat die Identitaetspruefung durchgefuehrt. Der Analyseanbieter nicht. Aus einer Adresse einen Namen zu machen erfordert die Unterlagen der Boerse und ein Rechtshilfeersuchen.",
    "cus.chain.b3":
      "Die ehrliche Reihenfolge ist kurz. Die Analytik zeigt, dass Werte eine ueberwachte Wallet verlassen und bei einem Dienst ankommen. Mehr zeigt sie nicht. Sie benennt einen Dienst, niemals eine Person. Nuetzlich, notwendig, und nicht das, was Alarm ausloest.",

    "cus.orch.eyebrow": "Ein Werkzeug regiert sie nicht alle",
    "cus.orch.h": "Es gibt kein einzelnes Werkzeug. Es gibt eine Orchestrierungsschicht, und die ist das Produkt.",
    "cus.orch.lede":
      "Jede Organisation in dieser Lage besitzt die meisten Sensoren bereits. Das Fallsystem, den Tresor fuer privilegierte Zugriffe, den Identitaetsanbieter, den Endpunkt-Agenten, die vorhandene Log-Plattform, einen oder mehrere Chain-Anbieter. Die Daten sind da. Es fehlt die Schicht, in der zwei davon einander offen widersprechen.",
    "cus.orch.b1":
      "Diese Schicht ist zuerst ein Integrationsproblem und erst danach ein Analyseproblem. Alles kommt ueber Schnittstellen und wird in ein gemeinsames Vokabular normalisiert. Es landet in einem Graphen, in dem eine Beziehung ein eigenstaendiges Objekt ist statt eines Joins, den nie jemand geschrieben hat.",
    "cus.orch.b2":
      "Sie muss ausserdem ueber Organisations- und Landesgrenzen hinweg funktionieren, denn die Bewegung sieht die eine Seite und die Autorisierung liegt bei der anderen. Ein gemeinsames System mehrerer Behoerden, das die Punkte verbindet, ist die eigentliche Anforderung. Eine einzelne Herstellerkonsole nicht.",

    "cus.layers.eyebrow": "Der Stack, benannt",
    "cus.layers.h": "Sieben Schichten, und es fehlt immer dieselbe.",
    "cus.layers.lede":
      "Unten stehen konkrete Komponenten, denn ein Architekturbild mit unbeschrifteten Kaesten legt sich auf nichts fest. Tauschen Sie frei: das Argument ist die Form, nicht die Herstellerliste. Der Join sitzt zwischen Schicht drei und vier. Genau diese Schicht fehlt den meisten, und deshalb haben sie alle Daten und keine Antwort.",

    "cus.tri.eyebrow": "Triangulation",
    "cus.tri.h": "Das sind nicht mehr Alarme. Das ist das Gegenteil davon.",
    "cus.tri.lede":
      "Jeder Sensor fuer sich meldet staendig. Ein Ueberwachungsprogramm stirbt in der Woche, in der seine Warteschlange unlesbar wird, und unlesbar wird sie lange bevor das jemand zugibt. Ein einzelnes Signal wird deshalb protokolliert und loest gar nichts aus.",
    "cus.tri.math.h": "Die Rechnung, ehrlich",
    "cus.tri.math.b":
      "Angenommen, ein Sensor irrt sich einmal pro tausend Ereignisse und sieht hunderttausend Ereignisse taeglich. Allein erzeugt er rund hundert Fehlalarme pro Tag und wird binnen einer Woche stummgeschaltet. Zwei wirklich unabhaengige Sensoren auf demselben Objekt multiplizieren sich zu eins zu einer Million. Dieselbe Menge ergibt dann etwa alle zehn Tage einen Fehltreffer.",
    "cus.tri.math.warn":
      "Das entscheidende Wort ist unabhaengig. Zwei Datenstroeme aus derselben Quelle sind ein Sensor mit zwei Huetten, und ihre Fehlerraten zu multiplizieren ist Rechenbetrug. Eine extern beobachtete Bewegung und eine intern erfasste Autorisierung haben keine gemeinsame Ursache. Genau deshalb bedeutet ihr Widerspruch etwas.",
    "cus.tri.contra.h": "Ein Widerspruch schlaegt eine Anomalie",
    "cus.tri.contra.b":
      "Eine Anomalie sagt, das ist ungewoehnlich. Ungewoehnliches passiert staendig und bedeutet nichts. Ein Widerspruch sagt, diese beiden Eintraege koennen nicht beide stimmen. Der Wert wurde bewegt, und es existiert keine Autorisierung. Eine der Aussagen ist falsch, oder jemand hat getan, was ihm nicht erlaubt war. Ein Drittes gibt es nicht.",

    "cus.graph.eyebrow": "Warum ausgerechnet ein Graph",
    "cus.graph.h": "Der Graph verdient sich seinen Platz beim zweiten Schritt, nicht beim ersten.",
    "cus.graph.b1":
      "Waere die einzige Frage, ob dieser Wert ohne Autorisierung bewegt wurde, genuegte eine relationale Tabelle und eine Graphdatenbank waere Architekturtheater. Diese erste Frage ist eine Abfrage mit einem einzigen Anti-Join.",
    "cus.graph.b2":
      "Die zweite Frage findet die Person. Hat jemand, der das Schluesselmaterial zu diesem Fall gelesen hat, noch etwas anderes getan, das einen Blick lohnt? Eine nicht gemeldete Reise, ein Konto beim empfangenden Dienst, ein zweiter Fall in derselben Stunde.",
    "cus.graph.b3":
      "Relational sind das vier Joins mit zwei Anti-Joins, und mit jedem Schritt wird es schlimmer. Als Graph-Traversierung liest es sich ungefaehr wie der Satz, den eine Ermittlerin laut sagen wuerde. Diese Lesbarkeit ist nicht kosmetisch. Eine Regel, die sie lesen kann, ist eine Regel, die sie bestreiten kann.",

    "cus.models.eyebrow": "Wo die Modelle sitzen",
    "cus.models.h": "Niemals im Entscheidungspfad.",
    "cus.models.b1":
      "Ein Modellaufruf dauert zwischen Sekundenbruchteilen und einer Minute und kann im falschen Moment gedrosselt werden. Die Regel, die ueber einen Vorfall entscheidet, ist Arithmetik und laeuft in Mikrosekunden. Ein Modell an dieser Stelle fuegt einem Vergleich Latenz und Meinungen hinzu, der beides nicht braucht.",
    "cus.models.b2":
      "Ausserhalb des Pfades sind sie viel wert. Vier Modelle von vier Anbietern pruefen, was die deterministische Schicht entschieden hat, schreiben den Text, den ein Mensch um zwei Uhr nachts lesen muss, und widersprechen einander schriftlich. Vier Anbieter bedeuten keine gemeinsame Ausfallursache.",
    "cus.models.b3":
      "Ihr Ergebnis ist beratend und wird auch so gekennzeichnet. Der Code entscheidet, die Modelle erklaeren. Wir betreiben unsere eigene Auslieferung genau so, das Argument ist hier also nicht theoretisch.",



    "cus.limits.eyebrow": "Ehrliche Grenzen",
    "cus.limits.h": "Was das hier nicht leistet.",
    "cus.limits.lede":
      "Hier genannt statt spaeter entdeckt. Ein Anbieter, der Ihnen die Grenze seines eigenen Entwurfs nicht nennt, teilt Ihnen stattdessen etwas anderes mit.",

    "cus.start.eyebrow": "Wie das anfaengt",
    "cus.start.h": "Die erste nuetzliche Fassung ist klein, und sie ist keine Plattform.",
    "cus.start.b1":
      "Zwei Quellen und eine Regel. Bewegungen von dort, wo Sie ohnehin hinsehen, Autorisierungen aus dem Fall- oder Aktensystem, und der Join dazwischen. Das allein beantwortet die entscheidende Frage und kann laufen, waehrend ueber den Rest noch diskutiert wird.",
    "cus.start.b2":
      "Alles Weitere verbreitert die Bestaetigung und aendert die Idee nicht. Ein zweiter Chain-Anbieter, die Lesezugriffe aus dem Tresor, Entitaetsaufloesung, damit eine Person nicht laenger vier Datensaetze ist, danach der Graph fuer den zweiten Schritt.",
    "cus.start.b3":
      "Die Pruefung, die vom ersten Tag an existieren muss, loest eine Bewegung ohne Autorisierung aus und weist nach, dass ein Vorfall erscheint. Ein Detektor, den nie jemand ausloesen sah, ist ein Ordner und keine Kontrolle.",
  },

  content: {

    custodyCases: [
      {
        id: "insider",
        tag: "FALL 01",
        h: "Die Beamtin, die hinsehen durfte",
        sub: "Nichts wird von aussen gestohlen. Das Schluesselmaterial liest jemand, der es lesen darf.",
        steps: [
          { n: "1", at: "SEHEN", h: "Ein Lesezugriff wird erfasst", b: "Der Tresor protokolliert, dass Schluesselmaterial zu einem offenen Fall geoeffnet wurde. Fuer sich genommen ist das unauffaellig und loest nichts aus. Es wird notiert, und genau darum geht es.", w: "Nichts hat das Haus verlassen. Keine Datei kopiert, keine Nachricht gesendet. Eine auswendig gelernte Phrase umgeht jede Kontrolle gegen Datenabfluss, also ist der Lesezugriff die einzige Spur." },
          { n: "2", at: "SEHEN", h: "Werte verlassen die Wallet", b: "Ein Chain-Anbieter meldet eine Bewegung von einer ueberwachten Adresse, Stunden oder Wochen spaeter. Er benennt den empfangenden Dienst und sonst nichts.", w: "Hier hoeren die meisten Programme auf und nennen es Erkennung. Es ist keine: es benennt einen Dienst, nie eine Person." },
          { n: "3", at: "EINIGEN", h: "Beide bekommen ein Vokabular", b: "Lesezugriff und Bewegung kommen aus verschiedenen Systemen in verschiedenen Formen. Sie werden normalisiert und demselben Fall zugeordnet.", w: "Ohne diesen Schritt sind es zwei Zeilen in zwei Datenbanken, die niemand je vergleicht." },
          { n: "4", at: "ENTSCHEIDEN", h: "Die Regel stellt eine Frage", b: "Gibt es eine Autorisierung, die diese Bewegung zu diesem Zeitpunkt deckt? Die Antwort ist eine leere Menge. Mikrosekunden, kein Modell, kein Score.", w: "Eine leere Menge ist keine Meinung. Es gibt nichts zu justieren und in der Pruefung nichts zu bestreiten." },
          { n: "5", at: "ENTSCHEIDEN", h: "Der zweite Schritt findet die Person", b: "Der Graph wird gefragt, wer das Schluesselmaterial zu diesem Fall ohne deckende Autorisierung gelesen hat. Ein Name kommt zurueck, mit Zeitstempeln.", w: "Das ist der Schritt, den ein relationales Schema schmerzhaft und ein Graph lesbar macht. Deshalb ist der Speicher ein Graph." },
          { n: "6", at: "ZEIGEN", h: "Eine Zeile in der Warteschlange", b: "Eine Analystin sieht die Bewegung, die leere Autorisierungsmenge, den Lesezugriff und die Person auf einem Bildschirm, am selben Tag.", w: "Minuten statt Monate. Und der Wert liegt meist noch dort, wo er angekommen ist." },
        ],
      },
      {
        id: "quiet",
        tag: "FALL 02",
        h: "Die Nacht, in der nichts geschah",
        sub: "Der schwierigere Fall, und der, der darueber entscheidet, ob jemand dem System traut.",
        steps: [
          { n: "1", at: "SEHEN", h: "Eine Bewegung erscheint", b: "In der Form identisch mit Fall eins. Eine ueberwachte Adresse sendet Werte, um zwei Uhr nachts, ohne sichtbare Autorisierung.", w: "Weckt das System hier jemanden, liegt es falsch, und zwar in den meisten Naechten." },
          { n: "2", at: "HALTEN", h: "Das Fenster haelt sie", b: "Die Bewegung geht in das Korrelationsfenster statt in die Warteschlange. Noch wird nichts gemeldet.", w: "Autorisierungen kommen aus langsamen menschlichen Prozessen. Eine Regel ohne Geduld macht aus jedem Beschluss einen Vorfall." },
          { n: "3", at: "BEWEGEN", h: "Die Autorisierung kommt spaeter", b: "Vier Minuten danach liefert das Fallsystem den Beschluss, der vor der Ueberweisung unterschrieben wurde. Capture nimmt ihn auf.", w: "Zuerst unterschrieben, spaeter erfasst. Diese Luecke ist normal, und ein Entwurf, der sie nicht vertraegt, ist unbrauchbar." },
          { n: "4", at: "ENTSCHEIDEN", h: "Die Regel trifft zu und schweigt", b: "Das Fenster schliesst mit einem Treffer. Das Paar wird als abgeglichen protokolliert, und niemand wird geweckt.", w: "Eine Kontrolle misst sich daran, was sie NICHT sendet. Eine Warteschlange ohne Vertrauen liest niemand." },
          { n: "5", at: "ZEIGEN", h: "Es erscheint als gruen", b: "Das Board zeigt eine Bewegung, ihre Autorisierung und die vier Minuten dazwischen. Sichtbar, durchsuchbar, unauffaellig.", w: "Die Luecke selbst ist eine Kennzahl. Waechst sie, driftet der Prozess, und das will man wissen, bevor er etwas verdeckt." },
        ],
      },
    ],
    custodyLayers: [
      {
        n: "01",
        k: "SEHEN",
        role: "Sensoren. Jeder davon eine Schnittstelle, fuer die die Organisation bereits zahlt.",
        deep:
          "Sensoren, und jeder davon eine Schnittstelle, fuer die Sie bereits zahlen. Nichts hier ist neue Ausgabe. Es geht nicht darum, mehr zu sammeln, sondern darum, dass zwei Systeme, die nie miteinander sprechen, an dieselbe Stelle liefern. Die Chain sagt, was bewegt wurde. Das Fallsystem sagt, was erlaubt war. Allein ist keines nuetzlich.",
        products: ["Chainalysis KYT", "TRM Labs", "Elliptic Lens", "CyberArk", "Delinea", "Microsoft Entra ID", "Okta", "CrowdStrike Falcon", "Splunk", "Elastic", "Maltego", "MISP"],
        oss: ["Bitcoin Core", "Erigon", "Blockscout", "GraphSense", "OpenCTI", "MISP", "Wazuh", "Zeek", "Suricata", "OpenSearch", "Keycloak"],
        ossw:
          "Einen eigenen Node zu betreiben ist die einzige Art, eine Chain zu beobachten, ohne einen Anbieter um Erlaubnis zu fragen. Kein Lizenzmodell kann diesen Sensor abschalten.",
        items: [
          "Chain-Ueberwachung, mehr als ein Anbieter",
          "Fall- und Aktenverwaltung, die die andere Haelfte des Joins haelt",
          "Ereignisse aus dem Tresor fuer privilegierte Zugriffe",
          "Identitaet und Anmeldung",
          "Endpunkt-Telemetrie",
          "Die vorhandene Log-Plattform, gelesen statt neu gebaut",
          "Gemeldete Reisen und Vermoegensangaben, soweit das Mandat es zulaesst",
        ],
      },
      {
        n: "02",
        k: "BEWEGEN",
        role: "Transport. Von jedem Punkt wiederholbar und schemagepruaeft.",
        deep:
          "Transport, und der Grund fuer eine eigene Schicht ist Wiederholbarkeit. Aendert sich eine Regel oder kommt ein Detektor hinzu, muessen die letzten neunzig Tage erneut durchlaufen koennen, ohne zwoelf Quellsysteme nach ihrer Historie zu fragen. Ein zurueckspulbares Log macht das moeglich.",
        products: ["Apache Kafka", "Redpanda", "Confluent Schema Registry", "Debezium", "Dead letter queue"],
        oss: ["Apache Kafka", "Apache Pulsar", "NATS JetStream", "Debezium", "Apicurio Registry"],
        ossw:
          "Das Log ist das Rueckgrat des Systems. Ein offenes bedeutet, dass eine Regelaenderung in zehn Jahren nicht davon abhaengt, ob eine Firma noch existiert.",
        items: [
          "Ein Topic je Quelle",
          "Eine Schema-Registry, damit kein Sensor still seine Form aendert",
          "Change Data Capture aus der Falldatenbank",
          "Eine Dead-Letter-Queue, denn nichts darf leise verloren gehen",
        ],
      },
      {
        n: "03",
        k: "EINIGEN",
        role: "Ein Vokabular. Entitaeten aufgeloest, damit eine Person nicht vier Datensaetze bleibt.",
        deep:
          "Ein Vokabular und Entitaetsaufloesung. Die Bewegung nennt es Adresse, das Fallsystem nennt es Vermoegenswert, der Tresor nennt es Geheimnis. Solange das nicht dasselbe Wort ist, ist kein Vergleich moeglich. Eine Person ueber viele Datensaetze aufzuloesen ist die unscheinbarste Arbeit im Bau und die, die am ehesten ueber Erfolg entscheidet.",
        products: ["Apache Flink", "STIX 2.1", "Senzing", "Zingg", "dbt"],
        oss: ["Apache Flink", "Apache Beam", "dbt Core", "Zingg", "OpenLineage", "STIX 2.1"],
        ossw:
          "In den Transformationen steckt Ihr Fachwissen. Sie in SQL und Python zu besitzen verhindert, dass das Vokabular Eigentum eines Anbieters wird.",
        items: [
          "Stromverarbeitung und das Korrelationsfenster selbst",
          "Ein gemeinsames Vokabular fuer Beobachtungen aus einem Dutzend Quellen",
          "Entitaetsaufloesung",
          "Versionierte, getestete Transformationen",
        ],
      },
      {
        n: "04",
        k: "HALTEN",
        role: "Die Speicher. Jeder fuer die eine Aufgabe gewaehlt, die er besser kann.",
        deep:
          "Fuenf Speicher, jeder fuer die eine Aufgabe gewaehlt, die er besser kann. Hier sitzt der Join, und diese Schicht fehlt den meisten. Die verbindliche Antwort auf die Frage nach der Erlaubnis muss ein Fuehrungssystem sein, nie ein Cache und nie eine Kopie, denn um diese Antwort wird im Vorfall gestritten.",
        products: ["Neo4j", "PostgreSQL", "ClickHouse", "MinIO with object lock", "Redis"],
        oss: ["PostgreSQL", "Apache AGE", "JanusGraph", "ClickHouse", "Apache Iceberg", "SeaweedFS", "Valkey"],
        ossw:
          "Beweisspeicher ueberlebt jeden Vertrag. Ein offenes Format heisst, das Archiv ist noch lesbar, wenn das schreibende Werkzeug laengst weg ist.",
        items: [
          "Ein Property-Graph fuer Traversierung ueber mehrere Schritte",
          "Ein relationales Fuehrungssystem fuer Autorisierungen, die verbindliche Antwort auf die Frage nach der Erlaubnis",
          "Ein spaltenorientierter Speicher fuer Ereignismengen",
          "Objektspeicher mit Schreibschutz, denn Unveraenderlichkeit von Beweismitteln ist rechtliche Pflicht und keine Vorliebe",
          "Ein heisses Fenster im Arbeitsspeicher",
        ],
      },
      {
        n: "05",
        k: "ENTSCHEIDEN",
        role: "Die Regel. Arithmetik, Mikrosekunden, kein Modell in ihrer Naehe.",
        deep:
          "Die Regel, und nur die Regel. Bewegt und nicht autorisiert, als schlichter Code, in Mikrosekunden. Richtlinien sind versionierte Daten statt Code, den niemand lesen kann, und der Ablauf ist dauerhaft, damit ein Vorfall nicht auf halbem Weg verloren geht. Kein Modell hat in dieser Schicht etwas zu suchen.",
        products: ["Open Policy Agent", "Temporal", "Cypher", "A rule service in plain code"],
        oss: ["Open Policy Agent", "Temporal", "Drools", "openCypher"],
        ossw:
          "Die Regel entscheidet, ob eine Person beschuldigt wird. Ein Gericht muss sie lesen koennen, also darf sie keine lizenzierte Blackbox sein.",
        items: [
          "Bewegt und nicht autorisiert, als schlichter Code",
          "Graph-Traversierung fuer den zweiten Schritt",
          "Richtlinien als versionierte Daten statt als Code, den niemand lesen kann",
          "Dauerhafte Ablaeufe, damit mitten im Vorfall nichts verloren geht",
        ],
      },
      {
        n: "06",
        k: "ERKLAEREN",
        role: "Das Modellgremium. Ausserhalb des Pfades, beratend, und so gekennzeichnet.",
        deep:
          "Das Gremium, ausserhalb des Pfades und beratend. Vier Modelle von vier Anbietern pruefen, was die deterministische Schicht entschieden hat. Zwei schreiben, zwei greifen das Geschriebene an, und der Pruefer ist nie der Autor. Unter drei Antworten gilt es als nicht beschlussfaehig. Das Ergebnis ist beratend und entscheidet nichts.",
        products: ["Four models, four vendors", "Qdrant", "A quorum rule and a median"],
        oss: ["vLLM", "Ollama", "Qdrant", "Milvus"],
        ossw:
          "Die Modelle selbst zu betreiben haelt Fallmaterial im eigenen Netz. Das ist meist eine rechtliche Pflicht und keine Vorliebe.",
        items: [
          "Vier Modelle von vier Anbietern, damit es keine gemeinsame Ausfallursache gibt",
          "Eine Mehrheitsregel und der Median, damit ein selbstsicheres Modell das Ergebnis nicht verzerrt",
          "Abruf frueherer Vorfaelle als Kontext",
        ],
      },
      {
        n: "07",
        k: "ZEIGEN",
        role: "Das Board, die Warteschlange, und ein Protokoll darueber, wer was angesehen hat.",
        deep:
          "Das Board, die Warteschlange und ein Protokoll darueber, wer hingesehen hat. Identitaetsbezogener Zugriff, sodass die Sichtbarkeit eines Falls durchgesetzt und nicht angenommen wird, und jeder Zugriff wird festgehalten. Auch die Beobachter werden beobachtet, denn ein Ueberwachungssystem, das niemand prueft, ist selbst ein Innentaeterrisiko.",
        products: ["FastAPI", "Keycloak", "React", "Cytoscape.js"],
        oss: ["FastAPI", "Keycloak", "React", "Cytoscape.js", "Grafana", "Apache Superset"],
        ossw:
          "Im Board arbeitet eine Ermittlerin den ganzen Tag. Das Frontend zu besitzen heisst, es an ihre Arbeit anzupassen statt an eine Roadmap.",
        items: [
          "Werte gegen Autorisierungen, ueberwiegend gruen",
          "Ein Klick auf eine gelbe Zeile zeigt den Teilgraphen",
          "Identitaetsbezogener Zugriff, sodass die Sichtbarkeit eines Falls durchgesetzt und nicht angenommen wird",
          "Ein Pruefpfad ueber jeden Zugriff, denn auch die Beobachter werden beobachtet",
        ],
      },
    ],

    custodyTiers: [
      { t: "1", n: "Rauschen", c: "Ein Signal.", a: "Protokolliert. Loest nichts aus." },
      {
        t: "2",
        n: "Alarm",
        c: "Zwei unabhaengige Sensoren auf demselben Objekt.",
        a: "Ein Mensch sieht heute hin.",
      },
      { t: "3", n: "Vorfall", c: "Eine dritte Quelle stimmt zu.", a: "Ein Vorgang wird eroeffnet." },
    ],


    custodyLimits: [
      {
        h: "Das erkennt. Es verhindert nicht.",
        b: "Verhinderung ist eine andere und einfachere Kontrolle: Vier-Augen-Prinzip auf Schluesselmaterial, damit niemand eine Wiederherstellungsphrase allein lesen kann. Dies hier meldet schnell, solange der Wert oft noch zurueckholbar ist.",
      },
      {
        h: "Es ist nur so gut wie der Autorisierungsnachweis.",
        b: "Eine Organisation, in der Autorisierungen nachtraeglich geschrieben werden koennen, hat das Problem verschoben statt geloest. Das ist eine Governance-Frage, und sie muss beantwortet sein, bevor der Join etwas bedeutet.",
      },
      {
        h: "Der zweite Schritt haengt an der Entitaetsaufloesung.",
        b: "Ist sie falsch, ist der Graph eine teure Art, Zeilen zu speichern. Es ist der unscheinbarste Teil des Baus und derjenige, der am ehesten ueber Erfolg entscheidet.",
      },
      {
        h: "Chain-Zuordnung hat echte Fehlerraten.",
        b: "Labels sind wahrscheinlichkeitsbasiert, und Anbieter widersprechen einander. Genau deshalb ist mehr als einer im Entwurf, und keiner darf allein einen Alarm ausloesen.",
      },
      {
        h: "Es gibt keinen Vergleich mit einem benannten Produkt.",
        b: "Das Argument ist architektonisch und in jedem Teil ueberpruefbar. Wir haben das nicht gegen einen Wettbewerber gemessen, also behaupten wir auch nicht, ihn zu schlagen.",
      },
      {
        h: "Nichts hier beschreibt die realen Systeme einer Organisation.",
        b: "Es ist eine Referenzarchitektur aus Komponenten, die es gibt. Was Sie bereits betreiben, aendert die Form, meist indem es die erste Fassung kleiner macht.",
      },
    ],
  },
};
