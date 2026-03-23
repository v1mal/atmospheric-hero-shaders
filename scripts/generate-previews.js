const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");
const sharp = require("sharp");

const ROOT = process.cwd();
const HOST = "127.0.0.1";
const PORT = 4173;
const VIEWPORT = { width: 1600, height: 1200 };
const WEBP_QUALITY = 86;

function parseArgs(argv) {
  const args = {
    all: false,
    force: false,
    shader: null,
    collection: "atmospheric-hero-shaders"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--all") args.all = true;
    if (value === "--force") args.force = true;
    if (value === "--shader") args.shader = argv[index + 1] || null;
    if (value === "--collection") args.collection = argv[index + 1] || args.collection;
  }

  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function startServer() {
  return spawn("python3", ["-m", "http.server", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore"
  });
}

async function writeWebp(buffer, outputPath) {
  await sharp(buffer).webp({ quality: WEBP_QUALITY }).toFile(outputPath);
}

async function captureShader(browser, shader, { BASE_URL, PREVIEW_DIR, collection }) {
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1
  });

  try {
    const url = `${BASE_URL}/preview.html?shader=${encodeURIComponent(shader.slug)}&capture=1&t=${encodeURIComponent(shader.previewTime || 4.0)}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__shaderPreviewReady === true, undefined, { timeout: 15000 });
    const image = await page.screenshot({ type: "png" });
    const outputPath = path.join(PREVIEW_DIR, `${shader.slug}.webp`);
    await writeWebp(image, outputPath);
    console.log(`Generated ${collection}/previews/${shader.slug}.webp`);
  } finally {
    await page.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const PLAYGROUND_DIR = path.join(ROOT, args.collection);
  const PREVIEW_DIR = path.join(PLAYGROUND_DIR, "previews");
  const MANIFEST_PATH = path.join(PLAYGROUND_DIR, "shaders.json");
  const TEMP_DIR = path.join(ROOT, ".tmp-preview-captures");
  const BASE_URL = `http://${HOST}:${PORT}/${args.collection}`;

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  let shaders = manifest;

  if (args.shader) {
    shaders = manifest.filter((entry) => entry.slug === args.shader);
    if (shaders.length === 0) {
      throw new Error(`Shader "${args.shader}" not found in ${args.collection}/shaders.json`);
    }
  }

  if (!args.force) {
    shaders = shaders.filter((entry) => args.all || !exists(path.join(PREVIEW_DIR, `${entry.slug}.webp`)));
  }

  if (shaders.length === 0) {
    console.log("No previews to generate.");
    return;
  }

  ensureDir(PREVIEW_DIR);
  ensureDir(TEMP_DIR);

  const server = startServer();
  try {
    await waitForServer(`${BASE_URL}/preview.html`);
    const browser = await chromium.launch({ headless: true });
    try {
      for (const shader of shaders) {
        await captureShader(browser, shader, { BASE_URL, PREVIEW_DIR, collection: args.collection });
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
