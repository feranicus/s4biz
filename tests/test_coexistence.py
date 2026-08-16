# -*- coding: utf-8 -*-
"""This site is the SIXTH project on a shared droplet, and the other five were there first.

The rules below are not style. Each one traces to an outage on this exact host: a blunt range
delete that truncated another project's block and took every domain down for six hours, a
`--remove-orphans` that deleted a sibling stack's log shipper and both of its bots, and a
container on two networks that produced intermittent 502s nobody could attribute.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The neighbours, read from the shared proxy's own roster. Names, ports and containers that must
# never be reused here.
NEIGHBOUR_CONTAINERS = ("colt-web", "jhw-web", "polara-web", "videodead-caddy")
NEIGHBOUR_PORTS = ("8090", "3000", "8099", "9090", "5900", "9222")
NEIGHBOUR_VOLUMES = ("colt_events", "colt_webdata", "colt-stack")


def read(*p):
    return open(os.path.join(*p), encoding="utf-8").read()


def code_only(src):
    """Strip docstrings and whole-line comments. The prose here NAMES the neighbours in order to
    warn about them, and a naive grep would match its own warning."""
    src = re.sub(r'"""[\s\S]*?"""', "", src)
    return "\n".join(ln for ln in src.splitlines() if not ln.lstrip().startswith("#"))


def compose():
    return read(ROOT, "docker-compose.web.yml")


def block(text, key, indent=2):
    """The lines belonging to one top-level-ish key, without a YAML library.

    `yaml` is NOT a declared dependency of this application. It is present transitively through
    uvicorn[standard], and tests/test_portability.py refuses a transitive import for the same
    reason the esbuild lesson exists: relying on somebody else's dependency tree is a silent
    dependency on their packaging decisions.

    This file is ours and its shape is stable, so reading it by indentation is honest and needs
    nothing installed.
    """
    lines = text.splitlines()
    pad = " " * indent
    out, inside = [], False
    for ln in lines:
        if ln.startswith(pad + key.rstrip(":") + ":") and not ln.startswith(pad + " "):
            inside = True
            continue
        if inside:
            if ln.strip() and not ln.startswith(pad + " "):
                break
            out.append(ln)
    return "\n".join(out)


def test_no_neighbour_container_name_is_reused():
    c = code_only(compose())
    for name in NEIGHBOUR_CONTAINERS:
        assert name not in c, (
            "%s is a LIVE container belonging to another project on this host. Reusing the name "
            "would replace it." % name
        )
    assert "container_name: s4biz-web" in c


def test_the_compose_project_is_our_own():
    """Deploying into another project's namespace is what makes `--remove-orphans` catastrophic,
    and it is one flag away at all times."""
    d = code_only(read(ROOT, "deploy_direct.py"))
    assert 'PROJECT = "s4biz-stack"' in d
    assert "colt-stack" not in d, "the deploy references the neighbour's compose project"
    assert "-p %s" in d or "-p s4biz-stack" in d


def test_no_host_port_is_published_at_all():
    """The only way to be certain a port is free on a box you do not fully control is to need none.

    This used to publish 127.0.0.1:8091, asserted safe against a hardcoded list of what the
    siblings were known to use. The first real deploy failed with "Bind for 127.0.0.1:8091 failed:
    port is already allocated". The list was REASONING about the host instead of MEASURING it, and
    there are six projects plus dev containers on that machine.

    Choosing a different number would have repeated the same bet. Publishing nothing makes the
    collision structurally impossible: the proxy reaches the container over the docker network, and
    every health check goes through `docker exec`.
    """
    c = code_only(compose())
    assert not re.search(r"^\s*ports:", c, re.M), (
        "a published port has come back. It is not needed (the proxy reaches this container over "
        "the docker network) and on a shared host it is a collision waiting for a deploy."
    )
    # Belt to those braces: 80 and 443 in particular would take every site on the box down.
    for p in ("80:", "443:"):
        assert p not in c, "publishing %s would collide with the shared proxy" % p


def test_health_checks_do_not_assume_a_host_port():
    """Every local probe has to work without a published port, or removing it silently breaks the
    deploy's own verification and the staging reboot test."""
    for f in ("deploy_direct.py", "ship.py", "import_secrets.py"):
        src = code_only(read(ROOT, f))
        assert "127.0.0.1:8091" not in src, "%s still probes the old host port" % f
        if "/api/health" in src:
            assert "docker exec" in src, (
                "%s probes /api/health but never through docker exec, so it must be assuming a "
                "published port" % f
            )


