#!/usr/bin/env python3
"""
stagegate.py -- validate on the test droplet BEFORE production. BUILDING BLOCK of ship.py.

    deploy to staging -> smoke tests -> REBOOT it -> smoke tests again -> four-model panel
    -> GO or NO-GO. Production is not touched unless the gate says GO.

THE REBOOT IS THE WHOLE POINT. Configuration that is valid on disk and never loaded is invisible
until something restarts. On this exact host a proxy config was damaged at 16:15 and nothing broke
until a kernel patch rebooted the box at 04:22 the next morning, at which point every domain died
together. A staging environment that is never rebooted cannot find that class of fault.

THE DETERMINISTIC CHECKS DECIDE. The panel produces reasoning, dissent and a written record; it
does not hold the switch. A rate-limited model must not be able to block a good release and an
agreeable one must not be able to wave through a broken one, and both directions are asserted in
tests/test_lifecycle.py.

WITH ONE EXCEPTION, AND IT IS EARNED. If EVERY reviewer (a quorum of at least three) says NO-GO
while every deterministic check is green, the run HALTS and asks for an explicit override. That is
not deference to the models: it is the observation that a unanimous panel against a green gate has
historically meant A CHECK IS LYING. It happened on 7 August 2026 on the sibling project: all four
reviewers said NO-GO, all four named the same check, all four were right, and the release promoted
anyway with a one-line note. A single dissent never stops anything.
"""
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
STAGING = os.environ.get("STAGING_HOST", "165.245.244.174")
PROD = os.environ.get("DROPLET_HOST", "64.225.108.200")
USER = os.environ.get("DROPLET_USER", "root")
KEY = os.environ.get("SSH_KEY", "")

_TMO = ["-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
        "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=4"]
SSH = ["ssh", "-o", "StrictHostKeyChecking=accept-new", "-o", "LogLevel=ERROR"] + _TMO
if KEY and os.path.exists(KEY):
    SSH += ["-i", KEY]

_verdict = {}


def last_verdict():
    return dict(_verdict)


