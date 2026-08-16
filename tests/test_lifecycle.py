# -*- coding: utf-8 -*-
"""The release lifecycle: GitHub is the source of truth, and production is never first.

    checks -> preview -> commit and PUSH -> TEST DROPLET (deploy, smoke, reboot, smoke, panel)
    -> production -> secrets -> verify from outside -> safe point -> release notes

Every assertion here traces to a way this has gone wrong on the sibling project, on the same host.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)


def read(*p):
    return open(os.path.join(*p), encoding="utf-8").read()


def code_only(src):
    src = re.sub(r'"""[\s\S]*?"""', "", src)
    return "\n".join(ln for ln in src.splitlines() if not ln.lstrip().startswith("#"))


# ---- the order of the pipeline ---------------------------------------------------------------
def test_production_is_never_the_first_place_a_change_runs():
    """Staging must be the DEFAULT. Opting IN to validation means it is skipped on exactly the run
    that was in a hurry, which is the run that needed it."""
    ship = code_only(read(ROOT, "ship.py"))
    assert "--no-stage" in ship, "there is no way to skip staging, so it cannot be the default"
    assert '"--stage"' not in ship, (
        "staging is opt-in again. It must be the default and skipping must be the deliberate act."
    )
    stage = ship.index("do_stage(")
    deploy = ship.index("do_deploy()")
    assert stage < deploy, "the test droplet must be validated before production is touched"


def test_the_push_happens_before_anything_is_deployed():
    """GitHub is the source of truth. If the machine dies mid-deploy, the code has to exist
    somewhere else already."""
    ship = code_only(read(ROOT, "ship.py"))
    assert ship.index("do_git(") < ship.index("do_deploy()")
    assert 'git", "push"' in ship or '"push", "-u", "origin"' in ship


def test_a_failed_push_is_reported_as_a_failure():
    """It used to be a warning. A repository that exists only on one laptop is not backed up, and
    the day that matters is not today."""
    ship = read(ROOT, "ship.py")
    i = ship.index('run(["git", "push"')
    window = ship[i:i + 900]
    assert "BAD.append" in window, (
        "a failed push is still only a warning. GitHub being the source of truth is either true "
        "or it is not."
    )


def test_a_stale_git_lock_is_cleared_so_the_commit_cannot_silently_fail():
    """A LEFTOVER index.lock STOPS EVERY COMMIT, AND THE DEPLOY THEN SHIPS OLD CODE.

    git leaves .git/index.lock behind when a process is killed. `git add` then fails with "Another
    git process seems to be running", ship.py logged "commit failed" as a warning and carried on,
    and because the deploy packs the COMMIT rather than the working tree, two consecutive runs
    shipped code that no longer matched the repository. The panel fix in particular was written,
    tested and never left the machine.

    A lock younger than two minutes is left alone: it might be a real concurrent git, and deleting
    that would corrupt an index.
    """
    ship = code_only(read(ROOT, "ship.py"))
    assert "index.lock" in ship, "nothing handles a stale git lock"
    assert "os.remove(lock)" in ship, "the stale lock is detected and never removed"
    assert "getmtime" in ship, (
        "the lock is removed without checking its AGE, so a real concurrent git would be killed"
    )
    # BOTH failure paths, not "a BAD.append appears somewhere nearby". There are two ways this can
    # go wrong (the lock cannot be removed, and the lock is too young to touch) and a window check
    # is satisfied by either one, so a mutation that demoted the second was not caught.
    i = ship.index("index.lock")
    window = ship[i:i + 1400]
    assert window.count("BAD.append") >= 2, (
        "a git lock that cannot be cleared must FAIL the run on BOTH paths, not warn. A failed "
        "commit means the deploy ships a different commit than the one just tested, which is "
        "exactly how a fix was written, tested and never shipped, twice."
    )
    # NOT "no WARN.append in the window": the same function legitimately warns about an unexpected
    # git remote a few lines later, and asserting its absence failed a correct file. Count the
    # failures instead of forbidding a warning that belongs to a different concern.


def test_the_secret_script_actually_builds():
    """It crashed on a live run with "not enough arguments for format string".

    The verification block is ONE %-formatted expression, and a literal % in a bash printf inside
    it has to be doubled or Python tries to substitute it. The whole secrets step died, and
    nothing caught it because no test had ever called the function. Building the string IS the
    test: a parse proves nothing about a format.
    """
    import import_secrets

    for show in (True, False):
        s = import_secrets.remote_script(show)
        assert len(s) > 500, "the remote script is suspiciously short"
        assert "printf" in s

    # And the allow-list must actually reach the script it generates, or the filter is decorative.
    body = import_secrets.remote_script(False)
    for k in import_secrets.WANTED:
        assert k in body, "%s is in the allow-list but never reaches the remote script" % k
    for k in import_secrets.FORBIDDEN[:3]:
        assert k in body, "%s is in the forbidden list but never reaches the guard" % k


def test_nothing_reads_stdin_while_bash_is_reading_the_script_from_it():
    """`bash -s` READS ITS SCRIPT FROM STDIN, so nothing else in that script may consume it.

    quorum.py shipped with `cat > /tmp/s4_facts.json` as the first line. That consumed the REST OF
    THE SCRIPT as its input: the facts file received the remaining bash, bash had nothing left to
    execute, and the panel produced complete silence. Not an error, not a timeout, just an empty
    section under a heading, which reads as "nothing to report". Every run said 0 of 4 answered.

    The sibling project has the identical defect on record, where a secret was piped to `bash -s`
    and the droplet executed the key as a command. Same stream, same cause, second occurrence.

    Payloads travel INSIDE the script, base64 encoded.
    """
    for f in ("quorum.py", "import_secrets.py", "deploy_direct.py", "stagegate.py"):
        code = code_only(read(ROOT, f))
        if "bash -s" not in code:
            continue
        # A bare redirect-from-stdin at the start of a remote script is the shape of the bug.
        assert not re.search(r"^\s*\"?cat > ", code, re.M), (
            "%s has a `cat > file` in a script sent to `bash -s`. It will swallow the rest of the "
            "script and the command will silently do nothing." % f
        )
    q = code_only(read(ROOT, "quorum.py"))
    assert "base64.b64encode" in q, "the facts must travel inside the script, not on stdin"
    assert "input=script.encode" in q, "only the script itself may be on stdin"


def test_generated_shell_scripts_are_syntactically_valid():
    """BUILD THEM AND CHECK THEM. These are shell programs assembled by string concatenation in
    Python, and a parse of the Python proves nothing about the bash it emits.

    THE SCRIPT GOES IN ON STDIN, NOT AS A FILE PATH. The first version wrote a temp file and
    passed its name, which failed on the operator's machine: `bash.EXE` on Windows is WSL's bash,
    and it cannot read a Windows path. It silently strips the backslashes, so
    `C:\\Users\\feran\\AppData\\...` arrives as `C:UsersferanAppData...` and the file does not
    exist. `bash -n` reads from stdin perfectly well and no path is involved at all.

    Fourth time in this project that a check could not run on the machine invoking it: the
    percent-encoded gate paths, the httpx import, the POSIX-only call, and now this.

    Skipped where bash is genuinely absent, because a check that cannot run must say so rather
    than fail.
    """
    import shutil
    import subprocess

    bash = shutil.which("bash")
    if not bash:
        return  # CI runs this on ubuntu, where bash always exists

    import import_secrets

    for name, script in (("import_secrets show", import_secrets.remote_script(True)),
                         ("import_secrets write", import_secrets.remote_script(False))):
        # BYTES, never text mode: on Windows that would rewrite every newline into CRLF and bash
        # would fail on the carriage returns rather than on anything we wrote.
        r = subprocess.run([bash, "-n"], input=script.encode("utf-8"),
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
        err = r.stderr.decode("utf-8", "replace")
        assert r.returncode == 0, "%s generates invalid bash:\n%s" % (name, err[:400])


def test_the_deploy_still_ships_the_commit_even_if_the_push_failed():
    """The two are independent on purpose: production gets exactly what was tested whether or not
    GitHub was reachable."""
    d = code_only(read(ROOT, "deploy_direct.py"))
    assert 'archive", "--format=tar"' in d and "HEAD" in d


# ---- the gate --------------------------------------------------------------------------------
def _verdict(gate, verdicts):
    return {"gate": gate,
            "reviews": [{"model": "m%d" % i, "verdict": v} for i, v in enumerate(verdicts)]}


def test_one_model_cannot_veto_a_good_release():
    """No SINGLE reviewer may block a release. Only a unanimous panel, against a green gate.

    REWRITTEN 16 Aug 2026, not deleted, because the doctrine changed and the reasoning is worth
    keeping. This used to assert that ["NO-GO"] and ["NO-GO","NO-GO"] both promote. They no longer
    do, and NOT because one model gained a veto: two answers out of four is below quorum, so the
    release is refused for want of a review rather than on any model's opinion. The cases below all
    have a quorum, which is where "one model must never hold the switch" actually applies.
    """
    import stagegate

    for verdicts in (["NO-GO", "GO", "GO"], ["NO-GO", "NO-GO", "GO"],
                     ["UNSURE", "UNSURE", "UNSURE"], ["NO-GO", "GO", "GO", "GO"]):
        gate, _ = stagegate._decide_from_verdict(_verdict("GO", verdicts))
        assert gate == "GO", "%r blocked a green gate; only a unanimous quorum may halt" % verdicts


def test_models_cannot_wave_through_a_broken_release():
    """The other direction, and it matters just as much: an agreeable panel must not rescue a
    deterministic failure."""
    import stagegate

    gate, _ = stagegate._decide_from_verdict(_verdict("NO-GO", ["GO", "GO", "GO", "GO"]))
    assert gate == "NO-GO", "four models talked a failing gate into promoting"


def test_a_unanimous_panel_against_a_green_gate_halts():
    """On 7 August 2026 all four reviewers said NO-GO, all four named the same check, all four
    were RIGHT (the check was scoring a failure as a pass), and the run promoted anyway with a
    one-line note. When every independent reviewer contradicts a green gate, the gate is the thing
    under suspicion and a human has to see it BEFORE production."""
    import stagegate

    os.environ.pop("OVERRIDE_PANEL", None)
    gate, digest = stagegate._decide_from_verdict(
        _verdict("GO", ["NO-GO", "NO-GO", "NO-GO", "NO-GO"]))
    assert gate == "NO-GO"
    assert "HALTED" in digest and "OVERRIDE_PANEL" in digest, (
        "the halt must say why and how to override, or it is just an unexplained failure"
    )


def test_the_halt_can_be_overridden_deliberately():
    import stagegate

    os.environ["OVERRIDE_PANEL"] = "1"
    try:
        gate, _ = stagegate._decide_from_verdict(
            _verdict("GO", ["NO-GO", "NO-GO", "NO-GO", "NO-GO"]))
        assert gate == "GO", "an informed operator must be able to proceed"
    finally:
        os.environ.pop("OVERRIDE_PANEL", None)


def test_below_quorum_the_release_is_refused_and_says_so():
    """A safeguard that cannot fire must announce it — and here it refuses rather than announcing.

    REWRITTEN 16 Aug 2026. The old version asserted that below quorum the run PROMOTES with a
    warning, which is precisely what shipped a release under the heading `REVIEW PANEL (0 of 4
    answered)`. A warning nobody can act on before the fact is not a safeguard.
    """
    import stagegate

    gate, dg = stagegate._decide_from_verdict(_verdict("GO", ["NO-GO", "NO-GO"]))
    assert gate == "NO-GO", "two answers is not a panel"
    assert "only 2 of 4" in dg, "the record must say how many answered"
    d = stagegate.digest([], [{"model": "a", "verdict": "GO"}], "GO")
    assert "BELOW QUORUM" in d and "REFUSED" in d


def test_a_pass_whose_own_detail_says_it_failed_is_demoted():
    """Twice on the sibling project a check reported PASS while its detail contained the word that
    describes the failure. Both times the CHECK was the defect. And the benign phrasing must NOT
    demote itself, or the gate cries wolf and gets switched off."""
    import stagegate

    bad = {"name": "x", "ok": True, "detail": "OK, but the mount is STALE and cannot be read"}
    assert stagegate.self_contradictory(bad)
    good = {"name": "y", "ok": True, "detail": "running config matches the file, no drift"}
    assert not stagegate.self_contradictory(good)
    parsed = stagegate.parse_checks("CHECK|z|yes|everything fine but the config is broken")
    assert parsed and parsed[0]["ok"] is False


def test_the_reboot_is_proven_by_a_changed_boot_id():
    """Waiting for ssh to answer is not a reboot test: right after the command is issued the box is
    still up and answers perfectly. A test that can pass without the event happening is not a
    test."""
    s = code_only(read(ROOT, "stagegate.py"))
    assert "/proc/sys/kernel/random/boot_id" in s
    assert "after != before" in s or "!= before" in s


def test_every_page_probe_announces_itself_as_a_browser():
    """THE BOT GATE ANSWERS AN UNRECOGNISED AGENT A 404, so a probe that announces itself as a
    tool measures the GATE and not the site.

    Plain `curl` sends curl/8.x, which the gate matches. The first real staging run therefore
    reported the front page as 22 bytes of {"detail":"not found"} and all six deep routes as 404,
    while the site was serving perfectly. /api/health passed only because /api/ is exempt.

    This blind spot has now appeared three times in this project. It is a test.
    """
    s = read(ROOT, "stagegate.py")
    smoke = s[s.index("SMOKE = r'''"):s.index("def parse_checks")]
    assert "UA=" in smoke, "the smoke script defines no browser user agent"

    # JOIN BACKSLASH CONTINUATIONS FIRST. A shell command split across two physical lines has
    # `curl` on one and the URL on the other, so a per-line scan matches NEITHER and skips the
    # command entirely. Proven by mutation: removing the user agent from the deep-route probe,
    # which is a two-line command, was not caught until this line existed.
    smoke = re.sub(r"\\\s*\n\s*", " ", smoke)

    bad = []
    for line in smoke.splitlines():
        if "curl" not in line or "127.0.0.1:8000" not in line:
            continue
        # /api/ is exempt from the gate, and the bot-gate check sets its own agents on purpose.
        if "/api/" in line or "-A '" in line:
            continue
        if '-A "$UA"' not in line:
            bad.append(line.strip()[:90])
    assert not bad, (
        "page-route probe(s) with no browser user agent, so they measure the bot gate:\n  "
        + "\n  ".join(bad)
    )


def test_the_panel_has_a_key_and_the_dangerous_secrets_are_still_refused():
    """The allow-list is the security boundary, and it was WIDENED deliberately.

    OPENAI_* is now imported so the release panel can run in this container. The earlier
    alternative, executing the panel inside the neighbour's container, avoided the grant and
    introduced a cross-project dependency for a convenience feature. That trade was reversed on
    the operator's instruction, and this test is rewritten rather than deleted so the reasoning
    survives: a test that encodes a doctrine has to change when the doctrine changes.

    What must NOT change is the refusal of the keys this site has no use for. A marketing site
    holding a shared access password or a scanning key is how the low-value system becomes the
    easiest route into the high-value one.
    """
    imp = code_only(read(ROOT, "import_secrets.py"))

    m = re.search(r"WANTED = \[([^\]]*)\]", imp)
    assert m, "there is no allow-list"
    wanted = set(re.findall(r'"([^"]+)"', m.group(1)))
    assert "OPENAI_API_KEY" in wanted, "the panel cannot run without an inference key"

    m = re.search(r"FORBIDDEN = \[([^\]]*)\]", imp)
    assert m, "there is no forbidden list"
    forbidden = set(re.findall(r'"([^"]+)"', m.group(1)))
    for must in ("SHODAN_API_KEY", "COLT_BOT_PASSWORD", "ABUSEIPDB_KEY", "SMTP_PASS"):
        assert must in forbidden, "%s is no longer refused" % must
    assert not (wanted & forbidden), "a key is on both lists"

    # And the grant must still be a SUBSET, not the whole shared file.
    assert "grep -E '^(%s)=' " in imp or "keys" in imp, "the copy is no longer key-filtered"


def test_the_smoke_tests_cover_more_than_a_status_code():
    """A blank page answers 200 perfectly happily, and that is how an empty site passed every
    check on this estate."""
    s = read(ROOT, "stagegate.py")
    for must, why in (
        ("wc -c", "nothing measures the response SIZE"),
        ("application/ld+json", "the shell contents are not checked"),
        ("/.env", "scanner paths are not exercised"),
        ("Googlebot", "the bot gate is only tested in one direction"),
        ("api/contact", "the only write endpoint is never exercised"),
        ("id -u", "nothing checks the container is not root"),
    ):
        assert must in s, why


# ---- CI ---------------------------------------------------------------------------------------
def test_github_runs_the_same_checks_where_nobody_can_skip_them():
    wf = os.path.join(ROOT, ".github", "workflows")
    assert os.path.isdir(wf), "there are no GitHub workflows"
    ci = read(wf, "ci.yml")
    for must, why in (
        ("gitleaks", "no secret scan"),
        ("fetch-depth: 0", "the secret scan only sees the tip, so a removed secret looks clean"),
        ("F821", "the undefined-name rule is not enforced, and that one is an outage"),
        ("pytest", "the python suite does not run in CI"),
        ("i18n_gate", "the frontend gates do not run in CI"),
        ("docker build", "the image is never built in CI"),
        ("sha256sum -c", "the scanner is downloaded without verifying it"),
        ("--exit-code 1", "no severity ever fails the build"),
    ):
        assert must in ci, why


def test_the_scanner_is_pinned_and_not_taken_from_a_moving_branch():
    """A supply-chain compromise of this exact tool in early 2026 was delivered by installers that
    took whatever the newest release happened to be, inside jobs holding credentials."""
    ci = read(ROOT, ".github", "workflows", "ci.yml")
    assert re.search(r"V=\d+\.\d+\.\d+", ci), "the scanner version is not pinned"
    assert "/main/contrib/install.sh" not in ci, "installing from a moving branch"


def test_off_box_uptime_exists_and_is_not_fooled_by_the_bot_gate():
    up = read(ROOT, ".github", "workflows", "uptime.yml")
    assert "Mozilla/5.0" in up, (
        "the monitor announces itself as a tool, so the bot gate answers 404 and the check "
        "measures the GATE instead of the site"
    )
    assert "404" not in re.sub(r"#.*", "", up), (
        "404 is an accepted status somewhere. Widening an expectation to match a broken probe is "
        "how a monitor comes to accept an outage."
    )
    assert "openssl" in up, "nothing watches the certificate from outside"


# --------------------------------------------------------------------------------------
# The four-model panel must actually run, and a release must not pass without it.
# --------------------------------------------------------------------------------------

def _decide(reviews, gate="GO", override=False):
    import stagegate
    os.environ.pop("OVERRIDE_PANEL", None)
    if override:
        os.environ["OVERRIDE_PANEL"] = "1"
    try:
        return stagegate._decide_from_verdict({"gate": gate, "reviews": reviews, "digest": "d"})[0]
    finally:
        os.environ.pop("OVERRIDE_PANEL", None)


def _answers(n, verdict="GO"):
    return [{"model": "m%d" % i, "role": "soldier", "verdict": verdict} for i in range(n)]


def test_a_release_is_refused_when_the_panel_did_not_answer():
    """`REVIEW PANEL (0 of 4 answered)` printed directly above `GATE: GO` once. Never again.

    A record that claims a four-model review which did not happen is worse than no record: it
    reads as evidence and is not. Below quorum the promotion is refused.
    """
    assert _decide([]) == "NO-GO", "0 of 4 answered must not promote"
    assert _decide(_answers(1)) == "NO-GO", "1 of 4 is not a panel"
    assert _decide(_answers(2)) == "NO-GO", "2 of 4 is below quorum"
    assert _decide(_answers(3)) == "GO", "3 of 4 is a quorum and they agreed"
    assert _decide(_answers(4)) == "GO"
    # The escape hatch is deliberate and must exist, or a model outage becomes an outage for us.
    assert _decide([], override=True) == "GO", "OVERRIDE_PANEL=1 must still promote"
    # And the older rule still holds: unanimous dissent against a green gate halts.
    assert _decide(_answers(3, "NO-GO")) == "NO-GO"
    # A failing deterministic check is still decided by code, never rescued by the panel.
    assert _decide(_answers(4), gate="NO-GO") == "NO-GO"


def test_the_panel_program_is_valid_python_and_is_passed_by_path():
    """The remote program is built by string formatting, so nothing checks it until it runs.

    It ran on the droplet for several releases and failed every time. Compiling it here costs a
    millisecond and is the difference between a defect found now and `0 of 4 answered` in
    production.
    """
    import quorum

    prog = quorum.PROGRAM % (json.dumps(quorum.PANEL), json.dumps(quorum.ARCH),
                             json.dumps(quorum.PROMPT), "True")
    compile(prog, "<panel>", "exec")          # raises SyntaxError on a bad %-escape
    assert "sys.argv[1]" in prog, "the facts must arrive as a PATH, never on stdin"
    assert "sys.stdin" not in prog

    script = quorum.remote_script("RkFDVFM=", "cHJvZw==")
    assert "docker cp" in script, "both payloads are copied in, not streamed"
    assert re.search(r"docker exec\s+\"\$C\"\s+python3\s+/tmp/s4_panel\.py", script), \
        "the program must be named in argv, not read from stdin as `python3 -`"
    assert " < /tmp" not in script, "a stdin redirect here would silently discard a heredoc"


def test_both_the_gate_and_the_release_notes_use_one_panel_implementation():
    """Two copies of this would drift, and the copy nobody watches is the one that breaks."""
    sg = open(os.path.join(ROOT, "stagegate.py"), encoding="utf-8").read()
    assert "import quorum" in sg and "quorum.remote(" in sg, \
        "the staging gate must call quorum, not carry its own panel"
    ship = open(os.path.join(ROOT, "ship.py"), encoding="utf-8").read()
    assert "quorum" in ship, "the release notes must come from the same module"
