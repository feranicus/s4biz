#!/usr/bin/env python3
"""
import_secrets.py -- reuse the secrets that are ALREADY on the droplet. A BUILDING BLOCK of ship.py.

The droplet already holds a working secret store at /opt/colt-stack/assess-bot/.env: the Gmail
service account that sends mail, and the Telegram bot token. This site needs a small subset of
those to deliver a contact enquiry, and there is no reason to mint, copy or paste anything.

    python ship.py            does this automatically, before the deploy
    python import_secrets.py  just this step
    python import_secrets.py --show   list what would be copied, names only

WHAT IT COPIES, AND NOTHING ELSE:

    GMAIL_SENDER     the mailbox the enquiry is sent from
    GMAIL_SA_B64     the Gmail API service account
    BOT_TOKEN        Telegram, the second delivery channel
    ALERT_TG_CHAT    where that message goes

Everything else in that file belongs to the assessment platform: SHODAN_API_KEY, OPENAI_API_KEY,
COLT_BOT_PASSWORD, ABUSEIPDB_KEY and the ENRICH/SHIELD families. A marketing site has no business
holding an inference key or a shared access password, and copying them "because they were there"
is how a low value system becomes the easiest route to a high value one. The allow-list below is
the whole security argument, so it is short on purpose.

WHY COPY RATHER THAN MOUNT THE OTHER PROJECT'S FILE. Pointing this compose file at
../colt-stack/assess-bot/.env would look tidier and would be fragile in two directions: a colt
deploy rewrites that file wholesale, and moving or renaming the colt stack would silently take
this site's mail with it. A copy under our own path is inspectable, survives the neighbour being
redeployed, and is refreshed by re-running this.

NO SECRET EVER CROSSES THIS MACHINE. The read, the filter and the write all happen ON the droplet
inside one ssh session. Values are never printed, never returned over the wire, and never written
to the repository. What comes back is a report of key names and lengths.
"""
import os
import subprocess
import sys

HOST = os.environ.get("DROPLET_HOST", "64.225.108.200")
USER = os.environ.get("DROPLET_USER", "root")
KEY = os.environ.get("SSH_KEY", "")

SOURCE = os.environ.get("SECRET_SOURCE", "/opt/colt-stack/assess-bot/.env")

# WHERE ELSE TO LOOK, and why this list exists.
#
# `ALERT_TG_CHAT` is not in the assessment platform's env file: that project leaves it empty and
# alerts every authenticated operator instead, which is a mechanism this site does not have. So
# the first run reported it MISSING and told the operator to "re-run after the deploy", which was
# wrong and unactionable, because re-running could never find a key that is not there.
#
# The chat id IS on the droplet, under a different name, in a sibling project. Rather than ask for
# it to be pasted, look for it. A chat id is an identifier rather than a credential, but it is
# still read on the droplet and never printed.
FALLBACKS = {
    "ALERT_TG_CHAT": [
        ("/opt/jobhuntwow/agent/.env", "TELEGRAM_CHAT_ID"),
        ("/opt/jhw/agent/.env", "TELEGRAM_CHAT_ID"),
        ("/opt/colt-stack/assess-bot/.env", "ALERT_TG_CHAT"),
    ],
}
DEST = "/opt/s4biz-stack/s4biz.env"
CONTAINER = "s4biz-web"

# THE ALLOW-LIST IS THE SECURITY BOUNDARY. Add a key here only when this site genuinely needs it.
#
# OPENAI_* WAS ADDED DELIBERATELY, and it is worth writing down why the earlier refusal was
# reversed. The four-model release panel needs an inference key, and the first attempt to avoid
# granting one ran the panel inside the neighbour's container instead. That worked on paper and
# was worse in practice: it made every release review depend on another project's container being
# up and keeping its name, which is a cross-project dependency for a convenience feature.
#
# The operator's instruction was to hold the keys here, the same way cybergod.ai does. So the site
# holds the two it actually uses, under its own path, chmod 600, never in git, and the genuinely
# dangerous ones are still refused by name below. That is a smaller grant than mounting the whole
# shared file, which is what the neighbour does.
WANTED = ["GMAIL_SENDER", "GMAIL_SA_B64", "BOT_TOKEN", "ALERT_TG_CHAT",
          "OPENAI_API_KEY", "OPENAI_BASE_URL"]

