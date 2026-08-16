# s4biz.io — Project Blueprint

**This is not the document you uploaded.** The file you sent is `cybergod.ai — Project Blueprint`,
and it is correct for cybergod. It describes `colt-web`, `colt-stack`, `colt_events`,
`/var/log/colt`, `assess-bot/.env`, the Shodan engine, the Telegram bots, the enrichment chain and
the shield. Every one of those is a **live resource belonging to a different project on the same
droplet**. Applied literally to this site it would deploy on top of cybergod.

This is the equivalent document for s4biz.io. Where the two disagree, this one is right about this
site and that one is right about that one.

---

## 0. What this is

A corporate website. React and Vite single-page app, FastAPI serving it, one container. It accepts
a contact enquiry and answers a health check. There is no database, no queue, no inference, no
scanner and no bot. That is not a gap; it is the reason it is cheap to run and hard to break.

Eleven pages: `/` `/ai` `/cloud` `/cyber` `/capabilities` `/method` `/work` `/about` `/contact`
`/privacy` `/impressum`. English and German.

---

## 1. Where it sits, and who else is on the box

Public IP **64.225.108.200**, FRA1. Staging twin **165.245.244.174**. One container,
`videodead-caddy`, owns `:80` and `:443` for everything and terminates TLS.

**This is the sixth project on that host, and the other five were there first.**

| Project | Container | Upstream | Host port | Caddy markers |
|---|---|---|---|---|
| VideoDead | `videodead-caddy` | owns `:80/:443` | 80, 443 | it *is* the proxy |
| cybergod.ai | `colt-web` (+3 bots) | `colt-web:8000` | `127.0.0.1:8090` | `# colt:cybergod` |
| jobhuntwow.com | `jhw-web` | `jhw-web:8000` | | `# jhw:jobhuntwow` |
| godeyes.ai | | | | |
| klimaanlage-*.de, jev.best | `polara-web` | | | |
| **s4biz.io** | **`s4biz-web`** | **`s4biz-web:8000`** | **`127.0.0.1:8091`** | **`# s4biz:site`** |

Amnezia VPN (UDP) and joplin do not pass through Caddy and are never touched.

### The rules, each of which traces to an outage on this exact host

1. **One docker network.** `videodead_appnet`, declared external, in one compose file. On two
   networks Docker's DNS hands the proxy a random address, half of them unroutable, and the result
   is an intermittent 502 nobody can attribute.
2. **Never `--remove-orphans`.** This compose file defines one service, so everything else in the
   project looks like an orphan to it. That flag has already deleted a sibling stack's log shipper
   and both of its bots here.
3. **Delete strictly between markers.** A range delete keyed on a word eventually starts inside
   another project's comment. That took every domain on the box down for six hours.
4. **Never publish 80 or 443.** The shared proxy owns them. Loopback only.
5. **Never hand-edit the droplet.** Fix the committed file and re-run.

### The Caddyfile is generated, not edited

A watchdog (`caddyguard`, owned by the cybergod repo) assembles the monolith from per-project
fragments in `/opt/caddyguard/blocks/`, validates it, and restores it when something truncates it.

**This site now writes `/opt/caddyguard/blocks/s4biz__site.caddy` as part of its deploy**, guarded
by a directory test so it is a no-op on the staging twin. Before that it only appended to the
monolith, which worked but left it outside the protection: assembled by accident, and restorable
only if nobody reached for an older backup.

Config has three hops and the deploy checks all three:

```
host file ──(the bind MOUNT)──► container file ──(the RELOAD)──► running config ──► served
```

A single-file bind mount pins the inode, so `validate` and `reload` can agree perfectly with each
other while the container reads a completely different file. The deploy compares `sha256` on both
sides and restarts the proxy if they differ.

---

## 2. Deploy

```
python preview.py     look at it, including on a phone
python ship.py        everything else
```

Six stages: **checks → has this frontend been looked at → git → deploy → verify from outside →
safe point.** Flags narrow it, they never split it: `--test`, `--stage`, `--dns`, `--no-preview`,
`--rollback`, `-m`.

`deploy_direct.py` is the building block. **One ssh session** for the whole deploy, with the
tarball travelling inside the remote script as base64. Two reasons: OpenSSH 9.8 enables
per-source penalties by default and they accrue, and on Windows a temp path like `C:\...` makes
`scp` read the drive letter as a hostname.

**The pack is `git archive HEAD`**, with `core.autocrlf=false` and `core.eol=lf` forced, so the
tested tree, the staging input and the production input are provably identical bytes on every
operating system.

**Verification runs from your machine, not the droplet**, because the droplet's own monitoring
sits behind the proxy it would be monitoring. It checks: a real body on the front page (a blank
page answers 200 perfectly happily), the security headers survived the proxy, Googlebot is served
and GPTBot is not, `/.env` is 404, `www` works, and the certificate covers both names with more
than seven days left.

The image is scanned with a pinned, checksum-verified Trivy before promotion. A CRITICAL fixable
finding stops the deploy.

---

## 3. Secrets

**Nothing is minted, pasted or committed.** The droplet already holds a working store at
`/opt/colt-stack/assess-bot/.env`. `import_secrets.py` reads it **on the droplet**, copies exactly
four keys into `/opt/s4biz-stack/s4biz.env` (`umask 077`, `chmod 600`) and verifies they reached
the running container.

| Copied | Why |
|---|---|
| `GMAIL_SENDER`, `GMAIL_SA_B64` | send the enquiry. SMTP is blocked outbound on this host, so this is the Gmail API. Never "fix" it to `smtplib`. |
| `BOT_TOKEN`, `ALERT_TG_CHAT` | the second delivery channel |

