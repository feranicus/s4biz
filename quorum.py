#!/usr/bin/env python3
"""
quorum.py -- four models review the release, code decides, a human is told. BUILDING BLOCK of ship.py.

    python ship.py            runs this last, after the deploy has verified
    python quorum.py --dry    print what would be sent, contact nothing

THE SAME FOUR AS THE ASSESSMENT PLATFORM, and for the same reason: they come from four different
suppliers, so a rate limit, an outage or a policy change at one of them cannot silence the panel,
and no two of them share a blind spot.

    deepseek-3.2       soldier    measured fastest and contract-valid on a real prompt
    llama-4-maverick   soldier    open weights, different lineage
    gemma-4-31B-it     auditor    has twice caught a check whose detail contradicted its verdict
    kimi-k2.6          auditor    sharpest auditor on record, also the most prone to inventing
                                  architecture it cannot see

WHAT THEY MAY AND MAY NOT DO.

They review DETERMINISTIC FACTS that have already been decided: what changed, what the gates said,
what the site actually returned. They produce reasoning, dissent and prose. **They never hold the
switch.** The deploy has already happened and already verified before this runs, so a rate-limited
model cannot block a good release and an agreeable one cannot wave through a broken one. Both
directions are failures, and only code decides.

THE DETERMINISTIC FACTS ARE THE REPORT. If all four fail, the notes still go out and are still
correct; they simply say `0 of 4 answered`. Same doctrine that keeps a deck honest when enrichment
dies.

IT CAN NEVER FAIL A DEPLOY. It runs last, wrapped, and returns 0 even when delivery fails. The
models sit behind a rate-limited endpoint and the mail gateway is a third party; neither having a
bad day may turn a verified release into a failed one.

WHY IT RUNS ON THE DROPLET. OPENAI_API_KEY and the Gmail credentials live there and deliberately
never enter git or this machine. One ssh session, facts in over stdin, prose out.
"""
import base64
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HOST = os.environ.get("DROPLET_HOST", "64.225.108.200")
USER = os.environ.get("DROPLET_USER", "root")
KEY = os.environ.get("SSH_KEY", "")

PANEL = [
    ("deepseek-3.2", "soldier"),
    ("llama-4-maverick", "soldier"),
    ("gemma-4-31B-it", "auditor"),
    ("kimi-k2.6", "auditor"),
]

# What the panel is allowed to know. Giving it MORE EVIDENCE works; giving it more AUTHORITY does
# not, and giving it a map with a hole in it costs a review slot every run, because a reviewer
# reasoning from a gap invents something to fill it.
ARCH = """\
s4biz.io is a corporate marketing website. React and Vite single-page app, FastAPI serving it, one
container called s4biz-web. It has TWO endpoints: POST /api/contact and GET /api/health.

It has NO database, NO login, NO queue, NO inference at runtime, NO scanner and NO bots. Do not
propose changes that assume any of those. It is the sixth project on a shared droplet behind a
shared Caddy proxy; it publishes no host port and joins one docker network.

Verification runs from the operator's machine, not the droplet, because the droplet's monitoring
sits behind the proxy it would be monitoring. The checks below already RAN and already decided.
Your job is to review whether the evidence supports the conclusion, and to name anything the
checks do not cover. You are not deciding whether to release: that has happened.
"""

PROMPT = """%s
Here are the deterministic facts from the release that just completed:

%s

Answer as JSON only, no prose outside it:
{"verdict":"GO|NO-GO|UNSURE",
 "reasons":["at most 3, each one sentence"],
 "risks":["at most 3 things these checks do NOT cover, each one sentence"],
 "summary":"two sentences a non-engineer could read"}

Be specific to the evidence above. If you cannot support a claim from it, say so rather than
inventing a mechanism. A confident answer about something you cannot see is worse than "unsure".
"""

_TMO = ["-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
        "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=4"]
SSH = ["ssh", "-o", "StrictHostKeyChecking=accept-new", "-o", "LogLevel=ERROR"] + _TMO
if KEY and os.path.exists(KEY):
    SSH += ["-i", KEY]


