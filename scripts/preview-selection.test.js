const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { changedFiles, selectChangedShaders } = require("./preview-selection");

test("refresh changed shaders even when thumbnails exist, and include missing thumbnails", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "preview-selection-"));
  try {
    for (const slug of ["changed", "untouched"]) fs.writeFileSync(path.join(dir, `${slug}.webp`), "existing");
    const manifest = ["changed", "untouched", "missing"].map((slug) => ({ slug }));
    assert.deepEqual(selectChangedShaders(manifest, "studies", ["studies/changed.html"], dir),
      [manifest[0], manifest[2]]);
    assert.deepEqual(selectChangedShaders(manifest.slice(0, 2), "studies", ["other/changed.html"], dir), []);
    for (const file of ["studies/shaders.json", "studies/preview.html", "scripts/generate-previews.js",
      "shared/preview-runtime.js", "shared/ui.css", "package.json", ".github/workflows/generate-previews.yml"]) {
      assert.deepEqual(selectChangedShaders(manifest, "studies", [file], dir), manifest, file);
    }
    assert.deepEqual(selectChangedShaders(manifest, "studies", null, dir), manifest);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("detect changes across the full push, including changes before its last commit", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "preview-git-range-"));
  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
  try {
    git("init", "--quiet");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Preview Test");
    fs.writeFileSync(path.join(dir, "README.md"), "base");
    git("add", "."); git("commit", "--quiet", "-m", "base");
    const before = git("rev-parse", "HEAD");
    fs.mkdirSync(path.join(dir, "studies"));
    fs.writeFileSync(path.join(dir, "studies", "changed.html"), "shader");
    git("add", "."); git("commit", "--quiet", "-m", "shader");
    fs.writeFileSync(path.join(dir, "README.md"), "later documentation");
    git("add", "."); git("commit", "--quiet", "-m", "docs");
    assert.deepEqual(changedFiles(dir, before, "HEAD"), ["README.md", "studies/changed.html"]);
    assert.deepEqual(changedFiles(dir, "HEAD~1", "HEAD"), ["README.md"]);
    assert.equal(changedFiles(dir, "0".repeat(40), "HEAD"), null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("the CI writer retries pushes and preserves previews for newer shader sources", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "preview-ci-writer-"));
  const source = path.join(dir, "source");
  const writer = path.join(dir, "writer");
  const remote = path.join(dir, "remote.git");
  const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  const write = (base, file, content) => {
    const target = path.join(base, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  try {
    fs.mkdirSync(source);
    git(dir, "init", "--bare", "--quiet", "--initial-branch=main", remote);
    git(source, "init", "--quiet", "--initial-branch=main");
    git(source, "config", "user.email", "test@example.com");
    git(source, "config", "user.name", "Preview Test");
    for (const slug of ["first", "later"]) {
      write(source, `atmospheric-hero-shaders/${slug}.html`, "original shader");
      write(source, `atmospheric-hero-shaders/previews/${slug}.webp`, "original preview");
    }
    write(source, "gradient-shaders/study.html", "gradient");
    write(source, "gradient-shaders/previews/study.webp", "original gradient preview");
    git(source, "add", "."); git(source, "commit", "--quiet", "-m", "base");
    git(source, "remote", "add", "origin", remote);
    git(source, "push", "--quiet", "origin", "main");
    const eventSha = git(source, "rev-parse", "HEAD");
    git(dir, "clone", "--quiet", remote, writer);

    // Another push changes only one shader in the same collection.
    write(source, "atmospheric-hero-shaders/later.html", "newer shader");
    write(source, "atmospheric-hero-shaders/previews/later.webp", "newer preview");
    git(source, "add", "."); git(source, "commit", "--quiet", "-m", "newer source");
    git(source, "push", "--quiet", "origin", "main");
    for (const slug of ["first", "later"]) {
      write(writer, `.preview-artifacts/atmospheric-hero-shaders/previews/${slug}.webp`, "generated preview");
    }
    write(writer, ".preview-artifacts/gradient-shaders/previews/study.webp", "generated gradient preview");

    // Exercise the actual workflow script, including its failed-push retry.
    const workflow = fs.readFileSync(path.join(__dirname, "../.github/workflows/generate-previews.yml"), "utf8");
    const script = workflow.slice(workflow.lastIndexOf("        run: |\n") + "        run: |\n".length)
      .split("\n").map((line) => line.replace(/^          /, "")).join("\n");
    execFileSync("bash", ["-n"], { input: script });
    const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
    const marker = path.join(dir, "push-retried");
    write(dir, "bin/git", '#!/bin/sh\nif [ "$1" = "push" ] && [ ! -f "$RETRY_MARKER" ]; then\n  touch "$RETRY_MARKER"\n  exit 1\nfi\nexec "$REAL_GIT" "$@"\n');
    fs.chmodSync(path.join(dir, "bin/git"), 0o755);
    execFileSync("bash", ["-e", "-o", "pipefail", "-c", script], {
      cwd: writer, stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, EVENT_SHA: eventSha, REAL_GIT: realGit,
        RETRY_MARKER: marker, PATH: path.join(dir, "bin") + path.delimiter + process.env.PATH }
    });
    assert.ok(fs.existsSync(marker));
    git(source, "pull", "--quiet", "--ff-only", "origin", "main");
    assert.equal(fs.readFileSync(path.join(source, "atmospheric-hero-shaders/previews/first.webp"), "utf8"), "generated preview");
    assert.equal(fs.readFileSync(path.join(source, "atmospheric-hero-shaders/previews/later.webp"), "utf8"), "newer preview");
    assert.equal(fs.readFileSync(path.join(source, "gradient-shaders/previews/study.webp"), "utf8"), "generated gradient preview");
    assert.equal(git(source, "log", "-1", "--format=%s"), "Generate shader previews");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
