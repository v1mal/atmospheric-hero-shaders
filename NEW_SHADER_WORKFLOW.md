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

## 2. Add a Gallery Card

Add a card to the collection's `index.html`:

```
{collection}/index.html
```

## 3. Add Preview Metadata

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

## 4. Commit and Push

```bash
cd /Users/vimal/Desktop/shaders
git add {collection}
git commit -m "Add my-new-shader to {collection}"
git push
```

## 5. Wait for Preview Generation

Pushing to `main` automatically triggers the `Generate Shader Previews` GitHub Action for the collection that changed. It generates the `.webp` preview and commits it back to `main`.

## 6. Pull the Bot Commit

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

See the "Adding a New Collection" section in `CONTEXT.md` for the full checklist.