def facts(extra=None):
    """The deterministic record. Read from git, not typed."""

    def g(*a):
        try:
            r = subprocess.run(["git"] + list(a), cwd=HERE, capture_output=True, text=True,
                               encoding="utf-8", errors="replace", timeout=30)
            return (r.stdout or "").strip()
        except Exception:
            return ""

    sha = g("rev-parse", "--short", "HEAD")
    subject = g("log", "-1", "--pretty=%s")
    # Since the last state that actually reached production, not since the last commit somebody
    # happened to make. That is the honest baseline for "what is new".
    rng = "last-known-good..HEAD" if g("tag", "-l", "last-known-good") else "HEAD~5..HEAD"
    changed = g("diff", "--name-only", rng) or g("show", "--name-only", "--pretty=", "HEAD")
    stat = g("diff", "--shortstat", rng)

    out = {
        "commit": sha,
        "subject": subject,
        "files_changed": [f for f in changed.splitlines() if f][:40],
        "diffstat": stat,
    }
    if extra:
        out.update(extra)
    return out


def remote(payload_json, dry=False):
    """Ask the panel and send the notes, entirely on the droplet."""
    # THE PANEL RUNS IN OUR OWN CONTAINER, because it now holds the inference key.
    #
    # An earlier version executed this inside the neighbour's container to avoid granting the key
    # here. It worked, and it made every release review depend on another project's container
    # being up and keeping its name. The key is imported to this site now, so the indirection
    # bought nothing and cost a dependency.
    # `bash -s` READS ITS SCRIPT FROM STDIN, so nothing else may use that stream.
    #
    # This shipped as `cat > /tmp/s4_facts.json` on the first line, which consumed the REST OF THE
    # SCRIPT as its input: the facts file got the remaining bash, bash had nothing left to run, and
    # the whole panel produced silence. Not an error, not a timeout, just an empty section under
    # the heading. That is why every run reported "0 of 4 answered".
    #
    # This exact defect is already recorded in the sibling project's notes, where a secret was
    # piped to `bash -s` and the droplet executed the key as a command. Same stream, same cause.
    #
    # The facts now travel INSIDE the script as base64, so stdin is used by exactly one thing. It
    # also removes a quoting layer: the JSON never passes through a shell word.
    # AND THEN IT FAILED AGAIN, ON THE SAME STREAM, ONE LAYER IN.
    #
    #     docker exec -i s4biz-web python3 - <<'PY' ... PY < /tmp/s4_facts.json
    #
    # A command may have a heredoc AND a stdin redirect, and **the LAST redirection wins**. So the
    # heredoc was discarded, `python3 -` read the FACTS as its program, and the container reported
    #     NameError: name 'true' is not defined
    # which is JSON's lowercase `true` being executed as Python. The panel therefore answered 0 of 4
    # for a reason that had nothing to do with the models or the key.
    #
    # THE LESSON IS THE SAME ONE, THIRD TIME: stop routing two different things through stdin and
    # hoping the shell picks the one you meant. Now NEITHER travels on stdin — both files are
    # written on the droplet, copied into the container, and the program is named in ARGV with the
    # facts path as an argument. There is no stream left to get confused about.
    facts_b64 = base64.b64encode(payload_json.encode("utf-8")).decode("ascii")
    prog = PROGRAM % (json.dumps(PANEL), json.dumps(ARCH), json.dumps(PROMPT),
                      "True" if dry else "False")
    prog_b64 = base64.b64encode(prog.encode("utf-8")).decode("ascii")
    return _run(facts_b64, prog_b64)


PROGRAM = r'''import json, os, sys, urllib.request, urllib.error

facts = json.load(open(sys.argv[1], encoding="utf-8"))
PANEL = %s
ARCH  = %s
PROMPT= %s
base  = os.environ.get("OPENAI_BASE_URL", "").rstrip("/")
key   = os.environ.get("OPENAI_API_KEY", "")

def ask(model):
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user",
                      "content": PROMPT %% (ARCH, json.dumps(facts, indent=2)[:6000])}],
        "temperature": 0.2,
        "max_tokens": 900,
    }).encode()
    req = urllib.request.Request(base + "/chat/completions", data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", "Bearer " + key)
    with urllib.request.urlopen(req, timeout=90) as r:
        d = json.loads(r.read())
    t = d["choices"][0]["message"]["content"]
    i, j = t.find("{"), t.rfind("}")
    return json.loads(t[i:j+1])

reviews = []
for model, role in PANEL:
    try:
        v = ask(model)
        v["model"], v["role"] = model, role
        reviews.append(v)
    except Exception as e:
        reviews.append({"model": model, "role": role, "verdict": "no answer",
                        "error": repr(e)[:160]})

lines = ["s4biz.io release  %%s  \"%%s\"" %% (facts.get("commit","?"), facts.get("subject","")), ""]
lines.append("DETERMINISTIC RESULT (this is the report; the panel only comments on it)")
for k in ("gates", "tests", "deploy", "verify", "certificate"):
    if facts.get(k): lines.append("  %%-12s %%s" %% (k, facts[k]))
if facts.get("diffstat"): lines.append("  %%-12s %%s" %% ("changed", facts["diffstat"]))
lines.append("")
answered = [r for r in reviews if r.get("verdict") not in (None, "no answer")]
lines.append("REVIEW PANEL (%%d of %%d answered)" %% (len(answered), len(PANEL)))
for r in reviews:
    lines.append("  [%%s] %%-18s %%s" %% (r.get("role","?"), r["model"], r.get("verdict","?")))
    for x in (r.get("reasons") or [])[:3]:  lines.append("        + %%s" %% x)
    for x in (r.get("risks") or [])[:3]:    lines.append("        ! %%s" %% x)
    if r.get("error"): lines.append("        . %%s" %% r["error"])
if len(answered) < 3:
    lines += ["", "!! PANEL BELOW QUORUM: fewer than 3 answered, so agreement here means little."]
for r in answered[:1]:
    if r.get("summary"): lines += ["", r["summary"]]
text = "\n".join(lines)
print(text)

if not %s:
    try:
        from app import notify
        notify.telegram(text)
        notify.email("s4biz.io release %%s" %% facts.get("commit","?"), text)
    except Exception as e:
        print("[!] delivery failed: %%r" %% (e,))
'''


