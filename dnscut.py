#!/usr/bin/env python3
"""
dnscut.py -- move s4biz.io off Tilda and onto the droplet. A BUILDING BLOCK of ship.py.

    python ship.py --dns          do the cutover as part of the one command
    python dnscut.py --check      read-only: what the world currently resolves
    python dnscut.py --apply      just the DNS change
    python dnscut.py --rollback   put the previous records back

THE ONE IRREDUCIBLE HUMAN INPUT is a GoDaddy API key. Only the domain owner can mint one, and that
is the internet's ownership model rather than a limit of this code. Create it once at
https://developer.godaddy.com/keys (Production, not OTE) and paste it into `s4biz.secrets.env`
(gitignored; copy s4biz.secrets.env.example). With it, the cutover is fully scripted and there are
zero browser steps. Without it, this prints the exact two line change to make by hand and stops.
Do not re-explain this every run.

WHAT ACTUALLY CHANGES. Tilda serves the current site from its own addresses. Pointing the apex and
www at the droplet is the whole cutover: nothing needs to be deleted at Tilda first, and leaving
the Tilda project alive is what makes rollback instant.

  BEFORE  s4biz.io      A      <Tilda>
  AFTER   s4biz.io      A      64.225.108.200
          www.s4biz.io  A      64.225.108.200

WWW IS AN A RECORD, NOT A CNAME. A CNAME at www would work, but an apex cannot be a CNAME at all,
so using two different record types for one site invites the next person to "tidy" one of them.

MAIL IS NEVER TOUCHED. feranicus@s4biz.io has to keep working, and the single most common way to
break a company during a website migration is to move the apex A record and take the MX or the
sender policy with it. This script reads and writes A records ONLY, prints the MX and TXT records
it is leaving alone, and refuses to run if it cannot see them.

THE LIVE ZONE, read 15 August 2026. Everything except the first two lines is left exactly alone:

    A      @                    5.181.161.80          <- the old host. CHANGED.
    A      www                  5.181.161.80          <- the old host. CHANGED.
    MX     @                    smtp.google.com       Google Workspace. Untouched.
    TXT    @                    v=spf1 include:_spf.google.com ~all        Untouched.
    TXT    @                    google-site-verification=...               Untouched.
    TXT    @                    brevo-code:...                             Untouched.
    TXT    _dmarc               v=DMARC1; p=none;                          Untouched.
    CNAME  brevo1/2._domainkey  Brevo signing keys. Untouched.
    CNAME  k2/k3._domainkey     Mailchimp signing keys. Untouched.
    NS/SOA @                    ns15/ns16.domaincontrol.com. Untouched.

LOWER THE TIME TO LIVE FIRST. The A records are published with a one hour TTL, which is how long
a resolver anywhere in the world may keep serving the OLD address after the change. Writing a
short TTL at cutover time does not help, because it is the value already in caches that governs.

    python dnscut.py --lower-ttl     run this an hour or two BEFORE
    python ship.py --dns             then this, and it propagates in minutes
"""
import argparse
import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DOMAIN = os.environ.get("S4_DOMAIN", "s4biz.io")
TARGET = os.environ.get("DROPLET_HOST", "64.225.108.200")
SECRETS = os.path.join(HERE, "s4biz.secrets.env")
BACKUP = os.path.join(HERE, ".dns-backup.json")
API = "https://api.godaddy.com/v1/domains/%s/records" % DOMAIN


