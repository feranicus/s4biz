/* English is the REFERENCE locale. Every other locale is checked against it by
 * tools/i18n_catalogue.mjs --check (every key present) and tools/content_gate.mjs (every content
 * array the same length, same ids, same field names).
 *
 * STANDING CONTENT RULES, enforced by tools/content_gate.mjs in every language:
 *   1. NO LONG DASHES anywhere. Use a comma, a full stop or brackets. It is the clearest tell
 *      that copy was machine-written, and the operator has asked for it twice.
 *   2. NO PRICES, rates, discounts or seat counts on a public page. A price given away publicly
 *      is a negotiating position given away for free, and it goes stale the day a tier changes.
 *   3. NO HTML ENTITIES (&rsquo; &mdash; &rarr;). A string that arrives through t() is a JS
 *      string and React escapes it, so the entity reaches the screen verbatim. Type the real
 *      character.
 *   4. NO NAMED COMPETITOR and no superiority claim we have not measured. The product's whole
 *      credibility rests on "absence of evidence is never a finding"; the marketing obeys the
 *      same rule. An unmeasured comparison against a named product also needs substantiation
 *      under UWG section 6 and the UCP Directive.
 *   5. EVERY NUMBER is either our own measurement (say so, and date it) or an external
 *      benchmark (name the source on the page). Nothing else ships.
 *   6. NO SENTENCE OVER 30 WORDS, and no unexpanded abbreviation on first use.
 */

import { EN_SERVICES } from "./en.services.js";
import { EN_CUSTODY } from "./en.custody.js";