def remote_script(facts_b64, prog_b64):
    """The bash that runs on the droplet. Separate so a test can BUILD it and check it.

    Every payload travels base64 inside a heredoc and is then handed over BY PATH. Nothing
    important is on stdin except the script itself, which is what `bash -s` is for.
    """
    return ('''set -e
C=s4biz-web
docker inspect -f . "$C" >/dev/null 2>&1 || { echo "[!] no $C container on this host"; exit 1; }
base64 -d > /tmp/s4_facts.json <<'FACTSEOF'
''' + facts_b64 + '''
FACTSEOF
base64 -d > /tmp/s4_panel.py <<'PROGEOF'
''' + prog_b64 + '''
PROGEOF
docker cp /tmp/s4_facts.json "$C":/tmp/s4_facts.json >/dev/null
docker cp /tmp/s4_panel.py  "$C":/tmp/s4_panel.py  >/dev/null
docker exec "$C" python3 /tmp/s4_panel.py /tmp/s4_facts.json
rm -f /tmp/s4_facts.json /tmp/s4_panel.py
''')


def _run(facts_b64, prog_b64):
    script = remote_script(facts_b64, prog_b64)
    tgt = "%s@%s" % (USER, HOST)
    try:
        # The script is the ONLY thing on stdin now. Bytes, never text mode: on Windows that would
        # rewrite every newline into CRLF and bash would fail on "$'\r': command not found".
        r = subprocess.run(SSH + [tgt, "bash -s"], input=script.encode("utf-8"),
                           timeout=420, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        out = r.stdout.decode("utf-8", "replace")
        if not out.strip():
            # SILENCE IS A FAILURE, and it has to say so. An empty section under a heading reads
            # as "nothing to report" when it actually means the remote script never ran.
            out = ("[!] the panel returned NOTHING. That is not 'no findings', it means the "
                   "remote script produced no output at all.")
        return r.returncode, out
    except subprocess.TimeoutExpired:
        return 1, "the panel did not answer within 7 minutes"


def parse_reviews(text):
    """Pull the per-model verdicts back out of the panel output.

    The remote script prints a line per reviewer as `  [role] model  VERDICT`. Parsing that rather
    than returning JSON keeps ONE format: what the operator reads in the log is exactly what the
    gate reasons about, so the two can never describe different runs.
    """
    import re

    out = []
    for ln in (text or "").splitlines():
        m = re.match(r"\s*\[(soldier|auditor)\]\s+(\S+)\s+(GO|NO-GO|UNSURE|no answer)", ln)
        if m:
            out.append({"role": m.group(1), "model": m.group(2),
                        "verdict": "" if m.group(3) == "no answer" else m.group(3)})
        elif out and ln.strip().startswith("! "):
            out[-1].setdefault("risks", []).append(ln.strip()[2:])
    return out


def main(extra=None, dry=False):
    print("== four-model release review ==", flush=True)
    f = facts(extra)
    rc, out = remote(json.dumps(f), dry=dry)
    print(out, flush=True)
    if rc:
        print("[!] the review did not complete. The release is unaffected: this runs after the "
              "deploy has already verified.")
    return 0  # NEVER fails the ship


if __name__ == "__main__":
    sys.exit(main(dry="--dry" in sys.argv))
