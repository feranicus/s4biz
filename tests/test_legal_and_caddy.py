# -*- coding: utf-8 -*-
"""Legal facts have exactly one home, and the Caddy fragment can only ever touch our own block."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FE = os.path.join(ROOT, "webapp", "frontend")


def read(*p):
    return open(os.path.join(*p), encoding="utf-8").read()


def code_only(src):
    """Strip docstrings and WHOLE-LINE comments, and nothing else.

    A blanket `re.sub(r"#.*", "")` is wrong here in both directions. It deletes the `#` inside
    `/# s4biz:site BEGIN/`, which is the marker this file exists to check, and it would leave a
    trailing comment on a code line intact. Only a line whose first non-space character is a hash
    is prose."""
    src = re.sub(r'"""[\s\S]*?"""', "", src)
    return "\n".join(ln for ln in src.splitlines() if not ln.lstrip().startswith("#"))


def test_contact_facts_have_exactly_one_home():
    """legal.jsx::OPERATOR is the ONLY place a contact detail is written down.

    This test used to assert the footer RESTATED the same facts, and the two promptly diverged:
    the phone number in the footer was one digit short and therefore unreachable while legal.jsx
    had it right. Nothing caught it, because both files were internally consistent. So the rule is
    now the opposite: the footer must DERIVE, and must not contain a literal.
    """
    legal = read(FE, "src", "legal.jsx")
    footer = read(FE, "src", "components", "Footer.jsx")

    for fact in ("Stars4business OÜ", "EE102156878", "feranicus@s4biz.io"):
        assert fact in legal, "%s is missing from legal.jsx" % fact

    assert "OPERATOR" in footer, "the footer must read its contact facts from OPERATOR"
    for fact in ("EE102156878", "feranicus@s4biz.io", "Sepapaja", "wa.me", "linkedin.com"):
        assert fact not in footer, (
            "the footer restates %r instead of reading it from OPERATOR. Two homes for one fact "
            "is how they end up disagreeing." % fact
        )


# The verified number, digits only. Two independent published sources agree on it: the previous
# s4biz.io site published +4915785541545, and cybergod.ai carries the same value.
#
# PINNED, NOT RANGE CHECKED. The first version of this test asserted "twelve or thirteen digits",
# which is true of a German mobile in general and therefore accepted BOTH the correct number and
# the broken one that was actually shipped here. A range wide enough to be safe was wide enough to
# be useless. If the number genuinely changes, change it here in the same commit.
VERIFIED_PHONE_DIGITS = "4915785541545"


def test_the_phone_number_is_dialable():
    """A number with a digit missing looks completely normal and simply never rings."""
    legal = read(FE, "src", "legal.jsx")
    m = re.search(r'phone:\s*"([^"]+)"', legal)
    assert m, "OPERATOR has no phone number"
    assert m.group(1).startswith("+"), "the phone number must be in international form"
    digits = re.sub(r"\D", "", m.group(1))
    assert digits == VERIFIED_PHONE_DIGITS, (
        "the phone number is %r (%d digits after the plus). The verified number is %s. "
        "A digit lost here is a dead line that nobody reports."
        % (m.group(1), len(digits), VERIFIED_PHONE_DIGITS)
    )


def test_the_whatsapp_deep_link_is_a_link_and_the_label_is_a_label():
    """wa.me refuses a number with a plus, a space or a dash in it. Keeping the machine form and
    the human form as separate fields is what stops somebody formatting the link for the reader
    and silently breaking it."""
    legal = read(FE, "src", "legal.jsx")
    link = re.search(r'whatsapp:\s*"([^"]*)"', legal)
    label = re.search(r'whatsappLabel:\s*"([^"]*)"', legal)
    assert link and label, "OPERATOR is missing whatsapp or whatsappLabel"
    if link.group(1):
        assert re.fullmatch(r"https://wa\.me/\d{8,15}", link.group(1)), (
            "%r is not a usable wa.me deep link: no plus, spaces or dashes allowed" % link.group(1)
        )
        assert re.sub(r"\D", "", label.group(1)) == link.group(1).rsplit("/", 1)[1], (
            "the human readable WhatsApp number and the deep link are different numbers"
        )


def test_no_channel_renders_as_a_dead_link():
    """A href built from an empty field produces a link that looks live and goes nowhere, and
    nobody reports it because it looks fine. Every channel must be guarded."""
    src = read(FE, "src", "components", "ContactChannels.jsx")
    assert "OPERATOR.whatsapp ?" in src, "the WhatsApp card is not guarded against an empty handle"
    assert "OPERATOR.email ?" in src, "the email card is not guarded against an empty handle"
    assert "ch.soon" in src, "there is no fallback for a channel with no handle set"
    # And the classic: a blind search and replace once produced `mailto:WhatsApp +351 ...`.
    for m in re.finditer(r"mailto:\$\{([^}]+)\}", src):
        assert "email" in m.group(1), "a mailto: is built from %r, which is not an address" % m.group(1)


def test_the_floating_button_is_mounted_once_and_hides_on_contact():
    app = read(FE, "src", "App.jsx")
    assert "<WhatsAppFab />" in app, (
        "the floating button is not mounted in App.jsx. Mounting it per page is how it ends up on "
        "three screens and missing from the rest."
    )
    fab = read(FE, "src", "components", "WhatsAppFab.jsx")
    assert 'pathname === "/contact"' in fab, (
        "the floating button does not hide on /contact, where it duplicates the page and covers "
        "the form"
    )
    assert "OPERATOR.whatsapp" in fab and "return null" in fab, (
        "the button must render nothing when no WhatsApp handle is configured"
    )


def test_the_privacy_page_names_a_lawful_basis_and_a_retention_period():
    legal = read(FE, "src", "legal.jsx")
    assert "retentionDays" in legal
    assert "Article 6" in legal and "Artikel 6" in legal, (
        "a privacy notice that does not name its lawful basis is not a privacy notice"
    )
    # The claims on that page are load bearing and checkable by a regulator.
    assert "European Union" in legal and "Europäischen Union" in legal


def test_no_invented_registration_details():
    """An invented commercial register number on an imprint is worse than a missing one. Fields we
    have not verified are left EMPTY and simply not rendered."""
    legal = read(FE, "src", "legal.jsx")
    for placeholder in ("HRB 12345", "XXXXX", "TODO", "TBD", "Lorem"):
        assert placeholder not in legal, "%s is still in the legal copy" % placeholder


def test_both_legal_pages_render_from_that_one_file():
    for page in ("Privacy.jsx", "Impressum.jsx"):
        src = read(FE, "src", "pages", page)
        assert "legal.jsx" in src, "%s does not read from legal.jsx" % page
        # A page holding its own copy is how the two drift apart.
        #
        # `[^"]` matches a NEWLINE, so an unanchored version of this spans from one quoted
        # attribute to the next quote several lines later and flags a file with no long strings in
        # it at all. Exclude newlines: a literal sentence lives on one line.
        assert len(re.findall(r'"[^"\n]{80,}"', src)) == 0, (
            "%s contains long literal copy. All legal text lives in legal.jsx." % page
        )


# ---- the shared proxy ------------------------------------------------------------------------
def test_the_caddy_fragment_is_marked_at_both_ends():
    frag = read(ROOT, "deploy", "caddy", "s4biz.caddy")
    assert "# s4biz:site BEGIN" in frag and "# s4biz:site END" in frag
    assert frag.index("BEGIN") < frag.index("END")
    assert "reverse_proxy s4biz-web:8000" in frag


def test_the_deploy_deletes_only_between_the_markers():
    """A range delete keyed on a WORD eventually starts inside another project's comment and
    truncates their site. That is not hypothetical on this host: it produced a six hour outage
    across every domain on the box."""
    code = code_only(read(ROOT, "deploy_direct.py"))
    deletes = re.findall(r"sed -i '([^']+)'", code)
    assert deletes, "no sed delete found in the deploy at all"
    for d in deletes:
        assert "BEGIN" in d and "END" in d, (
            "unbounded range delete %r. Delete strictly between the markers." % d
        )


def test_the_container_joins_exactly_one_network():
    """Two networks make Docker's DNS hand the proxy a random address, half of them unroutable,
    which shows up as an intermittent 502 that is very hard to attribute."""
    compose = read(ROOT, "docker-compose.web.yml")
    nets = re.findall(r"networks:\s*\[([^\]]+)\]", compose)
    assert nets, "the service declares no network"
    for n in nets:
        assert len([x for x in n.split(",") if x.strip()]) == 1, (
            "the container joins more than one network: %s" % n
        )
    assert "videodead_appnet" in compose
    assert "external: true" in compose


def test_the_deploy_never_removes_orphans():
    """This compose file defines ONE service, so everything else in the project looks like an
    orphan to it. That has already deleted a sibling stack's log shipper and both of its bots."""
    # Strip the prose first: the comment above the compose call explains the rule by name, and a
    # naive grep matches its own explanation. This repository has paid for that four times.
    assert "--remove-orphans" not in code_only(read(ROOT, "deploy_direct.py"))


def test_no_port_80_or_443_is_published():
    """The shared proxy owns those. Publishing them here would collide with it and take every site
    on the box down together."""
    compose = read(ROOT, "docker-compose.web.yml")
    for m in re.finditer(r'"([^"]*:\d+)"', compose):
        spec = m.group(1)
        host_port = spec.split(":")[-2] if spec.count(":") >= 2 else spec.split(":")[0]
        assert host_port not in ("80", "443"), "the compose file publishes %s" % spec
        assert spec.startswith("127.0.0.1:"), (
            "%s is published on every interface. Bind to loopback." % spec
        )
