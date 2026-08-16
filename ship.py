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
    --no-stage      skip the test droplet, deliberately
    --fast-stage    validate on the test droplet but skip the reboot (weaker)
    --dns           also move s4biz.io DNS from Tilda to the droplet (needs a GoDaddy key once)
    --no-preview    skip the "have you looked at it" gate, deliberately
    --rollback      reset to the last known good commit and redeploy that exact state
    -m "message"    commit message
"""
import argparse
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

HOST = os.environ.get("DROPLET_HOST", "64.225.108.200")
STAGING = os.environ.get("STAGING_HOST", "165.245.244.174")

# Carried from the safe-point step to the release notes. PREV_GOOD is where last-known-good
# pointed BEFORE this run moved it, which is the only honest baseline for "what is new".
PREV_GOOD = ""
STAGING_DIGEST = ""
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
    head("1/8  CHECKS")
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
    head("2/8  HAS THIS FRONTEND BEEN LOOKED AT")
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
REMOTE_URL = os.environ.get("S4_GIT_REMOTE", "https://github.com/feranicus/s4biz.git")


def do_git(message):
    head("3/8  GIT: GITHUB IS THE SOURCE OF TRUTH")

    # A STALE LOCK SILENTLY STOPS EVERY COMMIT, AND THE DEPLOY THEN SHIPS OLD CODE.
    #
    # git leaves .git/index.lock behind when a process is killed, and every later `git add` fails
    # with "Another git process seems to be running". ship.py reported "commit failed" as a
    # warning and carried on, and because the deploy packs the COMMIT rather than the working
    # tree, two runs shipped code that no longer matched the repository. The panel fix in
    # particular was written, tested, and never left this machine.
    #
    # Only remove it when nothing is actually holding it: a lock younger than two minutes might be
    # a real concurrent git, and deleting that would corrupt an index.
    lock = os.path.join(HERE, ".git", "index.lock")
    if os.path.exists(lock):
        age = time.time() - os.path.getmtime(lock)
        if age > 120:
            try:
                os.remove(lock)
                say("  removed a stale index.lock (%d minutes old, no git was running)" % (age // 60))
            except OSError as e:
                BAD.append("could not remove the stale git lock: %r" % (e,))
        else:
            BAD.append("git is locked by another process (%ds old). Wait, then re-run." % age)
            return

    rc, _ = git("rev-parse", "--git-dir")
    if rc:
        say("  no git repository here, initialising one")
        run(["git", "init"])
        run(["git", "add", "-A"])
        run(["git", "commit", "-m", message or "S4Biz site: initial commit"])

    # THE REMOTE IS CONFIGURED HERE, NOT BY HAND.
    #
    # A repository whose remote depends on somebody remembering a one-off command is a repository
    # that silently stops being backed up. If it is missing, add it; if it points somewhere else,
    # say so rather than overwrite, because that is a decision the operator has to make.
    rc, cur = git("remote", "get-url", "origin")
    if rc or not cur.strip():
        say("  adding origin -> %s" % REMOTE_URL)
        git("remote", "add", "origin", REMOTE_URL)
    elif cur.strip() != REMOTE_URL:
        WARN.append("origin is %s, not %s. Left alone." % (cur.strip(), REMOTE_URL))

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
    branch = (git("rev-parse", "--abbrev-ref", "HEAD")[1] or "master").strip()
    rc, ahead = git("rev-list", "--count", "@{u}..HEAD")
    if not rc and ahead.strip().isdigit() and int(ahead.strip()):
        say("  %s local commit(s) not yet on GitHub" % ahead.strip())

    say("  pushing %s to origin" % branch)
    rc = run(["git", "push", "-u", "origin", branch], timeout=300)
    if rc:
        # NOT FATAL, but loud. The deploy packs the local COMMIT, so production still gets exactly
        # what was tested. What is lost is the backup and the shared history, which matters the day
        # this machine dies rather than today.
        BAD.append("the push to GitHub FAILED. The code exists only on this machine.")
        say()
        say("      GitHub is meant to be the source of truth, and right now it is not.")
        say("      Usually this is authentication. Either:")
        say("          gh auth login                      (then re-run)")
        say("          git push -u origin %s      (to see the real error)" % branch)
    else:
        OK.append("pushed to GitHub")


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


def do_stage(fast=False):
    """The test droplet. DEFAULT, not optional.

    Deploy, smoke test, REBOOT, smoke test again, then four models review the result. Production
    is not touched unless the gate says GO. All of that lives in stagegate.py, which is a pure
    decision function plus some ssh; this only reports and decides what to do next.
    """
    head("4/8  TEST DROPLET  %s" % STAGING)
    try:
        sys.path.insert(0, HERE)
        import stagegate

        gate, dg = stagegate.run(reboot_test=not fast)
    except Exception as e:
        # A BROKEN GATE MUST NOT BECOME A BROKEN DEPLOY, but it must not silently wave things
        # through either. Report it and stop: this is the step that protects production.
        BAD.append("the staging gate could not run (%r)" % (e,))
        return False

    global STAGING_DIGEST
    STAGING_DIGEST = dg
    say()
    say(dg)
    say()
    say("  GATE: %s" % gate)
    if gate != "GO":
        BAD.append("the test droplet said %s, so PRODUCTION WAS NOT TOUCHED" % gate)
        return False
    OK.append("validated on the test droplet, including a reboot")
    return True


def do_deploy():
    head("5/8  DEPLOY TO PRODUCTION")
    if deploy(HOST, proxy=True):
        BAD.append("production deploy failed")
        return False
    OK.append("deployed")
    return True


# ---------------------------------------------------------------------------------------------
# 5/6  VERIFY FROM OUTSIDE
# ---------------------------------------------------------------------------------------------
def fetch(url, ua=BROWSER_UA, timeout=20, follow=True):
    """follow=False is how a REDIRECT can be seen at all.

    urllib follows redirects silently, so a check that wants to assert "www sends a 301 to the
    apex" would only ever observe the apex's 200 and could never fail. A no-redirect opener makes
    urllib raise on the 3xx, which the handler below already turns into (code, body, headers) —
    and the Location header is the thing being asserted.
    """
    import urllib.error
    import urllib.request

    req = urllib.request.Request(url, headers={"User-Agent": ua})
    opener = urllib.request.urlopen
    if not follow:
        class _NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None

        opener = urllib.request.build_opener(_NoRedirect).open
    try:
        with opener(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace"), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), dict(e.headers)
    except Exception as e:
        return 0, repr(e), {}


def do_verify():
    head("7/8  VERIFY FROM OUTSIDE")
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
    # www REDIRECTS to the apex; it does not serve. One canonical host, matching the canonical tag
    # and the sitemap. Asserting the exact status rather than "any of four" is what stops the
    # monitors describing a behaviour nobody decided.
    st_www, _body_www, hdr_www = fetch("https://www.%s/" % DOMAIN, follow=False)
    loc = ""
    for k, v in (hdr_www or {}).items():
        if k.lower() == "location":
            loc = v
    if st_www != 301:
        BAD.append("www.%s returned %s, expected a 301 to the apex" % (DOMAIN, st_www))
        ok = False
    elif DOMAIN not in loc or loc.startswith("https://www."):
        BAD.append("www.%s redirects to %r, which is not the apex" % (DOMAIN, loc))
        ok = False
    else:
        say("  www             301 -> %s" % loc)

    ok = check_certificate() and ok
    return ok


def check_certificate():
    """How many days of certificate are left, measured from OUTSIDE, PER HOSTNAME.

    A LAPSED CERTIFICATE TAKES EVERY DOMAIN ON THE SHARED PROXY DOWN AT THE SAME INSTANT, not just
    this one. It is also the only outage that arrives on a published schedule.

    ONE CERTIFICATE PER HOSTNAME. Caddy's automatic issuance obtains a SEPARATE certificate for
    each name it serves, so `s4biz.io` and `www.s4biz.io` have their own. The first version of this
    check read the apex certificate and asserted it also covered www, which is not how Caddy works:
    it failed the deploy while the browser was loading www over TLS with no warning at all. The
    site was correct and the check was wrong. Each name is now connected to and judged on its own.

    Caddy renews at 30 days, so under 10 means renewal has been failing for about three weeks.
    Under 7 fails the run.

    Stdlib only. A certificate check that needs a package installed is a check that does not run on
    the machine invoking it.
    """
    import socket
    import ssl
    from datetime import datetime, timezone

    ok = True
    for host in (DOMAIN, "www." + DOMAIN):
        try:
            ctx = ssl.create_default_context()
            with socket.create_connection((host, 443), timeout=15) as sock:
                with ctx.wrap_socket(sock, server_hostname=host) as ss:
                    cert = ss.getpeercert()
            exp = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
            exp = exp.replace(tzinfo=timezone.utc)
            days = (exp - datetime.now(timezone.utc)).days
            names = {v for k, v in cert.get("subjectAltName", ()) if k == "DNS"}
        except Exception as e:
            # A FAILED LOOKUP IS NOT A FINDING. Report unknown and claim nothing.
            WARN.append("could not read the certificate for %s (%r). Unknown, not expired." % (host, e))
            continue

        # The name we asked for must be on the certificate we were given. That is the real
        # question, and it is answered per connection rather than by assuming a shared SAN list.
        covered = host in names or any(
            n.startswith("*.") and host.endswith(n[1:]) for n in names
        )
        say("  certificate     %-14s %3d days, covers %s" % (host, days, ", ".join(sorted(names))))
        if not covered:
            BAD.append("the certificate served for %s does not cover that name" % host)
            ok = False
        elif days < 7:
            BAD.append("%s expires in %d days. That takes EVERY site on the shared proxy down "
                       "together, not just this one." % (host, days))
            ok = False
        elif days < 10:
            WARN.append("%s has only %d days left. Caddy renews at 30, so renewal has been "
                        "failing for about three weeks." % (host, days))
    return ok


# ---------------------------------------------------------------------------------------------
# 6/6  SAFE POINT
# ---------------------------------------------------------------------------------------------
def do_tag():
    head("8/8  SAFE POINT")
    rc, _ = git("rev-parse", "--git-dir")
    if rc:
        say("  no git repository, nothing to tag")
        return ""
    stamp = time.strftime("good-%Y%m%d-%H%M%S", time.gmtime())
    # REMEMBER WHERE last-known-good POINTED BEFORE WE MOVE IT.
    #
    # The release notes run AFTER this, and they describe "what changed since the last state that
    # actually reached production". Moving the tag first makes that range `HEAD..HEAD`, i.e. empty,
    # so the panel was handed an empty diffstat and three models correctly answered UNSURE and said
    # they had been given nothing to review. They were right: they had not.
    global PREV_GOOD
    rc, prev = git("rev-parse", "last-known-good^{commit}")
    if not rc:
        PREV_GOOD = prev.strip()
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
    # STAGING IS THE DEFAULT. Opting IN to validation means it is skipped on exactly the run that
    # was in a hurry, which is the run that needed it. Skipping is now a deliberate, named act.
    ap.add_argument("--no-stage", action="store_true",
                    help="skip the test droplet entirely, deliberately")
    ap.add_argument("--fast-stage", action="store_true",
                    help="validate on the test droplet but skip the reboot (weaker, say so)")
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

    if a.no_stage:
        WARN.append("the test droplet was SKIPPED deliberately (--no-stage)")
        say("\n  [!] skipping the test droplet. Production is the first place this runs.")
    elif not do_stage(fast=a.fast_stage):
        say("\n[X] the test droplet did not validate, so PRODUCTION WAS NOT TOUCHED.")
        say("    Read the checks above. If a CHECK is the thing that is wrong, fix the check.")
        return 2
    if a.fast_stage:
        WARN.append("the reboot test was skipped (--fast-stage), which is the weaker validation")

    if not do_deploy():
        return 1

    # Reuse the secrets already on the droplet rather than minting or pasting anything. Runs AFTER
    # the deploy because the target directory has to exist and the container has to be there to
    # re-read the file. NON-BLOCKING: an enquiry is written to disk before any delivery is tried,
    # so a missing mail credential costs a notification, never a lead.
    head("6/8  SECRETS")
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

    # LAST, AND IT CANNOT FAIL THE SHIP. The deploy has already happened and already verified, so
    # the panel is commenting on a decision rather than making one. A rate-limited model must not
    # be able to block a good release, and an agreeable one must not be able to wave through a
    # broken one; both directions are failures, and only the deterministic checks above decide.
    head("RELEASE NOTES")
    try:
        # GIVE THE PANEL THE EVIDENCE. It was previously handed a commit sha, an empty diffstat and
        # nothing else, and then asked whether the release was sound. Every model said UNSURE and
        # named the same gap. A reviewer with no evidence is not a reviewer.
        run([sys.executable, os.path.join(HERE, "quorum.py")], timeout=480,
            env={**os.environ,
                 "S4_GATES": "ok" if not BAD else "failed",
                 "S4_BASE": PREV_GOOD,
                 "S4_FACTS": json.dumps({
                     "gates": "%d passed, %d failed" % (len(OK), len(BAD)),
                     "tests": "passed" if "python tests" in OK else "did not pass",
                     "deploy": "deployed" if "deployed" in OK else "not deployed",
                     "verify": "verified from outside the droplet"
                               if verified else "NOT verified from outside",
                     "staging": STAGING_DIGEST[:2500] or "not run",
                     "passed": OK, "failed": BAD,
                 }),
                 "DROPLET_HOST": HOST})
    except Exception as e:
        say("  [!] the review could not run (%r). The release is unaffected." % (e,))

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
