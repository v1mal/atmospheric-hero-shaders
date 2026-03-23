# Project Context

## Overview

Atmospheric Hero Shaders is a curated collection of fullscreen WebGL/GLSL shader studies designed as cinematic hero-section backgrounds for websites. Each shader is a single self-contained HTML file with embedded GLSL code, zero external dependencies beyond WebGL, and no build step required.

**Live site:** shaders.vimal.works (GitHub Pages with custom domain)
**Repository:** github.com/v1mal/atmospheric-hero-shaders

---

## Project Structure

```
Shaders/
├── index.html                          # Root redirect to gallery
├── CNAME                               # Custom domain: shaders.vimal.works
├── package.json                        # Node deps (playwright, sharp)
├── README.md                           # Project overview
├── SHADERS_GUIDE.md                    # Cinematic GLSL technique reference
├── NEW_SHADER_WORKFLOW.md              # Checklist for adding new shaders
├── CONTEXT.md                          # This file
│
├── .github/workflows/
│   └── generate-previews.yml           # CI: auto-generate preview images
│
├── scripts/
│   └── generate-previews.js            # Playwright + Sharp preview capture script
│
└── atmospheric-hero-shaders/           # Main content directory
    ├── index.html                      # Gallery page (card grid of all shaders)
    ├── preview.html                    # Lightweight iframe renderer for previews
    ├── ui.css                          # Shared design tokens and component styles
    ├── ui.js                           # Shared icon injection and toolbar behavior
    ├── UI_SYSTEM.md                    # Design system documentation
    ├── shaders.json                    # Manifest (slug, title, previewTime per shader)
    ├── previews/                       # Auto-generated WebP thumbnails (1600x1200)
    └── *.html                          # Individual fullscreen shader files
```

---

## Shader Collection (21 shaders, 20 registered)

### Smoke and Fog
| Shader | Slug | Description |
|--------|------|-------------|
| Extinguish Smoke | `extinguish-smoke` | Monochromatic smoke ribbons |
| Veil Drift | `veil-drift` | Layered fog field |
| Linen Flow | `linen-flow` | Soft fabric-like flow |

### Premium-Tinted Atmospherics
| Shader | Slug | Description |
|--------|------|-------------|
| Ember Velvet | `ember-velvet` | Warm ember tones |
| Auric Mist | `auric-mist` | Gold-tinted atmosphere |
| Noctis Bloom | `noctis-bloom` | Dark bloom effect |

### Liquid and Caustic
| Shader | Slug | Description |
|--------|------|-------------|
| Obsidian Tide | `obsidian-tide` | Dark liquid distortion |
| Gilded Current | `gilded-current` | Gold caustic currents |
| Midnight Pool | `midnight-pool` | Deep liquid reflections |
| Glass Veil | `glass-veil` | Soft glass-liquid experiment |
| Ocean Labs | `ocean-labs` | Deep dark ocean surface with warped fluid dynamics |

### Geometric and Flow
| Shader | Slug | Description |
|--------|------|-------------|
| Satin Drape | `satin-drape` | Flowing satin folds |
| Aurora Borealis | `aurora-borealis` | Northern lights bands |
| Void Levitation | `void-levitation` | Suspended void particles |
| Nucleus Drift | `nucleus-drift` | Organic nucleus movement |
| Helix Void | `helix-void` | Helix in dark space |
| Helix Core | `helix-core` | Helix with bright core |
| Blue Vortex | `blue-vortex` | Blue spiral vortex |
| Nexus Silk | `nexus-silk` | Silk-like flowing nexus |

### Celestial
| Shader | Slug | Description |
|--------|------|-------------|
| Star Field | `starfield` | Twinkling stars, Milky Way, diffraction spikes |
| Event Horizon | `event-horizon` | Gravitational lensing effect (**not in shaders.json**) |

---

## Shader File Anatomy

Every shader HTML file follows the same pattern:

```
<!DOCTYPE html>
<html>
<head>
  <meta charset/viewport>
  <title>Shader Name</title>
  <style>/* Page background, canvas, overlay */</style>
  <link rel="stylesheet" href="./ui.css" />
  <script defer src="https://unpkg.com/lucide@latest"></script>
  <script defer src="./ui.js"></script>
</head>
<body>
  <a class="back-link" href="./index.html">Back to Playground</a>
  <button class="view-code-link">View Code</button>
  <canvas id="glsl-canvas"></canvas>
  <div class="overlay"></div>
  <div class="code-modal"><!-- Code viewer panel --></div>

  <script id="vertex-shader" type="x-shader/x-vertex">
    // Vertex shader (passes UV coordinates)
  </script>

  <script id="fragment-shader" type="x-shader/x-fragment">
    // Fragment shader (all visual logic)
    // Uses u_resolution, u_time, plus custom uniforms
  </script>

  <script>
    // WebGL setup, shader compilation, render loop
    // const params = { ... } for tweakable uniforms
  </script>
</body>
</html>
```

