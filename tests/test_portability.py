# -*- coding: utf-8 -*-
"""The suite has to run on the machine that INVOKES it.

Three ships have been lost in this codebase family to a check that was green in a Linux sandbox and
impossible on the operator's Windows box: a test-only library that was not a dependency, a platform
shim treated as a file, and a POSIX-only call on a failure path. Writing the rule down did not stop
it recurring, so it is a test.
"""
import ast
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TESTS = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(ROOT, "webapp", "backend", "app")

# POSIX only. Any of these on a path the tests execute makes the suite unrunnable on Windows, and
# they tend to sit on error paths, which is exactly where reliability matters most.
POSIX_ATTRS = {"uname", "getuid", "geteuid", "fork", "getpwuid", "setuid", "getpgid"}
POSIX_MODULES = {"pwd", "grp", "fcntl", "termios", "resource"}

# Everything the tests may import beyond the standard library and this repository.
ALLOWED = {"pytest", "fastapi", "starlette", "pydantic", "app", "asgi_harness", "ui_preview_stamp"}


def _py_files(*roots):
    for root in roots:
        for base, dirs, names in os.walk(root):
            dirs[:] = [d for d in dirs if d not in {"__pycache__", "node_modules", ".git"}]
            for n in names:
                if n.endswith(".py"):
                    yield os.path.join(base, n)


def test_no_posix_only_api_in_code_the_tests_exercise():
    """AST, not grep. A comment or a docstring discussing the removed call would false-positive,
    and this repository has already spent four rounds on checks that matched their own prose."""
    bad = []
    for p in _py_files(BACKEND, TESTS):
        tree = ast.parse(open(p, encoding="utf-8").read(), filename=p)
        for node in ast.walk(tree):
            if isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name):
                if node.value.id == "os" and node.attr in POSIX_ATTRS:
                    bad.append("%s: os.%s()" % (os.path.relpath(p, ROOT), node.attr))
            if isinstance(node, ast.Import):
                for a in node.names:
                    if a.name.split(".")[0] in POSIX_MODULES:
                        bad.append("%s: import %s" % (os.path.relpath(p, ROOT), a.name))
            if isinstance(node, ast.ImportFrom) and node.module:
                if node.module.split(".")[0] in POSIX_MODULES:
                    bad.append("%s: from %s" % (os.path.relpath(p, ROOT), node.module))
    assert not bad, "POSIX-only API on a path the tests run:\n  " + "\n  ".join(bad)


def test_no_test_imports_a_library_the_app_does_not_declare():
    req = open(os.path.join(ROOT, "webapp", "backend", "requirements.txt"), encoding="utf-8").read()
    declared = set()
    for line in req.splitlines():
        line = line.split("#")[0].strip()
        if line:
            declared.add(line.split("[")[0].split("=")[0].split(">")[0].split("<")[0].strip().lower())

    stdlib = set(getattr(sys, "stdlib_module_names", set()))
    bad = []
    for p in _py_files(TESTS):
        tree = ast.parse(open(p, encoding="utf-8").read(), filename=p)
        for node in ast.walk(tree):
            names = []
            if isinstance(node, ast.Import):
                names = [a.name.split(".")[0] for a in node.names]
            elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
                names = [node.module.split(".")[0]]
            for n in names:
                if n in stdlib or n in ALLOWED or n in declared:
                    continue
                # A module that is a FILE IN THIS REPOSITORY is part of this repository, whether it
                # sits in tests/ or at the root. The rule is about depending on somebody else's
                # package, not about a test importing the very script it exists to test, and a
                # guard that forbids that pushes people to re-implement the code they are checking.
                if any(os.path.exists(os.path.join(d, n + ".py")) for d in (TESTS, ROOT)):
                    continue
                bad.append("%s imports %s" % (os.path.basename(p), n))
    assert not bad, (
        "a test imports something that is neither standard library, nor a declared dependency, "
        "nor part of this repository:\n  " + "\n  ".join(bad) + "\n"
        "That makes the suite unrunnable wherever it happens to be absent, and adding it to "
        "requirements.txt would ship a test library into the production image."
    )


def test_the_harness_itself_needs_only_the_standard_library():
    tree = ast.parse(open(os.path.join(TESTS, "asgi_harness.py"), encoding="utf-8").read())
    stdlib = set(getattr(sys, "stdlib_module_names", set()))
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            mods = (
                [a.name.split(".")[0] for a in node.names]
                if isinstance(node, ast.Import)
                else [(node.module or "").split(".")[0]]
            )
            for m in mods:
                assert m in stdlib, "the harness imports %s; it must be standard library only" % m