def load_secrets():
    """Read the key file if it exists. Environment variables win, so a CI run needs no file."""
    if os.path.exists(SECRETS):
        with open(SECRETS, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return os.environ.get("GODADDY_KEY", ""), os.environ.get("GODADDY_SECRET", "")


def _req(url, method="GET", body=None, headers=None, timeout=25):
    req = urllib.request.Request(url, method=method, data=body)
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        # NEVER discard an API error body. A 4xx is the server telling you exactly what it wants,
        # and throwing that away has cost several rounds of guessing elsewhere in this codebase.
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return 0, repr(e)


def _doh(name, rtype):
    """One lookup, tried against TWO independent resolvers.

    DNS over HTTPS so this works from anywhere, including a container with no resolver of its own.
    Two providers because one is a single point of failure, and because a lookup that fails has to
    be distinguishable from a record that does not exist: this returns None for "could not ask"
    and a list for "asked, and here is the answer, possibly empty".

    Cloudflare needs an accept header for the JSON form; Google answers JSON on its own path. The
    two are queried in that order and the first usable answer wins.
    """
    for url, headers in (
        ("https://cloudflare-dns.com/dns-query?name=%s&type=%s", {"accept": "application/dns-json"}),
        ("https://dns.google/resolve?name=%s&type=%s", {}),
    ):
        st, body = _req(url % (name, rtype), headers=headers)
        if st != 200:
            continue
        try:
            data = json.loads(body)
        except Exception:
            continue
        return [a.get("data") for a in data.get("Answer", []) if a.get("data")]
    return None


def resolve(name):
    """What the world currently sees, per record type."""
    return {rtype: _doh(name, rtype) for rtype in ("A", "MX", "TXT", "NS")}


def show(name):
    r = resolve(name)
    for k in ("NS", "A", "MX", "TXT"):
        v = r.get(k)
        if v is None:
            print("  %-4s lookup FAILED (unknown, not 'none')" % k)
        elif not v:
            print("  %-4s none" % k)
        else:
            for x in v[:4]:
                print("  %-4s %s" % (k, x[:110]))
    return r


def api_headers(key, secret):
    return {
        "Authorization": "sso-key %s:%s" % (key, secret),
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def get_records(hdr, rtype="A"):
    st, body = _req("%s/%s" % (API, rtype), headers=hdr)
    if st != 200:
        return None, "GoDaddy returned %s: %s" % (st, body[:300])
    try:
        return json.loads(body), ""
    except Exception as e:
        return None, "unparseable response: %r" % (e,)


def put_a(hdr, name, ip, ttl=600):
    body = json.dumps([{"data": ip, "ttl": ttl}]).encode("utf-8")
    st, resp = _req("%s/A/%s" % (API, name), method="PUT", body=body, headers=hdr)
    return (200 <= st < 300), "%s %s" % (st, resp[:220])


def single_a_per_name(records, names):
    """GoDaddy's PUT /records/A/{name} REPLACES the whole set for that name.

    With one A record per name that is exactly what we want. With two, writing one would silently
    DELETE the other, and a zone that quietly lost half a round-robin is very hard to notice from
    the outside. Refuse rather than guess.
    """
    problems = []
    for n in names:
        hits = [r for r in records if r.get("name") == n and r.get("type", "A") == "A"]
        if len(hits) > 1:
            problems.append(
                "%s has %d A records (%s). A write would replace ALL of them."
                % (n, len(hits), ", ".join(h.get("data", "?") for h in hits))
            )
    return problems


def show_preserved(hdr):
    """Print what is being left alone, by name and value.

    A migration that says "mail is safe" and shows nothing is asking to be trusted. Printing the
    records means the operator can see the sender policy, the signing keys and the mail exchanger
    are still there, before and after.
    """
    kept = []
    for rtype in ("MX", "TXT", "CNAME"):
        recs, err = get_records(hdr, rtype)
        if recs is None:
            print("  [!] could not read %s records: %s" % (rtype, err))
            continue
        for r in recs:
            nm = r.get("name", "@")
            data = str(r.get("data", ""))
            if rtype == "CNAME" and "_domainkey" not in nm:
                continue  # a plain CNAME is not mail infrastructure
            kept.append("%-6s %-22s %s" % (rtype, nm, data[:64]))
    if kept:
        print("\n  preserved, not touched by this script:")
        for k in sorted(kept):
            print("    " + k)
    return kept


def manual_instructions():
    print()
    print("  Manual change, GoDaddy DNS management for %s, two records:" % DOMAIN)
    print("    Type A   Name @     Value %s   TTL 600" % TARGET)
    print("    Type A   Name www   Value %s   TTL 600" % TARGET)
    print("  Change NOTHING else. Leave MX, TXT and NS exactly as they are.")
    print("  Propagation is usually minutes. The site is already live on the droplet, so the")
    print("  moment those records move, s4biz.io serves the new site.")


def main():
    ap = argparse.ArgumentParser(description="Move s4biz.io DNS to the droplet.")
    ap.add_argument("--check", action="store_true", help="read only, change nothing")
    ap.add_argument("--apply", action="store_true", help="write the A records")
    ap.add_argument("--rollback", action="store_true", help="restore the previous A records")
    ap.add_argument(
        "--lower-ttl",
        action="store_true",
        help="keep the current addresses, shorten the TTL. Run an hour or two before the cutover.",
    )
    a = ap.parse_args()
    if not (a.check or a.apply or a.rollback or a.lower_ttl):
        a.check = True

    print("== %s, current public DNS ==" % DOMAIN)
    before = show(DOMAIN)
    print("== www.%s ==" % DOMAIN)
    show("www." + DOMAIN)

    live = before.get("A") or []
    if TARGET in live:
        print("\n  %s already resolves to the droplet (%s)." % (DOMAIN, TARGET))
    else:
        print("\n  %s does NOT point at the droplet yet (target %s)." % (DOMAIN, TARGET))

    if a.check:
        key, secret = load_secrets()
        print("\n  GoDaddy credentials: %s" % ("present" if (key and secret) else "NOT set"))
        if not (key and secret):
            manual_instructions()
        return 0

    key, secret = load_secrets()
    if not (key and secret):
        print("\n[!] No GoDaddy API credentials, so DNS cannot be changed automatically.")
        print("    Create a PRODUCTION key at https://developer.godaddy.com/keys and put it in")
        print("    %s  (copy s4biz.secrets.env.example)" % SECRETS)
        manual_instructions()
        return 2  # NOT a failure of the deploy. The site is live; only the name has not moved.

    hdr = api_headers(key, secret)

    # REFUSE TO RUN BLIND. If we cannot read the current records we cannot back them up, and a DNS
    # change with no backup is not a change, it is a gamble.
    current, err = get_records(hdr, "A")
    if current is None:
        print("[X] could not read the current A records: %s" % err)
        print("    Nothing was changed. A 401 here usually means an OTE key rather than a")
        print("    Production key, or a key created for a different account.")
        return 1

    problems = single_a_per_name(current, ["@", "www"])
    if problems:
        print("[X] refusing to write:")
        for p in problems:
            print("    " + p)
        return 1

    if a.lower_ttl:
        # SHORTEN THE LEASE, CHANGE NOTHING ELSE. The value already in caches is what governs how
        # long the old address survives, so this has to happen BEFORE the cutover to be any use.
        print("\n== shortening the A record TTL, addresses unchanged ==")
        ok = True
        for name in ("@", "www"):
            hits = [r for r in current if r.get("name") == name]
            if not hits:
                print("  %-5s no A record, nothing to do" % name)
                continue
            ip = hits[0].get("data")
            was = hits[0].get("ttl")
            good, msg = put_a(hdr, name, ip, ttl=600)
            print("  %-5s %-16s ttl %s -> 600  %s" % (name, ip, was, "OK" if good else msg))
            ok = ok and good
        print("\n  Wait for the OLD ttl to expire (about %d minutes), then run:" % 60)
        print("      python ship.py --dns")
        return 0 if ok else 1

    if a.rollback:
        if not os.path.exists(BACKUP):
            print("[X] no backup at %s, so there is nothing to roll back to." % BACKUP)
            return 1
        with open(BACKUP, "r", encoding="utf-8") as fh:
            saved = json.load(fh)
        print("\n== rolling back to the records saved %s ==" % saved.get("ts"))
        ok = True
        for name, recs in saved.get("a", {}).items():
            for rec in recs:
                good, msg = put_a(hdr, name, rec["data"], rec.get("ttl", 600))
                print("  %-5s -> %-16s %s" % (name, rec["data"], "OK" if good else msg))
                ok = ok and good
        return 0 if ok else 1

    # Back up EVERY A record before touching one, keyed by name.
    grouped = {}
    for rec in current:
        grouped.setdefault(rec.get("name", "@"), []).append(rec)
    with open(BACKUP, "w", encoding="utf-8") as fh:
        json.dump({"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "a": grouped}, fh, indent=2)
    print("\n  backed up %d A record(s) to %s" % (len(current), os.path.basename(BACKUP)))

    mx = before.get("MX")
    if mx is None:
        print("[X] the MX lookup FAILED, so this cannot prove mail is unaffected. Stopping.")
        print("    Absence of evidence is not evidence of absence, and mail is not worth guessing.")
        return 1
    if not mx:
        print("[X] this domain has NO MX record. That is not the zone this script was written for.")
        print("    Check you are pointing at the right domain before changing anything.")
        return 1
    show_preserved(hdr)

    # The OLD ttl decides how long the OLD address lingers in caches, and nothing written now can
    # shorten that. Say so plainly rather than let the operator think a slow switch is a failure.
    old_ttl = max([r.get("ttl", 3600) for r in current if r.get("name") in ("@", "www")] or [3600])
    if old_ttl > 900:
        print("\n  [!] the current A records carry a %d second (%d minute) TTL." % (old_ttl, old_ttl // 60))
        print("      Resolvers may keep serving the OLD address for that long after the change.")
        print("      For a fast switch, cancel this, run `python dnscut.py --lower-ttl`, wait that")
        print("      long, then come back. Otherwise expect a slow, harmless rollover.")

    print("\n== writing A records ==")
    ok = True
    for name in ("@", "www"):
        good, msg = put_a(hdr, name, TARGET)
        print("  %-5s -> %-16s %s" % (name, TARGET, "OK" if good else msg))
        ok = ok and good
    if not ok:
        print("[X] at least one record was refused. The backup is at %s" % BACKUP)
        return 1

    print("\n== waiting for propagation (up to 3 minutes) ==")
    for i in range(18):
        time.sleep(10)
        a_now = resolve(DOMAIN).get("A") or []
        if TARGET in a_now:
            print("  %s now resolves to %s after %ds" % (DOMAIN, TARGET, (i + 1) * 10))
            break
        print("  still %s" % (", ".join(a_now) or "unresolved"))
    else:
        print("  [!] not visible yet from this resolver. The record IS written; caches lag.")
        print("      Check again in a few minutes with: python dnscut.py --check")

    print("\n  Rollback at any time: python dnscut.py --rollback")
    return 0


if __name__ == "__main__":
    sys.exit(main())
