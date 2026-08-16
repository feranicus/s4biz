# s4biz.io

The S4Biz corporate site. React + Vite progressive web app, FastAPI backend, one Docker container,
served through the shared Caddy proxy on the same droplet as cybergod.ai.

---

## Two commands. That is the whole interface.

```
cd "C:\Users\feran\Downloads\S4biz new website"
python preview.py
```

Look at it. On your phone too: the address is printed. Then:

```
python ship.py
```

test → preview check → commit → push → deploy → verify from outside → tag a safe point.

Everything else in this folder is a building block that `ship.py` calls. You should never need to
run one directly, and if a reply about this project ever ends with two `python ...` lines, that is
a defect to fold back into `ship.py`.

| flag | what it narrows |
|---|---|
| `python ship.py --test` | run the checks and stop |
| `python ship.py --stage` | validate on the staging twin, **reboot it**, then production |
| `python ship.py --dns` | also move s4biz.io off Tilda onto the droplet |
| `python ship.py --rollback` | reset to the last known good commit and redeploy that exact state |
| `python ship.py --no-preview` | skip the have-you-looked gate, deliberately |
| `python preview.py --build` | serve the BUILT files, which is exactly what would ship |

---

## The DNS cutover

DNS is at GoDaddy (`ns15` and `ns16.domaincontrol.com`), so the whole thing is scriptable. The site
can be live on the droplet long before the name moves, which makes this a separate and reversible
step.

### The zone as it stands, read 15 August 2026

| | | | |
|---|---|---|---|
| A | `@` | `5.181.161.80` | the old host. **This changes.** |
| A | `www` | `5.181.161.80` | the old host. **This changes.** |
| MX | `@` | `smtp.google.com` | Google Workspace. Untouched. |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | Untouched. |
| TXT | `@` | `google-site-verification=...` | Untouched. |
| TXT | `@` | `brevo-code:...` | Untouched. |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | Untouched. See the note below. |
| CNAME | `brevo1/2._domainkey` | Brevo signing keys | Untouched. |
| CNAME | `k2/k3._domainkey` | Mailchimp signing keys | Untouched. |

**Two records change. Nothing else is written.** `dnscut.py` reads and writes A records only,
prints the mail records it is preserving so you can see them, refuses to run if it cannot see an
MX, and refuses to write if a name has more than one A record (GoDaddy's write replaces the whole
set for that name, so it would silently delete the others).

### Do it in two steps, not one

The A records carry a **one hour TTL**. That is how long resolvers may keep serving the old address
after the change, and writing a short TTL at cutover time does not help, because the value already
in caches is the one that governs.

```
python dnscut.py --lower-ttl     shortens the lease, changes no addresses
                                 ... wait about an hour ...
python ship.py --dns             deploy and move the name; propagates in minutes
```

If you would rather do it in one, `python ship.py --dns` on its own is safe. The switch is just
slower and staggered, which looks alarming and is not.

```
python dnscut.py --check         read only: what the world resolves right now
python dnscut.py --rollback      put the previous records back
```

### The one thing only you can do

A **GoDaddy API key**, Production not OTE, from <https://developer.godaddy.com/keys>. Paste it once
into `s4biz.secrets.env` (gitignored, copy `s4biz.secrets.env.example`):

```
GODADDY_KEY=...
GODADDY_SECRET=...
```

With it there are zero browser steps. Without it, `dnscut.py` prints the exact two records to
change by hand and stops. Only the domain owner can mint that key; that is the internet's ownership
model rather than a limit of this code.

Leave the old site alive until you are happy. Rollback is then one command and one TTL.

### One finding on your own domain

`_dmarc` is `v=DMARC1; p=none;`. That is monitoring only: it asks for reports and instructs
receivers to reject nothing, so a forged sender still lands in the inbox. Our own cyber page sells
exactly this check, so it is worth closing. The normal path is `p=none` with a reporting address
for a few weeks, then `p=quarantine`, then `p=reject`. Nothing to do with the website move, and it
should not be changed in the same week.

---

## Layout

```
webapp/frontend/                 React + Vite, the whole site
  src/locales/{en,de}.js         chrome copy, English is the reference locale
  src/locales/{en,de}.services.js  the AI, Cloud and Cyber pages: the bulk of the words
  src/legal.jsx                  ALL legal text, German normative for the imprint
  src/heroScene.js               the hero animation, a pure module so a gate can execute it
  tools/*.mjs                    the build gates (see below)
webapp/backend/app/              FastAPI: contact endpoint, bot gate, security headers, SPA
webapp/Dockerfile                two stages; the gates run in stage 1
docker-compose.web.yml           one service, one network, loopback port only
deploy/caddy/s4biz.caddy         the proxy fragment, marker delimited
tests/                           Python suite, standard library only
```

Pages: `/` `/ai` `/cloud` `/cyber` `/capabilities` `/method` `/work` `/about` `/contact`
`/privacy` `/impressum`.

---

## The palette, and why it is these colours

The three accents are counted from the S4Biz decks rather than chosen: cyan `#22D3EE`, violet
`#8B5CF6`, indigo `#4F46E5`. The canvas is a deep indigo `#0C1233`, not near-black, so the bright
panels look like they belong to the page instead of being pasted onto it.

**Magenta `#C026D3` is the one that does the work.** Every security and cloud company ships blue.
Wiz's own brand team describe their move as deliberately putting unconventional colourfulness into
cloud security, and it is why their pages are recognisable at a glance. Magenta is our equivalent,
and being the only one using it costs nothing.

Two rules the contrast gate enforces, both from measurement rather than taste:

