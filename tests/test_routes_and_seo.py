# -*- coding: utf-8 -*-
"""A route has to be registered in FOUR places and three of them fail SILENTLY.

  1. src/App.jsx                     the page exists at all
  2. main.py _APP_ROUTES             or the backend serves it a 404 as a scanner probe
  3. public/sitemap.xml              or a search engine is never told it exists
  4. the header nav or the More menu or the tab bar, or it is unreachable on a phone

And robots.txt has to AGREE with the bot gate: a crawler allowed in one and refused in the other
just burns crawl budget and depresses ranking.
"""
import os
import re

import asgi_harness as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FE = os.path.join(ROOT, "webapp", "frontend")


def read(*p):
    return open(os.path.join(*p), encoding="utf-8").read()


def app_routes():
    src = read(FE, "src", "App.jsx")
    return re.findall(r'path:\s*"([^"]+)"', src)


def test_app_registers_a_plausible_number_of_routes():
    r = app_routes()
    assert len(r) >= 6, "only %d route(s) parsed from App.jsx; this check is misreading it" % len(r)
    assert "/" in r


def test_every_route_is_in_the_backend_whitelist():
    from app.main import _APP_ROUTES

    for r in app_routes():
        seg = r.strip("/").split("/")[0]
        assert seg in _APP_ROUTES, (
            "main.py _APP_ROUTES is missing %r (route %s). The page would be served a 404." % (seg, r)
        )


def test_every_route_is_in_the_sitemap():
    sm = read(FE, "public", "sitemap.xml")
    for r in app_routes():
        loc = "https://s4biz.io" + ("/" if r == "/" else r)
        assert "<loc>%s</loc>" % loc in sm, "sitemap.xml does not list %s" % loc


def test_every_route_is_reachable_from_the_chrome():
    links = set(re.findall(r'to:\s*"([^"]+)"', read(FE, "src", "components", "SiteHeader.jsx")))
    links |= set(re.findall(r'to:\s*"([^"]+)"', read(FE, "src", "components", "MoreMenu.jsx")))
    links |= set(re.findall(r'to:\s*"([^"]+)"', read(FE, "src", "components", "TabBar.jsx")))
    links.add("/")
    for r in app_routes():
        assert r in links, "%s is registered but nothing in the header, menu or tab bar reaches it" % r


def test_every_public_page_renders_the_tab_bar():
    """On a phone, in an installed app, the tab bar is the only way out of a page: the Android back
    button is not always shown and plain header links are hidden below 1000px."""
    app_jsx = read(FE, "src", "App.jsx")
    assert "<TabBar />" in app_jsx, "App.jsx does not render the TabBar at all"
    assert app_jsx.index("<TabBar />") > app_jsx.index("</main>"), (
        "the TabBar must sit outside <main> so it is present on every route"
    )


# ---- robots.txt and the gate must agree -----------------------------------------------------
def test_robots_and_the_bot_gate_agree():
    from app import visitors

    robots = read(FE, "public", "robots.txt")
    allowed_in_robots = set()
    current = None
    for line in robots.splitlines():
        line = line.strip()
        if line.lower().startswith("user-agent:"):
            current = line.split(":", 1)[1].strip().lower()
        elif line.lower().startswith("allow:") and current and current != "*":
            allowed_in_robots.add(current)
        elif line.lower().startswith("disallow: /") and current and current != "*":
            allowed_in_robots.discard(current)

    for ua in allowed_in_robots:
        assert visitors.allowed_bot(ua), (
            "robots.txt invites %s and the bot gate would serve it a 404. That wastes crawl "
            "budget and depresses ranking." % ua
        )


def test_search_engines_are_served_and_scrapers_are_not():
    a = app()
    google = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    assert H.get(a, "/", headers={"User-Agent": google}).status != 404, (
        "Googlebot is refused. Nothing can be indexed, and a stale snippet survives for months."
    )
    assert H.get(a, "/", headers={"User-Agent": "GPTBot/1.0"}).status == 404
    assert H.get(a, "/", headers={"User-Agent": "AhrefsBot/7.0"}).status == 404


def app():
    from app.main import app as a

    return a


def test_the_sitemap_and_robots_are_never_gated():
    """A crawler fetches these BEFORE it has identified itself, and 404ing the sitemap silently
    kills indexing."""
    a = app()
    for p in ("/robots.txt", "/sitemap.xml"):
        assert H.get(a, p, headers={"User-Agent": "AhrefsBot/7.0"}).status != 404


def test_scanner_paths_are_refused_whatever_the_agent_claims():
    """A user agent is ATTACKER CONTROLLED. The evidence is the path, not the string they sent."""
    a = app()
    safari = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1"
    for p in ("/.env", "/.git/config", "/.aws/credentials", "/wp-login.php", "/vendor/phpunit"):
        assert H.get(a, p, headers={"User-Agent": safari}).status == 404, (
            "%s was not refused. A spoofed agent must not get past the path rule." % p
        )


def test_well_known_is_never_refused():
    """ACME lives there. 404ing it would break certificate renewal for every site on the shared
    proxy, not just this one."""
    r = H.get(app(), "/.well-known/security.txt")
    assert r.status == 200
    assert "mailto:" in r.text


# --------------------------------------------------------------------------------------
# The off-box monitor. It runs every ten minutes and emails on failure, so a defect in the
# CHECK is an alarm every ten minutes about a healthy site.
# --------------------------------------------------------------------------------------
UPTIME = os.path.join(ROOT, ".github", "workflows", "uptime.yml")


