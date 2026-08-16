#!/usr/bin/env python3
"""
preview.py -- see the site on YOUR machine, before anything ships.

    python preview.py              dev server, live reload, opens the browser
    python preview.py --build      build, then serve the BUILT files (what would actually ship)
    python preview.py --offline    no API proxy at all
    python preview.py --port 5300

THIS IS A SECOND VERB, NOT A SECOND DEPLOY COMMAND. `python ship.py` deploys, full stop. This
never touches a droplet, never builds an image and never pushes.

IT LISTENS ON THE LAN AND PRINTS THE PHONE ADDRESS. Half the design decisions here (the bottom tab
bar, the 16px input minimum, the header row arithmetic) exist for a phone. Judging them on a
monitor tests the one condition they were not chosen for.

THE /api PROXY IS READ ONLY, AND THAT IS A SAFETY RAIL. Pointing the preview at the live site is
what makes the pages real, but the browser may still hold a session there, so one stray submit
would send a real enquiry from what the operator believes is a local colour check. GET and HEAD
pass; everything else is refused in vite.config.js before it leaves this machine.

TWO PLATFORM TRAPS, BOTH DELIBERATELY AVOIDED:
  1. NEVER `npm run dev`. That resolves through node_modules/.bin/vite, which is a PLATFORM SHIM:
     a symlink on Linux, a .cmd on Windows, and absent entirely after an interrupted install. It
     fails with "vite: not found" on machines where vite itself is fine. We call the .js directly.
  2. DETECT A BROKEN TOOLCHAIN BY RUNNING IT, not by looking for a file. After an install,
     @esbuild/ holds one temporary directory per platform with a random suffix, so probing for a
     name you expect reports "installed for a different platform" on a machine where it works, and
     would wipe a healthy node_modules on every run.
"""
import argparse
import os
import shutil
import socket
import subprocess
import sys
import threading
import time
import webbrowser

HERE = os.path.dirname(os.path.abspath(__file__))
FE = os.path.join(HERE, "webapp", "frontend")
LIVE = "https://s4biz.io"


def lan_ip():
    """The address a phone on the same network can reach. A UDP connect needs no traffic; it just
    asks the routing table which interface would be used."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return ""


def node():
    exe = shutil.which("node")
    if not exe:
        sys.exit(
            "[X] node is not on PATH.\n"
            "    Install Node 20 or newer from https://nodejs.org and re-run."
        )
    return exe


def toolchain_runs():
    """Ask vite for its version. That is the only honest test of whether the install works here."""
    vite = os.path.join(FE, "node_modules", "vite", "bin", "vite.js")
    if not os.path.exists(vite):
        return False
    try:
        r = subprocess.run([node(), vite, "--version"], cwd=FE, capture_output=True, timeout=90)
        return r.returncode == 0
    except Exception:
        return False


def npm_install():
    npm = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm:
        sys.exit("[X] npm is not on PATH. Install Node 20 or newer.")
    print("== installing frontend dependencies (once) ==", flush=True)
    r = subprocess.run([npm, "install", "--no-audit", "--no-fund"], cwd=FE)
    if r.returncode:
        sys.exit("[X] npm install failed. See the output above.")


def ensure_toolchain():
    if toolchain_runs():
        return
    nm = os.path.join(FE, "node_modules")
    if os.path.isdir(nm):
        print("  [!] node_modules exists but vite will not run here.")
        print("      npm ships PER PLATFORM binaries as optional dependencies, so a folder")
        print("      installed on another operating system cannot work on this one. Reinstalling.")
        shutil.rmtree(nm, ignore_errors=True)
    npm_install()
    if not toolchain_runs():
        sys.exit("[X] vite still will not run after a fresh install. Send the output above.")


def stamp_ui():
    """Record that THIS frontend was looked at.

    ship.py refuses to deploy a changed frontend that has not been previewed. The stamp is a HASH
    of the UI files, not a timestamp: "a preview happened at some point" is a different claim from
    "this frontend was previewed", and only the second one is worth having.
    """
    try:
        sys.path.insert(0, HERE)
        import ui_preview_stamp

        ui_preview_stamp.write()
        print("  preview stamp written (ship.py will not ask you to look again at this state)")
    except Exception as e:
        print("  [!] could not write the preview stamp: %r" % (e,))


def main():
    ap = argparse.ArgumentParser(description="Preview the S4Biz site locally.")
    ap.add_argument("--build", action="store_true", help="build first and serve the built files")
    ap.add_argument("--offline", action="store_true", help="do not proxy /api anywhere")
    ap.add_argument("--port", type=int, default=5174)
    ap.add_argument("--no-open", action="store_true", help="do not open a browser")
    a = ap.parse_args()

    if not os.path.isdir(FE):
        sys.exit("[X] %s does not exist. Run this from the project root." % FE)

    ensure_toolchain()

    env = dict(os.environ)
    env["S4_PORT"] = str(a.port)
    if a.offline:
        env["S4_API_TARGET"] = "http://127.0.0.1:9"  # nothing listens there, and that is the point
        env["S4_API_READONLY"] = "1"
        api = "disabled"
    else:
        env["S4_API_TARGET"] = LIVE
        env["S4_API_READONLY"] = "1"
        api = "%s (READ ONLY: GET and HEAD only)" % LIVE

    vite = os.path.join(FE, "node_modules", "vite", "bin", "vite.js")
    if a.build:
        print("== building ==", flush=True)
        r = subprocess.run([node(), vite, "build"], cwd=FE, env=env)
        if r.returncode:
            sys.exit("[X] the build failed. See the output above.")
        cmd = [node(), vite, "preview", "--host", "--port", str(a.port)]
        what = "the BUILT files (exactly what would ship)"
    else:
        cmd = [node(), vite, "--host", "--port", str(a.port)]
        what = "the dev server (live reload)"

    ip = lan_ip()
    url = "http://localhost:%d/" % a.port
    print()
    print("=" * 72)
    print("  S4Biz preview: %s" % what)
    print("  this computer : %s" % url)
    if ip:
        print("  your phone    : http://%s:%d/   (same wifi)" % (ip, a.port))
        print("                  ^ open this. The bottom tab bar, the header row and the")
        print("                    daylight legibility were all designed for that screen.")
    print("  /api          : %s" % api)
    print("=" * 72)
    print()

    stamp_ui()

    if not a.no_open:
        threading.Thread(
            target=lambda: (time.sleep(2.0), webbrowser.open(url)), daemon=True
        ).start()

    try:
        sys.exit(subprocess.call(cmd, cwd=FE, env=env))
    except KeyboardInterrupt:
        print("\nstopped.")


if __name__ == "__main__":
    main()
