#!/usr/bin/env python3
"""
ship.py -- THE one command.

    python ship.py

test -> preview check -> commit -> push -> deploy -> verify from outside -> tag a safe point.

ONE ORCHESTRATOR. ONE COMMAND. ALWAYS. Every other script here is a BUILDING BLOCK that this file
calls; they stay individually runnable for debugging and the operator should never need to. If a
reply about this project is ever about to end with two `python ...` lines, that is a defect: fold
the second one in here instead.

Flags NARROW it, they never split it:
    --test          run the checks and stop
    --stage         deploy to the staging twin first, reboot it, and only then production
    --dns           also move s4biz.io DNS from Tilda to the droplet (needs a GoDaddy key once)
    --no-preview    skip the "have you looked at it" gate, deliberately
    --rollback      reset to the last known good commit and redeploy that exact state
    -m "message"    commit message
"""
import argparse
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

HOST = os.environ.get("DROPLET_HOST", "64.225.108.200")
STAGING = os.environ.get("STAGING_HOST", "165.245.244.174")
USER = os.environ.get("DROPLET_USER", "root")
DOMAIN = "s4biz.io"

_TMO = ["-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
        "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=4"]
SSH = ["ssh", "-o", "StrictHostKeyChecking=accept-new", "-o", "LogLevel=ERROR"] + _TMO
if os.environ.get("SSH_KEY") and os.path.exists(os.environ["SSH_KEY"]):
    SSH += ["-i", os.environ["SSH_KEY"]]

# ONE browser user agent for the whole repository. The bot gate serves an unrecognised agent a 404,
# so a verifier that announces itself as a tool measures the GATE and not the site. That blind spot
# once let a front page report healthy while returning 404 for weeks.
BROWSER_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

OK, WARN, BAD = [], [], []


def say(s=""):
    print(s, flush=True)


def head(s):
    say("\n" + "=" * 74)
    say("  " + s)
    say("=" * 74)


def run(cmd, cwd=HERE, timeout=None, env=None):
    """Stream a subprocess. Returns the exit CODE (an int), not a CompletedProcess."""
    try:
        return subprocess.call(cmd, cwd=cwd, timeout=timeout, env=env)
    except subprocess.TimeoutExpired:
        say("  [X] timed out: %s" % " ".join(cmd[:4]))
        return 124
    except FileNotFoundError:
        say("  [X] not found: %s" % cmd[0])
        return 127


def capture(cmd, cwd=HERE, timeout=120):
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=timeout)
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except Exception as e:
        return 1, repr(e)


def git(*a, timeout=120):
    return capture(["git"] + list(a), timeout=timeout)


# ---------------------------------------------------------------------------------------------
# 1/6  CHECKS
# ---------------------------------------------------------------------------------------------
def do_tests():
    head("1/6  CHECKS")
    ok = True

    # Python. A test suite the operator waits through is a test suite that gets skipped, so this
    # is deliberately small and fast.
    if os.path.isdir(os.path.join(HERE, "tests")):
        rc = run([sys.executable, "-m", "pytest", "-q", "tests"], timeout=600)
        if rc == 5:
            say("  [!] pytest collected nothing")
        elif rc:
            BAD.append("python tests failed")
            ok = False
        else:
            OK.append("python tests")

    # The frontend gates run INSIDE the image at deploy time, where the toolchain is correct by
    # construction. Running them here as well is a courtesy: it is faster feedback when node
    # happens to work on this machine, and it must never BLOCK on a machine where it does not.
    fe = os.path.join(HERE, "webapp", "frontend")
    vite = os.path.join(fe, "node_modules", "vite", "bin", "vite.js")
    if os.path.exists(vite):
        for gate in ("i18n_gate.mjs", "layout_gate.mjs", "contrast_gate.mjs", "render_gate.mjs"):
            rc = run(["node", os.path.join("tools", gate)], cwd=fe, timeout=600)
            if rc == 1:
                BAD.append("frontend gate %s" % gate)
                ok = False
            elif rc == 2:
                say("  [!] %s could not run here (exit 2). It will run in the image." % gate)
            else:
                OK.append(gate)
    else:
        say("  [!] frontend dependencies are not installed here, so the gates run in the image")
        say("      only. `python preview.py` installs them if you want local feedback.")

    return ok


