#!/usr/bin/env python3
"""
deploy_direct.py -- ship s4biz.io to the droplet. A BUILDING BLOCK: run `python ship.py`.

    ONE ssh session. Pack the COMMIT, send it inside the remote script, build, wire the shared
    Caddy from the committed snippet, force a config load, verify from outside.

Env: DROPLET_HOST (default 64.225.108.200), DROPLET_USER (root), SSH_KEY, and --no-proxy for a
staging box that has no shared proxy to publish into.
"""
import base64
import os
import re
import subprocess
import sys
import tarfile
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
HOST = os.environ.get("DROPLET_HOST", "64.225.108.200")
USER = os.environ.get("DROPLET_USER", "root")
KEY = os.environ.get("SSH_KEY", "")
REMOTE_DIR = "/opt/s4biz-stack"
PROJECT = "s4biz-stack"
CONTAINER = "s4biz-web"
DOMAIN = "s4biz.io"

# FAIL FAST, NEVER HANG. Without ConnectTimeout an unreachable droplet makes ssh sit for about two
# minutes with no output at all, which is indistinguishable from "it is building". BatchMode means
# it errors out instead of waiting on an interactive password prompt.
_TMO = ["-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
        "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=4"]
SSH = ["ssh", "-o", "StrictHostKeyChecking=accept-new", "-o", "LogLevel=ERROR"] + _TMO
if KEY and os.path.exists(KEY):
    SSH += ["-i", KEY]

# EVERYTHING THE DROPLET NEEDS. A path missing from here is not packed, and the failure is
# confusing rather than obvious: docker creates a DIRECTORY where a bind mount's source file
# should be, and the container dies with "not a directory: are you trying to mount a directory
# onto a file". That is what happened when obs/ was added and this list was not.
#
# tests/test_coexistence.py now derives the requirement from the compose file, so a new bind
# mount whose source is not packed fails the suite instead of the deploy.
INCLUDE = ["webapp", "docker-compose.web.yml", "deploy", "obs", ".dockerignore"]
EXCLUDE = {"node_modules", "__pycache__", "dist", ".git", ".pytest_cache", "ssrtmp"}


def _keep(name):
    """ONE exclusion rule, used by BOTH pack paths."""
    return not (set(name.split("/")) & EXCLUDE)


def _tree_state():
    def g(*a):
        r = subprocess.run(["git"] + list(a), cwd=HERE, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=30)
        return (r.stdout or "").strip() if r.returncode == 0 else ""
    sha = g("rev-parse", "--short", "HEAD")

    # `git status --porcelain` is "XY <path>", and the FIRST status column is a space for a file
    # that is modified but not staged. The helper above strips the whole output, which removes that
    # leading space from the FIRST LINE ONLY. Slicing at a fixed column then ate one character of
    # the first path and left every other path correct, which is exactly the shape of bug that
    # survives a glance: " M deploy_direct.py" was reported as "eploy_direct.py".
    #
    # So do not slice by position at all. Read the raw output and match the two status columns
    # explicitly. A diagnostic that misreports a path sends the next investigation down the wrong
    # road, and this one did.
    try:
        raw = subprocess.run(["git", "status", "--porcelain"], cwd=HERE, capture_output=True,
                             text=True, encoding="utf-8", errors="replace", timeout=30).stdout or ""
    except Exception:
        raw = ""
    dirty = []
    for ln in raw.splitlines():
        m = re.match(r"^(..) (.+)$", ln)
        if m:
            dirty.append(m.group(2).strip())
    return (not dirty), sha, dirty