def test_no_gate_derives_a_path_from_a_file_url_pathname():
    """A file URL is PERCENT ENCODED, and the project folder has a space in its name.

    `new URL(import.meta.url).pathname` turns "S4biz new website" into "S4biz%20new%20website", so
    every read fails with ENOENT on a path that visibly exists. It also leaves a leading slash on
    a Windows drive letter. `fileURLToPath` handles both.

    This shipped broken and could never have worked: the sandbox the gates were written in had no
    space in its path, so all four passed there and all four failed on the operator's machine the
    first time they ran. It is the same root cause as every other entry in this file, which is
    why it is a test rather than a note.
    """
    tools = os.path.join(ROOT, "webapp", "frontend", "tools")
    bad = []
    for name in sorted(os.listdir(tools)):
        if not name.endswith(".mjs"):
            continue
        src = open(os.path.join(tools, name), encoding="utf-8").read()
        # Strip comments: several of these files EXPLAIN the banned pattern by name, and a naive
        # grep matches its own explanation. That mistake has cost this repository four rounds.
        code = re.sub(r"/\*[\s\S]*?\*/", "", src)
        code = "\n".join(ln for ln in code.splitlines() if not ln.lstrip().startswith("//"))

        if re.search(r"new URL\(\s*import\.meta\.url\s*\)\s*\.pathname", code):
            bad.append("%s uses new URL(import.meta.url).pathname" % name)
        if "import.meta.url" in code and "fileURLToPath" not in code:
            bad.append("%s derives a path from import.meta.url without fileURLToPath" % name)
    assert not bad, "\n  ".join(["path handling that breaks on a folder with a space:"] + bad)


def test_a_missing_source_file_is_a_defect_not_a_missing_toolchain():
    """Exit 2 means "the toolchain cannot run here" and ship.py only NOTES it. Reporting a missing
    source file that way is how a completely broken gate looked like an environment quirk."""
    src = open(
        os.path.join(ROOT, "webapp", "frontend", "tools", "i18n_gate.mjs"), encoding="utf-8"
    ).read()

    # ANCHOR ON THE FUNCTION, not on a fixed-size window after the `if`.
    #
    # The first version of this check searched `if (!existsSync(p)) {([\s\S]{0,400}?)}`, and it
    # failed a correct file for two reasons at once: the body contains a template literal `${p}`,
    # whose closing brace ended the non-greedy match early, and 400 characters did not reach past
    # the comment anyway. A brace is not a reliable delimiter in JavaScript source.
    start = src.index("async function load(")
    end = src.index("\n}", start)
    body = src[start:end]
    body = "\n".join(ln for ln in body.splitlines() if not ln.lstrip().startswith("//"))

    assert "existsSync" in body, "load() no longer checks whether the file exists"
    assert "process.exit(1)" in body, (
        "a missing locale file must exit 1 (a defect), not 2 (a toolchain that cannot run here)"
    )
    assert "process.exit(2)" not in body, (
        "load() still has an exit 2 path. ship.py only NOTES exit 2, so a completely broken gate "
        "would look like an environment quirk."
    )


