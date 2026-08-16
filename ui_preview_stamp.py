#!/usr/bin/env python3
"""Proof that THIS frontend was looked at.

STANDING RULE: any change to the user interface is previewed locally with `python preview.py` and
LOOKED AT before it ships. It is a gate rather than a line in a document because a gate can
measure contrast, geometry and structure but it cannot SEE. Four colour defects have shipped past
green gates in this codebase family: a dark bar framing a light page (twice), white text on a
white menu, and a badge at 1.67:1. Ten seconds of looking would have caught every one.

A HASH, NOT A TIMESTAMP. "A preview happened at some point" is a different claim from "this
frontend was previewed". The same distinction as verifying a deployed artifact rather than the
intention to deploy it.

SCOPE IS DELIBERATELY NARROW. Backend or deploy edits must not send the operator to a browser for
nothing, or the gate becomes noise and gets switched off.

LINE ENDINGS ARE NORMALISED for text files. Hashing raw bytes makes the stamp mean "previewed on
this operating system", because a Windows checkout has CRLF where a Linux one has LF. Binaries are
deliberately NOT normalised: a PNG can legitimately contain the bytes 0d 0a.
"""
import hashlib
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FE = os.path.join(HERE, "webapp", "frontend")
STAMP = os.path.join(HERE, ".ui-preview-stamp")

TEXT_EXT = {".jsx", ".js", ".mjs", ".css", ".html", ".json", ".webmanifest", ".txt", ".xml", ".svg"}
SKIP_DIR = {"node_modules", "dist", "ssrtmp", ".git", "__pycache__"}


def _files():
    roots = [os.path.join(FE, "src"), os.path.join(FE, "public")]
    out = []
    for root in roots:
        for base, dirs, names in os.walk(root):
            dirs[:] = [d for d in dirs if d not in SKIP_DIR]
            for n in sorted(names):
                out.append(os.path.join(base, n))
    idx = os.path.join(FE, "index.html")
    if os.path.exists(idx):
        out.append(idx)
    return sorted(out)


def ui_hash():
    h = hashlib.sha256()
    for p in _files():
        rel = os.path.relpath(p, HERE).replace("\\", "/")
        h.update(rel.encode("utf-8"))
        try:
            with open(p, "rb") as fh:
                data = fh.read()
        except OSError:
            continue
        if os.path.splitext(p)[1].lower() in TEXT_EXT:
            data = data.replace(b"\r\n", b"\n")
        h.update(hashlib.sha256(data).digest())
    return h.hexdigest()


def write(value=None):
    v = value or ui_hash()
    with open(STAMP, "w", encoding="utf-8") as fh:
        fh.write(v)
    return v


def read():
    try:
        with open(STAMP, "r", encoding="utf-8") as fh:
            return fh.read().strip()
    except OSError:
        return ""


def is_current():
    return bool(read()) and read() == ui_hash()


if __name__ == "__main__":
    print("ui hash : %s" % ui_hash())
    print("stamped : %s" % (read() or "(never)"))
    print("current : %s" % is_current())
