# -*- coding: utf-8 -*-
"""Security alerting for a site with one write endpoint.

PROPORTIONATE ON PURPOSE. The assessment platform next door runs a full shield: inline blocking,
tarpits, an IP reputation store, an approval console. That is right for a system holding customer
data behind a login. This site has a contact form and a set of static pages, so the correct amount
of machinery is: notice the things worth noticing, tell a human once, and never block anything.

DETECTION ONLY. Nothing here touches a firewall, and nothing here decides to refuse a request.
The bot gate in visitors.py already answers scanners a 404; this module only reports.

FOUR RULES, each with a reason to exist rather than because it was easy:

  path_probe        somebody is walking a wordlist against us
  contact_burst     the form is being used as a mail relay or a spam target
  error_burst       our own 500s, which nothing else on this host would notice
  new_country       a first sighting, useful only because the traffic here is small

AN ALERT FLOOD IS A SECOND OUTAGE. Every rule has a cooldown per subject, and the module has a
global hourly cap. Muting is how a real incident gets missed, so the cap logs what it suppressed
rather than dropping it silently.

IN MEMORY, DELIBERATELY. A database for this would be more moving parts than the thing it
protects, and a restart losing an hour of counters costs nothing.
"""
import os
import threading
import time

from . import notify, visitors

ENABLED = os.environ.get("ALERTS_ENABLED", "1") == "1"
COOLDOWN = int(os.environ.get("ALERT_COOLDOWN", "900"))       # per rule and subject
STORM_CAP = int(os.environ.get("ALERT_STORM_CAP", "12"))       # per hour, all rules
WINDOW = int(os.environ.get("ALERT_WINDOW", "300"))

PROBE_N = int(os.environ.get("ALERT_PROBE_N", "8"))            # distinct probe paths
CONTACT_N = int(os.environ.get("ALERT_CONTACT_N", "6"))        # enquiries in the window
ERROR_N = int(os.environ.get("ALERT_ERROR_N", "10"))           # 5xx in the window

_lock = threading.Lock()
_events: dict[str, list[tuple[float, str]]] = {}
_sent: dict[str, float] = {}
_hour: list[float] = []
_seen_countries: set[str] = set()


def _prune(seq, now, window=WINDOW):
    return [x for x in seq if now - x[0] < window]


def _fire(rule: str, subject: str, text: str):
    """One alert, subject to the cooldown and the storm cap."""
    now = time.time()
    with _lock:
        key = "%s:%s" % (rule, subject)
        if now - _sent.get(key, 0) < COOLDOWN:
            return False
        _hour[:] = [t for t in _hour if now - t < 3600]
        if len(_hour) >= STORM_CAP:
            # Recorded, not silent. A cap that hides its own operation is how the one that
            # mattered disappears.
            visitors.log(evt="alert_suppressed", rule=rule, subject=subject, cap=STORM_CAP)
            return False
        _sent[key] = now
        _hour.append(now)

    visitors.log(evt="security_alert", rule=rule, subject=subject, detail=text[:300])
    body = "s4biz.io security alert\n\nRule:    %s\nSubject: %s\nWhen:    %s\n\n%s" % (
        rule, subject, notify.now(), text
    )
    notify.telegram(body)
    notify.email("s4biz.io alert: %s (%s)" % (rule, subject), body)
    return True


def observe_request(path: str, status: int, ip: str, country: str = "", ua: str = ""):
    """Called from the telemetry middleware for every request. Must never raise, and must never
    be slow: it is on the request path."""
    if not ENABLED:
        return
    try:
        now = time.time()
        src = ip or "?"
        with _lock:
            if visitors.is_probe_path(path):
                bucket = "probe:" + src
                _events[bucket] = _prune(_events.get(bucket, []), now) + [(now, path)]
            if status >= 500:
                _events["err"] = _prune(_events.get("err", []), now) + [(now, path)]

            distinct = {p for _, p in _events.get("probe:" + src, [])}
            errors = len(_events.get("err", []))

        # VARIETY, NOT VOLUME. A person hitting one stale link fifty times is not a scanner; a
        # scanner misses many DIFFERENT paths. That distinction is what stops a real visitor with
        # an old bookmark being reported as an attack.
        if len(distinct) >= PROBE_N:
            _fire("path_probe", src,
                  "%d distinct probe paths in %ds from %s.\nExamples: %s\nUser agent: %s"
                  % (len(distinct), WINDOW, src, ", ".join(sorted(distinct)[:8]), ua[:120]))

        if errors >= ERROR_N:
            _fire("error_burst", "self",
                  "%d server errors in %ds. This is OUR fault, not an attack, and nothing else on "
                  "this host would notice it." % (errors, WINDOW))

        if country and country not in _seen_countries:
            with _lock:
                first = country not in _seen_countries
                _seen_countries.add(country)
            if first and len(_seen_countries) > 1:
                _fire("new_country", country,
                      "First request seen from %s (%s). Informational." % (country, src))
    except Exception:
        # An alerting bug must never take a request down.
        pass


def observe_contact(ip: str, ok: bool):
    """The one endpoint that writes. A burst here is either a spam run or a broken script."""
    if not ENABLED:
        return
    try:
        now = time.time()
        with _lock:
            _events["ct"] = _prune(_events.get("ct", []), now) + [(now, ip or "?")]
            n = len(_events["ct"])
        if n >= CONTACT_N:
            _fire("contact_burst", "form",
                  "%d enquiries in %ds. The rate limit is already refusing them; this is a "
                  "heads-up that somebody is trying." % (n, WINDOW))
    except Exception:
        pass


def daily_digest():
    """A short summary, once a day, of what the site saw. Returns the text so it can be tested
    without sending anything."""
    now = time.time()
    with _lock:
        probes = sum(len(v) for k, v in _events.items() if k.startswith("probe:"))
        sources = len([k for k in _events if k.startswith("probe:")])
        errors = len(_events.get("err", []))
        contacts = len(_events.get("ct", []))
        countries = sorted(_seen_countries)
    return "\n".join([
        "s4biz.io daily summary, %s" % notify.now(),
        "",
        "Enquiries (recent window):   %d" % contacts,
        "Scanner requests:            %d from %d source(s)" % (probes, sources),
        "Server errors:               %d" % errors,
        "Countries seen:              %s" % (", ".join(countries) or "none recorded"),
        "",
        "Counters are in memory and reset when the container restarts. This is a summary, not a "
        "ledger.",
    ])
