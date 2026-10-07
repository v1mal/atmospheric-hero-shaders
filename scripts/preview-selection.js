const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function changedFiles(root, from, to) {
  if (/^0+$/.test(from)) return null;
  return execFileSync("git", ["diff", "--name-only", "-z", from, to, "--"], {
    cwd: root, encoding: "utf8"
  }).split("\0").filter(Boolean);
}

function selectChangedShaders(manifest, collection, files, previewDir) {
  const refreshAll = files === null || files.some((file) =>
    file.startsWith("shared/") || file.startsWith("scripts/") ||
    file === "package.json" || file === ".github/workflows/generate-previews.yml" ||
    file === `${collection}/shaders.json` || file === `${collection}/preview.html`);
  if (refreshAll) return manifest;
  const changed = new Set(files);
  return manifest.filter((entry) => changed.has(`${collection}/${entry.slug}.html`) ||
    !fs.existsSync(path.join(previewDir, `${entry.slug}.webp`)));
}

module.exports = { changedFiles, selectChangedShaders };
