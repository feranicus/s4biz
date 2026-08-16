# -*- coding: utf-8 -*-
"""The security headers we would report a customer for not having.

WHY THIS IS IN THE APP AND NOT IN THE CADDYFILE. The reverse proxy in front of this container is
SHARED with several other sites, and one bad edit to it has already taken every domain on that box
down together for six hours. A header belongs to the application that knows what it serves: it
ships inside the image, so the deploy verification covers it, and it can be tested in a second
without a proxy at all. Editing the shared Caddyfile to harden one site would put five at risk.

WHAT THE POLICY ACTUALLY BUYS. `script-src 'self'` with no 'unsafe-inline' is the single largest
cross-site-scripting mitigation available: an injected <script>, or an injected onclick=, does not
run. It costs one discipline, which is that no inline script may ever appear in index.html.

FAIL OPEN. Setting a header must never be able to break a response. The whole body is wrapped; on
any error the response goes out exactly as it was.
"""
import os

# --------------------------------------------------------------------------------------------
# Every origin below is one the site DEMONSTRABLY loads. tests/test_security_headers.py reads
# index.html and styles.css, extracts every external origin the pages actually request, and fails
# if the policy permits an origin the site does not use, or omits one it does. A policy written
# from memory either breaks the site or allows something nobody reviewed.
# --------------------------------------------------------------------------------------------
FONT_CSS = "https://fonts.googleapis.com"
FONT_FILES = "https://fonts.gstatic.com"

CSP = "; ".join(
    [
        "default-src 'self'",
        "script-src 'self'",
        # 'unsafe-inline' IS required for styles: React writes style="..." ATTRIBUTES on elements
        # and a nonce cannot apply to an attribute. Inline CSS is a far smaller hazard than inline
        # script, because it cannot call an API or read a cookie.
        "style-src 'self' 'unsafe-inline' " + FONT_CSS,
        "font-src 'self' data: " + FONT_FILES,
        "img-src 'self' data: blob:",
        "media-src 'self'",
        "connect-src 'self'",
        "worker-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "upgrade-insecure-requests",
    ]
)

# Two years, subdomains included. NOT preloaded by default: submission to hstspreload.org is a
# one-way door that is slow and awkward to reverse, so it stays a deliberate decision taken once
# rather than a side effect of a deploy. Set HSTS_PRELOAD=1 when that decision is made.
_HSTS = "max-age=63072000; includeSubDomains"
if os.environ.get("HSTS_PRELOAD") == "1":
    _HSTS += "; preload"

HEADERS = {
    "Content-Security-Policy": CSP,
    "Strict-Transport-Security": _HSTS,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": (
        "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), "
        "gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), "
        "xr-spatial-tracking=()"
    ),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Permitted-Cross-Domain-Policies": "none",
    # Version disclosure is free reconnaissance, and it is the first thing a banner detector reads.
    "Server": "s4biz",
}

NO_STORE_PREFIXES = ("/api/",)


def install(app):
    """Outermost middleware, so it also decorates the 404s the bot gate returns.

    Starlette builds the stack so the LAST middleware added is the OUTERMOST. This call therefore
    has to come AFTER visitors.install(app) in main.py. tests/test_security_headers.py asserts that
    ordering, because getting it backwards silently leaves every gated response bare.
    """
    from starlette.middleware.base import BaseHTTPMiddleware

    class _SecurityHeaders(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            response = await call_next(request)
            try:
                for k, v in HEADERS.items():
                    response.headers[k] = v
                if any(request.url.path.startswith(p) for p in NO_STORE_PREFIXES):
                    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
                    response.headers["Pragma"] = "no-cache"
            except Exception:
                pass  # a header is never worth failing a response over
            return response

    app.add_middleware(_SecurityHeaders)