# Never, under any circumstances. Listed explicitly so that a careless edit to WANTED still fails,
# and so the intent is readable rather than implied by an omission.
FORBIDDEN = [
    "SHODAN_API_KEY",
    "COLT_BOT_PASSWORD",
    "ABUSEIPDB_KEY",
    "SMTP_PASS",
    "GODADDY_KEY",
    "GODADDY_SECRET",
    "DO_API_TOKEN",
    "SPACES_KEY",
    "SPACES_SECRET",
]

_TMO = ["-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
        "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=4"]
SSH = ["ssh", "-o", "StrictHostKeyChecking=accept-new", "-o", "LogLevel=ERROR"] + _TMO
if KEY and os.path.exists(KEY):
    SSH += ["-i", KEY]


def remote_script(show_only: bool) -> str:
    """The droplet-side script.

    Written with the allow-list expanded into a literal grep pattern rather than a loop over a
    variable, so that what runs is exactly what is reviewable here.
    """
    keys = "|".join(WANTED)
    forbidden = "|".join(FORBIDDEN)
    lines = [
        "set -e",
        'SRC="%s"' % SOURCE,
        'DEST="%s"' % DEST,
        'if [ ! -f "$SRC" ]; then echo "NO_SOURCE $SRC"; exit 1; fi',
        "mkdir -p \"$(dirname \"$DEST\")\"",
        "echo '== keys available in the shared store =='",
        # NAMES ONLY. A length is enough to tell "set" from "empty" and reveals nothing.
        "grep -E '^[A-Za-z_][A-Za-z0-9_]*=' \"$SRC\" | while IFS='=' read -r k v; do"
        "  printf '   %-22s %s chars\\n' \"$k\" \"${#v}\"; done",
        "echo",
        "echo '== selecting =='",
        # Extract exactly the wanted keys, in file order, preserving the value verbatim.
        "TMP=\"$(mktemp)\"",
        "grep -E '^(%s)=' \"$SRC\" > \"$TMP\" || true" % keys,
        "if [ ! -s \"$TMP\" ]; then echo 'NO_KEYS_MATCHED'; rm -f \"$TMP\"; exit 1; fi",
        "while IFS='=' read -r k v; do printf '   take %-18s %s chars\\n' \"$k\" \"${#v}\"; done < \"$TMP\"",
        # BELT AND BRACES: prove nothing on the forbidden list survived the filter. If the
        # allow-list is ever widened carelessly, this stops the write rather than the review.
        "if grep -qE '^(%s)=' \"$TMP\"; then echo 'FORBIDDEN_KEY_LEAKED'; rm -f \"$TMP\"; exit 1; fi"
        % forbidden,
    ]

    # Fill anything the primary store does not have from a named sibling file, under OUR key name.
    for want, sources in FALLBACKS.items():
        lines.append("if ! grep -q '^%s=' \"$TMP\"; then" % want)
        for path, srckey in sources:
            lines.append(
                "  if [ -z \"$(grep -c '^%s=' \"$TMP\" | grep -v 0)\" ] && [ -f '%s' ]; then"
                "    V=\"$(grep -m1 '^%s=' '%s' | cut -d= -f2-)\";"
                "    if [ -n \"$V\" ]; then printf '%s=%%s\\n' \"$V\" >> \"$TMP\";"
                "      printf '   take %-18s %%s chars (from %s)\\n' \"${#V}\";"
                "    fi; fi" % (want, path, srckey, path, want, want, path)
            )
        lines.append(
            "  grep -q '^%s=' \"$TMP\" || printf '   %-18s NOT ON THIS HOST (optional)\\n' '%s';"
            % (want, want, want)
        )
        lines.append("fi")

    if show_only:
        lines += ["rm -f \"$TMP\"", "echo 'SHOW_ONLY: nothing was written'", ""]
        return "\n".join(lines)

    lines += [
        "echo",
        "echo '== writing %s =='" % DEST,
        # umask BEFORE the file exists. Creating it world readable and chmod-ing afterwards leaves
        # a window, and on a shared host a window is all it takes.
        "( umask 077; { echo '# Written by import_secrets.py. Do not edit by hand.';"
        "  echo '# Source: %s  (the shared droplet secret store)';" % SOURCE,
        "  cat \"$TMP\"; } > \"$DEST\" )",
        "chmod 600 \"$DEST\"",
        "rm -f \"$TMP\"",
        "echo -n '   '; ls -l \"$DEST\" | awk '{print $1, $3, $5\" bytes\"}'",
        "echo",
        "echo '== restarting %s so it picks them up =='" % CONTAINER,
        "if docker ps --format '{{.Names}}' | grep -qx %s; then" % CONTAINER,
        "  cd /opt/s4biz-stack && docker compose -p s4biz-stack -f docker-compose.web.yml up -d %s"
        % "web",
        "  sleep 3",
        # Through docker exec: this container publishes no host port.
        "  docker exec %s curl -s -o /dev/null -w '   local /api/health = %%{http_code}\\n'"
        " --max-time 15 http://127.0.0.1:8000/api/health || true" % CONTAINER,
        "else",
        "  echo '   not running yet; the next deploy will read the file'",
        "fi",
        # VERIFY INSIDE THE CONTAINER, not by reading the file we just wrote. The file existing and
        # the process having the value are different claims, and only the second one matters.
        "if docker ps --format '{{.Names}}' | grep -qx %s; then" % CONTAINER,
        "  echo '== verifying the running container actually has them =='",
        "  for k in %s; do" % " ".join(WANTED),
        "    n=$(docker exec %s sh -c \"printenv $k 2>/dev/null | wc -c\" || echo 0);" % CONTAINER,
        # EVERY LITERAL % IN A %-FORMATTED STRING MUST BE DOUBLED. These four lines are ONE
        # expression ending in `% DEST`, so the printf conversions below belong to bash and have to
        # be escaped from Python or it tries to substitute them and raises "not enough arguments
        # for format string". That crash took out the whole secrets step on a live run.
        "    if [ \"$n\" -gt 1 ]; then printf '   %%-18s present (%%s chars)\\n' \"$k\" \"$((n-1))\";"
        # NOT_ON_HOST, not MISSING. A key that does not exist anywhere on this droplet cannot be
        # fixed by re-running, and telling the operator to re-run was a wrong and unactionable
        # instruction. Distinguish "we could not find it" from "it did not reach the container".
        "    elif ! grep -q \"^$k=\" \"%s\" 2>/dev/null; then"
        "      printf '   %%-18s NOT ON THIS HOST (optional, set it once if you want it)\\n' \"$k\";"
        "    else printf '   %%-18s MISSING (in the file, not in the container)\\n' \"$k\"; fi; done"
        % DEST,
        "fi",
        "",
    ]
    return "\n".join(lines)


