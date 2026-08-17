/* Custody observability. English is the reference locale.
 *
 * DELIBERATELY ANONYMOUS. This argument was written from a real case and every trace of it has been
 * removed: no person, no agency, no country, no dates, no amount. Two reasons, and the second is
 * the one that matters. A commercial page naming somebody who is charged and not convicted carries
 * defamation exposure. And the architecture does not need the story: the claim is structural, so it
 * either holds for every custodian or it holds for none.
 *
 * NO INVENTED NUMBERS. There is exactly one piece of arithmetic here and it is introduced with
 * "suppose", because it is an illustration of how independent error rates compose rather than a
 * measurement of anything. The two research findings are named with their source ON THE PAGE. The
 * i18n gate enforces the rest: no long dashes, no HTML entities, no sentence over thirty words.
 */

export const EN_CUSTODY = {
  keys: {
    "cus.pan.eyebrow":
      "Layer 06, in full",
    "cus.pan.h":
      "Four models, four vendors, and a vote they are not allowed to win.",
    "cus.pan.lede":
      "This is the layer people ask about first, so here is exactly how it works. The deterministic rule has already decided whether an incident exists before any model is called. The panel writes the explanation, argues with itself in public, and holds no switch.",
    "cus.pan.r1h":
      "Two soldiers, two auditors",
    "cus.pan.r1b":
      "Two models are asked to summarise what happened. Two different models are asked to attack that summary and name what the checks do not cover. The roles are fixed, so nobody marks their own homework.",
    "cus.pan.r2h":
      "The auditor is never the author",
    "cus.pan.r2b":
      "A model reviewing its own output agrees with itself. The reviewer is always a different model from the one that wrote the text, and where possible a different vendor. A blind spot is usually shared across a family rather than an instance.",
    "cus.pan.r3h":
      "Four vendors means no shared failure domain",
    "cus.pan.r3b":
      "One provider rate limiting, having an outage, or changing a policy overnight cannot silence the panel. Four models from one supplier is four hats on one head, and it fails all at once.",
    "cus.pan.r4h":
      "A quorum of three, and the median",
    "cus.pan.r4b":
      "Below three answers the panel is recorded as below quorum and its opinion carries no weight at all. Where the panel proposes a number, the applied value is the median of what they agreed, so one confident model cannot drag the result.",
    "cus.pan.r5h":
      "Unanimous dissent stops the line",
    "cus.pan.r5b":
      "If every reviewer disagrees with a green deterministic result, that is treated as evidence the CHECK is wrong rather than the system. It halts and reaches a human. In our own release pipeline that pattern has twice meant a check was lying.",
    "cus.pan.r6h":
      "Code decides. Models explain.",
    "cus.pan.r6b":
      "A model call takes anywhere from a fraction of a second to a minute and can be rate limited at the worst moment. The rule that decides is arithmetic in microseconds. Putting a model in that path adds latency and opinions to a comparison that needs neither.",
    "cus.pan.note":
      "We run our own release pipeline exactly this way, so none of the above is theoretical. Four models review every deploy, the deterministic checks decide, and the panel has caught defects our own checks scored as passes. It has also been confidently wrong, which is why it never holds the switch.",
    "cus.d.schema":
      "Contracts for every feed, so a sensor cannot silently change shape and break the join.",
    "cus.d.panel":
      "Four models from four vendors review the decision and write the narrative. Advisory, never a gate.",
    "cus.d.recall":
      "Earlier incidents retrieved for context, so a reviewer sees what happened last time.",
    "cus.oss.eyebrow":
      "The same architecture, entirely on open source",
    "cus.oss.h":
      "Every layer can be built from software you can read, run and keep.",
    "cus.oss.lede":
      "Not a cheaper alternative. A different set of guarantees, and for an organisation holding other people's assets under a legal mandate, usually the more defensible one. Licences checked: nothing on this page is source available, because a licence that can be changed under you is not open source.",
    "cus.oss.stack":
      "Open source stack",
    "cus.oss.why":
      "Why it matters in this layer",
    "cus.oss.v1h":
      "The rule has to survive a courtroom",
    "cus.oss.v1b":
      "A detection accuses a person. Defence counsel will ask how the system decided, and an answer that ends in a commercial confidentiality clause is not an answer. Software you can read is software a court can examine.",
    "cus.oss.v2h":
      "No licence can switch off your evidence",
    "cus.oss.v2b":
      "Redis relicensed and the community produced Valkey. Elasticsearch relicensed and the community produced OpenSearch. Terraform relicensed and the community produced OpenTofu. Every one of those forks exists because somebody depended on a promise that was withdrawn.",
    "cus.oss.v3h":
      "The data stays where the law says it must",
    "cus.oss.v3b":
      "Case material under a European mandate frequently cannot leave the jurisdiction, and often cannot leave the building. Software you host yourself makes that a configuration question rather than a contract negotiation.",
    "cus.oss.v4h":
      "An archive outlives the tool that wrote it",
    "cus.oss.v4b":
      "Evidence is kept for years and sometimes for decades. An open format means the archive is still readable long after the product that created it has been discontinued, acquired or repriced.",
    "cus.oss.v5h":
      "Open source is not free, and pretending otherwise is how it fails",
    "cus.oss.v5b":
      "Somebody has to run it, patch it and answer for it at three in the morning. And the supply chain is a real attack surface. Dependencies get pinned and checksums get verified before anything executes. A scanner that never fails a build is a log file with a licence.",
    "cus.oss.mixh":
      "Mixed is usually the right answer",
    "cus.oss.mixb":
      "Nobody should replace a working chain analytics contract on principle. The useful question is which layers must be yours. The answer is almost always the store, the rule and the audit trail, because those three decide what an incident means and who has to defend it.",
    "cus.deep.eyebrow":
      "Deep dive, layer by layer",
    "cus.deep.h":
      "What each layer is for, and what you would actually build it with.",
    "cus.deep.lede":
      "Named products, because a diagram of unlabelled boxes commits to nothing. Substitute freely: the shape is the argument, not the vendor list. Most estates already run three or four of these.",
    "cus.deep.map":
      "Product mapping",
    "cus.deep.inside":
      "What sits in this layer",
    "cus.d.chain":
      "Watches the wallets you already monitor. Reports a movement, names a service, never a person.",
    "cus.d.case":
      "Holds the seizure orders and authorisations. This is the other half of the join.",
    "cus.d.vault":
      "Records who opened key material, and when. Often the only trace a memorised phrase leaves.",
    "cus.d.idp":
      "Who signed in, from where, on which device. Ties an action to an account.",
    "cus.d.bus":
      "One topic per source, replayable from any point. Nothing is lost if a consumer dies.",
    "cus.d.cdc":
      "Streams changes out of the case database the moment they are written.",
    "cus.d.stream":
      "Windows and correlates. This is where a late authorisation is given time to arrive.",
    "cus.d.vocab":
      "One vocabulary for a dozen sources, so two systems can finally be compared.",
    "cus.d.entity":
      "Resolves one person across many records. Get this wrong and the graph is useless.",
    "cus.d.hot":
      "The last few minutes in memory. Fast enough to answer before anything is written down.",
    "cus.d.sql":
      "The authoritative answer to whether an action was permitted. Never a cache, never a copy.",
    "cus.d.graph":
      "Relationships as first class objects. This is what makes the second hop readable.",
    "cus.d.rule":
      "Moved and not authorised. Arithmetic, microseconds, no model anywhere near it.",
    "cus.d.hop":
      "Who else touched this case without permission. The query that finds a person.",
    "cus.d.queue":
      "One row, with the movement, the empty authorisation set and the evidence attached.",
    "cus.jump4":
      "Two investigations",
    "cus.cases.eyebrow":
      "Two investigations, end to end",
    "cus.cases.h":
      "What the system does on the night it matters, and on the night it does not.",
    "cus.cases.lede":
      "The same movement arrives in both. In one there is no authorisation and a person is found within minutes. In the other the authorisation is simply late, and nobody is woken. A control is judged by both.",
    "cus.n.chain": "CHAIN",
    "cus.n.case": "CASE",
    "cus.n.vault": "VAULT",
    "cus.n.idp": "IDENTITY",
    "cus.n.edr": "ENDPOINT",
    "cus.n.siem": "LOGS",
    "cus.n.bus": "BUS",
    "cus.n.schema": "SCHEMA",
    "cus.n.cdc": "CAPTURE",
    "cus.n.dlq": "DEAD LETTER",
    "cus.n.stream": "STREAM",
    "cus.n.vocab": "VOCABULARY",
    "cus.n.entity": "ENTITIES",
    "cus.n.graph": "GRAPH",
    "cus.n.sql": "AUTHORISATIONS",
    "cus.n.ts": "EVENTS",
    "cus.n.obj": "EVIDENCE",
    "cus.n.hot": "HOT WINDOW",
    "cus.n.rule": "THE RULE",
    "cus.n.hop": "SECOND HOP",
    "cus.n.policy": "POLICY",
    "cus.n.flow": "WORKFLOW",
    "cus.n.panel": "FOUR MODELS",
    "cus.n.recall": "PRIOR CASES",
    "cus.n.board": "BOARD",
    "cus.n.queue": "QUEUE",
    "cus.n.audit": "WHO LOOKED",
    "cus.dia2.hot": "THE DETECTION PATH",
    "cus.dia1.cap":
      "Movements arrive on the left, authorisations on the right. Four pair up. The fifth has no partner, and that absence is the alarm.",
    "cus.dia1.alt":
      "An animated diagram: asset movements pairing with authorisations, and one movement with no matching authorisation raising an incident.",
    "cus.dia1.left":
      "MOVEMENTS",
    "cus.dia1.right":
      "AUTHORISATIONS",
    "cus.dia1.none":
      "NO MATCH",
    "cus.dia1.verdict":
      "INCIDENT",
    "cus.dia2.cap":
      "Events rise through the seven layers. The bright seam is the join, and the traversal across the store is the second hop, the one that finds a person rather than a transaction.",
    "cus.dia2.alt":
      "An animated diagram of the seven layer stack, with the join highlighted between the third and fourth layers and a graph traversal across the store.",
    "cus.dia2.join":
      "THE JOIN",
    "cus.dia2.hop":
      "SECOND HOP",
    "cap.cus.lede":
      "A reference architecture for detecting the theft of an asset by the person guarding it, built from systems most custodians already own. Written for seizure units, custodians, exchanges and escrow.",
    "cap.cus.go":
      "Read the architecture",
    "cus.jump1": "The stack",
    "cus.jump2": "Triangulation",
    "nav.custody": "Custody",
    "tab.custody": "Custody",
    "cus.eyebrow": "Custody observability",
    "cus.h": "The person guarding the asset can move the asset. Almost nothing you own is looking for that.",
    "cus.lede":
      "Seizure units, custodians, exchanges, escrow agents and insolvency practitioners all hold value on somebody else's behalf. The controls around that value are usually built to stop an outsider getting in. The harder problem is the person who is already inside and already trusted.",
    "cus.cta": "Talk to us about custody",

    "cus.idea.eyebrow": "The governing idea",
    "cus.idea.h": "Every movement of an asset under custody must have a matching authorisation. No match is an incident.",
    "cus.idea.lede":
      "That single rule is the whole system. Everything else on this page is plumbing, corroboration or presentation. The detection signal is not on the blockchain and not in the employee's behaviour. It is the absence of an authorisation matching a movement that already happened, and that is a database join rather than an inference.",

    "cus.prec.eyebrow": "The precedent is not new",
    "cus.prec.h": "An evidence locker has enforced this rule for a century.",
    "cus.prec.b1":
      "Nothing leaves without a signed chit, and the missing chit is the alarm. Nobody has to identify the officer first, or model their behaviour, or decide whether they seemed nervous. The record either exists or it does not.",
    "cus.prec.b2":
      "Cryptocurrency held under an investigation is evidence in a locker. It happens to be a locker that anyone holding the combination can open from home, at three in the morning, without the door making a sound. The control did not become unnecessary. The door just stopped squeaking.",
    "cus.prec.b3":
      "Accounting solved a version of this in the fifteenth century. Luca Pacioli described double entry in Venice in 1494, and Venetian merchants were already using it. Every movement carries a matching counter entry, so an unmatched entry is an error by definition rather than by judgement. Custody observability applies that idea to evidence.",

    "cus.chain.eyebrow": "The part everyone gets wrong first",
    "cus.chain.h": "Chain analytics is a corroboration layer. It was never going to be the detector.",
    "cus.chain.lede":
      "This is the first answer most people reach for, and a compliance professional will object to it within one sentence. They are right to.",
    "cus.chain.b1":
      "Analytics tools attribute at the service level. They cluster addresses and label the cluster: this one belongs to an exchange, that one to a mixer, this one to a sanctioned entity. That is genuinely hard and they are good at it.",
    "cus.chain.b2":
      "What they cannot do is tell you the beneficial owner of a deposit address. The exchange knows, because the exchange performed the identity checks. The analytics vendor does not. Turning a deposit address into a name needs the exchange's own records and legal process, which is a subpoena rather than an inference.",
    "cus.chain.b3":
      "So the honest sequence is short. Analytics shows value leaving a monitored wallet and arriving at a service. That is all it shows. It names a service, never a person. Useful, necessary, and not the thing that raises the alarm.",

    "cus.orch.eyebrow": "One ring does not rule them all",
    "cus.orch.h": "There is no single tool. There is an orchestration layer, and that is the product.",
    "cus.orch.lede":
      "Every organisation in this position already owns most of the sensors. The case system, the privileged access vault, the identity provider, the endpoint agent, the existing log platform, one or more chain vendors. The data is there. What is missing is the layer that makes two of them contradict each other in public.",
    "cus.orch.b1":
      "That layer is an integration problem before it is an analytics problem. Everything arrives over an interface and is normalised into one vocabulary. It lands in a graph where a relationship between two records is a first class thing rather than a join nobody wrote.",
    "cus.orch.b2":
      "It also has to cross organisational and national boundaries, because the movement is observed by one party and the authorisation lives with another. A joint system across agencies, with correlation of the dots, is the actual requirement. A single vendor console is not.",

    "cus.layers.eyebrow": "The stack, named",
    "cus.layers.h": "Seven layers, and the missing one is always the same.",
    "cus.layers.lede":
      "Named components below, because an architecture diagram with unlabelled boxes commits to nothing. Substitute freely: the shape is the argument, not the vendor list. The join lives between layer three and layer four, and that is the layer most organisations are missing. It is why they have all the data and none of the answer.",

    "cus.tri.eyebrow": "Triangulation",
    "cus.tri.h": "This is not more alerts. It is the opposite of more alerts.",
    "cus.tri.lede":
      "Every sensor fires constantly on its own. A monitoring programme dies the week its queue stops being readable, and it stops being readable long before anybody admits it. So a single signal is logged and raises nothing at all.",
    "cus.tri.math.h": "The arithmetic, honestly",
    "cus.tri.math.b":
      "Suppose a sensor is wrong once in a thousand events and sees a hundred thousand events a day. Alone it produces about a hundred false alarms a day and is muted within a week. Two genuinely independent sensors converging on the same object multiply out to one in a million, and the same volume yields roughly one false convergence every ten days. That queue is readable.",
    "cus.tri.math.warn":
      "The word doing all the work is independent. Two feeds derived from the same underlying log are one sensor wearing two hats, and multiplying their error rates is arithmetic fraud. A chain movement observed by an external party and an authorisation recorded by an internal one share no common cause, which is exactly what makes their disagreement mean something.",
    "cus.tri.contra.h": "A contradiction beats an anomaly",
    "cus.tri.contra.b":
      "An anomaly says this is unusual. Unusual things happen constantly and mean nothing. A contradiction says these two records cannot both be correct. The asset moved and no authorisation exists. One of those statements is false, or somebody did something they were not permitted to do. There is no third option.",

    "cus.graph.eyebrow": "Why a graph, specifically",
    "cus.graph.h": "The graph earns its place on the second hop, not the first.",
    "cus.graph.b1":
      "If the only question were whether this asset moved without authorisation, a relational table would do and a graph database would be architecture theatre. That first question is one query with one anti join.",
    "cus.graph.b2":
      "The second question is the one that finds a person. Did anyone who read the key material for this case also do anything else worth a look? An undeclared trip, an account at the receiving service, a second case touched in the same hour.",
    "cus.graph.b3":
      "In a relational schema that is four joins with two anti joins, and it gets worse with every hop. As a graph traversal it reads roughly like the sentence an investigator would say out loud. That readability is not cosmetic. A rule an investigator can read is a rule an investigator can challenge.",

    "cus.models.eyebrow": "Where the models sit",
    "cus.models.h": "Never in the decision path.",
    "cus.models.b1":
      "A model call takes anywhere from a fraction of a second to a minute, and it can be rate limited at exactly the wrong moment. The rule that decides whether an incident exists is arithmetic and runs in microseconds. Putting a model there adds latency and opinions to a comparison that needs neither.",
    "cus.models.b2":
      "Out of band, they are worth a great deal. Four models from four different suppliers review what the deterministic layer decided and disagree with each other in writing. They also write the narrative a human has to read at two in the morning. Four suppliers means no shared failure domain, so one bad day at one provider cannot silence the panel.",
    "cus.models.b3":
      "Their output is advisory and it is labelled as advisory. Code decides, models explain. We run our own release pipeline this way, so the argument is not theoretical here.",



    "cus.limits.eyebrow": "Honest limits",
    "cus.limits.h": "What this does not do.",
    "cus.limits.lede":
      "Stated here rather than discovered later. A supplier who will not tell you the boundary of their own design is telling you something else instead.",

    "cus.start.eyebrow": "How this starts",
    "cus.start.h": "The first useful version is small, and it is not a platform.",
    "cus.start.b1":
      "Two sources and one rule. Asset movements from wherever you already watch them, authorisations from the case or matter system, and the join between them. That alone answers the question that matters, and it can be running while the rest is still being argued about.",
    "cus.start.b2":
      "Everything after that is widening the corroboration, not changing the idea. A second chain vendor, the vault read events, entity resolution so one person stops being four records, then the graph for the second hop.",
    "cus.start.b3":
      "The check that has to exist from day one is a test that fires a movement with no authorisation and proves an incident appears. A detector nobody has ever seen trigger is a folder, not a control.",
  },

  content: {

    custodyCases: [
      {
        id: "insider",
        tag: "CASE 01",
        h: "The officer who was allowed to look",
        sub: "Nothing is stolen from outside. The key material is read by somebody entitled to read it.",
        steps: [
          { n: "1", at: "SEE", h: "A read is recorded", b: "The vault logs that key material for an open case was opened. This is not suspicious on its own and no alert fires. It is written down, which is the whole point.", w: "Nothing left the building. No file was copied, no message sent. A memorised phrase defeats every data loss control ever built, so the read event is the only trace that exists." },
          { n: "2", at: "SEE", h: "Value leaves the wallet", b: "A chain vendor reports a movement out of a monitored address, hours or weeks later. It names the receiving service and nothing else.", w: "This is where most programmes stop and call it detection. It is not: it names a service, never a person." },
          { n: "3", at: "AGREE", h: "The two become one vocabulary", b: "The read and the movement arrive from different systems in different shapes. They are normalised, and both are attached to the same case.", w: "Without this step they are two rows in two databases that nobody will ever compare." },
          { n: "4", at: "DECIDE", h: "The rule asks one question", b: "Is there an authorisation covering this movement, valid at this time? The answer is an empty set. Microseconds, no model, no score.", w: "An empty set is not an opinion. There is nothing to tune and nothing to argue with in a review." },
          { n: "5", at: "DECIDE", h: "The second hop finds a person", b: "The graph is asked who read the key material for this case without an authorisation covering them. One name comes back, with the timestamps.", w: "This is the hop a relational schema makes painful and a graph makes readable, which is why the store is a graph." },
          { n: "6", at: "SHOW", h: "One row in the queue", b: "An analyst sees the movement, the empty authorisation set, the read event and the person, on one screen, the same day.", w: "Minutes, not months. And the value is usually still sitting where it landed." },
        ],
      },
      {
        id: "quiet",
        tag: "CASE 02",
        h: "The night nothing happened",
        sub: "The harder case, and the one that decides whether anybody trusts the system.",
        steps: [
          { n: "1", at: "SEE", h: "A movement appears", b: "Identical in shape to case one. A monitored address sends value out, at two in the morning, with no authorisation visible.", w: "If the system pages somebody here it is wrong, and it will be wrong most nights." },
          { n: "2", at: "HOLD", h: "The window holds it", b: "The movement goes into the correlation window instead of into the queue. Nothing is raised yet.", w: "Authorisations arrive through slow human systems. A rule with no patience turns every court order into an incident." },
          { n: "3", at: "MOVE", h: "The authorisation arrives late", b: "Four minutes later the case system emits the seizure order that was signed before the transfer. Capture picks it up and it lands.", w: "Signed first, recorded later. That gap is normal and a design that cannot tolerate it is unusable." },
          { n: "4", at: "DECIDE", h: "The rule matches, and stays quiet", b: "The window closes with a match. The pair is logged as reconciled and nobody is woken.", w: "A control is judged by what it does NOT send. A queue nobody trusts is a queue nobody reads." },
          { n: "5", at: "SHOW", h: "It shows up as green", b: "The board records a movement, its authorisation, and the four minute gap between them. Visible, searchable, unremarkable.", w: "The gap itself is a metric. If it starts growing, the process is drifting, and that is worth knowing before it hides something." },
        ],
      },
    ],
    /* Seven layers. `n` is the layer number, `k` the one word name, `role` what it is for,
       `items` the named components. The page renders whatever is here, in this order. */
    custodyLayers: [
      {
        n: "01",
        k: "SEE",
        role: "Sensors. Every one of them an interface the organisation already pays for.",
        deep:
          "Sensors, and every one of them is an interface you already pay for. Nothing here is new spend. The point of this layer is not to collect more, it is to make two systems that never speak to each other emit into the same place. Chain telemetry answers what moved. The case system answers what was permitted. Neither is useful alone.",
        products: ["Chainalysis KYT", "TRM Labs", "Elliptic Lens", "CyberArk", "Delinea", "Microsoft Entra ID", "Okta", "CrowdStrike Falcon", "Splunk", "Elastic", "Maltego", "MISP"],
        oss: ["Bitcoin Core", "Erigon", "Blockscout", "GraphSense", "OpenCTI", "MISP", "Wazuh", "Zeek", "Suricata", "OpenSearch", "Keycloak"],
        ossw:
          "Running your own node is the only way to observe a chain without asking a vendor for permission, and it is the one sensor no licence can switch off.",
        items: [
          "Chain monitoring, more than one vendor",
          "Case and matter management, which holds the other half of the join",
          "Privileged access vault events",
          "Identity and authentication",
          "Endpoint telemetry",
          "The existing log platform, read from rather than rebuilt",
          "Declared travel and financial disclosure, where the mandate allows",
        ],
      },
      {
        n: "02",
        k: "MOVE",
        role: "Transport. Replayable from any point, and schema enforced.",
        deep:
          "Transport, and the reason it is a layer rather than a wire is replay. When a rule changes, or a detector is added, you must be able to run the last ninety days through it again without asking twelve source systems for their history. A log you can rewind is what makes that possible.",
        products: ["Apache Kafka", "Redpanda", "Confluent Schema Registry", "Debezium", "Dead letter queue"],
        oss: ["Apache Kafka", "Apache Pulsar", "NATS JetStream", "Debezium", "Apicurio Registry"],
        ossw:
          "The log is the spine of the whole system. An open one means a rule change ten years from now does not depend on a company still existing.",
        items: [
          "One topic per source",
          "A schema registry, so a sensor cannot silently change shape",
          "Change data capture from the case database",
          "A dead letter queue, because nothing may be dropped quietly",
        ],
      },
      {
        n: "03",
        k: "AGREE",
        role: "One vocabulary. Entities resolved, so one person stops being four records.",
        deep:
          "One vocabulary, and entity resolution. A movement calls it an address, the case system calls it an asset, the vault calls it a secret. Until those are the same word, no comparison is possible. Resolving one person across many records is the least glamorous work in the build and the most likely to decide whether it works.",
        products: ["Apache Flink", "STIX 2.1", "Senzing", "Zingg", "dbt"],
        oss: ["Apache Flink", "Apache Beam", "dbt Core", "Zingg", "OpenLineage", "STIX 2.1"],
        ossw:
          "Transforms are where your domain knowledge lives. Owning them in plain SQL and Python is what stops the vocabulary becoming a vendor's property.",
        items: [
          "Stream processing and the correlation window itself",
          "A shared observable vocabulary across a dozen sources",
          "Entity resolution",
          "Versioned, tested transforms",
        ],
      },
      {
        n: "04",
        k: "HOLD",
        role: "The stores. Each chosen for one job it does better than the others.",
        deep:
          "Five stores, each chosen for one job it does better than the others. This is where the join lives, and it is the layer most estates are missing. The authoritative answer to whether something was permitted must be a system of record. Never a cache and never a copy, because that answer is what an incident will be argued over.",
        products: ["Neo4j", "PostgreSQL", "ClickHouse", "MinIO with object lock", "Redis"],
        oss: ["PostgreSQL", "Apache AGE", "JanusGraph", "ClickHouse", "Apache Iceberg", "SeaweedFS", "Valkey"],
        ossw:
          "Evidence storage outlives every contract. An open format means the archive is still readable when the tool that wrote it is gone.",
        items: [
          "A property graph for multi hop traversal",
          "A relational system of record for authorisations, the authoritative answer to whether something was permitted",
          "A columnar store for event volume",
          "Object storage with write once retention, because immutability of evidence is a legal requirement rather than a preference",
          "An in memory hot window",
        ],
      },
      {
        n: "05",
        k: "DECIDE",
        role: "The rule. Arithmetic, microseconds, no model anywhere near it.",
        deep:
          "The rule, and only the rule. Moved and not authorised, expressed in plain code, running in microseconds. Policy is versioned data rather than code nobody can read, and the workflow is durable so an incident cannot be lost half way through. No model has any part in this layer.",
        products: ["Open Policy Agent", "Temporal", "Cypher", "A rule service in plain code"],
        oss: ["Open Policy Agent", "Temporal", "Drools", "openCypher"],
        ossw:
          "The rule decides whether a person is accused. It must be readable by a court, which means it cannot be a black box you licensed.",
        items: [
          "Moved and not authorised, in plain code",
          "Graph traversal for the second hop",
          "Policy expressed as versioned data rather than as code nobody can read",
          "Durable workflow, so nothing is lost part way through an incident",
        ],
      },
      {
        n: "06",
        k: "EXPLAIN",
        role: "The model panel. Out of band, advisory, and labelled as advisory.",
        deep:
          "The panel, out of band and advisory. Four models from four different suppliers review what the deterministic layer decided. Two write, two attack what was written, and the reviewer is never the author. Below three answers the panel is recorded as below quorum and carries no weight. Their output is labelled advisory and gates nothing.",
        products: ["Four models, four vendors", "Qdrant", "A quorum rule and a median"],
        oss: ["vLLM", "Ollama", "Qdrant", "Milvus"],
        ossw:
          "Running the models yourself keeps case material inside your own network, which is usually a legal requirement rather than a preference.",
        items: [
          "Four models from four suppliers, so there is no shared failure domain",
          "A quorum rule and a median, so one confident model cannot drag the result",
          "Retrieval over prior incidents for context",
        ],
      },
      {
        n: "07",
        k: "SHOW",
        role: "The board, the queue, and a log of who looked at what.",
        deep:
          "The board, the queue, and a record of who looked. Identity aware access, so which case a person may see is enforced rather than assumed, and every view is written down. The watchers get watched, because a monitoring system nobody audits is a new insider risk rather than a control for one.",
        products: ["FastAPI", "Keycloak", "React", "Cytoscape.js"],
        oss: ["FastAPI", "Keycloak", "React", "Cytoscape.js", "Grafana", "Apache Superset"],
        ossw:
          "The board is what an investigator lives in all day. Owning the front end means it can be shaped around their work rather than a roadmap.",
        items: [
          "Assets against authorisations, mostly green",
          "Click an amber row and get the subgraph",
          "Identity aware access, so who may see which case is enforced rather than assumed",
          "An audit trail of every view, because the watchers get watched too",
        ],
      },
    ],

    /* Triangulation levels. Deliberately three rows: the whole point is that one signal does
       nothing at all. */
    custodyTiers: [
      { t: "1", n: "Noise", c: "One signal.", a: "Logged. Alerts on nothing." },
      {
        t: "2",
        n: "Alarm",
        c: "Two independent sensors on the same object.",
        a: "A human looks at it today.",
      },
      { t: "3", n: "Incident", c: "A third source agrees.", a: "A file is opened." },
    ],

    /* The refusals. `w` is what, `y` is why. Each one is a real legal or empirical reason, not a
       preference, and the citation is on the page rather than in a footnote nobody opens. */

    custodyLimits: [
      {
        h: "This detects. It does not prevent.",
        b: "Prevention is a different control, and a simpler one: dual authorisation on key material, so no single officer can read a recovery phrase alone. This tells you quickly, while the value is often still recoverable.",
      },
      {
        h: "It is only as good as the authorisation record.",
        b: "An organisation where authorisations can be written after the fact has moved the problem rather than solved it. That is a governance question, and it has to be answered before the join means anything.",
      },
      {
        h: "The second hop depends on entity resolution.",
        b: "Get that wrong and the graph is an expensive way to store rows. It is the least glamorous part of the build and the one most likely to decide whether it works.",
      },
      {
        h: "Chain attribution carries real error rates.",
        b: "Labels are probabilistic and vendors disagree with each other. That is precisely why more than one is in the design, and why none of them is allowed to be the thing that raises an alarm by itself.",
      },
      {
        h: "No comparison is made against any named product.",
        b: "The argument here is architectural and every part of it is checkable. We have not benchmarked this against a competitor, so we do not claim to beat one.",
      },
      {
        h: "Nothing here describes any organisation's live systems.",
        b: "It is a reference architecture expressed in components that exist. What you already run will change the shape of it, usually by making the first version smaller.",
      },
    ],
  },
};