def pack():
    """Pack the COMMITTED tree, because the working tree is a moving target.

    A ship reads the tree several times: to test it, to commit it, to pack it for staging, to pack
    it again for production. If an editor is still writing while that runs, production is handed
    different bytes from the ones staging validated, and the failure looks impossible ("it is the
    same commit"). It was never the same code.

    `git archive HEAD` is immutable, so the tested tree, the staging input and the production input
    are provably identical.

    -c core.autocrlf=false -c core.eol=lf: git archive applies the SAME end-of-line conversion as a
    checkout, so on Windows it would emit CRLF while the repository blob is LF. That leaves the
    deployed artifact platform dependent, which is precisely what packing the commit was meant to
    remove. Forcing both off makes the archive repository bytes on every operating system.
    """
    clean, sha, dirty = _tree_state()
    if sha:
        if not clean:
            print("  [!] working tree is DIRTY (%d path(s), e.g. %s)"
                  % (len(dirty), ", ".join(dirty[:3])))
            print("      packing the COMMIT %s. Uncommitted edits will NOT ship." % sha)
        tf = tempfile.NamedTemporaryFile(suffix=".tar", delete=False)
        tf.close()
        r = subprocess.run(
            ["git", "-c", "core.autocrlf=false", "-c", "core.eol=lf",
             "archive", "--format=tar", "-o", tf.name, "HEAD"] + INCLUDE,
            cwd=HERE, capture_output=True, text=True, timeout=180)
        if r.returncode == 0 and os.path.getsize(tf.name) > 0:
            gz = tf.name + ".gz"
            with tarfile.open(tf.name) as src, tarfile.open(gz, "w:gz") as dst:
                for m in src.getmembers():
                    if _keep(m.name):
                        dst.addfile(m, src.extractfile(m) if m.isfile() else None)
            os.unlink(tf.name)
            print("  packing COMMIT %s (immutable: staging and production get identical bytes)" % sha)
            return gz
        print("  [!] git archive failed (%s), falling back to the working tree"
              % ((r.stderr or "").strip()[:120]))
        try:
            os.unlink(tf.name)
        except OSError:
            pass

    tf = tempfile.NamedTemporaryFile(suffix=".tgz", delete=False)
    tf.close()
    with tarfile.open(tf.name, "w:gz") as tar:
        for item in INCLUDE:
            p = os.path.join(HERE, item)
            if os.path.exists(p):
                tar.add(p, arcname=item, filter=lambda ti: ti if _keep(ti.name) else None)
    return tf.name