def _uptime_targets():
    src = open(UPTIME, encoding="utf-8").read()
    block = src[src.index("TARGETS=("):src.index(")", src.index("TARGETS=("))]
    return re.findall(r'"([^"]+)"', block)


def test_no_uptime_field_contains_the_delimiter_that_splits_it():
    """`IFS='|' read -r name url want minb` splits on "|", and the regex CONTAINED "|".

    The line was
        "www|https://www.s4biz.io/|^(200|301|302|308)$|0"
    so `want` became `^(200` (an unterminated group, which never matches) and `minb` became
    `301|302|308)$` (not an integer). The monitor then failed every ten minutes against a site that
    was answering perfectly, and mailed the operator each time.

    Same defect class as a `sed` range delete keyed on a word that also appears in a comment: the
    delimiter must not be able to occur inside the thing it delimits.
    """
    bad = []
    for t in _uptime_targets():
        parts = t.split("|")
        if len(parts) != 4:
            bad.append("%r splits into %d fields, not 4" % (t, len(parts)))
    assert _uptime_targets(), "no targets found; the parser or the workflow moved"
    assert not bad, "\n  ".join(["a target field contains the delimiter:"] + bad)

    for t in _uptime_targets():
        name, url, want, minb = t.split("|")
        assert minb.isdigit(), "%s: min-bytes %r is not a number" % (name, minb)
        assert want.startswith("^") and want.endswith("$"), \
            "%s: %r is not an anchored status pattern" % (name, want)
        re.compile(want)          # an unterminated group would raise here


def test_the_monitor_and_the_deploy_agree_on_what_www_does():
    """Two monitors describing one behaviour will disagree unless the behaviour is DECIDED.

    www used to serve the same bytes as the apex, so both checks carried an alternation for a thing
    nobody had chosen. It now redirects, the canonical tag and sitemap name the apex, and every
    check asserts exactly one status.
    """
    frag = open(os.path.join(ROOT, "deploy", "caddy", "s4biz.caddy"), encoding="utf-8").read()
    assert re.search(r"www\.s4biz\.io\s*\{[^}]*redir\s+https://s4biz\.io", frag), \
        "www must redirect to the apex in the committed Caddy fragment"
    assert not re.search(r"^s4biz\.io,\s*www\.s4biz\.io\s*\{", frag, re.M), \
        "www is serving again instead of redirecting"

    want = dict(t.split("|")[0:3:2] for t in _uptime_targets())
    assert want["www"] == "^301$", "the off-box monitor expects %r for www" % want["www"]

    ship = open(os.path.join(ROOT, "ship.py"), encoding="utf-8").read()
    assert "st_www != 301" in ship, "the deploy verify must assert the same single status"
    # ANCHOR ON THE CALL, not on the word. The first version asserted that "follow=False" appeared
    # anywhere in ship.py, and it does: in fetch()'s own docstring explaining why the argument
    # exists. So removing it from the call site passed. Seventh time a check in this project has
    # matched its own prose.
    assert re.search(r"fetch\([^)]*www[^)]*follow=False[^)]*\)", ship), \
        ("the www probe follows redirects again. urllib follows 3xx silently, so the check would "
         "only ever observe the apex's 200 and could never fail.")


# --------------------------------------------------------------------------------------
# The custody page. The four-places rule is already enforced above, for EVERY route, by
# test_every_route_is_in_the_backend_whitelist / _in_the_sitemap / _reachable_from_the_chrome.
# A custody-specific copy of that was written here and deleted: it duplicated a working check
# and got it wrong, because it read the header and the More menu and forgot the tab bar.
# --------------------------------------------------------------------------------------
def test_the_custody_page_holds_no_copy_of_its_own():
    """The page is layout. The words are data. A translator must not be able to break the layout.

    Same rule as the three service pages: every string arrives through t() or useContent, so the
    German pack can only ever change words.
    """
    src = open(os.path.join(ROOT, "webapp", "frontend", "src", "pages", "Custody.jsx"),
               encoding="utf-8").read()
    body = src[src.index("return ("):]
    # Text sitting directly between tags, which is what hardcoded copy looks like.
    stray = [x.strip() for x in re.findall(r">\s*([A-Za-z][^<>{}\n]{12,})\s*<", body)]
    assert not stray, "hardcoded copy in the page: %r" % stray[:3]


def test_the_custody_content_names_no_person_and_no_agency():
    """The architecture was written from a real case and is published without it, deliberately.

    A commercial page naming somebody who is charged and not convicted carries defamation exposure,
    and the argument is structural: it holds for every custodian or for none. The case facts are
    also not ours to publish. This is a content decision that a later edit could quietly undo, so
    it is asserted rather than trusted.
    """
    banned = ["fbi", "yaroch", "counterintelligence", "supervisory special agent",
              "925,426", "eighteen months", "charging affidavit"]
    for loc in ("en", "de"):
        p = os.path.join(ROOT, "webapp", "frontend", "src", "locales", "%s.custody.js" % loc)
        text = open(p, encoding="utf-8").read()
        # Comments explain WHY the case was removed, so they must not be scanned for its traces.
        text = re.sub(r"/\*[\s\S]*?\*/", "", text).lower()
        hit = [b for b in banned if b in text]
        assert not hit, "%s.custody.js names the case again: %r" % (loc, hit)
