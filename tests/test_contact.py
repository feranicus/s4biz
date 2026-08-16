# -*- coding: utf-8 -*-
"""The contact form is the only thing on this site that writes anything."""
import os

import asgi_harness as H


def app():
    from app.main import app as a

    return a


def _payload(**kw):
    d = {
        "name": "Anna Weber",
        "email": "anna.weber@example.de",
        "company": "Example AG",
        "message": "We are exiting two datacentres next year and need an architect.",
    }
    d.update(kw)
    return d


def test_a_valid_enquiry_is_accepted():
    r = H.post(app(), "/api/contact", _payload())
    assert r.status == 200, r.text
    assert r.json()["ok"] is True


def test_an_enquiry_survives_a_dead_mail_gateway():
    """Delivery is best effort; the RECORD is not. An enquiry is written to disk before any third
    party is contacted, so a mail outage cannot lose a lead."""
    data_dir = os.environ["DATA_DIR"]
    path = os.path.join(data_dir, "enquiries.jsonl")
    before = os.path.getsize(path) if os.path.exists(path) else 0
    r = H.post(app(), "/api/contact", _payload(message="persisted before delivery"))
    assert r.status == 200
    assert os.path.exists(path), "the enquiry was not written to disk"
    assert os.path.getsize(path) > before


def test_missing_fields_are_refused():
    for bad in ({"name": ""}, {"email": ""}, {"message": ""}):
        r = H.post(app(), "/api/contact", _payload(**bad))
        assert r.status == 400, "%r was accepted" % bad


def test_a_malformed_address_is_refused():
    for bad in ("not-an-email", "a@b", "@example.com", "a b@example.com"):
        r = H.post(app(), "/api/contact", _payload(email=bad))
        assert r.status == 400, "%s was accepted" % bad


def test_the_honeypot_answers_200_and_sends_nothing():
    """Answering 400 would tell whoever wrote the bot exactly which field gave them away, which is
    free feedback. A person can never reach this branch."""
    data_dir = os.environ["DATA_DIR"]
    path = os.path.join(data_dir, "enquiries.jsonl")
    before = os.path.getsize(path) if os.path.exists(path) else 0
    r = H.post(app(), "/api/contact", _payload(website="http://spam.example"))
    assert r.status == 200
    after = os.path.getsize(path) if os.path.exists(path) else 0
    assert after == before, "a honeypot hit was recorded as a real enquiry"


def test_the_rate_limit_stops_a_runaway_script():
    from app.main import _RECENT, _MAX_PER_HOUR

    _RECENT.clear()
    last = None
    for i in range(_MAX_PER_HOUR + 3):
        last = H.post(app(), "/api/contact", _payload(message="flood %d" % i))
    assert last.status == 429, "the rate limit never fired"
    _RECENT.clear()


def test_notify_never_reaches_for_smtp():
    """SMTP is blocked outbound on this droplet. Switching to smtplib looks correct, imports
    cleanly, and would silently stop every enquiry from arriving."""
    import re

    src = open(
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                     "webapp", "backend", "app", "notify.py"),
        encoding="utf-8",
    ).read()
    code = re.sub(r'"""[\s\S]*?"""', "", src)  # strip docstrings: they explain the rule
    code = re.sub(r"#.*", "", code)
    assert "smtplib" not in code, "notify.py imports smtplib; SMTP is blocked on this host"
