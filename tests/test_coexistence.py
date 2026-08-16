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


def test_the_published_port_collides_with_nothing():
    """The neighbours already hold 8090, 3000, 8099, 9090, 5900 and 9222 on loopback."""
    ports = re.findall(r'"127\.0\.0\.1:(\d+):\d+"', compose())
    assert ports, "no loopback published port found"
    for p in ports:
        assert p not in NEIGHBOUR_PORTS, "port %s is already taken by another project here" % p
    assert "8091" in ports


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