# ---------------------------------------------------------------------------------------------
# 2/6  DID ANYONE LOOK AT IT
# ---------------------------------------------------------------------------------------------
def do_preview_gate(skip):
    head("2/6  HAS THIS FRONTEND BEEN LOOKED AT")
    if skip:
        say("  skipped deliberately (--no-preview)")
        return True
    try:
        import ui_preview_stamp

        if ui_preview_stamp.is_current():
            say("  yes, this exact frontend was previewed")
            OK.append("preview stamp")
            return True
        say("  [X] the frontend has changed since it was last previewed.")
        say()
        say("      A gate can measure contrast, geometry and structure. It cannot SEE. Four")
        say("      colour defects have shipped past green gates in this codebase family, and")
        say("      ten seconds of looking would have caught every one.")
        say()
        say("      Run this, look at it (on your phone too), then ship:")
        say("          python preview.py")
        say()
        say("      Or override deliberately:  python ship.py --no-preview")
        return False
    except Exception as e:
        # A BROKEN GUARD MUST NEVER BECOME A BROKEN DEPLOY.
        say("  [!] the preview gate could not run (%r), continuing" % (e,))
        return True


# ---------------------------------------------------------------------------------------------
# 3/6  GIT
# ---------------------------------------------------------------------------------------------
def do_git(message):
    head("3/6  GIT")
    rc, _ = git("rev-parse", "--git-dir")
    if rc:
        say("  no git repository here, initialising one")
        run(["git", "init"])
        run(["git", "add", "-A"])
        run(["git", "commit", "-m", message or "S4Biz site: initial commit"])
        say("  [!] no remote is configured, so nothing is pushed. Add one when you have it:")
        say("      git remote add origin <url> && git push -u origin main")
        return

    _, status = git("status", "--porcelain")
    if status.strip():
        run(["git", "add", "-A"])
        rc = run(["git", "commit", "-m", message or "s4biz.io: update"])
        if rc:
            WARN.append("commit failed")
        else:
            OK.append("committed")
    else:
        say("  nothing to commit, the tree is clean")

    # ALWAYS PUSH, even when nothing new was committed.
    #
    # A push that only happens when THIS run made a commit means commits created any other way
    # never reach the remote, and the local machine silently drifts ahead of it. Push is
    # idempotent; skipping it breaks the promise that the remote is the source of truth.
    rc, out = git("remote")
    if not out.strip():
        say("  [!] no git remote configured, so there is nothing to push to yet.")
        return
    rc, _ = git("rev-parse", "--abbrev-ref", "HEAD")
    rc, ahead = git("rev-list", "--count", "@{u}..HEAD")
    if not rc and ahead.strip().isdigit() and int(ahead.strip()):
        say("  %s local commit(s) not on the remote" % ahead.strip())
    rc = run(["git", "push"], timeout=180)
    if rc:
        WARN.append("push failed (the deploy packs the local commit, so this is not fatal)")
    else:
        OK.append("pushed")


# ---------------------------------------------------------------------------------------------
# 4/6  DEPLOY
# ---------------------------------------------------------------------------------------------
def deploy(host, proxy=True):
    env = dict(os.environ)
    env["DROPLET_HOST"] = host
    cmd = [sys.executable, os.path.join(HERE, "deploy_direct.py")]
    if not proxy:
        cmd.append("--no-proxy")
    return run(cmd, timeout=1800, env=env)


