# New Shader Workflow

Use this checklist every time you add a new shader to any collection.

---

## 1. Create the Shader File

Create the shader inside the target collection folder:

```
{collection}/my-new-shader.html
```

Examples:
```
atmospheric-hero-shaders/my-new-shader.html
gradient-shaders/my-new-shader.html
```

UI paths inside every shader file must be:
```html
<link rel="stylesheet" href="../shared/ui.css" />
<script defer src="https://unpkg.com/lucide@latest"></script>
<script defer src="../shared/ui.js"></script>
```

## 2. Choose a Post Profile

Before wiring the shader into the gallery, classify its material/visual intent and choose the finishing profile that fits it best.

Available profiles:
- `minimalClean`
- `softAtmospheric`
- `cinematicGlow`
- `printSurface`
- `liquidGloss`

Decision rule:
- do **not** apply the same post stack to every shader
- choose the profile based on the shader's material read and highlight structure
- use `SHADERS_GUIDE.md` as the source of truth for profile selection

Quick examples:
- minimal gradients / clean spatial work → `minimalClean`
- smoke / veil / soft luminous atmosphere → `softAtmospheric`
- black holes / plasma / emissive cosmic work → `cinematicGlow`
- geometric / poster / paper / gouache work → `printSurface`
- glossy liquids / caustics / reflective fluid work → `liquidGloss`

## 3. Add a Gallery Card

Add a card to the collection's `index.html`:

```
{collection}/index.html
```

## 4. Add Preview Metadata

Add an entry to the collection's `shaders.json`:

```
{collection}/shaders.json
```

```json
{
  "slug": "my-new-shader",
  "title": "My New Shader",
  "previewTime": 4.2
}
```

For a stateful simulation, add `"direct": true` so capture runs real warm-up frames. Other shaders are captured at a fixed animation time, including their complete post-processing pipeline.

## 5. Visually Verify the Shader

Before committing:
- verify the chosen post profile improves the shader without changing its identity
- check for washout, clipping, muddy bloom, banding, or lost edge detail
- if the finish makes the shader worse, reduce it or switch profiles

## 6. Commit and Push

```bash
cd /Users/vimal/Desktop/shaders
git add {collection}
git commit -m "Add my-new-shader to {collection}"
git push
```

## 7. Wait for Preview Generation

Pushing to `main` automatically triggers the `Generate Shader Previews` GitHub Action. It checks the whole push, refreshes changed shaders even if their WebPs already exist, and commits all generated previews together. Manifest and preview-page changes refresh the collection; shared UI, renderer, and generator changes refresh all collections.

## 8. Pull the Bot Commit

```bash
git pull --rebase origin main
```

---

## Short Version

```bash
cd /Users/vimal/Desktop/shaders
git add {collection}
git commit -m "Add my-new-shader to {collection}"
git push
# wait for CI
git pull --rebase origin main
```

---

## Adding a New Collection

Load `../shared/ui.css`, Lucide, and `../shared/ui.js` in the new gallery head. Add collection links to every gallery, add a hub card with the manifest count, add the collection to the preview CI matrix and commit-job collection list, and update `CONTEXT.md`.