- **Text on the brand field is pure white.** Across the four gradient stops the worst case is the
  magenta at 4.71:1 for `#FFFFFF`, while an off-white like `#F2F3FF` drops to 4.27 and fails.
- **Magenta is a surface, never text.** `#C026D3` on the canvas is 3.88:1. It appears as a glow, a
  fill or a border. `--magenta-lt` (7.4:1) exists for the cases that want magenta text.

---

## Where things live, and the rules that keep them there

**Copy lives in `src/locales/`, never in a page.** A page component holds layout and zero words, so
a translation can only ever change text. A translator cannot move a box or reorder a section
because none of those things are in the file they edit.

**Legal text lives in `src/legal.jsx`, once.** The moment the same promise exists in two places one
of them goes stale and the site is making a false statement about how it handles personal data.

**Content arrays are parallel across locales.** Same length, same ids, same fields. That is what
makes the whole-array language fallback safe: an index-wise merge would silently pair one
section's German heading with another's English body the first time a locale gained an entry.

### Standing content rules, enforced in every language

1. **No long dashes.** Use a comma, a full stop or brackets.
2. **No prices** on a public page. A price given away publicly is a negotiating position given away
   for free, and it goes stale the day a tier changes.
3. **No HTML entities.** A string that arrives through `t()` is a JavaScript string and React
   escapes it, so `&rsquo;` reaches the screen verbatim. Type the real character.
4. **No named competitor**, and no superiority claim we have not measured.
5. **Every number** is either our own measurement, dated and labelled as ours, or an external
   benchmark with its source named on the page.
6. **No sentence over 30 words.**

---

## The gates

Four run inside the image, where the toolchain is correct by construction. That is deliberate:
esbuild ships a per-platform binary, and a `node_modules` in a shared folder is native to whichever
operating system installed it, so a gate that depends on the operator's local install is a gate
that cannot run on the machine invoking it.

| gate | what it will not let through |
|---|---|
| `i18n_gate` | an incomplete locale, a long dash, a price, an HTML entity, a 31 word sentence, a tab label too long for a 360px row, a locale that is secretly a copy of English |
| `layout_gate` | a header row that overflows in German, the two chrome controls drifting apart, a route that is unreachable or missing from `_APP_ROUTES` or the sitemap |
| `contrast_gate` | a text pair below WCAG AA, the call-to-action fill used anywhere but the button, a retired brand colour, invisible text, the manifest and the meta theme colour disagreeing |
| `render_gate` | a page that throws, a raw translation key reaching the DOM, a German page silently falling back to English, a missing tab bar, and 1800 frames of the hero animation against a validating canvas |
| `shipped_shell` | a source map, a secret, an HTML comment in the shell, or missing structured data |

Every one has been negative-tested: the defect reintroduced, the gate seen to fail, the tree
restored. A gate that has only ever gone green is unproven.

The Python suite is 37 tests and imports **nothing outside the standard library** except the app's
own dependencies. It calls the ASGI application directly rather than through `starlette.testclient`,
which needs `httpx` — a testing dependency, not an application one, and therefore absent on some
machines and an operator step to install.

---

## Deploy, and the rules the droplet imposes

The site runs as `s4biz-web` on the **existing** `videodead_appnet`, and the shared
`videodead-caddy` reaches it at `http://s4biz-web:8000`. Amnezia VPN, VideoDead, jobhuntwow and the
colt stack are untouched.

- **One network, defined in one file.** Two networks make Docker's DNS hand the proxy a random
  address, half of them unroutable, which surfaces as an intermittent 502 that is very hard to
  attribute.
- **Never `--remove-orphans`.** This compose file defines one service, so everything else in the
  project looks like an orphan to it.
- **Never hand-edit the droplet.** Fix the committed file and re-run. A change made over ssh is
  invisible to the repository and vanishes on the next deploy.
- **The Caddy fragment is marker delimited**, and the deploy deletes strictly between the markers.
  A range delete keyed on a word eventually starts inside another project's comment and truncates
  their site. That has happened on this host and produced a six hour outage.
- **The deploy packs `git archive HEAD`**, not the working tree, with `core.autocrlf=false`. The
  tested tree, the staging input and the production input are then provably the same bytes on every
  operating system.
- **One ssh session** for the whole deploy. OpenSSH 9.8 enables per-source penalties by default and
  they accrue, so a burst of short connections is what gets refused.
- The image is scanned before it is promoted. A CRITICAL, fixable finding stops the deploy.

Verification runs **from your machine, not the droplet**, because the droplet's own monitoring sits
behind the same proxy it would be monitoring. It checks the front page has a real body (a blank
page answers 200 perfectly happily), that the security headers survived the proxy, that Googlebot
is served and GPTBot is not, and that `/.env` still returns 404.

---

## Before the name moves: three things to fill in

Deliberately left empty rather than guessed, because an invented registration number on an imprint
is worse than a missing one. `src/legal.jsx`:

1. `OPERATOR.regNo` — the Estonian registry code for Stars4business OÜ.
2. `DE_ENTITY.street` and `DE_ENTITY.register` — the German UG's street address, its registry court
   and HRB number. Required if the site addresses the German market, which it does.
3. Confirm the **30 day log retention** claim on the privacy page matches what the droplet actually
   keeps. It is a statement a regulator can check.

Also worth a decision: the work page names real clients, taken from the project portfolio you
already circulate. If any of those are under a confidentiality obligation, replace the `client`
field in `src/locales/*.js` with a sector descriptor. The layout does not change.

---

## Regenerating the icons

```
python webapp/frontend/tools/make_icons.py
```

Seven icon files plus the social card, all from `public/icon.svg` and `public/icon-maskable.svg`.
Doing it by hand is how five of seven ended up on a retired palette for months in a sibling project.
