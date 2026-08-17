# -*- coding: utf-8 -*-
"""s4biz.io — the corporate site.

A small application by design. It serves a built single-page app, accepts one contact enquiry, and
answers a health check. Everything else on the page is static, which is what makes the whole thing
cheap to reason about and impossible to break subtly.
"""
import os
import re
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import alerts, notify, security_headers, visitors

FRONTEND_DIST = os.environ.get("FRONTEND_DIST", "/app/frontend_dist")
DATA_DIR = os.environ.get("DATA_DIR", "/data")
BUILD = os.environ.get("BUILD_SHA", "dev")

app = FastAPI(title="S4Biz", version="1.0.0", docs_url=None, redoc_url=None, openapi_url=None)

# ---- middleware ---------------------------------------------------------------------------
# ORDER IS LOAD BEARING. Starlette makes the LAST middleware added the OUTERMOST, so
# security_headers must be installed AFTER visitors in order to also decorate the 404s the bot
# gate returns before the application ever runs. Those 404s are most of our traffic.
# tests/test_security_headers.py asserts this ordering.
visitors.install(app)
security_headers.install(app)


# ---- contact ------------------------------------------------------------------------------
class Enquiry(BaseModel):
    name: str = ""
    email: str = ""
    company: str = ""
    message: str = ""
    website: str = ""  # honeypot; a person never sees this field
    lang: str = ""


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[a-z]{2,}$", re.I)

# A crude, per-process rate limit. Not a security control (a determined sender rotates addresses);
# it exists so one broken script cannot fill the mailbox. Deliberately in memory: a database for
# this would be more moving parts than the thing it protects.
_RECENT: dict[str, list[float]] = {}
_WINDOW = 3600
_MAX_PER_HOUR = 5


def _rate_ok(ip: str) -> bool:
    now = time.time()
    hits = [t for t in _RECENT.get(ip, []) if now - t < _WINDOW]
    _RECENT[ip] = hits
    if len(hits) >= _MAX_PER_HOUR:
        return False
    hits.append(now)
    return True


@app.post("/api/contact")
async def contact(req: Enquiry, request: Request):
    ip = visitors.client_ip(request)

    # The honeypot. Answer 200 rather than 400: telling a bot it was detected is free feedback for
    # whoever wrote it, and a person can never reach this branch.
    if req.website.strip():
        visitors.log(evt="enquiry_honeypot", ip=ip)
        return {"ok": True}

    name = req.name.strip()[:120]
    email = req.email.strip()[:180]
    message = req.message.strip()[:4000]
    if not name or not email or not message:
        raise HTTPException(status_code=400, detail="name, email and message are required")
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="that email address is not valid")
    if not _rate_ok(ip):
        visitors.log(evt="enquiry_rate_limited", ip=ip)
        raise HTTPException(status_code=429, detail="too many enquiries from this address")

    rec = {
        "ts": notify.now(),
        "name": name,
        "email": email,
        "company": req.company.strip()[:160],
        "message": message,
        "lang": req.lang.strip()[:8],
        "ip": ip,
    }
    ok = notify.enquiry(rec, DATA_DIR)
    visitors.log(evt="enquiry", ok=ok, company=rec["company"], lang=rec["lang"], ip=ip)
    alerts.observe_contact(ip, ok)
    if not ok:
        # Nothing was stored AND nothing was delivered. Say so, so the page can tell the visitor to
        # email directly rather than let them believe a message is on its way.
        raise HTTPException(status_code=503, detail="could not record the enquiry")
    return {"ok": True}


@app.get("/api/health")
def health():
    return {"ok": True, "build": BUILD, "service": "s4biz-web"}


# ---- static + SPA --------------------------------------------------------------------------
_DIST = Path(FRONTEND_DIST)
if (_DIST / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=str(_DIST / "assets")), name="assets")


# KEEP IN STEP WITH src/App.jsx. A single-page-app catch-all answers 200 to everything, which is
# wrong twice over: a scanner walking a wordlist gets 200 on every entry, so its report says this
# host "has" all of it; and any alerting that keys on 404 never fires. The real routes are a short,
# known list. tests/test_routes.py fails if App.jsx and this set disagree.
_APP_ROUTES = {"", "ai", "cloud", "cyber", "custody", "capabilities", "method", "work", "about",
               "contact", "privacy", "impressum"}


def _is_probe(path: str) -> bool:
    p = (path or "").lower().strip("/")
    if not p:
        return False
    if p.split("/", 1)[0] in _APP_ROUTES:
        return False
    return visitors.is_probe_path(p)


@app.get("/.well-known/security.txt", include_in_schema=False)
def security_txt():
    """RFC 9116. An honest contact route for anyone who finds a problem, and nothing more. It does
    not claim monitoring or feeds that do not exist.

    THIS MUST BE DECLARED BEFORE THE CATCH-ALL. Routes match in REGISTRATION order, so a
    `/{full_path:path}` declared above this one swallows every request and this handler can never
    run. It is the kind of defect that looks like a configuration problem for an hour.
    """
    return PlainTextResponse(
        "Contact: mailto:feranicus@s4biz.io\n"
        "Preferred-Languages: en, de\n"
        "Canonical: https://s4biz.io/.well-known/security.txt\n"
    )


@app.get("/{full_path:path}")
def spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="not found")

    if full_path:
        candidate = (_DIST / full_path).resolve()
        # Resolve FIRST, then prove the result is still inside dist. Checking the unresolved path
        # is the classic traversal hole: "a/../../etc/passwd" passes a naive prefix test.
        try:
            inside = _DIST.resolve() in candidate.parents
        except Exception:
            inside = False
        if inside and candidate.is_file():
            return FileResponse(str(candidate))

    if _is_probe(full_path):
        raise HTTPException(status_code=404, detail="not found")

    index = _DIST / "index.html"
    if index.is_file():
        return FileResponse(str(index))

    # dist/ absent: this is local development against the API only. Say what is wrong rather than
    # returning an empty 200, which looks identical to a broken deploy.
    return HTMLResponse(
        "<h1>S4Biz</h1><p>The frontend build was not found at %s. "
        "Run <code>python preview.py</code> for the site, or build the image.</p>" % FRONTEND_DIST,
        status_code=200,
    )


@app.exception_handler(HTTPException)
async def _http_error(request: Request, exc: HTTPException):
    """A 404 on a PAGE route returns the app shell, so the visitor sees the styled 404 page rather
    than a bare JSON body. A 404 under /api/ stays JSON, because that is what a client expects."""
    if exc.status_code == 404 and not request.url.path.startswith("/api/"):
        index = _DIST / "index.html"
        if index.is_file() and not _is_probe(request.url.path):
            return FileResponse(str(index), status_code=404)
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