Key points:
- Each file is 190-335 lines, fully self-contained
- Fragment shaders use `precision highp float`
- Custom uniforms are defined in a `const params = { ... }` block
- The `preview.html` renderer extracts these params for preview capture

---

## Shared UI System

- **ui.css**: Design tokens (Plus Jakarta Sans font, color palette, spacing, radii, shadows) and component styles for back-link, view-code button, code modal, gallery cards
- **ui.js**: Lucide icon injection and toolbar/code-modal behavior
- **External dep**: Lucide icons via unpkg CDN

### Design Tokens (from ui.css)
- Font: Plus Jakarta Sans (400-800 weights)
- Text color: `#eef5f6`, muted: `#95a9ad`
- Surfaces: dark translucent backgrounds (`rgba(10, 15, 18, 0.7)`)
- Border radius: 14px (sm), 18px (md), 24px (lg)

---

## Gallery (index.html)

The gallery at `atmospheric-hero-shaders/index.html` displays all shaders as a responsive card grid. Each card shows:
- A WebP preview image (pre-generated, not live)
- The shader title
- A link to the fullscreen shader page

The root `index.html` at the repo root redirects to this gallery via meta refresh.

---

## Preview Generation Pipeline

### How it works
1. `shaders.json` defines each shader's `slug` and `previewTime` (seconds into animation to capture)
2. `scripts/generate-previews.js` starts a local HTTP server, opens each shader in headless Chromium via Playwright, waits until `previewTime`, captures a 1600x1200 screenshot, and converts it to WebP (quality 86) using Sharp
3. Output goes to `atmospheric-hero-shaders/previews/{slug}.webp`

### CI/CD (GitHub Actions)
- **Trigger**: Push to `main` when shader HTML files, `shaders.json`, or the generate script change
- **Manual trigger**: `workflow_dispatch` with optional `shader` slug and `force` flag
- **Steps**: Checkout, Node 22, npm install, Playwright Chromium install, generate previews, upload artifacts, commit and push previews back to `main`
- **Bot commits**: `github-actions[bot]` auto-commits generated preview images

### npm scripts
- `npm run generate-previews` - Generate missing previews only
- `npm run generate-previews:all` - Regenerate all previews (with `--force`)

---

## Cinematic Techniques (from SHADERS_GUIDE.md)

All shaders in this project follow these principles for a cohesive premium aesthetic:

1. **ACES Tonemapping** - Compresses HDR color into smooth filmic highlights without digital clipping
2. **Film Grain (Anti-Banding)** - Additive high-frequency white noise eliminates WebGL color banding on standard monitors
3. **Optical Flares / Blooms** - Inverse-square distance falloff mimics real light bloom through a lens
4. **Cartesian Liquid Distortion** - Rotational sine waves for organic liquid movement

---

## Adding a New Shader

Workflow (see NEW_SHADER_WORKFLOW.md for full details):

1. Create `atmospheric-hero-shaders/{slug}.html` following the shader file anatomy above
2. Add a card to `atmospheric-hero-shaders/index.html`
3. Add an entry to `atmospheric-hero-shaders/shaders.json` with slug, title, and previewTime
4. Commit and push to `main`
5. GitHub Actions auto-generates the preview WebP and commits it
6. Pull the bot commit: `git pull --rebase origin main`

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `playwright` (^1.58.2) | Headless Chromium for screenshot capture |
| `sharp` (^0.34.4) | PNG to WebP image conversion |

No runtime dependencies. Shaders run purely on WebGL in the browser.

---

## Hosting

- **Platform**: GitHub Pages
- **Custom domain**: shaders.vimal.works (configured via CNAME file)
- **Branch**: Served from `main`

---

## Run Locally

```bash
git clone https://github.com/v1mal/atmospheric-hero-shaders.git
cd atmospheric-hero-shaders
python3 -m http.server 4173
# Open http://127.0.0.1:4173/atmospheric-hero-shaders/
```

Or open any individual shader HTML file directly in a browser.