def remote(proxy=True):
    steps = [
        "set -e",
        "cd %s" % REMOTE_DIR,
        # docker-compose.web.yml joins videodead_appnet as an EXTERNAL network. On production it
        # already exists; on a fresh staging box it does not, and compose fails before it builds
        # anything. Creating it when absent is idempotent and touches nothing on production.
        "docker network inspect videodead_appnet >/dev/null 2>&1 || docker network create videodead_appnet",
        # DISCOVER where Loki actually is rather than hardcoding it. The log shipper needs to reach
        # it, and it lives on a neighbour's network whose name differs between this box and a fresh
        # staging twin. Asking docker is the difference between a working shipper and a container
        # that restarts forever with a DNS error nobody reads.
        "LOKI_CT=\"$(docker ps --format '{{.Names}}' | grep -i loki | head -1)\"",
        "if [ -n \"$LOKI_CT\" ]; then"
        "  LOKI_NET=\"$(docker inspect \"$LOKI_CT\" -f "
        "'{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | awk '{print $1}')\";"
        "  printf 'LOKI_URL=http://%s:3100/loki/api/v1/push\\nLOKI_NETWORK=%s\\n' \"$LOKI_CT\" \"$LOKI_NET\" > .env;"
        "  echo \"observability: shipping to $LOKI_CT on $LOKI_NET\";"
        "else"
        # No Loki on this host (the staging twin). Point the shipper at our own network so compose
        # still resolves, and say so. A missing log shipper must not fail a deploy.
        "  printf 'LOKI_URL=http://127.0.0.1:3100/loki/api/v1/push\\nLOKI_NETWORK=videodead_appnet\\n' > .env;"
        "  echo 'observability: no loki container on this host, shipper will idle';"
        "fi",
        # WHAT ALREADY HOLDS A PORT ON THIS HOST. Printed every deploy, because "8091 is free" was
        # an assumption that survived until the first real deploy and then failed the whole run.
        # This container publishes nothing, so the list is diagnostic rather than load bearing, but
        # it is the only place the actual state of the box is visible.
        "echo '== ports already published on this host =='",
        "docker ps --format '{{.Names}}\\t{{.Ports}}' | grep -v '^\\S*\\t$' | sed 's/^/   /' || true",
        "echo '== build and (re)start %s =='" % CONTAINER,
        # NEVER --remove-orphans: this file defines one service, and everything else in the project
        # would look like an orphan to it.
        "docker compose -p %s -f docker-compose.web.yml up -d --build --force-recreate" % PROJECT,
        "echo '== scan the image (CRITICAL fails the deploy, HIGH reports) =='",
        # The scanner is a supply-chain dependency like any other. It is PINNED and its tarball is
        # checksum verified BEFORE it is executed, because this tool was itself compromised in
        # early 2026 and a poisoned release dumped runner memory. --skip-version-check silences the
        # "a newer version is available" banner: an upgrade here is a deliberate, reviewed change
        # to TRIVY_VERSION, never something to be nudged into by the tool asking to update itself.
        # The vulnerability DATABASE updates independently, so findings are current either way.
        "TRIVY_VERSION=0.69.3",
        "if ! command -v trivy >/dev/null 2>&1; then"
        "  cd /tmp && B=https://github.com/aquasecurity/trivy/releases/download/v$TRIVY_VERSION &&"
        "  curl -sfLO $B/trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz &&"
        "  curl -sfLO $B/trivy_${TRIVY_VERSION}_checksums.txt &&"
        "  grep \" trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz$\" trivy_${TRIVY_VERSION}_checksums.txt"
        " | sha256sum -c - &&"
        "  tar xzf trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz trivy &&"
        "  install -m 0755 trivy /usr/local/bin/trivy && cd - >/dev/null; fi",
        "trivy image --scanners vuln --severity HIGH --ignore-unfixed --exit-code 0"
        " --skip-version-check --timeout 8m %s:latest 2>&1 | tail -20 || true" % CONTAINER,
        "trivy image --scanners vuln --severity CRITICAL --ignore-unfixed --exit-code 1"
        " --skip-version-check --timeout 8m %s:latest 2>&1 | tail -20"
        " || { echo 'TRIVY_CRITICAL_FAIL'; }" % CONTAINER,
    ]

    if not proxy:
        return "\n".join(steps + [
            "echo '== staging: no shared proxy on this box, skipping the caddy wiring =='",
            "echo -n 'image  : '; docker inspect %s -f '{{.Config.Image}}'" % CONTAINER,
            "sleep 4",
            # Through docker exec, not a host port. This container publishes nothing.
            "docker exec %s curl -s -o /dev/null -w 'local /api/health = %%{http_code}"
            "  (200 = LIVE)\\n' --max-time 15 http://127.0.0.1:8000/api/health || true" % CONTAINER,
            "",
        ])

    return "\n".join(steps + [
        "echo '== wire %s into the shared caddy from the committed snippet =='" % DOMAIN,
        "CADDY_CT=\"$(docker ps --format '{{.Names}}' | grep -i caddy | head -1)\"",
        "[ -n \"$CADDY_CT\" ] || { echo 'NO_CADDY_CONTAINER'; exit 1; }",
        # ASK DOCKER where the Caddyfile comes from. Never assume a path: the mount source differs
        # between hosts, and a hardcoded one turns "I cannot see the file" into "the file is
        # broken", which is absence of evidence being reported as a finding.
        "CF=\"$(docker inspect \"$CADDY_CT\" --format "
        "'{{range .Mounts}}{{if eq .Destination \"/etc/caddy/Caddyfile\"}}{{.Source}}{{end}}{{end}}')\"",
        "[ -n \"$CF\" ] || { echo 'NO_CADDYFILE_MOUNT'; exit 1; }",
        "cp \"$CF\" \"$CF.bak.$(date +%s)\"",
        # THE MARKER DELETE IS THE ONLY CORRECT ONE. It removes exactly our block and nothing else.
        # A blunt range delete on a WORD eventually starts inside another project's comment and
        # truncates their site. That is not hypothetical on this host.
        "sed -i '/# s4biz:site BEGIN/,/# s4biz:site END/d' \"$CF\"",
        "cat deploy/caddy/s4biz.caddy >> \"$CF\"",
        # ---- JOIN THE MANAGED REGIME -------------------------------------------------------
        # This box does not really have a hand-edited Caddyfile any more: a watchdog called
        # caddyguard ASSEMBLES the monolith from per-project fragments in /opt/caddyguard/blocks,
        # validates it, and restores it when something truncates it. Five projects append into one
        # file, and one bad append has already taken every domain on the host down for six hours.
        #
        # Appending to the monolith alone leaves this site OUTSIDE that regime. It works, because
        # caddyguard re-splits whatever is live into fragments before it assembles, but it depends
        # on that ordering and on nobody restoring from an older backup. Writing the fragment
        # ourselves makes the site a first class member: it is then assembled, validated and
        # restored exactly like the others.
        #
        # Guarded by a directory test, so this is a no-op on a host without caddyguard (the
        # staging twin) rather than an error.
        "if [ -d /opt/caddyguard/blocks ]; then"
        "  install -m 0644 deploy/caddy/s4biz.caddy /opt/caddyguard/blocks/s4biz__site.caddy;"
        "  echo 'caddyguard: fragment written (this site is now assembled and restored like the rest)';"
        "else echo 'caddyguard: not installed on this host, monolith append only'; fi",
        # IN PLACE, never mv. A single-FILE bind mount pins the inode, so replacing the file leaves
        # the container reading the old one forever while every check happily agrees with itself.
        "docker exec \"$CADDY_CT\" caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile",
        "echo '== force a full config load (a plain reload can keep a stale config) =='",
        "docker exec \"$CADDY_CT\" sh -c 'caddy adapt --config /etc/caddy/Caddyfile > /tmp/s4.json"
        " && curl -sS -X POST -H \"Content-Type: application/json\" --data @/tmp/s4.json"
        " http://localhost:2019/load && echo ADMIN_LOAD_OK' || echo 'admin load failed'",
        "sleep 3",
        # HOP 1 of 3: does the CONTAINER read the file we just wrote? validate and reload both work
        # on the container's own copy, so they agree perfectly with each other and prove nothing
        # about whether the mount is stale.
        "H=\"$(sha256sum \"$CF\" | cut -c1-12)\"",
        "C=\"$(docker exec \"$CADDY_CT\" sha256sum /etc/caddy/Caddyfile | cut -c1-12)\"",
        "if [ \"$H\" != \"$C\" ]; then echo \"STALE MOUNT host=$H container=$C -> restarting\";"
        " docker restart \"$CADDY_CT\" >/dev/null; sleep 6; fi",
        "code=\"$(curl -sk --resolve %s:443:127.0.0.1 https://%s/api/health -o /dev/null -w '%%{http_code}' || true)\""
        % (DOMAIN, DOMAIN),
        "if [ \"$code\" != \"200\" ]; then echo \"== load did not take (got $code), restarting caddy ==\";"
        " docker restart \"$CADDY_CT\" >/dev/null; sleep 6; fi",
        "echo '== verify =='",
        "echo -n 'image  : '; docker inspect %s -f '{{.Config.Image}}'" % CONTAINER,
        # A container on TWO networks makes the proxy dial a random one of them, and roughly half
        # the requests then fail. Print it so a regression is visible, not inferred.
        "echo -n 'nets   : '; docker inspect %s -f "
        "'{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'; echo" % CONTAINER,
        "echo -n 'caddy->web: '; docker exec \"$CADDY_CT\" wget -qO- -T5 http://%s:8000/api/health"
        " 2>&1 | head -c 80; echo" % CONTAINER,
        "curl -sk --resolve %s:443:127.0.0.1 https://%s/api/health"
        " -o /dev/null -w 'public via caddy = %%{http_code}  (200 = LIVE)\\n'" % (DOMAIN, DOMAIN),
        "",
    ])


