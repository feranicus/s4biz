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