def main():
    show = "--show" in sys.argv
    tgt = "%s@%s" % (USER, HOST)
    print("== reusing the droplet's existing secret store ==")
    print("   source : %s" % SOURCE)
    print("   dest   : %s (chmod 600)" % DEST)
    print("   copying: %s" % ", ".join(WANTED))
    print("   NOT copying anything else. Values never leave the droplet.\n", flush=True)

    payload = remote_script(show).encode("utf-8")  # BINARY: text mode would feed bash CRLF
    try:
        r = subprocess.run(SSH + [tgt, "bash -s"], input=payload, timeout=180,
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except subprocess.TimeoutExpired:
        print("[X] the droplet did not answer within 180s.")
        return 1
    out = r.stdout.decode("utf-8", "replace")
    print(out, flush=True)

    if "NO_SOURCE" in out:
        print("[!] the shared secret store is not at %s on this host." % SOURCE)
        print("    Point at it with SECRET_SOURCE=/path/to/.env, or write %s by hand" % DEST)
        print("    from s4biz.env.example. The site runs without it; only enquiry DELIVERY stops,")
        print("    and an enquiry is written to disk before any delivery is attempted.")
        return 2  # NOT a failure: nothing here is required for the site to serve.
    if "FORBIDDEN_KEY_LEAKED" in out:
        print("[X] a key on the forbidden list matched the allow-list. Nothing was written.")
        return 1
    if "NO_KEYS_MATCHED" in out:
        print("[!] none of the wanted keys are in that file. Nothing was written.")
        return 2
    if r.returncode:
        print("[X] the remote step failed (see above).")
        return 1
    if not show and "MISSING (in the file" in out:
        print("[!] a key is in the file but not in the container. Re-run after the deploy.")
        return 2
    if not show and "NOT ON THIS HOST" in out:
        print("[!] an optional key does not exist anywhere on this droplet. Nothing to re-run:")
        print("    set it once if you want it, for example")
        print("      ssh root@%s \"echo 'ALERT_TG_CHAT=<your chat id>' >> %s\"" % (HOST, DEST))
        print("    Everything else was imported and the site is unaffected.")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