def test_observability_ships_to_the_existing_stack_and_labels_are_low_cardinality():
    """One log store for the whole box, and a shipper that cannot make it unusable for the others.

    Loki creates a STREAM PER LABEL COMBINATION. Labelling by path, by IP or by user agent is the
    standard way to take down a shared Loki, and it would be our fault landing on five other
    projects. Only `evt` (about eight values) and `status` (a handful) are labels; everything else
    stays in the line and is filtered at query time.
    """
    cfg = read(ROOT, "obs", "promtail.yml")
    m = re.search(r"-\s*labels:\s*\n((?:\s{10,}[a-z_]+:\s*\n)+)", cfg)
    assert m, "no labels stage found in the promtail config; this check cannot see its subject"
    labels = set(re.findall(r"([a-z_]+):", m.group(1)))
    assert labels, "the labels stage parsed empty"
    assert labels <= {"evt", "status"}, (
        "high cardinality label(s) %s would create a Loki stream per value and degrade the shared "
        "instance for every other project on this host" % sorted(labels - {"evt", "status"})
    )
    # Positions must persist, or every restart re-ships the whole file and Loki rejects the
    # duplicates as out of order, which looks exactly like a broken shipper.
    assert re.search(r"filename:\s*/positions/", cfg)
    assert "s4biz_positions" in compose()

    # The Loki endpoint is DISCOVERED on the droplet, never hardcoded to a name that differs
    # between production and a fresh staging twin.
    d = code_only(read(ROOT, "deploy_direct.py"))
    assert "grep -i loki" in d, "the deploy does not discover where Loki actually is"


def test_alerting_notifies_and_never_blocks():
    """Detection only. Amnezia VPN shares this host and the standing rule is that nothing here
    touches a firewall or refuses a request."""
    src = code_only(read(ROOT, "webapp", "backend", "app", "alerts.py"))
    for banned in ("iptables", "nft ", "ufw ", "subprocess", "block(", "deny("):
        assert banned not in src, "alerts.py reaches for %r. This module reports, it never acts." % banned
    # A flood of alerts is a second outage, and muting is how the real one gets missed: the cap
    # has to RECORD what it suppressed.
    assert "STORM_CAP" in src and "alert_suppressed" in src
    assert "COOLDOWN" in src


def test_the_release_panel_advises_and_cannot_block():
    """Four suppliers so no single rate limit silences the panel, and it runs AFTER the deploy has
    already verified, so it is commenting on a decision rather than making one."""
    src = read(ROOT, "quorum.py")
    code = code_only(src)
    m = re.search(r"PANEL = \[([\s\S]*?)\]", code)
    assert m, "there is no panel"
    models = re.findall(r'\("([^"]+)"', m.group(1))
    assert len(models) == 4, "expected four models, found %d" % len(models)
    vendors = {mm.split("-")[0] for mm in models}
    assert len(vendors) == 4, (
        "the panel has %d distinct vendors (%s). Four hats on fewer suppliers share a failure "
        "domain, which is the whole reason for having four." % (len(vendors), sorted(vendors))
    )
    assert "return 0  # NEVER fails the ship" in src, "the review must not be able to fail a deploy"

    # ANCHOR ON THE CALL SITE, NOT THE NAME.
    #
    # The first version compared index("do_verify()") against index("quorum.py"), and
    # `def do_verify():` CONTAINS the substring "do_verify()". So it matched the DEFINITION near
    # the top of the file, which precedes every quorum mention, and the assertion was true no
    # matter where the panel actually ran. Proven by mutation: inserting a quorum call before
    # verification was not caught until this line changed.
    ship = code_only(read(ROOT, "ship.py"))
    call = ship.index("verified = do_verify()")
    first_panel = ship.index("quorum.py")
    assert call < first_panel, (
        "the panel runs before verification, so it would be deciding rather than reviewing a "
        "decision already made"
    )


