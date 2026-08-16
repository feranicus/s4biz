/* The three service pages: AI, Cloud, Cyber. English is the reference locale.
 *
 * KEPT SEPARATE FROM en.js because it is the bulk of the site's words and it changes on a
 * different rhythm from the chrome. It is still ONE dictionary at runtime: en.js spreads it in, so
 * there is no second key space and no second fallback path to reason about.
 *
 * The same standing rules apply and are enforced by tools/i18n_gate.mjs in every language: no long
 * dashes, no prices, no HTML entities, no sentence over 30 words, and every number is either our
 * own measurement or an external benchmark with its source named ON THE PAGE.
 */

export const EN_SERVICES = {
  keys: {
    /* ---------------- AI ---------------- */
    /* ---------------- the three doors, on the front page ---------------- */
    "svc.eyebrow": "Three practices, one team",
    "svc.h": "Where the work actually lands.",
    "svc.lede":
      "Everything below is delivered by the same people, which is why the boundaries between them are not a problem. A cloud migration with a security requirement and an AI component is one conversation here, not three suppliers blaming each other.",
    "svc.open": "Read the detail",

    "ai.eyebrow": "Artificial intelligence",
    "ai.h": "Most AI programmes do not fail on the model. They fail on everything around it.",
    "ai.lede":
      "The model is the easy part and it is getting easier every quarter. What decides whether a programme reaches production is the evidence you feed it, the way you measure it, and who checks it. That, and what happens on the day it is confidently wrong. That is the part we build.",
    "ai.jump1": "What is possible",
    "ai.jump2": "How to do it better",
    "ai.jump3": "The lifecycle",
    "ai.jump4": "Ten use cases",

    "ai.cap.h": "What is actually possible today.",
    "ai.cap.lede":
      "Six classes of work that are production ready now, in the sense that a regulated enterprise can run them, evidence them and defend them. Anything not on this list we will tell you is research.",

    "ai.rules.h": "Six rules that decide whether it reaches production.",
    "ai.rules.lede":
      "None of these are about the model. Every one of them is where we have seen programmes stall, and every one is enforced in code on work we have shipped.",

    "ai.life.h": "From inception to production, and then the part nobody budgets for.",
    "ai.life.lede":
      "Eight stages. We can take all of them or join at any one. Each carries the trap that stage is known for, because the traps are more useful than the happy path.",
    "ai.life.trap": "The trap",
    "ai.life.we": "What we do",

    "ai.use.h": "Ten use cases the market is actually buying.",
    "ai.use.lede":
      "Ranked by how often we are asked for them, not by how interesting they are. Each one states what good looks like as something you can measure, and the failure mode that makes it worthless.",
    "ai.use.good": "What good looks like",
    "ai.use.bad": "How it goes wrong",

    "ai.bench.h": "The honest market picture",
    "ai.bench.p":
      "These are published third party figures about the market, not results we have produced for a customer. We put them here because they describe the problem we are hired to solve.",
    "ai.bench.src": "Sources: Gartner press releases 25 Jun 2025, 11 Mar 2026 and 19 May 2026. McKinsey, The State of AI 2025.",

    /* ---------------- Cloud ---------------- */
    "cl.eyebrow": "Cloud transformation",
    "cl.h": "Every application gets one of seven answers. Most programmes only ever use two.",
    "cl.lede":
      "Lift and shift everything and you carry the old problems into a more expensive place. Rebuild everything and you never finish. The work is deciding, application by application, which of the seven strategies applies, and being able to defend each choice.",
    "cl.jump1": "The seven strategies",
    "cl.jump2": "How a migration runs",
    "cl.jump3": "What we do differently",

    "cl.rs.h": "The seven Rs.",
    "cl.rs.lede":
      "Gartner published five migration strategies in 2010. Amazon Web Services extended them to six in 2016, and to seven with the addition of Retain. The set below is the one in current use, and the choice is made per application, never per estate.",
    "cl.rs.when": "When it is right",
    "cl.rs.trap": "The trap",

    "cl.ph.h": "How a migration actually runs.",
    "cl.ph.lede":
      "Six phases. The order matters more than the tooling, and the phase everyone shortens is the one that decides whether the savings arrive.",

    "cl.diff.h": "What we do differently.",
    "cl.diff.lede":
      "Four choices that are unusual, each of which comes from a programme where the opposite choice cost somebody a lot of money.",

    /* ---------------- Cyber ---------------- */
    "cy.eyebrow": "Cyber security",
    "cy.h": "We are not another scanner. We answer what the internet already knows about you.",
    "cy.lede":
      "Most security tooling answers what is wrong inside your network, and needs credentials, agents and a signed authorisation to do it. We start on the outside, from public sources only, with nothing installed and nothing touched. Then we price what we find in euros.",
    "cy.jump1": "What we do best",
    "cy.jump2": "What we do differently",
    "cy.jump3": "The regimes",

    "cy.best.h": "Six things we do better than a generalist.",
    "cy.best.lede":
      "This is a deliberately short list. Naming a capability we are merely competent at is how a technical audience stops believing the rest of the page.",
    "cy.best.col": "What we do best",
    "cy.diff.col": "What we do differently",

    "cy.reg.h": "The regimes we grade against.",
    "cy.reg.lede":
      "Compliance is graded as part of the assessment rather than sold as a separate engagement, and the framework set follows the jurisdiction of the entity being assessed. Citing the wrong regulator tells a reader the document was not written for them.",
    "cy.reg.note":
      "This is engineering and architecture work, not legal advice. Deadlines and penalties are quoted from the primary legal texts and should be re-checked, because national transposition moves.",
  },

  content: {
    /* The route for each of these lives in the PAGE COMPONENT, keyed by id, never here. A path is
       not copy, and a translator editing this file must not be able to break navigation. */
    services: [
      {
        id: "ai",
        h: "Artificial intelligence",
        b: "From framing the decision to running it in production, with an evaluation set that proves it works and an adversarial review that catches it when it does not.",
        tags: "Agentic pipelines · Retrieval · Evaluation · Model operations",
      },
      {
        id: "cloud",
        h: "Cloud transformation",
        b: "Datacentre exits and platform moves decided application by application against the seven strategies, with the network, the identity and the cost model designed together.",
        tags: "Migration · Landing zones · Networking · Decommissioning",
      },
      {
        id: "cyber",
        h: "Cyber security",
        b: "What the internet already knows about you, established without touching anything, priced in euros, and handed over as a remediation plan rather than a score.",
        tags: "Attack surface · Adversary simulation · Sovereignty · Compliance",
      },
    ],

    /* ================= AI ================= */
    aiCapabilities: [
      {
        id: "agentic",
        h: "Agentic automation of a real process",
        b: "A pipeline that reads evidence, calls tools, takes intermediate decisions and produces a finished artifact, with every step recorded. Not a chat window: a process that runs end to end and hands over something a person can sign.",
      },
      {
        id: "rag",
        h: "Answers grounded in your own material",
        b: "Retrieval over contracts, policies, tickets, drawings and standards, so that every answer cites the passage it came from. The citation is the product. An answer that cannot point at its source cannot be used in a regulated process.",
      },
      {
        id: "decide",
        h: "Decision support with an audit trail",
        b: "Where a judgement is high consequence and made repeatedly, an adversarial panel produces a verdict, a confidence figure, the reasons and the recorded dissent. That file is what makes the decision defensible to a board or an inspector.",
      },
      {
        id: "extract",
        h: "Extraction and classification at scale",
        b: "Turning unstructured input into structured records: invoices, claims, identity documents, engineering specifications, inbound mail. The oldest and most reliable class of value, and still the one with the shortest path to a measurable number.",
      },
      {
        id: "code",
        h: "Engineering and legacy comprehension",
        b: "Explaining a system nobody remembers writing, generating tests for it, and accelerating delivery inside guard rails. Most useful where documentation is gone and the original team has left, which is most large estates.",
      },
      {
        id: "defend",
        h: "Detection under live attack",
        b: "Fraud, abuse and application layer defence, where the input is adversarial and the model is being probed deliberately. This is the class where a naive deployment does active harm, and where our own platform is built.",
      },
    ],

    aiRules: [
      {
        id: "decision",
        h: "Start from a decision, not a technology",
        b: "The qualifying question is whether a decision is high consequence, made repeatedly, and currently owned by one expert with one method. If yes to all three, the business case writes itself. If not, we say so rather than bid.",
      },
      {
        id: "evals",
        h: "The evaluation set is the product",
        b: "Before anything is built, we assemble historical cases where the right answer is already known. That set is what turns opinion into measurement, and it is the only asset in the programme that keeps its value when the model is replaced.",
      },
      {
        id: "reviewer",
        h: "The reviewer is never the author",
        b: "Work is produced by one engine and reviewed by another, from a different supplier. A model asked to check its own answer inherits the blind spot that made it wrong, and published research shows evaluators favour their own output.",
      },
      {
        id: "ground",
        h: "Ground every claim, and strip what you cannot verify",
        b: "Identifiers, figures and citations are cross checked against the source evidence, and anything unverifiable is removed rather than rewritten. One fabricated reference in a customer document is unrecoverable once it has been read.",
      },
      {
        id: "cost",
        h: "Bound the cost per unit of work",
        b: "Cost is measured per completed task and recorded in a ledger from the first day, not estimated per token in a spreadsheet. A programme that cannot state its unit cost cannot be scaled, and will be cancelled at the first budget review.",
      },
      {
        id: "fallback",
        h: "Design the fallback before the happy path",
        b: "Every supplier has rate limits, outages and policy changes. If a single provider going quiet stops your process, you have built a dependency rather than a capability. Two suppliers, a deterministic path, and an honest degraded mode.",
      },
    ],

    aiLifecycle: [
      {
        id: "frame",
        h: "Frame the decision",
        we: "Workshops to name the exact decision, the evidence that should inform it, the threshold for acting, and what a refusal looks like. Success is defined as a number before anything is built.",
        trap: "Starting from a use case rather than a decision. A use case can always be demonstrated and never accepted, because nobody agreed in advance what would count as working.",
      },
      {
        id: "data",
        h: "Data readiness and the boundary",
        we: "Find where the evidence actually lives, what condition it is in, and what may lawfully leave the building. The residency and processing boundary is drawn here, in the architecture, not certified afterwards.",
        trap: "Discovering at integration time that the corpus is a shared drive with fifteen years of duplicates, or that the data cannot leave the jurisdiction at all.",
      },
      {
        id: "spike",
        h: "Feasibility spike against a measurable target",
        we: "A short, deliberately ugly build against real evidence, to answer one question: can this reach the number agreed in stage one. Weeks, not months, and it is allowed to fail.",
        trap: "A demonstration on curated examples. It always works, it proves nothing, and it creates an expectation the production system then has to live down.",
      },
      {
        id: "harness",
        h: "Build the evaluation harness",
        we: "The golden set of historical cases with known outcomes, plus adversarial cases designed to break it. Every later change is measured against this, automatically, so a regression is visible the day it appears.",
        trap: "Evaluating by reading a sample and forming an impression. It cannot detect a small regression, and it cannot survive a procurement challenge.",
      },
      {
        id: "build",
        h: "Build: retrieval, tools, orchestration",
        we: "Retrieval over your material, tool calls into your systems, orchestration across steps, and a strict output contract validated on every response. Tolerate any shape, never tolerate an empty answer.",
        trap: "Treating a well formed response as a good one. A model that returns valid but empty output scores as a success in the log and ships an empty deliverable.",
      },
      {
        id: "review",
        h: "Adversarial review and the deterministic gate",
        we: "A second supplier's engine reviews the output against the evidence. Code, not confidence, decides pass or fail. Reasoning and dissent are recorded and handed over with the result.",
        trap: "Letting the review hold the switch. A rate limited reviewer must not be able to block good work, and an agreeable one must not be able to wave through broken work.",
      },
      {
        id: "prod",
        h: "Production: observability, cost and failure",
        we: "Structured events for every run, cost per task in a ledger, alerting on quality rather than only on errors, and a documented degraded mode. A crash has to be as visible as a success.",
        trap: "Monitoring uptime instead of output. The service answers, the metrics are green, and the quality has quietly halved because a supplier changed a model behind the same name.",
      },
      {
        id: "operate",
        h: "Operate: drift, refresh and recalibration",
        we: "The evaluation set is re-run on a schedule and on every supplier change. Thresholds are recalibrated against fresh outcomes, and the supplier chain is re-measured rather than assumed.",
        trap: "Assuming the choice you made at launch is still the right one. Latency and quality rankings invert between suppliers within months, and a chain nobody re-measures silently becomes the wrong one.",
      },
    ],

    aiUseCases: [
      {
        id: "service",
        n: "01",
        h: "Customer service deflection and agent assist",
        sector: "Every sector",
        b: "Answering routine contact from your own documented policy, and drafting the reply for a human on everything else. The assist half is usually where the return is, because it lifts the whole team rather than the easy tickets.",
        good: "Containment rate on a named intent set, with quality sampled and held flat. Handling time down without transfer rate up.",
        bad: "Deflection measured as contacts avoided, so the bot closes conversations it did not resolve and the customer simply calls.",
      },
      {
        id: "docs",
        n: "02",
        h: "Document intelligence in a regulated back office",
        sector: "Insurance, banking, legal",
        b: "Claims files, know your customer packs, contracts and correspondence turned into structured records with the source passage cited for every field. The citation is what makes it auditable.",
        good: "Straight through processing rate on a defined document class, with a measured exception rate and a full audit trail per field.",
        bad: "High accuracy on average, with no way to tell which individual case is wrong, so a human re-reads everything and nothing is saved.",
      },
      {
        id: "bids",
        n: "03",
        h: "Bid, tender and proposal production",
        sector: "Professional services, technology, construction",
        b: "Assembling a first draft from your own answer library, past submissions and the specific requirements of this tender, with every claim traceable to an approved source.",
        good: "First draft time cut on a like for like tender, with the compliance matrix complete and no unapproved claim in the text.",
        bad: "Fluent prose that quietly asserts a capability or a certification the company does not hold, which is a disqualification rather than an error.",
      },
      {
        id: "legacy",
        n: "04",
        h: "Legacy comprehension and delivery acceleration",
        sector: "Banking, telecommunications, public sector",
        b: "Explaining a system whose authors have gone, generating characterisation tests before anything is changed, and accelerating routine delivery inside review guard rails.",
        good: "Test coverage on the legacy path before modernisation starts, and change lead time down without defect escape rate up.",
        bad: "Generated code merged without the tests, which raises throughput for one quarter and the defect rate for the next two.",
      },
      {
        id: "soc",
        n: "05",
        h: "Security triage and alert enrichment",
        sector: "Any organisation with a security operation",
        b: "Enriching an alert with asset ownership, exposure and business context, then proposing a disposition with the evidence attached. The analyst decides; the machine does the assembly.",
        good: "Time to triage down on a fixed alert mix, with the false negative rate measured, not assumed.",
        bad: "Auto closing alerts to improve the queue metric. The metric improves, and the one that mattered is closed with the rest.",
      },
      {
        id: "fraud",
        n: "06",
        h: "Fraud and abuse detection",
        sector: "Financial services, marketplaces, telecommunications",
        b: "Behavioural detection where the input is adversarial and the attacker adapts to your controls. The evasion is usually the strongest signal, because it is the one thing a genuine user never produces.",
        good: "Detection at a fixed false positive budget, measured against confirmed cases, and holding after the attacker adapts.",
        bad: "A model tuned on last year's fraud, with no adversarial evaluation, that degrades silently as soon as it is worth defeating.",
      },
      {
        id: "knowledge",
        n: "07",
        h: "Knowledge retrieval across internal corpora",
        sector: "Engineering, pharmaceutical, industrial",
        b: "Search that answers rather than lists, over standards, drawings, specifications and decade old project archives, with permissions honoured at retrieval time and not bolted on later.",
        good: "Time to find a defensible answer, measured on real questions, with permissions provably enforced per document.",
        bad: "An index built with a service account that can read everything, which cheerfully answers a question the asker had no right to ask.",
      },
      {
        id: "supplier",
        n: "08",
        h: "Supplier and third party risk",
        sector: "Regulated enterprise, public sector",
        b: "Continuous review of the suppliers you depend on, combining their published exposure, their filings and their incident history, ranked by what you would actually lose if they stopped.",
        good: "Coverage of the supplier base with a dated evidence pack per supplier, and review effort concentrated on real dependency.",
        bad: "A questionnaire summariser. It produces a score from what the supplier chose to tell you, which is the least reliable input available.",
      },
      {
        id: "field",
        n: "09",
        h: "Field service and maintenance guidance",
        sector: "Manufacturing, energy, transport",
        b: "Putting the right procedure, drawing and history in front of an engineer at the asset, offline where the site has no coverage, with the safety critical steps kept deterministic.",
        good: "First time fix rate up and repeat visits down, with safety critical procedures unchanged and verifiable.",
        bad: "A generated procedure for a safety critical task. Those steps belong in a controlled document, and the assistant should retrieve them, never compose them.",
      },
      {
        id: "reg",
        n: "10",
        h: "Regulatory change monitoring and mapping",
        sector: "Financial services, health, critical infrastructure",
        b: "Watching the regimes that bind you, mapping each change to the controls and systems it touches, and producing the delta rather than another summary of the whole regulation.",
        good: "Time from publication to a named owner holding a specific control change, with the mapping traceable to the article.",
        bad: "A monthly digest nobody reads, because it restates the regulation instead of naming what has to change and who owns it.",
      },
    ],

    aiBench: [
      {
        id: "cancel",
        b: "Gartner expects more than 40 percent of agentic AI projects to be cancelled by the end of 2027. The reasons given are escalating cost, unclear business value and inadequate risk controls.",
      },
      {
        id: "value",
        b: "McKinsey reports 88 percent of organisations using AI in at least one function. Only about 39 percent report any effect on earnings, and most of those report under 5 percent.",
      },
      {
        id: "gov",
        b: "Gartner expects that by 2030 half of AI agent deployment failures will trace to insufficient runtime enforcement of governance, rather than to the models themselves.",
      },
      {
        id: "spend",
        b: "Worldwide AI spending is forecast at 2.59 trillion United States dollars in 2026. Scarcity of budget is not the constraint, and has not been for some time.",
      },
    ],

    /* ================= CLOUD ================= */
    cloudRs: [
      {
        id: "rehost",
        n: "R1",
        h: "Rehost",
        one: "Move it as it is, commonly called lift and shift.",
        when: "A dated deadline you cannot move, a datacentre contract ending, or an application nobody is allowed to change. Fastest path off the floor and the lowest delivery risk.",
        trap: "Rehosting the whole estate and calling the programme finished. The old inefficiency now runs on metered infrastructure, the bill goes up, and the promised savings never appear.",
      },
      {
        id: "relocate",
        n: "R2",
        h: "Relocate",
        one: "Move the hypervisor, not the application.",
        when: "A large virtualised estate that has to move quickly with no change to the operating model, typically into a managed equivalent of the platform it already runs on.",
        trap: "Treating it as a destination rather than a staging post. It buys time and changes almost nothing, so it needs a dated plan for what happens next.",
      },
      {
        id: "replatform",
        n: "R3",
        h: "Replatform",
        one: "Keep the application, change what it stands on.",
        when: "The best return in most estates. A managed database, a managed runtime or a managed queue removes real operational burden without touching application logic.",
        trap: "Scope creep into a rewrite. Every replatform contains an argument for refactoring one more thing, and that is how a six week piece of work becomes a year.",
      },
      {
        id: "refactor",
        n: "R4",
        h: "Refactor or re-architect",
        one: "Change the application to change what it can do.",
        when: "The constraint is the architecture itself: it cannot scale, cannot be released independently, or cannot meet a regulatory requirement in its current shape.",
        trap: "Refactoring something the business is about to replace, or refactoring for elegance. Only a named business or compliance constraint justifies the cost and the risk.",
      },
      {
        id: "repurchase",
        n: "R5",
        h: "Repurchase",
        one: "Stop running it and buy the capability instead.",
        when: "The application is not a differentiator and a mature product exists. Common for mail, collaboration, human resources, expense handling and increasingly for core finance.",
        trap: "Underestimating the data migration and the integration surface. The licence is the small number; the interfaces and the historical data are where the programme is won or lost.",
      },
      {
        id: "retire",
        n: "R6",
        h: "Retire",
        one: "Turn it off.",
        when: "Always worth asking first. In most large estates a meaningful share of applications have no real users, duplicate something else, or exist only because nobody checked.",
        trap: "Never being executed. Decommissioning is planned at the end, the programme runs out of appetite, and the estate is now paying for two of everything.",
      },
      {
        id: "retain",
        n: "R7",
        h: "Retain",
        one: "Leave it where it is, on purpose, and write down why.",
        when: "Data residency, licensing, latency to a physical process, or a system with a known replacement date. Retain is a decision, and a legitimate one.",
        trap: "Retain by default, undocumented. It then looks identical to an application nobody assessed, and it will be rediscovered as a surprise two years later.",
      },
    ],

    cloudPhases: [
      {
        id: "discover",
        h: "Discover what you actually run",
        we: "Inventory from the network, the directory, the billing and the people, not from the configuration database. Dependencies mapped by observation, because the diagram is always out of date.",
        trap: "Trusting the existing inventory. Every estate has applications nobody listed and dependencies nobody drew, and both surface during a cutover weekend.",
      },
      {
        id: "assess",
        h: "Assess and choose the R",
        we: "One of the seven strategies per application, with the reason, the cost and the risk written down. That record is what lets a decision be defended a year later when someone asks why.",
        trap: "Choosing per estate rather than per application. It is faster, it is what most programmes do, and it is the root of both the over cost and the over run.",
      },
      {
        id: "landing",
        h: "Build the landing zone",
        we: "Accounts, identity, network, logging, guard rails and the cost model, designed together. This is also where the residency and sovereignty position is fixed, because retrofitting it is a rebuild.",
        trap: "A landing zone designed by the platform team alone. Identity and network then meet the application requirements for the first time during migration, and one of them loses.",
      },
      {
        id: "waves",
        h: "Migrate in waves",
        we: "Small first wave to prove the runbook, then waves grouped by dependency rather than by convenience. Every wave produces a rehearsed, timed, reversible cutover.",
        trap: "A first wave chosen because it is easy. It proves nothing about the hard ones and gives the programme false confidence at exactly the wrong moment.",
      },
      {
        id: "run",
        h: "Cut over and run",
        we: "Rehearsed cutovers with a tested rollback, then a stabilisation period with the old platform still available. Backup and restore proven by actually restoring, not by a green tick.",
        trap: "Declaring success at cutover. The first month is where the operational cost, the performance surprises and the missing runbooks appear.",
      },
      {
        id: "optimise",
        h: "Decommission and optimise",
        we: "Turn off the old estate, on a schedule, and prove it is off. Then right size, commit where the workload is predictable, and put unit cost in front of the teams who create it.",
        trap: "Skipping the decommission. The savings case in every business plan assumes the old thing stops, and it is the single most common reason the savings never arrive.",
      },
    ],

    cloudDiff: [
      {
        id: "network",
        h: "The network is in scope, not a dependency",
        b: "Routing, label switching and wide area design are part of the migration rather than a ticket raised with someone else's roadmap. Carrier scale networking is where this practice started, and it is usually the constraint nobody costed.",
      },
      {
        id: "decom",
        h: "Decommissioning is planned first",
        b: "The savings case assumes the old estate stops. We schedule and evidence that from the beginning, because a programme with no appetite left at the end simply does not do it.",
      },
      {
        id: "hard",
        h: "The hard parts are treated as the programme",
        b: "Database engine changes, mainframe replatforming, identity migration and integration platform replacement are where migrations actually fail. They are planned as the main body of work, not as sub tasks.",
      },
      {
        id: "cost",
        h: "The cost model is designed with the landing zone",
        b: "Tagging, account structure, commitment strategy and unit cost reporting are built in from the start. Retrofitting cost visibility onto a live estate is expensive and always incomplete.",
      },
    ],

    /* ================= CYBER ================= */
    cyberBest: [
      {
        id: "asm",
        h: "External attack surface, established passively",
        b: "Your entire internet facing estate resolved from public sources: routing registries, certificate transparency, passive domain records and internet wide scan indexes. No authorisation needed because nothing is touched.",
      },
      {
        id: "own",
        h: "Ownership proven rather than matched",
        b: "Every step that widens scope has to prove the asset is yours. Shared hosting, group structures and lookalike names are resolved correctly, so a neighbour's exposure never appears in your report.",
      },
      {
        id: "bas",
        h: "Adversary simulation with the controls on your side",
        b: "Simulation in a segmented replica, mapped to the MITRE ATT&CK matrix, with the controller resident on your infrastructure under your oversight. Tested against one click, zero click and zero day chains.",
      },
      {
        id: "deep",
        h: "Security engineered into the lowest layers",
        b: "Identity, cryptography, tenant isolation, supply chain and firmware integrity, so trust is built by construction. Perimeter controls fail, and resilience has to be architectural to survive an audit.",
      },
      {
        id: "sov",
        h: "Sovereignty and key custody that survives scrutiny",
        b: "Residency designed in from the first diagram, customer held keys, and no third party carrier in the delivery path. The evidence pack a regulator asks for is produced as part of the work.",
      },
      {
        id: "quant",
        h: "Risk expressed in euros",
        b: "Findings converted to annual loss exposure using the same loss mathematics an insurer prices with. A letter grade does not survive a finance director; a number with its workings does.",
      },
    ],

    cyberDiff: [
      {
        id: "passive",
        h: "Not one packet, by contract",
        b: "We can assess a company before the first conversation, because nothing we do requires their permission or touches their systems. Every scanner based approach needs authorisation, which means the engagement has already started.",
      },
      {
        id: "evidence",
        h: "Absence of evidence is never a finding",
        b: "When a lookup fails we report unknown and claim nothing. A false weakness in a board pack is worse than a gap, because it cannot be taken back once it has been read.",
      },
      {
        id: "audit",
        h: "We audit our own findings with a second supplier",
        b: "A different vendor's engine reviews every finding against the evidence and flags what it cannot support. The auditor may flag, but deterministic ownership data decides, so an automated filter can never empty a report.",
      },
      {
        id: "fix",
        h: "The output is a remediation plan, not a score",
        b: "Every finding carries what to do, why a patch does not close it structurally, and what the customer gets. A score tells somebody they have a problem and nothing about how their week should change.",
      },
      {
        id: "vendor",
        h: "Vendor neutral, because you sell your own stack",
        b: "Remediation is expressed as a control, not as a product name. A partner selling one firewall vendor cannot hand a customer a document recommending a competitor.",
      },
    ],

    cyberRegimes: [
      {
        id: "eu",
        h: "European Union",
        b: "NIS2, the Digital Operational Resilience Act, the Cyber Resilience Act, the AI Act and the General Data Protection Regulation, with German banking supervisory requirements for information technology where they apply.",
      },
      {
        id: "ca",
        h: "Canada",
        b: "The OSFI guidelines on technology and cyber risk, operational resilience and third party arrangements, alongside federal privacy law and the Quebec provincial regime.",
      },
      {
        id: "uk",
        h: "United Kingdom",
        b: "The National Cyber Security Centre baseline and the United Kingdom data protection regime, mapped to the same controls rather than assessed separately.",
      },
      {
        id: "intl",
        h: "Elsewhere",
        b: "ISO 27001 and the NIST Cybersecurity Framework as the default set, with the national baseline of the jurisdiction where the assessed entity is registered.",
      },
    ],
  },
};