export const EN = {
  /* The three service pages live in their own file because they are the bulk of the words. They
     are spread in HERE so there is still exactly ONE dictionary and one fallback path at runtime.
     A second key space is what produced raw dotted keys on a live page in a sibling project. */
  ...EN_SERVICES.keys,
  ...EN_CUSTODY.keys,

  /* ---------------- chrome ---------------- */
  "nav.ai": "AI",
  "nav.cloud": "Cloud",
  "nav.cyber": "Cyber",
  "nav.capabilities": "Capabilities",
  "nav.method": "How we work",
  "nav.work": "Work",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.privacy": "Privacy",
  "nav.impressum": "Imprint",
  "nav.more": "More",
  "nav.cta": "Start a conversation",

  /* Tab labels are SHORT BY CONTRACT (8 characters or fewer, in every language). A fixed-height
     bar with six items on a 360px phone is an arithmetic problem, and German overflows first.
     Asserted by tools/header_layout.mjs. */
  "tab.home": "Home",
  "tab.ai": "AI",
  "tab.cloud": "Cloud",
  "tab.cyber": "Cyber",
  "tab.work": "Work",
  "tab.talk": "Talk",

  "a11y.menu": "Open the menu",
  "a11y.lang": "Change language",
  "a11y.close": "Close",
  "a11y.skip": "Skip to content",

  /* ---------------- hero ---------------- */
  "hero.eyebrow": "Stars4business OÜ · Tallinn · Frankfurt · Lisboa · Delaware",
  "hero.h1a": "Sovereign cyber, cloud and AI,",
  "hero.h1b": "architected and delivered",
  "hero.h1c": "by one accountable team.",
  "hero.sub":
    "We design and build the systems regulated enterprises cannot outsource blindly. External attack surface, adversary simulation, cloud and datacentre migration, digital sovereignty, and security engineered into the foundations rather than bolted on top.",
  "hero.claim": "One sovereign partner. Five capability pillars. Zero carrier lock-in.",
  "hero.cta1": "Start a conversation",
  "hero.cta2": "See what we do",
  "hero.scroll": "Scroll",

  "stat.years": "Years delivering",
  "stat.years.v": "20+",
  "stat.jur": "Jurisdictions",
  "stat.jur.v": "4",
  "stat.prog": "Largest programme led",
  "stat.prog.v": "400+ apps",
  "stat.prog.note": "Three datacentres to public cloud, 2.5 years",
  "stat.edge": "Edge locations orchestrated",
  "stat.edge.v": "10,000+",
  "stat.edge.note": "Across more than 140 countries",

  /* ---------------- problem / positioning ---------------- */
  "why.eyebrow": "Why this exists",
  "why.h": "Most programmes fail on the seams, not the parts.",
  "why.lede":
    "The cloud provider is competent. The security vendor is competent. The integrator is competent. Nobody owns what happens between them, and that gap is where budget, deadlines and evidence disappear.",
  "why.c1.h": "One accountable counterparty",
  "why.c1.b":
    "Architecture, build, security and hand-over sit with the same team. There is no carrier intermediary, no procurement layer and no place for a defect to be somebody else's.",
  "why.c2.h": "An architect who still writes the code",
  "why.c2.b":
    "The person in your board review is the person in the pull request. Design decisions survive contact with the terminal, because they were made there.",
  "why.c3.h": "Evidence, not assertion",
  "why.c3.b":
    "Every claim we make about your estate traces to something observable. Where a lookup fails we report it as unknown, because absence of evidence is never a finding.",

  /* ---------------- capability pillars ---------------- */
  "pill.eyebrow": "What we do",
  "pill.h": "Five capability pillars.",
  "pill.lede":
    "Sold separately or as one programme. Each pillar carries its own deliverable, its own acceptance criteria and its own hand-over.",
  "pill.more": "Read more",
  "pill.deliver": "Deliverable",

  "prac.eyebrow": "The full bench",
  "prac.h": "Four more practice areas.",
  "prac.lede":
    "Same principal architect, same delivery bar. These are the disciplines the five pillars stand on, and they are available on their own.",

  /* ---------------- method ---------------- */
  "meth.eyebrow": "How we work",
  "meth.h": "Automate everything. Make failure observable. Verify the artifact, not the intention.",
  "meth.lede":
    "That is the method we apply to your estate, and it is the method we run on our own. The four rules below are not a philosophy page. Each one is enforced in code on work we have shipped.",
  "meth.r1.h": "One command, every time",
  "meth.r1.b":
    "Test, commit, deploy and verify are one orchestrated pipeline, not a sequence of instructions someone has to remember. If a task needs doing twice, it becomes a script.",
  "meth.r2.h": "The reviewer is never the author",
  "meth.r2.b":
    "Work is produced by one engine and reviewed by a different one, from a different supplier. A model that marks its own homework inherits the same blind spot that made it wrong.",
  "meth.r3.h": "Code decides, judgement advises",
  "meth.r3.b":
    "Pass or fail comes from deterministic checks against measurable criteria. Reasoning and dissent are recorded and delivered. They never hold the switch.",
  "meth.r4.h": "Absence of evidence is never a finding",
  "meth.r4.b":
    "When a lookup fails we report unknown and claim nothing. A false weakness in a board pack is worse than a gap, because it is unrecoverable once it has been read.",

  "cons.eyebrow": "Consensus decision engineering",
  "cons.h": "Two build. Two attack. Code decides.",
  "cons.lede":
    "Where a decision is high consequence, made repeatedly, and currently owned by one expert with one method, we build an adversarial panel into the process itself.",
  "cons.s1.h": "Two independent attempts",
  "cons.s1.b":
    "Two engines from two different suppliers produce the work separately. Not a discussion, two separate attempts at the same job.",
  "cons.s2.h": "Two independent reviewers",
  "cons.s2.b":
    "Two further engines, from two other suppliers, review it. The reviewer is never the author and never the author's supplier.",
  "cons.s3.h": "A deterministic gate",
  "cons.s3.b":
    "Code decides pass or fail against checks that can be measured. A rate limited reviewer cannot block good work, and an agreeable one cannot wave through broken work.",
  "cons.s4.h": "A written record",
  "cons.s4.b":
    "Every verdict, agreement and dissent is recorded and handed over. A decision that records who disagreed, on what evidence, is defensible to a board or a regulator.",
  "cons.honest.h": "The honest limit",
  "cons.honest.b":
    "Consensus is not truth. Four engines can agree and still be wrong. That is exactly why the gate is deterministic and why every verdict is written down for a person to read.",
  "cons.hold":
    "Hold is a first class outcome. It names what would have to be collected before the decision can be made.",

  "proof.eyebrow": "Measured on our own platform",
  "proof.h": "We run the method on ourselves.",
  "proof.lede":
    "These are our own engineering measurements, read from our repository and cost ledger in August 2026. They describe our platform, not a customer result.",
  "proof.p1": "Deterministic checks reviewed on every release",
  "proof.p1.v": "43",
  "proof.p2": "Automated assertions behind them",
  "proof.p2.v": "426",
  "proof.p3": "Regression suites, each written from a real incident",
  "proof.p3.v": "11",
  "proof.p4": "Defect classes documented and permanently gated",
  "proof.p4.v": "170",
  "proof.note":
    "We publish the misses as well as the catches. A supplier who shows you only the wins is selling you something else.",

  /* ---------------- work ---------------- */
  "work.eyebrow": "Selected work",
  "work.h": "Programmes delivered.",
  "work.lede":
    "Two decades of transformation, migration and security programmes across telecommunications, aviation, energy, insurance, defence, banking and public sector. Delivered directly or as principal architect inside the named organisation.",
  "work.scope": "Scope",
  "work.scale": "Scale",
  "work.stack": "Stack",
  "work.sector": "Sector",
  "work.all": "All sectors",
  "work.note":
    "Engagements are listed with the client's own name where that name already appears in the principal's published professional record. Anything under a confidentiality obligation is described by sector and scale only.",

  /* ---------------- about ---------------- */
  "about.eyebrow": "Who you are actually hiring",
  "about.h": "One principal. Four flags.",
  "about.lede":
    "S4Biz is a group of four registered entities across two continents, operating as a single accountable counterparty. Billing in euro or US dollar, EU and EEA data residency by design.",
  "about.bio.h": "Evgeny \"Jev\" Vainshtein",
  "about.bio.role": "Principal Technical Architect and Engagement Lead",
  "about.bio.p1":
    "Twenty years delivering multi million cloud, security and AI transformations across public cloud, telecommunications, defence and enterprise. Engaged at director level by NetApp, Amazon Web Services, Red Hat, Canonical, Enea, Infineon, Luxair, ZEDEDA and Colt.",
  "about.bio.p2":
    "I lead cyber, cloud and AI transformation as an architect who still writes the code. That is what I bring: the boardroom and the terminal, with no translation layer in between.",
  "about.bio.p3":
    "What I carry from that work is not a stack list. It is a method: automate everything, make failure observable, never let a model decide a side effect, and verify the artifact rather than the intention.",
  "about.langs": "Languages",
  "about.langs.v": "English, German, Russian, Hebrew",
  "about.based": "Based",
  "about.based.v": "Frankfurt area, Germany. Delivering across DACH, EMEA and globally.",
  "about.edu": "Education",
  "about.edu.v":
    "B.Sc. Computer Science, Champlain College, Vermont. Practical engineering degree, ORT Ashdod technological school for naval officers.",
  "about.entities.h": "Registered where it matters",
  "about.entities.lede":
    "An EU operating core plus a US arm, so a programme can be contracted and delivered under the jurisdiction it belongs in.",
  "about.role": "Role",
  "about.taxid": "Tax identifier",

  "career.h": "Career in brief",
  "career.note": "Selected roles. The full record is on LinkedIn.",

  /* ---------------- contact ---------------- */
  "ct.eyebrow": "Start a conversation",
  "ct.h": "Tell us what is stuck.",
  "ct.lede":
    "A first call is thirty minutes, free, and technical. If the work does not fit us we will say so on that call rather than write a proposal for it.",
  "ct.name": "Name",
  "ct.email": "Work email",
  "ct.company": "Company",
  "ct.msg": "What are you trying to do?",
  "ct.msg.ph": "The programme, the constraint, and the date it has to work by.",
  "ct.send": "Send",
  "ct.sending": "Sending",
  "ct.ok.h": "Received.",
  "ct.ok.b": "We reply from feranicus@s4biz.io, usually the same working day.",
  "ct.err":
    "That did not send. Email feranicus@s4biz.io directly and it will reach the same place.",
  /* ---- contact channels ---- */
  "wa.msg": "Hello, I found s4biz.io and would like to talk about a project.",
  "wa.aria": "Message us on WhatsApp",
  "ch.h": "Every door, and where each one leads.",
  "ch.lede":
    "Pick whichever suits you. WhatsApp is first because it is the fastest to answer, and the message opens ready to send.",
  "ch.soon": "Coming soon",
  "ch.wa": "WhatsApp",
  "ch.wa.d": "The quickest reply, usually within the hour during a European working day.",
  "ch.email": "Email",
  "ch.email.d": "Best for anything with a document attached, a scope or a requirement list.",
  "ch.phone": "Phone",
  "ch.phone.d": "Direct line to the principal architect. German, English or Russian.",
  "ch.li": "LinkedIn",
  "ch.li.d": "The full professional record, and where most first conversations start.",
  "ch.tg": "Telegram",
  "ch.tg.d": "For anyone who prefers it, and for partners already working with us there.",
  "ch.gh": "GitHub",
  "ch.gh.d": "Open source work, including the passive internet reconnaissance tooling.",

  "ct.direct": "Or reach us directly",
  "ct.privacy":
    "We use what you send here only to answer you. It is stored in the European Union and never sold or shared. See the privacy notice.",
  "ct.required": "Please fill in your name, a work email and a message.",
  "ct.bademail": "That email address does not look right.",

  /* ---------------- footer ---------------- */
  "foot.tag": "Sovereign cyber, cloud and AI engineering.",
  "foot.rights": "Stars4business OÜ. All rights reserved.",
  "foot.built": "EU hosted. No third party analytics, no advertising trackers.",
  "foot.nav": "Site",
  "foot.legal": "Legal",
  "foot.reach": "Reach us",

  /* ---------------- legal ---------------- */
  "priv.h": "Privacy notice",
  "priv.updated": "Last updated 14 August 2026",
  "imp.h": "Imprint",
  "err.h": "That page does not exist.",
  "err.b": "The link may be old, or the address may have a typo in it.",
  "err.cta": "Back to the front page",

  /* ================= structured content ================= */
  __content: {
    ...EN_SERVICES.content,
    ...EN_CUSTODY.content,
    pillars: [
      {
        id: "discovery",
        tag: "A",
        h: "Cyber discovery and attack surface",
        lede: "What the internet can already see about you, established without sending a single packet to your infrastructure.",
        body: "We resolve an organisation's entire internet facing estate from public sources: routing and address registries, certificate transparency logs, passive domain name records, registration records and internet wide scan indexes. Findings are correlated, enriched against known exploited vulnerability catalogues, and attributed. Every scope widening step has to prove ownership rather than merely match a string, so a neighbour on shared hosting never appears in your report.",
        bullets: [
          "Passive by contract. No authorisation needed, nothing touched.",
          "Ownership proven, not assumed. Shared hosting and group structures resolved correctly.",
          "Findings priced in euro using the same loss maths an insurer uses.",
        ],
        deliver: "External attack surface map, ranked findings, and quantified annual loss exposure.",
      },
      {
        id: "bas",
        tag: "B",
        h: "Breach and attack simulation",
        lede: "We run the adversary in a sealed range, with the controller resident on your side.",
        body: "Simulation is executed against a segmented replica: separate application and operations planes, with tenant isolation that has to hold while under attack. Coverage is mapped to the MITRE ATT&CK matrix from reconnaissance and initial access through execution, persistence, lateral movement, credential access, discovery and impact. Resilience is validated against one click, zero click and zero day chains rather than against a checklist.",
        bullets: [
          "The controller stays on your infrastructure, under your oversight.",
          "Tenant isolation tested while under load, not asserted in a design document.",
          "Results delivered as a remediation playbook, not a score.",
        ],
        deliver: "ATT&CK coverage heat map, zero trust maturity read, and a prioritised remediation playbook.",
      },
      {
        id: "cloud",
        tag: "C",
        h: "Cloud and migration",
        lede: "Build, move, run. Datacentre exits, public cloud landing zones and the network underneath them.",
        body: "Migration across Amazon Web Services, Microsoft Azure, Google Cloud and OpenStack. That includes the parts most programmes underestimate: database engine changes, mainframe replatforming, identity migration, integration platform replacement and decommissioning. Network is treated as part of the migration rather than a dependency on somebody else's roadmap, covering border gateway routing, multiprotocol label switching and software defined wide area networking.",
        bullets: [
          "Landing zone, identity, network and cost model designed together.",
          "Decommissioning planned at the start, because that is where the savings are.",
          "Backup, restore and resilience engineered and then actually tested.",
        ],
        deliver: "Migration architecture, executed waves, a decommissioned estate and a tested recovery position.",
      },
      {
        id: "sovereignty",
        tag: "D",
        h: "Digital sovereignty",
        lede: "Your platform, your jurisdiction, your keys. Architected and run by one team.",
        body: "European Union and European Economic Area data residency designed in from the first diagram rather than certified afterwards. Sovereign and private cloud with customer held keys, using bring your own key or hold your own key models. No third party carrier dependency in the delivery path. Alignment with the Digital Operational Resilience Act, the second Network and Information Security Directive, the General Data Protection Regulation and German banking supervisory requirements for information technology.",
        bullets: [
          "Residency by design, evidenced in the architecture, not claimed in a datasheet.",
          "You hold the keys. We architect the model that makes that workable.",
          "No procurement layer between the architect and the running system.",
        ],
        deliver: "A sovereign architecture, the running platform, and the evidence pack a regulator asks for.",
      },
      {
        id: "deep",
        tag: "E",
        h: "Secure by design, \"The Deep\"",
        lede: "Security is not a layer you bolt on top. It is the foundation everything else stands on.",
        body: "The Deep is security engineered into the lowest layers of the stack: identity, cryptography, tenant isolation, supply chain and firmware integrity. Trust is then built by construction rather than patched in afterwards. Perimeter controls fail, because one click, zero click and zero day chains bypass the surface. Resilience has to be architectural, and regulators now require security by design to be demonstrable rather than asserted.",
        bullets: [
          "Four layers: surface, application, platform, and the deep beneath all three.",
          "Supply chain and firmware provenance treated as first class, not as procurement paperwork.",
          "Designed so the security argument survives an audit without a rewrite.",
        ],
        deliver: "A reference architecture, the implemented controls, and a defensible security argument.",
      },
    ],

    practices: [
      {
        id: "net",
        n: "01",
        h: "Networking and connectivity",
        tag: "Carrier grade plumbing",
        bullets: [
          "Carrier scale backbone and peering: border gateway protocol, label switching, route origin validation",
          "Software defined wide area network design and rollout",
          "Embedded subscriber identity and cellular underlay, provisioned remotely with no site visits",
          "Internet performance and route optimisation",
        ],
      },
      {
        id: "ai",
        n: "02",
        h: "AI and agentic engineering",
        tag: "Defence as a product",
        bullets: [
          "Agentic pipelines for fraud, abuse and application layer defence under live attack",
          "Orchestration, evaluation and observability for multi step agent systems",
          "Streaming and analytics on Kubernetes: event log, columnar store and search",
          "Model operations across hosted frontier models and locally fine tuned open weights",
        ],
      },
      {
        id: "dlt",
        n: "03",
        h: "Blockchain and distributed ledger",
        tag: "Regulated grade chains",
        bullets: [
          "Co-founder of a hybrid proof of work, authority and stake protocol",
          "Platform architect for a regulated bank running a digital asset platform",
          "Smart contract assessment and architecture audit",
          "Tokenisation and on chain settlement design",
        ],
      },
      {
        id: "oss",
        n: "04",
        h: "Open source engineering",
        tag: "Runs on your kit",
        bullets: [
          "OpenStack private and sovereign cloud build and upgrade",
          "Passive internet reconnaissance tooling, open sourced",
          "Upstream first: no licence, no lock in",
          "Auditable by design. You keep the source.",
        ],
      },
    ],

    work: [
      {
        id: "telefonica",
        client: "Telefónica Germany",
        sector: "Telecommunications",
        geo: "Germany",
        scope:
          "Migration of more than 400 applications out of three datacentres into public cloud, covering enterprise resource planning, databases, operational and business support systems. Database exit from a proprietary engine to PostgreSQL, with cyber security and continuous delivery implemented alongside.",
        scale: "400+ applications · 3 datacentres · 2.5 years",
        stack: "AWS · PostgreSQL · OSS/BSS · CI/CD",
      },
      {
        id: "zededa",
        client: "Automotive edge programme",
        sector: "Automotive and edge",
        geo: "Global",
        scope:
          "Principal technical account leadership on one of the largest automotive edge computing deployments in the world. Distributed compute orchestrated at dealer and plant locations, over a secure software defined network fabric.",
        scale: "10,000+ edge points of presence · 140+ countries",
        stack: "Kubernetes at the edge · immutable edge OS · secure SD-WAN",
      },
      {
        id: "luxair",
        client: "Luxair",
        sector: "Aviation",
        geo: "Luxembourg",
        scope:
          "Built a cloud centre of excellence from nothing, then led the exit from two datacentres into public cloud. That covered mainframe migration, database migration, application re-architecture, identity migration, integration platform replacement, enterprise resource planning migration and decommissioning.",
        scale: "2 datacentres exited · cloud centre of excellence established",
        stack: "Microsoft Azure · Logic Apps · Dynamics",
      },
      {
        id: "dt",
        client: "Deutsche Telekom",
        sector: "Telecommunications",
        geo: "Germany",
        scope:
          "Large scale digital transformation delivered as principal project manager. The programme also migrated the legacy subscriber database onto an open source engine and moved the delivery organisation from waterfall to agile.",
        scale: "50 million subscribers · programme delivered in 12 months",
        stack: "PostgreSQL · agile delivery at scale",
      },
      {
        id: "redhat",
        client: "Deutsche Telekom and Orange",
        sector: "Telecommunications",
        geo: "Europe",
        scope:
          "Open source network function virtualisation portfolio: virtualised packet core and voice services on private cloud. Alongside it, a second portfolio of container platform and private cloud projects for a second carrier group.",
        scale: "26 projects · plus 24 platform and private cloud projects",
        stack: "OpenStack · OpenShift · vEPC · vIMS · SDN",
      },
      {
        id: "tosca",
        client: "Tosca Services",
        sector: "Logistics",
        geo: "Europe and Asia",
        scope:
          "Post merger information technology transition and transformation after two acquisitions that tripled the landscape. Enterprise resource planning consolidation, application stack move to public cloud, secure development pipeline, and management of offshore development, quality assurance and integration teams.",
        scale: "3 companies consolidated · 2.5 years",
        stack: "Microsoft Azure · Dynamics · Azure DevOps",
      },
      {
        id: "mod",
        client: "Defence ministry and radar manufacturer",
        sector: "Defence",
        geo: "Israel",
        scope:
          "Digital transformation off a proprietary compute, virtualisation and storage stack onto an open source private cloud, retaining operational continuity through the transition.",
        scale: "National defence estate",
        stack: "Ubuntu · OpenStack",
      },
      {
        id: "law",
        client: "Law enforcement agencies",
        sector: "Public sector and security",
        geo: "Multiple countries",
        scope:
          "Cyber security software and hardware programmes, including deep packet inspection at national scale and mobile network security work, covering major operators and terabytes of traffic.",
        scale: "National scale · terabytes of traffic",
        stack: "DPI · lawful interception · network security",
      },
      {
        id: "eon",
        client: "E.ON",
        sector: "Energy",
        geo: "Germany",
        scope:
          "Estate wide endpoint modernisation, including directory services and endpoint security, executed without interrupting the operating business.",
        scale: "25,000+ workstations",
        stack: "Windows · Active Directory · endpoint security",
      },
      {
        id: "aon",
        client: "Aon",
        sector: "Insurance",
        geo: "United Kingdom and Germany",
        scope:
          "Post referendum relocation of applications out of several United Kingdom datacentres into a Frankfurt datacentre, driven by data residency and regulatory continuity.",
        scale: "Multi datacentre relocation",
        stack: "Datacentre migration · data residency",
      },
      {
        id: "vbank",
        client: "Private bank, Germany",
        sector: "Banking",
        geo: "Germany",
        scope:
          "Head of platform for a regulated digital asset investment platform, integrating institutional custody with the bank's core banking system.",
        scale: "Regulated digital asset platform",
        stack: "Institutional custody · core banking integration",
      },
      {
        id: "sonangol",
        client: "National oil company",
        sector: "Oil and gas",
        geo: "Angola",
        scope:
          "Wireless internet service provider built from nothing: radio access, backhaul, billing and operations, alongside a country wide radio spectrum monitoring solution used to license spectrum and locate unlicensed transmitters.",
        scale: "7 million subscribers · 300+ monitoring sites",
        stack: "WiMAX · RF monitoring · carrier billing",
      },
      {
        id: "infineon",
        client: "Semiconductor manufacturer",
        sector: "Semiconductors",
        geo: "Germany",
        scope:
          "Inner source strategy for global software engineering: how internal teams publish, discover, reuse and govern shared code across business units.",
        scale: "Global engineering organisation",
        stack: "Inner source · engineering governance",
      },
      {
        id: "cargill",
        client: "Cargill",
        sector: "Agriculture and commodities",
        geo: "Global",
        scope:
          "Payment and treasury platform implementation, integrated across three separate enterprise resource planning systems.",
        scale: "3 ERP systems integrated",
        stack: "Treasury automation · ERP integration",
      },
    ],

    entities: [
      {
        id: "ee",
        name: "Stars4business OÜ",
        flag: "Estonia",
        type: "Osaühing",
        role: "European Union hub. Group consultancy and European operating core.",
        tax: "VAT EE102156878",
        city: "Tallinn",
      },
      {
        id: "de",
        name: "S4biz UG (haftungsbeschränkt)",
        flag: "Germany",
        type: "Unternehmergesellschaft",
        role: "Commercial software development and DACH delivery.",
        tax: "USt-IdNr DE361822318",
        city: "Pinneberg",
      },
      {
        id: "pt",
        name: "S4BIZ Unipessoal Lda",
        flag: "Portugal",
        type: "Sociedade Unipessoal por Quotas",
        role: "Iberian operations and delivery.",
        tax: "NIF 518007596",
        city: "Lisboa",
      },
      {
        id: "us",
        name: "CyberGod LLC",
        flag: "United States",
        type: "Limited liability company",
        role: "Cyber and cloud delivery, United States presence.",
        tax: "Delaware registered",
        city: "Lewes, Delaware",
      },
    ],

    career: [
      { y: "2019 to now", r: "Founder, Principal Technical Architect", o: "S4Biz group" },
      { y: "2026 to now", r: "Cyber Security Client Partner, DACH", o: "Colt Technology Services" },
      { y: "2025", r: "Principal Technical Account Manager", o: "ZEDEDA" },
      { y: "2024", r: "Principal Cyber Security Customer Success Manager", o: "Intellexa" },
      { y: "2023 to 2024", r: "Cloud Centre of Excellence Lead", o: "Luxair" },
      { y: "2021 to 2024", r: "Senior Customer Solutions Manager, Telecom", o: "Amazon Web Services" },
      { y: "2020 to 2021", r: "Principal Project Manager", o: "Enea Openwave" },
      { y: "2020 to 2021", r: "Global Cloud Architect", o: "NetApp" },
      { y: "2019 to 2020", r: "Principal NFV Telecom Manager", o: "Red Hat" },
      { y: "2017 to 2018", r: "Director, Sales and Business Development, Public Cloud", o: "Canonical" },
      { y: "2014 to 2016", r: "Senior Solutions Sales Manager, EMEA elite team", o: "Huawei" },
    ],
  },
};
