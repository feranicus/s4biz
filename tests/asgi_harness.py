# -*- coding: utf-8 -*-
"""Call the ASGI app directly, with nothing but the standard library.

WHY NOT starlette.testclient. It imports **httpx**, which is a dependency of starlette's TESTING
helper and NOT of this application. It happens to be installed in some environments and is absent
from others, so a suite that uses it is unrunnable on the machine that actually invokes it, and
"pip install httpx" is an operator step. Putting it in requirements.txt would ship a test library
into the production image.

This is about twenty lines of asyncio instead: a scope dict, a receive that returns an empty body,
and a send that records the status and the headers.

IT ALSO DOES NOT RUN THE LIFESPAN, which means no background task starts during a test.
"""
import asyncio
import json


class CIDict(dict):
    """Raw ASGI emits header names as LOWERCASE bytes. httpx was quietly providing a case
    insensitive mapping, so `headers["Content-Security-Policy"]` returned None while
    `content-security-policy` sat right there. A test failing for a harness reason looks exactly
    like one failing for a real reason, which is why this exists. RFC 9110 section 5.1 says a
    header table is case insensitive anyway."""

    def __getitem__(self, k):
        return dict.__getitem__(self, k.lower())

    def get(self, k, default=None):
        return dict.get(self, k.lower(), default)

    def __contains__(self, k):
        return dict.__contains__(self, k.lower())


class Response:
    def __init__(self, status, headers, body):
        self.status = status
        self.headers = headers
        self.body = body

    @property
    def text(self):
        return self.body.decode("utf-8", "replace")

    def json(self):
        return json.loads(self.text)


def request(app, method, path, headers=None, body=None):
    raw = [(k.lower().encode(), str(v).encode()) for k, v in (headers or {}).items()]
    payload = b"" if body is None else json.dumps(body).encode()
    if payload:
        raw.append((b"content-type", b"application/json"))
        raw.append((b"content-length", str(len(payload)).encode()))

    q = ""
    if "?" in path:
        path, q = path.split("?", 1)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": method.upper(),
        "scheme": "https",
        "path": path,
        "raw_path": path.encode(),
        "query_string": q.encode(),
        "root_path": "",
        "headers": raw,
        "client": ("203.0.113.7", 51234),
        "server": ("s4biz.io", 443),
    }

    out = {"status": 500, "headers": CIDict(), "body": b""}
    sent = {"done": False}

    async def receive():
        if not sent["done"]:
            sent["done"] = True
            return {"type": "http.request", "body": payload, "more_body": False}
        return {"type": "http.disconnect"}

    async def send(msg):
        if msg["type"] == "http.response.start":
            out["status"] = msg["status"]
            for k, v in msg.get("headers", []):
                out["headers"][k.decode().lower()] = v.decode()
        elif msg["type"] == "http.response.body":
            out["body"] += msg.get("body", b"") or b""

    asyncio.run(app(scope, receive, send))
    return Response(out["status"], out["headers"], out["body"])


def get(app, path, **kw):
    return request(app, "GET", path, **kw)


def post(app, path, body=None, **kw):
    return request(app, "POST", path, body=body or {}, **kw)