def preflight(tgt, tries=3):
    """Prove we can reach the droplet BEFORE doing anything slow, and say so out loud.

    ConnectTimeout only bounds the handshake. A connection that sshd ACCEPTS and then stalls
    (OpenSSH 9.8 turns PerSourcePenalties on by default, and penalties accrue) hangs a whole deploy
    with no output. Penalties decay, so backing off and retrying is the correct response.
    """
    print("== preflight: ssh %s (hard 25s timeout, %d tries) ==" % (tgt, tries), flush=True)
    r, delay = None, 20
    for attempt in range(tries):
        try:
            r = subprocess.run(SSH + [tgt, "echo ssh-ok && docker ps --format '{{.Names}}' | head -6"],
                               capture_output=True, text=True, timeout=25)
        except subprocess.TimeoutExpired:
            r = None
        if r is not None and r.returncode == 0 and "ssh-ok" in (r.stdout or ""):
            break
        if attempt < tries - 1:
            print("   no answer (%d/%d), sshd may be throttling. Waiting %ds"
                  % (attempt + 1, tries, delay), flush=True)
            time.sleep(delay)
            delay *= 2
    if r is None:
        sys.exit("[X] ssh to %s timed out %d times.\n"
                 "    OpenSSH 9.8 enables PerSourcePenalties by default and they ACCRUE.\n"
                 "    They decay on their own: wait about five minutes and re-run." % (tgt, tries))
    if r.returncode or "ssh-ok" not in (r.stdout or ""):
        sys.exit("[X] cannot ssh to %s\n    %s\n\n"
                 "    Most likely:\n"
                 "      1. the key is not where THIS shell looks (PowerShell uses %%USERPROFILE%%\\.ssh,\n"
                 "         WSL uses ~/.ssh). Set SSH_KEY=C:\\path\\to\\key\n"
                 "      2. the droplet is not answering :22 from this network\n"
                 "      3. wrong host: DROPLET_HOST=%s"
                 % (tgt, (r.stderr or "").strip()[:300] or "no response", HOST))
    print("  ssh OK, containers: %s" % ", ".join((r.stdout or "").split()[1:7]), flush=True)