def ssh_script(host, script, timeout=300):
    """Run a multi-line script in ONE session.

    ONE SESSION, NOT ONE PER COMMAND. Windows OpenSSH has no connection multiplexing, and OpenSSH
    9.8 turns per-source penalties on by default and they ACCRUE, so a burst of short-lived
    connections from one address is exactly the shape both mechanisms exist to damp. Every extra
    handshake is a chance to be refused.

    Bytes, never text mode: on Windows that would rewrite every newline into CRLF and feed bash a
    script it cannot parse.
    """
    try:
        r = subprocess.run(SSH + ["%s@%s" % (USER, host), "bash -s"],
                           input=script.encode("utf-8"), timeout=timeout,
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        return r.returncode, r.stdout.decode("utf-8", "replace")
    except subprocess.TimeoutExpired:
        return 124, "timed out after %ds" % timeout
    except FileNotFoundError:
        return 127, "ssh not found on this machine"


# ---------------------------------------------------------------------------------------------
# checks
# ---------------------------------------------------------------------------------------------
SMOKE = r'''
chk() { printf 'CHECK|%s|%s|%s\n' "$1" "$2" "$3"; }

C=s4biz-web

# A BROWSER USER AGENT, FOR THE THIRD TIME IN THIS PROJECT.
#
# Plain `curl` announces itself as curl/8.x, and the bot gate answers an unrecognised agent a 404
# on every page route. So the first run of these smoke tests measured THE GATE, not the site: the
# front page came back as 22 bytes of {"detail":"not found"} and all six deep routes as 404, while
# the site was serving perfectly. /api/health passed only because /api/ is exempt from the gate.
#
# This exact blind spot has now appeared three times here: an off-box monitor that reported a
# healthy front page while getting 404 for weeks, a header check that announced itself as
# "cybergod-verify", and now this. Any probe of a PAGE route sends UA.
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
if docker ps --format '{{.Names}}' | grep -qx $C; then
  chk container yes "$(docker inspect $C -f '{{.State.Status}}, up since {{.State.StartedAt}}')"
else
  chk container no "not running"
fi

# THE APP ANSWERS. Through docker exec, because this container publishes no host port.
CODE=$(docker exec $C curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
       http://127.0.0.1:8000/api/health 2>/dev/null || echo 000)
[ "$CODE" = "200" ] && chk health yes "/api/health = 200" || chk health no "/api/health = $CODE"

# A 200 IS NOT A WORKING PAGE. An empty body answers 200 perfectly happily, and that is how a
# blank site once passed every check on this estate.
BYTES=$(docker exec $C curl -s -A "$UA" --max-time 15 http://127.0.0.1:8000/ 2>/dev/null | wc -c)
[ "$BYTES" -gt 2000 ] && chk page yes "front page $BYTES bytes" \
                      || chk page no "front page only $BYTES bytes, that is not a page"

# The shell must carry the things that make it a SITE rather than a response.
BODY=$(docker exec $C curl -s -A "$UA" --max-time 15 http://127.0.0.1:8000/ 2>/dev/null)
MISS=""
for s in '<title>' 'application/ld+json' 'rel="manifest"' 'id="root"'; do
  echo "$BODY" | grep -q "$s" || MISS="$MISS $s"
done
[ -z "$MISS" ] && chk shell yes "title, structured data, manifest and root all present" \
               || chk shell no "missing:$MISS"

# Deep routes must return the application, not a 404 from the catch-all.
BAD=""
for p in /ai /cloud /cyber /work /about /contact; do
  c=$(docker exec $C curl -s -o /dev/null -w '%{http_code}' -A "$UA" --max-time 10 \
      http://127.0.0.1:8000$p 2>/dev/null || echo 000)
  [ "$c" = "200" ] || BAD="$BAD $p=$c"
done
[ -z "$BAD" ] && chk routes yes "all six deep routes return 200" || chk routes no "$BAD"

# Scanner paths must still be refused, and the bot gate must still let Google in. Only a check
# that exercises BOTH directions proves anything.
# WITH the browser agent, deliberately. Probing /.env as `curl` would get a 404 from the BOT
# GATE, not from the path rule, and the check could not tell the two apart. A browser asking for
# /.env must still be refused, and that is the property worth asserting.
E=$(docker exec $C curl -s -o /dev/null -w '%{http_code}' -A "$UA" --max-time 10 \
    http://127.0.0.1:8000/.env 2>/dev/null || echo 000)
G=$(docker exec $C curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
    -A 'Mozilla/5.0 (compatible; Googlebot/2.1)' http://127.0.0.1:8000/ 2>/dev/null || echo 000)
X=$(docker exec $C curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
    -A 'GPTBot/1.0' http://127.0.0.1:8000/ 2>/dev/null || echo 000)
[ "$E" = "404" ] && [ "$G" = "200" ] && [ "$X" = "404" ] \
  && chk gate yes "/.env=404 googlebot=200 gptbot=404" \
  || chk gate no "/.env=$E googlebot=$G gptbot=$X"

# Headers, on the response the app actually produced.
H=$(docker exec $C curl -sI -A "$UA" --max-time 10 http://127.0.0.1:8000/ 2>/dev/null)
MISS=""
for h in content-security-policy strict-transport-security x-content-type-options referrer-policy; do
  echo "$H" | tr 'A-Z' 'a-z' | grep -q "^$h" || MISS="$MISS $h"
done
[ -z "$MISS" ] && chk headers yes "all security headers present" || chk headers no "missing:$MISS"

# The contact endpoint must REFUSE a malformed enquiry. A write path that accepts anything is not
# validated, and this is the only endpoint on the site that writes.
R=$(docker exec $C curl -s -o /dev/null -w '%{http_code}' --max-time 10 -X POST \
    -H 'Content-Type: application/json' -d '{"name":"","email":"x","message":""}' \
    http://127.0.0.1:8000/api/contact 2>/dev/null || echo 000)
[ "$R" = "400" ] && chk contact_validation yes "a malformed enquiry is refused (400)" \
                 || chk contact_validation no "malformed enquiry returned $R, expected 400"

# One network. Two makes the shared proxy dial a random address and half the requests fail.
N=$(docker inspect $C -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null)
[ "$(echo $N | wc -w)" = "1" ] && chk network yes "one network: $N" || chk network no "networks: $N"

# The container must not be root. It needs no privileged operation at runtime.
U=$(docker exec $C id -u 2>/dev/null || echo unknown)
[ "$U" != "0" ] && chk nonroot yes "runs as uid $U" || chk nonroot no "running as root"

# The log shipper, if this host has one.
if docker ps -a --format '{{.Names}}' | grep -qx s4biz-promtail; then
  S=$(docker inspect s4biz-promtail -f '{{.State.Status}}' 2>/dev/null)
  R=$(docker inspect s4biz-promtail -f '{{.RestartCount}}' 2>/dev/null)
  [ "$S" = "running" ] && [ "$R" -lt 3 ] && chk shipper yes "running, $R restarts" \
                                         || chk shipper no "status=$S restarts=$R"
else
  chk shipper skip "no log shipper on this host"
fi
'''


def parse_checks(text):
    out = []
    for ln in (text or "").splitlines():
        if ln.startswith("CHECK|"):
            p = ln.split("|", 3)
            if len(p) == 4:
                c = {"name": p[1], "ok": p[2].strip() == "yes",
                     "skip": p[2].strip() == "skip", "detail": p[3].strip()}
                word = self_contradictory(c)
                if word:
                    # DEMOTE IT. The system may well be fine; the CHECK is not, and a check whose
                    # own detail contradicts its verdict has twice been the actual defect here.
                    c["ok"] = False
                    c["detail"] = "SELF-CONTRADICTORY (%s in: %s)" % (word, c["detail"])
                out.append(c)
    return out


# Words that mean failure. A PASS whose own detail contains one of these is not a pass.
_BAD_WORDS = ("stale", "drift", "unavailable", "cannot", "failed", "broken", "missing", "error")
# ...except where the sentence is saying the bad thing did NOT happen. Without this, a check that
# reports "no drift detected" would demote itself, and a gate that cries wolf gets switched off.
_BENIGN = ("no drift", "not stale", "no silent", "nothing missing", "no error", "not broken",
           "refused", "rejected")


def self_contradictory(c):
    if not c.get("ok"):
        return ""
    d = (c.get("detail") or "").lower()
    for good in _BENIGN:
        d = d.replace(good, "")
    for w in _BAD_WORDS:
        if w in d:
            return w
    return ""


def boot_id(host):
    rc, out = ssh_script(host, "cat /proc/sys/kernel/random/boot_id\n", timeout=40)
    return out.strip().splitlines()[-1].strip() if rc == 0 and out.strip() else ""


def run(reboot_test=True):
    """Returns (gate, digest). Never raises: a broken gate must not become a broken deploy."""
    global _verdict
    _verdict = {"staging": STAGING, "checks": [], "reviews": [], "gate": "NO-GO"}
    checks = []

    print("== 1. deploy to the test droplet %s ==" % STAGING, flush=True)
    env = dict(os.environ, DROPLET_HOST=STAGING)
    rc = subprocess.call([sys.executable, os.path.join(HERE, "deploy_direct.py"), "--no-proxy"],
                         cwd=HERE, env=env)
    checks.append({"name": "staging_deploy", "ok": rc == 0, "skip": False,
                   "detail": "deploy_direct.py --no-proxy exited %d" % rc})
    if rc:
        _verdict["checks"] = checks
        _verdict["digest"] = "The staging deploy failed, so nothing was validated."
        return "NO-GO", _verdict["digest"]

    print("\n== 2. smoke tests ==", flush=True)
    _, out = ssh_script(STAGING, SMOKE, timeout=300)
    checks += parse_checks(out)

    if reboot_test:
        print("\n== 3. REBOOT the test droplet ==", flush=True)
        print("   Configuration valid on disk and never loaded is invisible until something", flush=True)
        print("   restarts. That is how a config damaged at 16:15 took every site down at 04:22.", flush=True)
        before = boot_id(STAGING)
        subprocess.run(SSH + ["%s@%s" % (USER, STAGING), "systemctl reboot"],
                       capture_output=True, timeout=30)
        back = False
        for i in range(45):
            time.sleep(6)
            after = boot_id(STAGING)
            # A TEST THAT CAN PASS WITHOUT THE EVENT HAPPENING IS NOT A TEST. Waiting for ssh to
            # answer is not enough: right after the command is issued the box is still up.
            if after and before and after != before:
                back = True
                print("   back after about %ds, boot id changed" % ((i + 1) * 6), flush=True)
                break
        checks.append({"name": "reboot", "ok": back, "skip": False,
                       "detail": "boot id changed" if back else "the boot id never changed"})
        if back:
            time.sleep(10)
            print("\n== 4. smoke tests AFTER the reboot ==", flush=True)
            _, out2 = ssh_script(STAGING, SMOKE, timeout=300)
            for c in parse_checks(out2):
                c["name"] = "post_reboot_" + c["name"]
                checks.append(c)

    ok, why = kernel_twin_check()
    checks.append({"name": "kernel_twin", "ok": ok is not False, "skip": ok is None, "detail": why})
    print("\n   %s" % why, flush=True)

    _verdict["checks"] = checks
    hard = [c for c in checks if not c["ok"] and not c.get("skip")]
    gate = "GO" if not hard else "NO-GO"

    print("\n== 5. four-model review ==", flush=True)
    reviews = ask_panel(checks, gate)
    _verdict["reviews"] = reviews
    _verdict["gate"] = gate
    _verdict["digest"] = digest(checks, reviews, gate)
    return _decide_from_verdict(_verdict)


def ask_panel(checks, gate):
    """Ask the four models on the droplet, where the inference key lives. Never raises."""
    facts = {"gate_from_deterministic_checks": gate,
             "checks": [{k: c[k] for k in ("name", "ok", "detail")} for c in checks]}
    try:
        sys.path.insert(0, HERE)
        import quorum

        rc, out = quorum.remote(json.dumps(facts), dry=True)
        for ln in out.splitlines():
            if ln.strip():
                print("   " + ln[:160], flush=True)
        return quorum.parse_reviews(out)
    except Exception as e:
        print("   [!] the panel could not be reached (%r). The gate is unaffected." % (e,))
        return []


def digest(checks, reviews, gate):
    lines = ["s4biz.io staging validation: %s" % gate, ""]
    for c in checks:
        mark = "SKIP" if c.get("skip") else ("ok  " if c["ok"] else "FAIL")
        lines.append("  %s %-28s %s" % (mark, c["name"], c["detail"][:110]))
    lines.append("")
    answered = [r for r in reviews if r.get("verdict")]
    lines.append("REVIEW PANEL (%d of 4 answered)" % len(answered))
    if len(answered) < 3:
        # A SAFEGUARD THAT CANNOT FIRE MUST ANNOUNCE IT, and here it does more than announce: below
        # quorum the promotion is REFUSED, because a record claiming a review that did not happen
        # is worse than no record.
        lines.append("  !! BELOW QUORUM: fewer than 3 of 4 answered, so this release is REFUSED.")
    for r in reviews:
        lines.append("  [%s] %-18s %s" % (r.get("role", "?"), r.get("model", "?"),
                                          r.get("verdict", "no answer")))
        for x in (r.get("risks") or [])[:2]:
            lines.append("        ! %s" % x)

    # A MINORITY DISSENT MUST BE VISIBLE WITHOUT BLOCKING. It did not stop the promotion, and it
    # should not: one model must never hold the switch. But a reviewer that raised a real problem
    # and was overruled by arithmetic is exactly the thing that gets scrolled past, so say it in
    # words rather than leaving the operator to count verdicts.
    dissent = [r for r in answered
               if str(r.get("verdict", "")).lower().replace("_", "-") == "no-go"]
    if dissent and gate == "GO":
        lines += ["", "  NOTE: %d reviewer(s) said NO-GO (%s). The gate is decided by the"
                      % (len(dissent), ", ".join(r.get("model", "?") for r in dissent)),
                  "  deterministic checks above, so this did not block the promotion, but read",
                  "  it before you promote again."]
    return "\n".join(lines)


def kernel_twin_check():
    """Do the twin and production run the SAME kernel?

    THE REBOOT TEST IS THE WHOLE REASON THE TWIN EXISTS, and it only proves something if the twin
    boots what production will boot. A staging box a kernel behind validates a state that will
    never ship, which is worse than not testing, because it reports confidence it has not earned.

    A warning, not a failure: a kernel difference is a real signal and is also normal for a day or
    two after a patch window, and a gate that fails on that gets switched off.
    """
    out = {}
    for name, host in (("staging", STAGING), ("production", PROD)):
        rc, txt = ssh_script(host, "uname -r\n", timeout=40)
        out[name] = txt.strip().splitlines()[-1].strip() if rc == 0 and txt.strip() else ""
    if not out["staging"] or not out["production"]:
        # A FAILED LOOKUP IS NOT A FINDING.
        return None, "could not read both kernels, so this is unknown rather than a mismatch"
    same = out["staging"] == out["production"]
    if same:
        return True, ("staging and production run the SAME kernel (%s), so the reboot test on the "
                      "twin is testing what will ship" % out["production"])
    return False, ("KERNEL DRIFT: staging %s, production %s. The reboot test validated a state "
                   "production will not boot." % (out["staging"], out["production"]))


def _decide_from_verdict(verdict):
    """(gate, digest) — the FINAL promotion decision. PURE: no ssh, no droplet, fully testable.

    Extracted deliberately. On the sibling project this logic lived inside a ninety line routine
    that needed two droplets to exercise, and that is precisely how a branch which turned an
    unknown answer into a PASS shipped unverified.

    UNANIMOUS PANEL DISSENT AGAINST A GREEN GATE IS ITSELF EVIDENCE. The deterministic checks still
    decide, and both failure directions are asserted by tests. But when every independent reviewer
    contradicts a green gate, the gate is the thing under suspicion, and that has to reach a human
    BEFORE production rather than in a paragraph afterwards. A quorum is three, so one dissent
    never stops a release.

    AND A PANEL THAT NEVER ANSWERED DOES NOT PASS. A release that reaches production having
    reviewed nothing, under a heading that says four models reviewed it, is worse than one with no
    panel at all: the record claims a review that did not happen. This shipped exactly once, with
    `REVIEW PANEL (0 of 4 answered)` printed directly above `GATE: GO`, because the remote script
    was broken and silence read as consent.

    So below quorum is a NO-GO. This is a DELIBERATE DEPARTURE from the sibling project, where a
    rate limit must never block a good release. The difference is that s4biz.io ships a marketing
    site a few times a week, not an engine under load, so waiting for the panel costs nothing and
    the review is the point. OVERRIDE_PANEL=1 promotes anyway, and says so in the record.
    """
    gate = verdict.get("gate", "NO-GO")
    revs = [r for r in (verdict.get("reviews") or []) if r.get("verdict")]
    override = bool(os.environ.get("OVERRIDE_PANEL"))
    verdict["below_quorum"] = len(revs) < 3
    if gate == "GO" and verdict["below_quorum"] and not override:
        verdict["gate"] = gate = "NO-GO"
        verdict["digest"] = (
            "HALTED: every deterministic check passed, but only %d of 4 reviewers answered.\n"
            "A release must not claim a four-model review that did not happen. This is almost\n"
            "always the panel PLUMBING rather than the models: run `python quorum.py --dry` to\n"
            "see the error from the droplet. To promote without a review: OVERRIDE_PANEL=1.\n\n"
            % len(revs)) + verdict.get("digest", "")
        return gate, verdict["digest"]

    dissent = [r for r in revs if str(r.get("verdict", "")).lower().replace("_", "-") == "no-go"]
    verdict["unanimous_dissent"] = bool(revs) and len(dissent) == len(revs) and len(revs) >= 3
    if gate == "GO" and verdict["unanimous_dissent"] and not override:
        names = ", ".join(str(r.get("model", "?")) for r in revs)
        verdict["gate"] = gate = "NO-GO"
        verdict["digest"] = (
            "HALTED: every deterministic check passed, but ALL %d reviewers (%s) said NO-GO.\n"
            "A unanimous panel against a green gate usually means a CHECK IS LYING rather than "
            "that the system is fine.\nRead their reasons above. To promote anyway: set "
            "OVERRIDE_PANEL=1 and re-run.\n\n" % (len(revs), names)) + verdict.get("digest", "")
    return gate, verdict.get("digest", "")


def main():
    import argparse

    ap = argparse.ArgumentParser(description="Validate a change on the test droplet.")
    ap.add_argument("--no-reboot", action="store_true", help="skip the reboot test, faster and weaker")
    a = ap.parse_args()
    gate, dg = run(reboot_test=not a.no_reboot)
    print("\n" + dg)
    print("\nGATE: %s" % gate)
    return 0 if gate == "GO" else 1


if __name__ == "__main__":
    sys.exit(main())
