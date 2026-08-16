# -*- coding: utf-8 -*-
"""The release lifecycle: GitHub is the source of truth, and production is never first.

    checks -> preview -> commit and PUSH -> TEST DROPLET (deploy, smoke, reboot, smoke, panel)
    -> production -> secrets -> verify from outside -> safe point -> release notes

Every assertion here traces to a way this has gone wrong on the sibling project, on the same host.
"""
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


def test_the_deploy_still_ships_the_commit_even_if_the_push_failed():
    """The two are independent on purpose: production gets exactly what was tested whether or not
    GitHub was reachable."""
    d = code_only(read(ROOT, "deploy_direct.py"))
    assert 'archive", "--format=tar"' in d and "HEAD" in d


# ---- the gate --------------------------------------------------------------------------------
def _verdict(gate, verdicts):
    return {"gate": gate,
            "reviews": [{"model": "m%d" % i, "verdict": v} for i, v in enumerate(verdicts)]}


def test_models_cannot_veto_a_good_release():
    """A rate-limited or opinionated model must not be able to block a release on its own. Only a
    UNANIMOUS panel, and only against a green gate, and only with a quorum."""
    import stagegate

    for verdicts in (["NO-GO"], ["NO-GO", "GO"], ["NO-GO", "NO-GO"],
                     ["NO-GO", "NO-GO", "GO"], ["UNSURE", "UNSURE", "UNSURE"]):
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


def test_below_quorum_the_halt_cannot_fire_and_says_so():
    """A safeguard that cannot fire must announce it. Silence is indistinguishable from a pass."""
    import stagegate

    gate, _ = stagegate._decide_from_verdict(_verdict("GO", ["NO-GO", "NO-GO"]))
    assert gate == "GO"
    d = stagegate.digest([], [{"model": "a", "verdict": "GO"}], "GO")
    assert "BELOW QUORUM" in d


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