def main():
    proxy = "--no-proxy" not in sys.argv
    tgt = "%s@%s" % (USER, HOST)
    if not proxy:
        print("== STAGING MODE: build and start only, no proxy wiring ==", flush=True)
    preflight(tgt)

    print("== pack sources ==", flush=True)
    tgz = pack()
    blob = base64.b64encode(open(tgz, "rb").read()).decode("ascii")
    try:
        os.unlink(tgz)
    except OSError:
        pass
    print("  packed (%d KB -> %d KB base64)" % (len(blob) * 3 // 4 // 1024, len(blob) // 1024),
          flush=True)

    # ONE ssh connection for the whole deploy. The tarball travels INSIDE the remote script as
    # base64. Two reasons:
    #   * scp is gone. On Windows a temp path is "C:\Users\...\x.tgz" and scp reads the "C:" as a
    #     HOSTNAME because of the colon, so the upload dies instantly and almost silently.
    #   * sshd throttles rapid repeat connections, and four sessions per deploy is enough to
    #     trigger it.
    payload = "\n".join([
        "set -e",
        "mkdir -p %s" % REMOTE_DIR,
        "cd %s" % REMOTE_DIR,
        "base64 -d > /tmp/s4biz-src.tgz <<'B64EOF'",
        blob,
        "B64EOF",
        "echo '== unpack on the droplet =='",
        # CLEAR ANY PHANTOM DIRECTORY DOCKER LEFT BEHIND.
        #
        # When a bind mount's source file is absent, docker helpfully creates a DIRECTORY at that
        # path. tar then cannot extract the real file over it, so the next deploy fails in the same
        # way as the first and the cause looks permanent. rmdir only removes an EMPTY directory,
        # so this can never destroy anything real.
        "for f in obs/promtail.yml; do [ -d \"%s/$f\" ] && rmdir \"%s/$f\" 2>/dev/null || true; done"
        % (REMOTE_DIR, REMOTE_DIR),
        "tar xzf /tmp/s4biz-src.tgz -C %s && rm -f /tmp/s4biz-src.tgz" % REMOTE_DIR,
        # Prove the bind sources arrived, BEFORE compose tries to mount them. A missing file here
        # produces a runtime error three steps later that names mounts rather than packing.
        "for f in docker-compose.web.yml obs/promtail.yml deploy/caddy/s4biz.caddy; do"
        "  [ -f \"%s/$f\" ] || { echo \"MISSING_AFTER_UNPACK $f\"; exit 1; }; done" % REMOTE_DIR,
        remote(proxy),
        "",
    ])

    print("== upload, build, wire, verify (ONE ssh; the image build takes 2-4 min) ==", flush=True)
    try:
        # BINARY input. text=True would rewrite every \n into \r\n on Windows and feed bash a CRLF
        # script, which fails with the memorable "$'\r': command not found".
        r = subprocess.run(SSH + [tgt, "bash -s"], input=payload.encode("utf-8"), timeout=1500,
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        out = r.stdout.decode("utf-8", "replace")
        print(out, flush=True)
    except subprocess.TimeoutExpired:
        sys.exit("[X] the remote build exceeded 25 minutes and was killed.\n"
                 "    Nothing is half applied: compose is idempotent, just re-run.")

    if r.returncode:
        sys.exit("[X] remote deploy failed (see the output above)")
    # A marker nobody reads is decoration. These are consumed, not printed.
    if "TRIVY_CRITICAL_FAIL" in out:
        sys.exit("[X] the image has a CRITICAL, FIXABLE vulnerability, so this stops here.\n"
                 "    Usually a base image bump in webapp/Dockerfile. If it is genuinely accepted\n"
                 "    risk, add the identifier to .trivyignore WITH A REASON AND A DATE. An\n"
                 "    allowlist without a reason is a disabled scanner wearing a hat.")
    if "MISSING_AFTER_UNPACK" in out:
        missing = [ln for ln in out.splitlines() if "MISSING_AFTER_UNPACK" in ln]
        sys.exit("[X] a file the compose file needs was not shipped:\n    %s\n\n"
                 "    Add its top level directory to INCLUDE in this script. A bind mount whose\n"
                 "    source is missing makes docker create a DIRECTORY there, and the container\n"
                 "    then dies complaining about mounting a directory onto a file."
                 % "\n    ".join(missing))
    if "NO_CADDY_CONTAINER" in out or "NO_CADDYFILE_MOUNT" in out:
        sys.exit("[X] could not find the shared caddy container or its Caddyfile mount.")
    if proxy and "public via caddy = 200" not in out:
        sys.exit("[X] the site did not answer 200 through the shared proxy.\n"
                 "    The container may be up while the proxy is not routing to it. Do NOT hand\n"
                 "    edit the droplet: fix the committed files and re-run.")
    print("== deploy OK ==")


if __name__ == "__main__":
    main()
