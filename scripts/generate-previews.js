const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { changedFiles, selectChangedShaders } = require("./preview-selection");
const { chromium } = require("playwright");
const sharp = require("sharp");

const ROOT = process.cwd();
const HOST = "127.0.0.1";
const PORT = 4173;
const VIEWPORT = { width: 1600, height: 1200 };
const WEBP_QUALITY = 86;
const VALID_NAME = /^[a-z0-9-]+$/;

function parseArgs(argv) {
  const args = {
    all: false,
    force: false,
    shader: null,
    collection: "atmospheric-hero-shaders",
    changedFrom: null,
    changedTo: "HEAD"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--all") args.all = true;
    if (value === "--force") args.force = true;
    if (value === "--shader") args.shader = argv[index + 1] || null;
    if (value === "--collection") args.collection = argv[index + 1] || args.collection;
    if (value === "--changed-from") args.changedFrom = argv[index + 1] || null;
    if (value === "--changed-to") args.changedTo = argv[index + 1] || "HEAD";
  }

  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function assertValidName(value, label) {
  if (!VALID_NAME.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
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
    // Rendering is self-contained. Avoid remote font/icon latency during capture.
    await page.route(/^https?:\/\//, (route) => {
      if (new URL(route.request().url()).origin === new URL(BASE_URL).origin) return route.continue();
      return route.abort();
    });
    const time = shader.previewTime ?? 4.0;
    const url = `${BASE_URL}/preview.html?shader=${encodeURIComponent(shader.slug)}&capture=1&t=${encodeURIComponent(time)}`;
    await page.goto(url, { waitUntil: "load" });
    await page.waitForFunction(
      () => window.__shaderPreviewReady === true || window.__shaderPreviewError,
      undefined,
      { timeout: Math.max(15000, time * 1000 + 15000) }
    );
    const error = await page.evaluate(() => window.__shaderPreviewError);
    if (error) throw new Error(`${shader.slug}: ${error}`);
    const image = await page.screenshot({ type: "png" });
    const previewRoot = path.resolve(PREVIEW_DIR);
    const outputPath = path.resolve(previewRoot, `${shader.slug}.webp`);
    if (!outputPath.startsWith(`${previewRoot}${path.sep}`) && outputPath !== path.join(previewRoot, `${shader.slug}.webp`)) {
      throw new Error(`Refusing to write outside preview directory for ${shader.slug}`);
    }
    await writeWebp(image, outputPath);
    console.log(`Generated ${collection}/previews/${shader.slug}.webp`);
  } finally {
    await page.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  assertValidName(args.collection, "collection");
  if (args.shader) {
    assertValidName(args.shader, "shader slug");
  }

  const PLAYGROUND_DIR = path.join(ROOT, args.collection);
  const PREVIEW_DIR = path.join(PLAYGROUND_DIR, "previews");
  const MANIFEST_PATH = path.join(PLAYGROUND_DIR, "shaders.json");
  const BASE_URL = `http://${HOST}:${PORT}/${args.collection}`;

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  for (const entry of manifest) {
    assertValidName(entry.slug, "manifest shader slug");
  }
  let shaders = manifest;

  if (args.shader) {
    shaders = manifest.filter((entry) => entry.slug === args.shader);
    if (shaders.length === 0) {
      throw new Error(`Shader "${args.shader}" not found in ${args.collection}/shaders.json`);
    }
  }

  if (args.changedFrom) {
    shaders = selectChangedShaders(shaders, args.collection,
      changedFiles(ROOT, args.changedFrom, args.changedTo), PREVIEW_DIR);
  } else if (!args.force) {
    shaders = shaders.filter((entry) => args.all || !exists(path.join(PREVIEW_DIR, `${entry.slug}.webp`)));
  }

  if (shaders.length === 0) {
    console.log("No previews to generate.");
    return;
  }

  ensureDir(PREVIEW_DIR);

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
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
