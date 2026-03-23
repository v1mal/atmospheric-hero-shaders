# Project Context

## Overview

Shader Studies is a growing collection of fullscreen WebGL/GLSL shader experiments organised into themed collections. Each shader is a single self-contained HTML file with embedded GLSL code, zero external dependencies beyond WebGL, and no build step required.

**Live site:** shaders.vimal.works (GitHub Pages with custom domain)
**Repository:** github.com/v1mal/atmospheric-hero-shaders

---

## Project Structure

```
Shaders/
├── index.html                          # Hub page — links to all collections
├── CNAME                               # Custom domain: shaders.vimal.works
├── package.json                        # Node deps (playwright, sharp)
├── README.md                           # Project overview
├── SHADERS_GUIDE.md                    # Cinematic GLSL technique reference
├── NEW_SHADER_WORKFLOW.md              # Checklist for adding new shaders
├── CONTEXT.md                          # This file
│
├── shared/                             # Canonical shared UI — used by all collections
│   ├── ui.css                          # Design tokens and component styles
│   └── ui.js                           # Toolbar, modal, and icon injection logic
│
├── .github/workflows/
│   └── generate-previews.yml           # CI: auto-generate preview images (matrix: all collections)
│
├── scripts/
│   ├── generate-previews.js            # Playwright + Sharp preview capture script (--collection flag)
│   └── strip-modal-boilerplate.py      # One-time script: removed modal HTML/JS from all shader files
│
├── atmospheric-hero-shaders/           # Collection: atmospheric GLSL studies
│   ├── index.html                      # Gallery page
│   ├── preview.html                    # Lightweight iframe renderer for previews
│   ├── UI_SYSTEM.md                    # Design system documentation
│   ├── shaders.json                    # Manifest (slug, title, previewTime per shader)
│   ├── previews/                       # Auto-generated WebP thumbnails (1600x1200)
│   └── *.html                          # Individual fullscreen shader files
│
└── gradient-shaders/                   # Collection: animated gradient studies
    ├── index.html                      # Gallery page
    ├── preview.html                    # Lightweight iframe renderer for previews
    ├── shaders.json                    # Manifest (slug, title, previewTime per shader)
    └── previews/                       # Auto-generated WebP thumbnails (1600x1200)
```

Each collection folder is self-contained. Shared UI lives only in `shared/`. To add a new collection, create a new sibling folder following the same structure.

---

## Collections

### Atmospheric (21 shaders)

Fullscreen GLSL experiments exploring the boundary between darkness and luminance: smoke, liquid, silk, aurora, and deep space.

#### Smoke and Fog
| Shader | Slug | Description |
|--------|------|-------------|
| Extinguish Smoke | `extinguish-smoke` | Monochromatic smoke ribbons |
| Veil Drift | `veil-drift` | Layered fog field |
| Linen Flow | `linen-flow` | Soft fabric-like flow |

#### Premium-Tinted Atmospherics
| Shader | Slug | Description |
|--------|------|-------------|
| Ember Velvet | `ember-velvet` | Warm ember tones |
| Auric Mist | `auric-mist` | Gold-tinted atmosphere |
| Noctis Bloom | `noctis-bloom` | Dark bloom effect |

#### Liquid and Caustic
| Shader | Slug | Description |
|--------|------|-------------|
| Obsidian Tide | `obsidian-tide` | Dark liquid distortion |
| Gilded Current | `gilded-current` | Gold caustic currents |
| Midnight Pool | `midnight-pool` | Deep liquid reflections |
| Glass Veil | `glass-veil` | Soft glass-liquid experiment |
| Ocean Labs | `ocean-labs` | Deep dark ocean surface with warped fluid dynamics |

#### Geometric and Flow
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

#### Celestial
| Shader | Slug | Description |
|--------|------|-------------|
| Star Field | `starfield` | Twinkling stars, Milky Way, diffraction spikes |
| Event Horizon | `event-horizon` | Black hole with accretion rings, debris field, photon rim |

### Gradients (0 shaders)

Animated WebGL gradient studies exploring color transitions, flow, and smooth generative motion.

---

## Shader File Anatomy

Every shader HTML file follows the same pattern regardless of collection:

```
<!DOCTYPE html>
<!-- MIT License — Copyright (c) 2026 Vimal — https://github.com/v1mal/atmospheric-hero-shaders -->
<html>
<head>
  <meta charset/viewport>
  <title>Shader Name</title>
  <style>/* Page background, canvas, overlay */</style>
  <link rel="stylesheet" href="../shared/ui.css" />
  <script defer src="https://unpkg.com/lucide@latest"></script>
  <script defer src="../shared/ui.js"></script>
</head>
<body>
  <a class="back-link" href="./index.html">Back to Playground</a>
  <button class="view-code-link">View Code</button>
  <canvas id="glsl-canvas"></canvas>
  <div class="overlay"></div>
  <!-- No code-modal HTML — injected at runtime by ui.js -->

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
    window.shaderControls = params;
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(render);
  </script>
</body>
</html>
```