def do_stage():
    head("4/6  STAGING TWIN")
    say("  deploying to %s, then REBOOTING it." % STAGING)
    say("  The reboot is the point. Configuration that is valid on disk and never loaded is")
    say("  invisible until something restarts, and that is how a latent break becomes an outage")
    say("  hours later with no obvious cause.")
    if deploy(STAGING, proxy=False):
        BAD.append("staging deploy failed")
        return False

    tgt = "%s@%s" % (USER, STAGING)
    rc, before = capture(SSH + [tgt, "cat /proc/sys/kernel/random/boot_id"], timeout=40)
    if rc:
        WARN.append("could not read the staging boot id, so the reboot cannot be proven")
        return True
    before = before.strip()
    subprocess.run(SSH + [tgt, "systemctl reboot"], capture_output=True, timeout=30)
    say("  rebooting, waiting for a NEW boot id")
    for i in range(40):
        time.sleep(6)
        rc, after = capture(SSH + [tgt, "cat /proc/sys/kernel/random/boot_id"], timeout=25)
        if not rc and after.strip() and after.strip() != before:
            say("  back after about %ds, boot id changed" % ((i + 1) * 6))
            break
    else:
        # A TEST THAT CAN PASS WITHOUT THE EVENT HAPPENING IS NOT A TEST. Waiting for ssh to answer
        # is not enough: right after the command is issued the box is still up and answers fine.
        BAD.append("staging did not reboot (the boot id never changed)")
        return False

    time.sleep(8)
    rc, out = capture(SSH + [tgt, "curl -s -o /dev/null -w '%{http_code}' --max-time 15 "
                                 "http://127.0.0.1:8091/api/health"], timeout=45)
    if "200" not in out:
        BAD.append("staging did not come back healthy after the reboot (got %s)" % out.strip()[:20])
        return False
    OK.append("staging survived a reboot")
    return True


def do_deploy():
    head("4/6  DEPLOY TO PRODUCTION")
    if deploy(HOST, proxy=True):
        BAD.append("production deploy failed")
        return False
    OK.append("deployed")
    return True


# ---------------------------------------------------------------------------------------------
# 5/6  VERIFY FROM OUTSIDE
# ---------------------------------------------------------------------------------------------
def fetch(url, ua=BROWSER_UA, timeout=20):
    import urllib.error
    import urllib.request

    req = urllib.request.Request(url, headers={"User-Agent": ua})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace"), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), dict(e.headers)
    except Exception as e:
        return 0, repr(e), {}


def do_verify():
    head("5/6  VERIFY FROM OUTSIDE")
    say("  The droplet's own monitoring sits behind the same proxy it would be monitoring, so a")
    say("  check that runs there cannot see the outage that matters. These run from here.")

    base = "https://%s" % DOMAIN
    st, body, hdrs = fetch(base + "/api/health")
    if st != 200:
        # NOT necessarily a failure: before the cutover the name still points at Tilda.
        say("  [!] %s/api/health returned %s. If DNS has not moved yet, that is expected." % (base, st))
        say("      Check with: python dnscut.py --check")
        WARN.append("the public name does not serve this site yet")
        return True

    ok = True

    # A 200 IS NOT A WORKING PAGE. A completely empty body answers 200 perfectly happily, which is
    # how a blank site once passed every check on this host.
    st, html, hdrs = fetch(base + "/")
    if st != 200 or len(html) < 800:
        BAD.append("the front page returned %s with %d bytes" % (st, len(html)))
        ok = False
    else:
        say("  front page      %s, %d bytes" % (st, len(html)))
    for must in ("<title>", "application/ld+json", 'rel="manifest"'):
        if must not in html:
            BAD.append("the served front page is missing %s" % must)
            ok = False

    # The headers we would report a customer for not having. The middleware setting them and the
    # deployed response carrying them are different claims, and a proxy sits in between.
    for h in ("Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options",
              "Referrer-Policy", "X-Frame-Options"):
        if h not in hdrs:
            BAD.append("the live response has no %s header" % h)
            ok = False
    if ok:
        say("  security headers all present")

    # The bot gate, both directions. Only a check that exercises BOTH proves anything.
    st_bad, _, _ = fetch(base + "/", ua="GPTBot/1.0")
    st_good, _, _ = fetch(base + "/", ua="Mozilla/5.0 (compatible; Googlebot/2.1; "
                                        "+http://www.google.com/bot.html)")
    say("  bot gate        GPTBot -> %s (want 404), Googlebot -> %s (want 200)" % (st_bad, st_good))
    if st_bad != 404:
        WARN.append("an unwanted crawler was NOT refused (got %s)" % st_bad)
    if st_good != 200:
        BAD.append("GOOGLEBOT was refused (got %s). The site cannot be indexed." % st_good)
        ok = False

    for p in ("/robots.txt", "/sitemap.xml", "/og.png"):
        st, b, _ = fetch(base + p)
        if st != 200:
            BAD.append("%s returned %s" % (p, st))
            ok = False
    say("  robots, sitemap and social card all served")

    # A deep route must return the app, not a 404 from the proxy.
    st, b, _ = fetch(base + "/capabilities")
    if st != 200 or "<div id=\"root\">" not in b:
        BAD.append("/capabilities did not return the application shell (%s)" % st)
        ok = False

    # And a scanner path must still be refused.
    st, _, _ = fetch(base + "/.env")
    if st != 404:
        BAD.append("/.env returned %s instead of 404" % st)
        ok = False
    else:
        say("  scanner paths   /.env -> 404")

    # www has to work too. It is a separate name on the same certificate, and a deploy that gets
    # the apex right and drops www is a real outage for anyone whose bookmark has it.
    st_www, body_www, _ = fetch("https://www.%s/" % DOMAIN)
    if st_www not in (200, 301, 302, 308):
        BAD.append("www.%s returned %s" % (DOMAIN, st_www))
        ok = False
    else:
        say("  www             %s" % st_www)

    ok = check_certificate() and ok
    return ok