def test_no_command_has_both_a_heredoc_and_a_stdin_redirect():
    """`cmd <<'EOF' ... EOF < file` — the LAST redirection wins, so the heredoc is DISCARDED.

    This shipped as `docker exec -i s4biz-web python3 - <<'PY' ... PY < /tmp/s4_facts.json`. The
    container therefore ran the FACTS as its program and died on `NameError: name 'true' is not
    defined`, which is JSON's lowercase true being executed as Python. The visible symptom was
    `REVIEW PANEL (0 of 4 answered)` on every release, which looks like a model or key problem and
    is not.

    Third instance of one root cause in this project: a secret piped to `bash -s`, a facts file
    `cat` into `bash -s`, and now a heredoc losing to a redirect. Stop routing two things through
    stdin. Pass one of them by PATH.
    """
    def prose_removed(src):
        """Blank the DOCSTRINGS and # comments, keep every other string.

        Not "strip all string literals": the shell scripts under inspection ARE string literals,
        so that would blind the check completely. And not "keep everything": the paragraph above
        quotes the exact defective line, and the first version of this check duly failed on its own
        explanation. That mistake is now recorded five times in this project — brand gate, recover,
        caddyguard, secaudit, here — so it is done properly with the parser.
        """
        lines = src.splitlines()
        try:
            tree = ast.parse(src)
        except SyntaxError:
            return src
        for node in ast.walk(tree):
            if not isinstance(node, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef,
                                     ast.ClassDef)):
                continue
            body = getattr(node, "body", None) or []
            if body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant) \
                    and isinstance(body[0].value.value, str):
                for i in range(body[0].lineno - 1, (body[0].end_lineno or body[0].lineno)):
                    if i < len(lines):
                        lines[i] = ""
        return "\n".join("" if ln.lstrip().startswith("#") else ln for ln in lines)

    bad = []
    for p in list(_py_files(ROOT)) + list(_py_files(TESTS)):
        src = prose_removed(open(p, encoding="utf-8").read())
        for m in re.finditer(r"<<-?\s*'?([A-Za-z_][A-Za-z0-9_]*)'?(.*)$", src, re.M):
            tail = m.group(2)
            # A redirect on the SAME command line as the heredoc opener, or on the line that
            # closes it, silently replaces the heredoc as stdin.
            if re.search(r"(?<![0-9<>])<(?!<)", tail):
                bad.append("%s: heredoc %s also has a stdin redirect" % (os.path.basename(p),
                                                                         m.group(1)))
        for m in re.finditer(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s+<(?!<)\s*\S+", src, re.M):
            if re.search(r"<<-?\s*'?%s'?" % re.escape(m.group(1)), src):
                bad.append("%s: heredoc %s is closed on a line that redirects stdin"
                           % (os.path.basename(p), m.group(1)))
    assert not bad, "\n  ".join(["the heredoc is discarded, the redirect wins:"] + sorted(set(bad)))


def test_no_test_hands_a_windows_path_to_bash():
    """`bash.EXE` on Windows is WSL's bash, and it CANNOT read a Windows path.

    It strips the backslashes silently, so `C:\\Users\\feran\\AppData\\Local\\Temp\\x.sh` arrives as
    `C:UsersferanAppDataLocalTempx.sh` and bash reports "No such file or directory" about a file
    that exists. A syntax check written with a temp file therefore failed the whole run on the
    operator's machine while passing in a Linux sandbox.

    Scripts go to bash on STDIN. No path, no translation, works everywhere.

    This is the FOURTH instance of one root cause in this project: percent-encoded gate paths, an
    httpx import that was not a dependency, a POSIX-only call on an error path, and now this.
    Writing the rule down has not been enough, so it is a test.
    """
    bad = []
    for p in _py_files(TESTS):
        src = open(p, encoding="utf-8").read()
        code = re.sub(r'"""[\s\S]*?"""', "", src)
        code = "\n".join(ln for ln in code.splitlines() if not ln.lstrip().startswith("#"))
        if not re.search(r'\[\s*bash\s*,', code):
            continue
        # SCOPE THE MATCH TO THE ARGUMENTS. The first version searched `args + code`, i.e. the
        # whole file, which contains `os.path` in every module here, so it failed a correct file
        # on the very first run. A bash invocation may carry flags and nothing else.
        for m in re.finditer(r"\[\s*bash\s*,([^\]]*)\]", code):
            args = m.group(1)
            if re.search(r"\bpath\b|\.name\b|tempfile", args):
                bad.append("%s passes a filesystem path to bash: [bash,%s]"
                           % (os.path.basename(p), args.strip()[:60]))
                break
    assert not bad, "\n  ".join(["bash cannot read a Windows path:"] + bad)


def test_no_deploy_script_writes_a_payload_into_argv():
    """Windows caps a command line at about 32 kilobytes, and Python surfaces that overflow as
    FileNotFoundError, which reads as "ssh is not installed" on a machine where ssh works. Payloads
    go over stdin."""
    src = open(os.path.join(ROOT, "deploy_direct.py"), encoding="utf-8").read()
    src = re.sub(r'"""[\s\S]*?"""', "", src)
    src = "\n".join(ln for ln in src.splitlines() if not ln.lstrip().startswith("#"))

    assert "input=payload.encode(" in src, "the payload must be sent as BYTES over stdin"

    # SCOPE THE ASSERTION TO THE SSH CALL. `text=True` is correct where we read git's own output,
    # and a blanket ban would fail a correct file. The rule is about the bytes we send to bash.
    m = re.search(r"subprocess\.run\(SSH \+ \[tgt, \"bash -s\"\][^)]*\)", src, re.S)
    assert m, "could not find the ssh payload call, so this check cannot see its subject"
    assert "text=True" not in m.group(0), (
        "text=True on the ssh call rewrites \\n into \\r\\n on Windows and feeds bash a CRLF "
        "script, which fails with \"$'\\r': command not found\""
    )


def test_the_dirty_path_report_names_the_real_path():
    """A diagnostic that misreports a path sends the next investigation down the wrong road.

    `git status --porcelain` is "XY <path>", and the first column is a SPACE for a file modified
    but not staged. The helper that runs git strips the whole output, which removes that space
    from the first line only, so a fixed-column slice ate one character of the FIRST path and left
    every other path correct. " M deploy_direct.py" was reported as "eploy_direct.py".

    Exercises the real function against the real shape rather than re-implementing the parse.
    """
    import subprocess as sp
    import sys as _sys

    _sys.path.insert(0, ROOT)
    import deploy_direct

    sample = " M deploy_direct.py\n M tests/test_coexistence.py\nA  obs/promtail.yml\n"

    class _R:
        returncode = 0
        stdout = sample
        stderr = ""

    real = sp.run
    try:
        sp.run = lambda *a, **k: _R()
        _, _, dirty = deploy_direct._tree_state()
    finally:
        sp.run = real

    assert dirty == ["deploy_direct.py", "tests/test_coexistence.py", "obs/promtail.yml"], (
        "the dirty-path parse is wrong: %r. The FIRST entry is the one that breaks, because the "
        "leading status space is stripped from the first line only." % (dirty,)
    )


def test_the_deploy_packs_the_commit_not_the_working_tree():
    import re

    src = open(os.path.join(ROOT, "deploy_direct.py"), encoding="utf-8").read()
    code = re.sub(r'"""[\s\S]*?"""', "", src)
    assert "core.autocrlf=false" in code and "core.eol=lf" in code, (
        "git archive applies the same end-of-line conversion as a checkout, so without both flags "
        "a Windows pack and a Linux pack of one commit produce different bytes"
    )
    assert 'archive", "--format=tar"' in code, "the pack must come from git archive HEAD"
