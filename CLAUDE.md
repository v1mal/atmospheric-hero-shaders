# Shader Studies — Claude Instructions

## Project Overview

A growing collection of fullscreen WebGL/GLSL shader experiments organised into themed collections. Each shader is a single self-contained HTML file with embedded GLSL and plain WebGL, with no build step.

Collections live as sibling folders at the repo root. See `CONTEXT.md` for full project structure and `SHADERS_GUIDE.md` for cinematic GLSL techniques.

Current collections:
- `atmospheric-hero-shaders/` — smoke, liquid, silk, aurora, deep space (21 shaders)
- `gradient-shaders/` — animated gradient studies (2 shaders)
- `fractal-universe/` — fractal and self-similar pattern studies (4 shaders)
- `geometric-abstraction/` — abstract art-inspired geometric studies (4 shaders)
- `organic-patterns/` — reaction-diffusion and biological growth studies (1 shader)

---

## GLSL References

When writing or reviewing GLSL code, refer to these resources in order of relevance:

1. **Inigo Quilez — Articles** (`https://iquilezles.org/articles/`): The primary technical reference for this project. Covers SDFs, domain warping, procedural noise, FBM, volumetric fog, smooth blending, and organic shapes — the foundational techniques behind smoke, liquid, aurora, and cosmic shaders.

2. **The Book of Shaders** (`https://thebookofshaders.com`): Background reference for noise (value, gradient, FBM), patterns, and domain warping. Useful when building smoke, silk, or fluid motion shaders from scratch.

3. **awesome-glsl** (`https://github.com/vanrez-nez/awesome-glsl`): A broad directory of GLSL tools, editors, and learning resources. Useful for orientation and tool discovery, not technique depth.

Before writing a new shader, fetch and read the relevant IQ article for the core technique being implemented.

---

## Adding a New Shader

See `NEW_SHADER_WORKFLOW.md` for the full checklist. In brief:

1. Create `{collection}/{slug}.html` following the file anatomy in `CONTEXT.md`
2. Add a card to `{collection}/index.html`
3. Add an entry to `{collection}/shaders.json`
4. Commit and push — GitHub Actions auto-generates the preview WebP

---

## Git Rules

- Never commit or push without explicitly showing the user what will be committed and getting confirmation first

---

## Key Rules

- Never introduce external runtime dependencies to shader files
- All shared UI logic belongs in `shared/ui.js` and `shared/ui.css` — never inside a collection folder
- Prefer shared toolbar/modal behavior from `ui.js`. Some existing files still include legacy inline `.code-modal` markup, so match the collection's current pattern unless you are explicitly cleaning it up.
- Shader UI paths must always be `../shared/ui.css` and `../shared/ui.js`
- Follow the cinematic techniques in `SHADERS_GUIDE.md` (ACES tonemapping, film grain, inverse-square bloom, liquid distortion)
- No em dashes in copy, descriptions, or UI text
- When adding a new collection: the new gallery `index.html` must load `../shared/ui.css`, `https://unpkg.com/lucide@latest`, and `../shared/ui.js` in `<head>`; update the nav in all existing gallery `index.html` files; add a hub card to root `index.html`; add the collection to the CI matrix in `.github/workflows/generate-previews.yml`; and update `CONTEXT.md`