def check_certificate():
    """How many days of certificate are left, measured from OUTSIDE.

    A LAPSED CERTIFICATE TAKES EVERY DOMAIN ON THE SHARED PROXY DOWN AT THE SAME INSTANT, not just
    this one. It is also the only outage that arrives on a published schedule, so there is no
    excuse for being surprised by it.

    Caddy renews at 30 days. Under 10 therefore means renewal has been failing for three weeks and
    nobody noticed. Under 7 fails the run outright.

    Stdlib only: ssl and socket. A certificate check that needs a package installed is a check
    that does not run on the machine invoking it.
    """
    import socket
    import ssl
    from datetime import datetime, timezone

    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((DOMAIN, 443), timeout=15) as sock:
            with ctx.wrap_socket(sock, server_hostname=DOMAIN) as ss:
                cert = ss.getpeercert()
        exp = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days = (exp - datetime.now(timezone.utc)).days
        names = {v for k, v in cert.get("subjectAltName", ()) if k == "DNS"}
    except Exception as e:
        # A FAILED LOOKUP IS NOT A FINDING. Report unknown and claim nothing.
        WARN.append("could not read the certificate (%r). Unknown, not necessarily expired." % (e,))
        return True

    say("  certificate     %d days left, covers %s" % (days, ", ".join(sorted(names)) or "?"))
    for want in (DOMAIN, "www." + DOMAIN):
        if want not in names:
            BAD.append("the certificate does not cover %s" % want)
            return False
    if days < 7:
        BAD.append("the certificate expires in %d days. That takes EVERY site on the shared "
                   "proxy down together, not just this one." % days)
        return False
    if days < 10:
        WARN.append("only %d days of certificate left. Caddy renews at 30, so renewal has been "
                    "failing for about three weeks." % days)
    return True


# ---------------------------------------------------------------------------------------------
# 6/6  SAFE POINT
# ---------------------------------------------------------------------------------------------
def do_tag():
    head("6/6  SAFE POINT")
    rc, _ = git("rev-parse", "--git-dir")
    if rc:
        say("  no git repository, nothing to tag")
        return ""
    stamp = time.strftime("good-%Y%m%d-%H%M%S", time.gmtime())
    git("tag", "-f", "last-known-good")
    git("tag", stamp)
    rc, out = git("remote")
    if out.strip():
        git("push", "-f", "origin", "last-known-good", timeout=120)
        git("push", "origin", stamp, timeout=120)
    say("  tagged %s and moved last-known-good" % stamp)
    say("  undo everything with: python ship.py --rollback")
    return stamp