**Everything else in that file is refused by name**, including `SHODAN_API_KEY`,
`OPENAI_API_KEY`, `COLT_BOT_PASSWORD` and `ABUSEIPDB_KEY`. A marketing site has no business
holding an inference key or a shared access password. Widening that allow-list is how a low value
system becomes the easiest route into a high value one, so it is asserted by a test rather than
left to review.

Values never reach your machine: the read, the filter and the write all happen remotely in one
session, and what comes back is key names and lengths.

**The one credential that does not exist yet** is a GoDaddy API key, for DNS. Only the domain
owner can mint it. `s4biz.secrets.env` (gitignored).

Own environment, complete: `SERVICE`, `DATA_DIR`, `EVENTS_LOG`, `ALERT_EMAIL`, `BOT_404`,
`BOT_404_ALLOW`, `HSTS_PRELOAD`.

---

## 4. DNS

At GoDaddy (`ns15`/`ns16.domaincontrol.com`). **Two records change and nothing else:** `A @` and
`A www`, from the old host `5.181.161.80` to `64.225.108.200`.

MX to Google Workspace, the SPF record, the Brevo and Mailchimp signing keys, the Google and Brevo
verification records and `_dmarc` are all left exactly alone. `dnscut.py` prints them so you can
see it, refuses to run if it cannot see an MX, and refuses to write if a name has more than one A
record, because GoDaddy's write replaces the whole set for a name.

The A records carry a one hour TTL, so lower it first:

```
python dnscut.py --lower-ttl     ... wait an hour ...     python ship.py --dns
```

---

## 5. What this site deliberately does not have

Stated because their absence looks like an omission against the cybergod blueprint, and it is not.

- **No database, no backup timer.** Nothing here cannot be regenerated from the repository. An
  enquiry is appended to a JSON Lines file on a volume before any delivery is attempted, so a mail
  outage costs a notification and never a lead.
- **No promtail, no Loki, no dashboards.** Events are written to `/var/log/s4biz/events.log` and
  shipped nowhere. If that is ever wanted it is a sidecar, not a rewrite.
- **No shield, no `/api/siege`, no threat intelligence.** There is a bot gate and a set of
  security headers, and that is the correct amount of machinery for a site with one write endpoint.
- **No GitHub Actions.** The deploy runs from your machine in one session.

---

## 6. What is monitored, and by whom

`s4biz.io` was serving traffic while absent from every monitor on the box. Now added:

- **`CADDY_EXPECT`** in the cybergod repo's `deploy/caddyguard/agent.py`. An unexpected vhost only
  warns; a vhost that is not expected can never be reported **missing**. Its disappearance was
  invisible.
- **The certificate expiry loop and the local probe loop** in `caddyguard.py`.
- **The off-box uptime workflow**, `.github/workflows/uptime.yml`, with three targets: `/api/health`
  for the container, `/` for the page (a blank 200 passes the first and fails the second), and `www`.
- **`s4biz-web`** added to the admin-API probe candidates.
- Independently, `ship.py` checks the certificate itself, so this site does not depend on the
  neighbour's monitors to know it is alive.

**Those five edits live in the other repository and take effect on the next `python ship.py`
there.** Two repositories sharing one host is the one case where one command is not enough, and
saying so is better than pretending otherwise.

---

## 7. The build gates

Five, and they run **inside the image**, where the toolchain is correct by construction. esbuild
ships a per-platform binary and `node_modules` in a shared folder is native to whichever operating
system installed it, so a gate depending on the local install is a gate that cannot run on the
machine invoking it.

| Gate | What it will not let through |
|---|---|
| `i18n_gate` | an incomplete locale, a long dash, a price, an HTML entity, a 31 word sentence, an over-long tab label, a locale that is secretly a copy of English |
| `layout_gate` | a header row that overflows in German at any breakpoint, the two chrome controls drifting apart, a route missing from `_APP_ROUTES` or the sitemap |
| `contrast_gate` | a text pair below WCAG AA, the call-to-action fill used anywhere but the button, magenta used as text, the manifest and meta theme colours disagreeing |
| `render_gate` | a page that throws, a raw translation key in the DOM, a German page falling back to English, 1800 frames of the hero animation against a validating canvas |
| `shipped_shell` | a source map, a secret, an HTML comment in the shell, missing structured data |

Plus 52 Python tests, of which 9 exist only to keep this site out of its neighbours' way.

**Every gate has been negative-tested**: the defect reintroduced, the gate seen to fail, the tree
restored. A gate that has only ever gone green is unproven.

---

## 8. Things that have already gone wrong here, so they do not go wrong again

- **A path derived from `import.meta.url`.** It is percent-encoded, so `S4biz new website` became
  `S4biz%20new%20website` and all four gates failed on the operator's machine while passing in a
  sandbox whose path had no space. Now `fileURLToPath`, guarded by a test that scans every `.mjs`.
- **A contact detail with two homes.** The phone number in the footer was one digit short and
  therefore unreachable, while `legal.jsx` had it right. Both files were internally consistent.
  The footer now derives, and the verified number is pinned in a test.
- **A test loose enough to accept the bug.** That phone check first asserted "twelve or thirteen
  digits", which is true of German mobiles generally and accepted both values. A range wide enough
  to be safe was wide enough to be useless.
- **Two gates measuring a hardcoded list** instead of reading the component and the router, so
  they reported comfortable passes on a header and a route set that no longer existed.
- **A breakpoint table that missed the tightest case.** It tested 1180px and 1000px, and the nav
  hides at 1000px, so the hardest moment for the row was never measured.
