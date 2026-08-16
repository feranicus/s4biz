# -*- coding: utf-8 -*-
"""The headers, and the policy matching what the pages actually load."""
import os
import re

import asgi_harness as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FE = os.path.join(ROOT, "webapp", "frontend")


def app():
    from app.main import app as a

    return a


def test_every_security_header_is_present_on_a_page():
    r = H.get(app(), "/")
    for h in (
        "content-security-policy",
        "strict-transport-security",
        "x-content-type-options",
        "x-frame-options",
        "referrer-policy",
        "permissions-policy",
        "cross-origin-opener-policy",
    ):
        assert h in r.headers, "missing %s" % h
    assert r.headers["x-frame-options"] == "DENY"
    assert r.headers["x-content-type-options"] == "nosniff"


def test_the_api_is_never_cached():
    r = H.get(app(), "/api/health")
    assert "no-store" in r.headers.get("cache-control", "")


def test_headers_also_decorate_a_gated_404():
    """The bot gate and the probe refusal answer BEFORE the application runs. If the header
    middleware were installed in the wrong order those responses would go out bare, and they are
    most of our traffic."""
    r = H.get(app(), "/.env")
    assert r.status == 404
    assert "content-security-policy" in r.headers, (
        "a refused probe came back with no headers: security_headers.install() must be called "
        "AFTER visitors.install() so it is the OUTERMOST middleware"
    )


def test_the_ordering_that_makes_that_true_is_explicit_in_main():
    src = open(os.path.join(ROOT, "webapp", "backend", "app", "main.py"), encoding="utf-8").read()
    src = re.sub(r"#.*", "", src)  # strip comments: they discuss the rule and would false-positive
    v = src.index("visitors.install(app)")
    s = src.index("security_headers.install(app)")
    assert v < s, "security_headers must be installed after visitors to be the outermost layer"


def test_the_policy_permits_exactly_the_origins_the_pages_use():
    """A policy written from memory either breaks the site or allows an origin nobody reviewed.

    This reads the SHELL and the STYLESHEET, extracts every external origin they actually reach,
    and compares both directions.
    """
    from app.security_headers import CSP

    html = open(os.path.join(FE, "index.html"), encoding="utf-8").read()
    css = open(os.path.join(FE, "src", "styles.css"), encoding="utf-8").read()

    used = set()
    # Anchor on the ELEMENT and on its REL. An <a href> is a navigation, and so are canonical and
    # alternate: those describe the page's own identity, they do not fetch anything. Only a link
    # that actually causes a request counts. An earlier version of this check treated every
    # href="https://..." as a navigation, which swallowed the stylesheet link for the fonts, the
    # single origin most likely to break the site.
    FETCHING = ("stylesheet", "preconnect", "preload", "dns-prefetch", "modulepreload")
    for m in re.finditer(r"<link\b([^>]*)>", html):
        attrs = m.group(1)
        rel = (re.search(r'rel="([^"]+)"', attrs) or [None, ""])[1]
        href = (re.search(r'href="(https://[^"/]+)', attrs) or [None, None])[1]
        if href and any(r in rel for r in FETCHING):
            used.add(href)
    for m in re.finditer(r"<script\b[^>]*src=\"(https://[^\"/]+)", html):
        used.add(m.group(1))
    for m in re.finditer(r"url\(\s*[\"']?(https://[^\"')/]+)", css):
        used.add(m.group(1))
    for m in re.finditer(r"@import\s+url\(\s*[\"']?(https://[^\"')/]+)", css):
        used.add(m.group(1))

    # 'self' already covers our own origin, and naming it explicitly would be noise.
    used.discard("https://s4biz.io")

    for origin in used:
        assert origin in CSP, "the page loads from %s and the policy does not permit it" % origin

    declared = set(re.findall(r"https://[a-z0-9.\-]+", CSP))
    for origin in declared:
        assert origin in used, (
            "the policy permits %s and no page loads from it. Remove it: every permitted origin "
            "is attack surface nobody reviewed." % origin
        )


def test_no_inline_script_in_the_shell():
    """`script-src 'self'` blocks inline script, so an inline block would be silently refused by
    the browser and the page would simply not work. The JSON-LD block is DATA, never executed, and
    the policy does not apply to it."""
    html = open(os.path.join(FE, "index.html"), encoding="utf-8").read()
    for m in re.finditer(r"<script(?![^>]*application/ld\+json)([^>]*)>([\s\S]*?)</script>", html):
        assert not m.group(2).strip(), "an inline <script> is in index.html; the policy blocks it"