def test_no_neighbour_volume_is_mounted():
    """colt_events holds the cost ledger and colt_webdata holds the jobs database. Neither is ours
    to write to, and a name collision after the compose prefix would be silent."""
    c = code_only(compose())
    for v in NEIGHBOUR_VOLUMES:
        assert v not in c, "%s belongs to another project" % v


def test_the_caddy_fragment_is_marked_and_uniquely_named():
    frag = read(ROOT, "deploy", "caddy", "s4biz.caddy")
    assert "# s4biz:site BEGIN" in frag and "# s4biz:site END" in frag
    # A marker that collides with another project's would make each deploy delete the other.
    for other in ("colt:cybergod", "jhw:jobhuntwow"):
        assert other not in frag, "our markers collide with %s" % other


def test_the_deploy_joins_the_managed_caddy_regime():
    """The monolith on this host is ASSEMBLED from per-project fragments by a watchdog, and it is
    restored from them when something truncates it. A project that only appends to the monolith is
    outside that protection: it works until the day somebody restores an older file."""
    d = code_only(read(ROOT, "deploy_direct.py"))
    assert "/opt/caddyguard/blocks" in d, (
        "the deploy does not write a caddyguard fragment, so this site is not assembled or "
        "restored like the other five"
    )
    assert "s4biz__site.caddy" in d
    assert "-d /opt/caddyguard/blocks" in d, (
        "writing the fragment must be guarded by a directory test, or it errors on a host without "
        "caddyguard (the staging twin)"
    )


def test_secrets_are_reused_not_copied_into_the_repository():
    """The droplet already holds a working secret store. Nothing is minted, pasted or committed."""
    src = read(ROOT, "import_secrets.py")
    code = code_only(src)

    # The allow-list IS the security boundary, so it is asserted rather than assumed.
    m = re.search(r"WANTED = \[([^\]]*)\]", code)
    assert m, "there is no allow-list"
    wanted = set(re.findall(r'"([^"]+)"', m.group(1)))
    assert wanted == {"GMAIL_SENDER", "GMAIL_SA_B64", "BOT_TOKEN", "ALERT_TG_CHAT"}, (
        "the allow-list has changed to %s. A marketing site has no business holding an inference "
        "key or a shared access password: widening this is how a low value system becomes the "
        "easiest route into a high value one." % sorted(wanted)
    )

    m = re.search(r"FORBIDDEN = \[([^\]]*)\]", code)
    assert m, "there is no forbidden list"
    forbidden = set(re.findall(r'"([^"]+)"', m.group(1)))
    for must in ("SHODAN_API_KEY", "OPENAI_API_KEY", "COLT_BOT_PASSWORD"):
        assert must in forbidden, "%s is not on the forbidden list" % must
    assert not (wanted & forbidden), "a key is on both lists"


def test_no_secret_value_can_reach_this_machine_or_the_repository():
    """Read, filter and write all happen ON the droplet inside one session. What comes back is key
    names and lengths."""
    code = code_only(read(ROOT, "import_secrets.py"))
    assert "bash -s" in code and "input=payload" in code, (
        "the work must happen remotely in one session, not by fetching the file here"
    )
    assert "umask 077" in code, "the destination file must never exist world readable, even briefly"
    assert "chmod 600" in code


def test_no_env_file_is_committed():
    """A secret in git is a secret forever, whatever the next commit says."""
    gi = read(ROOT, ".gitignore")
    assert "*.env" in gi
    assert "!*.env.example" in gi, (
        "without this negation the example files are ignored too, and the NAMES are documentation"
    )
    for base, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__", "dist"}]
        for n in names:
            if n.endswith(".env") or n == ".env":
                raise AssertionError(
                    "%s exists in the working tree. It is gitignored, but it must never be "
                    "created inside the repository at all." % os.path.join(base, n)
                )
