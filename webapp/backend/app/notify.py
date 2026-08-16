# -*- coding: utf-8 -*-
"""Getting a contact enquiry to a human.

SMTP IS BLOCKED OUTBOUND ON THIS DROPLET. Do not "fix" this module to use smtplib: it looks
correct, it imports cleanly, and it would silently stop every enquiry from ever arriving. Delivery
is the Gmail API with a service account, exactly as the other services on this host do it, plus
Telegram as a second channel.

TWO CHANNELS, BOTH OPTIONAL, AND THE ENQUIRY IS NEVER LOST EITHER WAY. Every enquiry is written to
the events log and to a JSON Lines file on the persistent volume BEFORE any delivery is attempted.
If the mail gateway is having a bad day, the enquiry is still on disk and still greppable. A
contact form that drops a lead when a third party is down is not a contact form.
"""
import base64
import json
import os
import time

ALERT_EMAIL = os.environ.get("ALERT_EMAIL", "feranicus@s4biz.io")
GMAIL_SENDER = os.environ.get("GMAIL_SENDER", "")
GMAIL_SA_B64 = os.environ.get("GMAIL_SA_B64", "")
BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
ALERT_TG_CHAT = os.environ.get("ALERT_TG_CHAT", "")


def _service():
    """A Gmail API client, or None. Never raises."""
    if not (GMAIL_SENDER and GMAIL_SA_B64):
        return None
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import AuthorizedSession

        info = json.loads(base64.b64decode(GMAIL_SA_B64))
        creds = service_account.Credentials.from_service_account_info(
            info, scopes=["https://www.googleapis.com/auth/gmail.send"], subject=GMAIL_SENDER
        )
        return AuthorizedSession(creds)
    except Exception as e:
        print("[notify] gmail client unavailable: %r" % (e,), flush=True)
        return None


def email(subject, body, to=None):
    """Send. Returns True only if the gateway accepted it. Never raises."""
    sess = _service()
    if sess is None:
        return False
    recipients = [a.strip() for a in (to or ALERT_EMAIL).split(",") if a.strip()]
    if not recipients:
        return False
    try:
        from email.mime.text import MIMEText

        msg = MIMEText(body, "plain", "utf-8")
        msg["To"] = ", ".join(recipients)
        msg["From"] = GMAIL_SENDER
        msg["Subject"] = subject
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        r = sess.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            json={"raw": raw},
            timeout=20,
        )
        ok = 200 <= r.status_code < 300
        if not ok:
            print("[notify] gmail %s %s" % (r.status_code, r.text[:200]), flush=True)
        return ok
    except Exception as e:
        print("[notify] email failed: %r" % (e,), flush=True)
        return False


def telegram(text):
    """Second channel. PLAIN TEXT, deliberately: an enquiry can contain any character, and a stray
    underscore makes Telegram reject a Markdown message outright. The alert that matters most is
    the one that silently never arrives."""
    if not (BOT_TOKEN and ALERT_TG_CHAT):
        return False
    try:
        import requests

        r = requests.post(
            "https://api.telegram.org/bot%s/sendMessage" % BOT_TOKEN,
            json={"chat_id": ALERT_TG_CHAT, "text": text[:3900], "disable_web_page_preview": True},
            timeout=15,
        )
        return 200 <= r.status_code < 300
    except Exception as e:
        print("[notify] telegram failed: %r" % (e,), flush=True)
        return False


def persist(record, data_dir):
    """Append the enquiry to disk BEFORE delivery is attempted. This is the copy that survives a
    mail outage, and it is the reason a delivery failure is not a lost lead."""
    try:
        os.makedirs(data_dir, exist_ok=True)
        with open(os.path.join(data_dir, "enquiries.jsonl"), "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        return True
    except Exception as e:
        print("[notify] persist failed: %r" % (e,), flush=True)
        return False


def enquiry(rec, data_dir):
    """Persist, then deliver on both channels. Returns True if it is safely recorded."""
    stored = persist(rec, data_dir)
    subject = "s4biz.io enquiry: %s (%s)" % (rec.get("name", "?"), rec.get("company") or "no company")
    body = "\n".join(
        [
            "New enquiry from s4biz.io",
            "",
            "Name:    %s" % rec.get("name", ""),
            "Email:   %s" % rec.get("email", ""),
            "Company: %s" % (rec.get("company") or "-"),
            "When:    %s" % rec.get("ts", ""),
            "Lang:    %s" % (rec.get("lang") or "-"),
            "IP:      %s" % (rec.get("ip") or "-"),
            "",
            "Message:",
            rec.get("message", ""),
            "",
            "Reply directly to %s" % rec.get("email", ""),
        ]
    )
    sent_mail = email(subject, body)
    sent_tg = telegram(body)
    print(
        "[notify] enquiry stored=%s mail=%s telegram=%s" % (stored, sent_mail, sent_tg), flush=True
    )
    return stored or sent_mail or sent_tg


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