Key points:
- Each file is 190-335 lines, fully self-contained
- Fragment shaders use `precision highp float`
- Custom uniforms are defined in a `const params = { ... }` block
- The `preview.html` renderer extracts these params for preview capture
- MIT license comment header on line 2 of every shader file
- UI paths are always `../shared/ui.css` and `../shared/ui.js` (one level up from the collection folder)

---

## Shared UI System

Lives in `shared/`. Referenced by every shader and gallery page as `../shared/ui.css` and `../shared/ui.js`.

- **ui.css**: Design tokens (Plus Jakarta Sans font, color palette, spacing, radii, shadows), component styles for gallery cards, collection nav, toolbar, code modal, and footer
- **ui.js**: All toolbar and modal logic — icon injection, modal shell injection, modal behavior (open/close/copy/Escape), iframe detection, Prism.js lazy-loading for syntax highlighting
- **External deps**: Lucide icons via unpkg CDN; Prism.js (v1.29.0) via cdnjs, lazy-loaded on first "View Code" click

### ui.js responsibilities
- `enhanceIconButton()` — injects Lucide SVG icons into toolbar buttons
- `injectModalShell()` — creates the `.code-modal` DOM at runtime (marked `data-ui-injected` so it is stripped from the "View Code" source output)
- `injectModalFooter()` — appends the copyright/license footer to the code panel
- `initModalBehavior()` — wires up all modal event listeners; `getSource()` clones the document and removes `[data-ui-injected]` elements before serializing; calls `Prism.highlightElement()` after opening
- `loadPrism()` — lazy-loads Prism CSS + JS from cdnjs on first modal open; `Prism.manual = true` disables auto-scan
- `positionToolbarButtons()` — positions "View Code" button relative to "Back" button
- iframe check in `enhanceToolbar()` — hides toolbar when shader is embedded in a preview iframe

### Design Tokens (from ui.css)
- Font: Plus Jakarta Sans (400-800 weights)
- Text color: `#eef5f6`, muted: `#95a9ad`
- Surfaces: dark translucent backgrounds (`rgba(10, 15, 18, 0.7)`)
- Border radius: 14px (sm), 18px (md), 24px (lg)

---

## Collection Navigation

Each gallery `index.html` includes a `.collection-nav` bar that shows:
- "All Collections" link back to the root hub (`../`)
- A pill link for each collection, with the current one marked `.collection-nav__link--active`

The `.collection-nav` styles live in `shared/ui.css`. When adding a new collection, add a pill link to the nav in every existing gallery's `index.html`.

---

## Preview Generation Pipeline

### How it works
1. `shaders.json` in each collection defines each shader's `slug` and `previewTime` (seconds into animation to capture)
2. `scripts/generate-previews.js` starts a local HTTP server, opens each shader in headless Chromium via Playwright, waits until `previewTime`, captures a 1600x1200 screenshot, and converts it to WebP (quality 86) using Sharp
3. Output goes to `{collection}/previews/{slug}.webp`

### CI/CD (GitHub Actions)
- **Trigger**: Push to `main` when shader HTML files or `shaders.json` change in any collection folder
- **Matrix**: One job per collection (`atmospheric-hero-shaders`, `gradient-shaders`). Each job only runs if files in its collection changed.
- **Manual trigger**: `workflow_dispatch` with `collection`, `shader`, and `force` inputs
- **Bot commits**: `github-actions[bot]` auto-commits generated previews back to `main`, labelled `Generate shader previews [{collection}]`

### npm scripts
- `npm run generate-previews` — generate missing atmospheric previews
- `npm run generate-previews:all` — regenerate all atmospheric previews
- `npm run generate-previews:gradient` — generate missing gradient previews
- `npm run generate-previews:gradient:all` — regenerate all gradient previews
- Any collection: `node scripts/generate-previews.js --collection {folder-name}`

---

## Adding a New Shader

See `NEW_SHADER_WORKFLOW.md` for the full checklist. In brief:

1. Create `{collection}/{slug}.html` following the shader file anatomy above
2. Add a card to `{collection}/index.html`
3. Add an entry to `{collection}/shaders.json` with slug, title, and previewTime
4. Commit and push to `main`
5. GitHub Actions auto-generates the preview WebP and commits it
6. Pull the bot commit: `git pull --rebase origin main`

---

## Adding a New Collection

1. Create `{collection-name}/` at the repo root with: `index.html`, `preview.html`, `shaders.json` (`[]`), `previews/.gitkeep`
2. Copy `preview.html` from an existing collection — only the CSS path (`../shared/ui.css`) needs updating
3. Add a `.collection-nav__link` entry for the new collection in every existing gallery's `index.html`
4. Add a hub card for the new collection in the root `index.html`
5. Add the new collection to the matrix in `.github/workflows/generate-previews.yml`
6. Update `CONTEXT.md` and `CLAUDE.md`

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
# Open http://127.0.0.1:4173/
```

Or open any individual shader HTML file directly in a browser.