def do_rollback(target):
    head("ROLLBACK")
    ref = target if target and target != "last-known-good" else "last-known-good"
    rc, _ = git("rev-parse", ref)
    if rc:
        sys.exit("[X] there is no tag called %s" % ref)
    say("  parking any local mess in git stash")
    git("stash", "push", "-u", "-m", "ship.py rollback")
    rc = run(["git", "reset", "--hard", ref])
    if rc:
        sys.exit("[X] could not reset to %s" % ref)
    say("  reset to %s, redeploying that exact state" % ref)
    if deploy(HOST, proxy=True):
        sys.exit("[X] the rollback deploy failed")
    say("  rolled back.")


# ---------------------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Ship s4biz.io. One command.")
    ap.add_argument("--test", action="store_true", help="run the checks and stop")
    ap.add_argument("--stage", action="store_true", help="validate on the staging twin first")
    ap.add_argument("--dns", action="store_true", help="also move DNS from Tilda to the droplet")
    ap.add_argument("--no-preview", action="store_true", help="skip the have-you-looked gate")
    ap.add_argument("--rollback", nargs="?", const="last-known-good", default=None)
    ap.add_argument("-m", "--message", default="", help="commit message")
    a = ap.parse_args()

    t0 = time.time()
    if a.rollback is not None:
        do_rollback(a.rollback)
        return 0

    if not do_tests():
        say("\n[X] checks failed. Nothing was deployed.")
        return 1
    if a.test:
        say("\nchecks only. Nothing was deployed.")
        return 0

    if not do_preview_gate(a.no_preview):
        return 2

    do_git(a.message)

    if a.stage and not do_stage():
        say("\n[X] the staging twin did not validate, so PRODUCTION WAS NOT TOUCHED.")
        return 2

    if not do_deploy():
        return 1

    # Reuse the secrets already on the droplet rather than minting or pasting anything. Runs AFTER
    # the deploy because the target directory has to exist and the container has to be there to
    # re-read the file. NON-BLOCKING: an enquiry is written to disk before any delivery is tried,
    # so a missing mail credential costs a notification, never a lead.
    head("4b/6  SECRETS")
    rc = run([sys.executable, os.path.join(HERE, "import_secrets.py")], timeout=300)
    if rc == 0:
        OK.append("secrets reused from the shared droplet store")
    elif rc == 2:
        WARN.append("mail and Telegram credentials not imported; enquiries still record to disk")
    else:
        WARN.append("the secret import reported a problem")

    verified = do_verify()

    if a.dns:
        head("DNS CUTOVER")
        rc = run([sys.executable, os.path.join(HERE, "dnscut.py"), "--apply"], timeout=600)
        if rc == 2:
            WARN.append("DNS not moved: no GoDaddy key yet (the two manual records were printed)")
        elif rc:
            WARN.append("the DNS cutover reported a problem")
        else:
            OK.append("DNS moved to the droplet")
            # Re-verify: the name now points somewhere new, so the earlier result is stale.
            verified = do_verify() and verified

    tag = do_tag() if verified else ""

    head("SUMMARY  (%ds)" % int(time.time() - t0))
    for x in OK:
        say("  OK    %s" % x)
    for x in WARN:
        say("  [!]   %s" % x)
    for x in BAD:
        say("  [X]   %s" % x)
    if BAD:
        say("\nFINISHED WITH FAILURES. The site may be live but something above is wrong.")
        return 1
    say("\n%s  https://%s%s" % ("LIVE:" if verified else "DEPLOYED:", DOMAIN,
                                ("   safe point %s" % tag) if tag else ""))
    if WARN:
        say("Finished with warnings. Read them.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
