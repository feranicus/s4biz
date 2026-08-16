# -*- coding: utf-8 -*-
"""Request logging and the bot gate.

TWO JOBS, kept separate on purpose:

  1. LOG every request as one structured line, so the operator can see who reached the site and
     what they asked for. No third party analytics, which is a promise the privacy page makes.

  2. GATE crawlers. A marketing site wants Google, Bing and the link unfurlers, and wants nothing
     from backlink harvesters, AI training crawlers and vulnerability scanners. Only the agents in
     BOT_404_ALLOW get page routes; everything else identifying itself as a bot gets a 404.

THE RULE THAT MATTERS MOST HERE: A USER AGENT IS ATTACKER-CONTROLLED. A scanner that announces
itself as Safari is still a scanner, and the evidence is the PATH it asked for, not the string it
sent. So probe paths are refused regardless of the agent, and the allow-list only ever grants
access to a well behaved crawler that had no reason to lie.

The gate NEVER applies to /api/, /robots.txt, /sitemap.xml or /.well-known/. Every deploy verifier
in this repository reads the live site, a crawler fetches the sitemap before it has identified
itself, and 404ing an ACME challenge would break certificate renewal for the whole shared proxy.
"""
import json
import os
import re
import sys
import time

# The crawlers we WANT. Must stay in agreement with public/robots.txt; tests/test_seo.py asserts
# it, because a crawler allowed in one and refused in the other just burns crawl budget.
_DEFAULT_ALLOW = "googlebot,bingbot,duckduckbot,linkedinbot,slackbot,whatsapp,telegrambot,applebot"
BOT_404 = os.environ.get("BOT_404", "1") == "1"
ALLOW = [
    a.strip().lower()
    for a in os.environ.get("BOT_404_ALLOW", _DEFAULT_ALLOW).split(",")
    if a.strip()
]

_BOT_RE = re.compile(
    r"(bot|crawler|spider|scrap|curl|wget|python-requests|httpx|go-http|libwww|okhttp|"
    r"headless|phantomjs|semrush|ahrefs|mj12|dotbot|zgrab|masscan|nmap|nuclei)",
    re.I,
)

# Anything under these prefixes is never gated, for the reasons in the module docstring.
EXEMPT_PREFIX = ("/api/", "/.well-known/", "/assets/", "/media/")
EXEMPT_EXACT = {"/robots.txt", "/sitemap.xml", "/favicon.ico", "/manifest.webmanifest", "/sw.js"}

# A path SEGMENT beginning with a dot is a probe. The old spelling of this rule looked for the
# substring "/." AFTER stripping the leading slash, so ".env", ".git/config" and ".aws/credentials"
# (the three highest-value things a scanner asks for) never matched and were served 200.
_DOTSEG = re.compile(r"(?:^|/)\.[^/]")

_PROBE_HINT = (
    ".php", ".asp", ".aspx", ".jsp", ".cgi", ".env", ".git", ".sql", ".bak", ".old", ".zip",
    ".tar", ".gz", ".yml", ".yaml", ".ini", ".conf", ".sh", ".py", ".rb", ".db", ".sqlite",
    ".pem", ".key", ".log", ".swp", ".htpasswd",
    "wp-", "wordpress", "phpmyadmin", "xmlrpc", "vendor/", "cgi-bin", "shell", "adminer",
    "solr", "actuator", "struts", "config.json", "credentials", "id_rsa", "backup", "dump",
    "aws-ses", "telescope", "debug/default",
)

EVENTS_LOG = os.environ.get("EVENTS_LOG", "")
SERVICE = os.environ.get("SERVICE", "s4biz-web")


def log(**kw):
    """One structured line to stdout AND to the events file, if one is configured.

    NEVER rely on who owns our stdout. A log shipper tails a FILE; if the process is ever run with
    its stdout piped somewhere else, a print-only logger silently stops reaching it.
    """
    kw.setdefault("ts", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    kw.setdefault("service", SERVICE)
    line = json.dumps(kw, ensure_ascii=False)
    try:
        print(line, flush=True)
    except Exception:
        pass
    if EVENTS_LOG:
        try:
            os.makedirs(os.path.dirname(EVENTS_LOG), exist_ok=True)
            with open(EVENTS_LOG, "a", encoding="utf-8") as fh:
                fh.write(line + "\n")
        except Exception:
            pass


def client_ip(request):
    """The FIRST X-Forwarded-For entry: exactly one proxy sits in front of this app."""
    xff = request.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    return getattr(getattr(request, "client", None), "host", "") or ""


def is_probe_path(path: str) -> bool:
    p = (path or "").lower().strip("/")
    if not p:
        return False
    if p.startswith(".well-known/"):
        return False
    if _DOTSEG.search("/" + p):
        return True
    return any(h in p for h in _PROBE_HINT)


def bot_name(ua: str) -> str:
    """The crawler's own name if it identifies as one, else an empty string."""
    u = (ua or "").lower()
    if not _BOT_RE.search(u):
        return ""
    for a in ALLOW:
        if a in u:
            return a
    m = re.search(r"([a-z0-9\-_]{3,})bot", u)
    return (m.group(0) if m else "bot")


def allowed_bot(ua: str) -> bool:
    u = (ua or "").lower()
    return any(a in u for a in ALLOW)


def exempt(path: str) -> bool:
    return path in EXEMPT_EXACT or any(path.startswith(p) for p in EXEMPT_PREFIX)


def install(app):
    """Log everything, refuse probes and unwanted crawlers on PAGE routes only."""
    from starlette.middleware.base import BaseHTTPMiddleware
    from starlette.responses import JSONResponse

    class _Visitors(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            path = request.url.path
            ua = request.headers.get("user-agent", "")
            started = time.time()

            if not exempt(path):
                if is_probe_path(path):
                    # By PATH, whatever the agent claims to be.
                    log(evt="probe", path=path[:200], ip=client_ip(request), ua=ua[:160])
                    return JSONResponse({"detail": "not found"}, status_code=404)
                if BOT_404 and bot_name(ua) and not allowed_bot(ua):
                    log(evt="bot_refused", path=path[:200], bot=bot_name(ua), ip=client_ip(request))
                    return JSONResponse({"detail": "not found"}, status_code=404)

            response = await call_next(request)
            try:
                if not path.startswith("/assets/") and path not in EXEMPT_EXACT:
                    log(
                        evt="http",
                        path=path[:200],
                        status=response.status_code,
                        ms=int((time.time() - started) * 1000),
                        ip=client_ip(request),
                        bot=bot_name(ua),
                        ref=request.headers.get("referer", "")[:160],
                        ua=ua[:160],
                    )
            except Exception:
                pass
            return response

    app.add_middleware(_Visitors)
    print("[visitors] bot gate %s, allow=%s" % ("ON" if BOT_404 else "OFF", ",".join(ALLOW)),
          file=sys.stderr, flush=True)
