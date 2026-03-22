Save this as `NEW_SHADER_WORKFLOW.md` wherever you want outside the repo:

```md
# New Shader Workflow

Use this checklist every time you add a new shader experiment to the playground.

## 1. Add the Shader

Create the new shader file inside:

```text
atmospheric-hero-shaders/
```

Example:

```text
atmospheric-hero-shaders/my-new-shader.html
```

## 2. Add It to the Gallery

Update:

```text
atmospheric-hero-shaders/index.html
```

Add a new card that links to the shader page.

## 3. Add Preview Metadata

Update:

```text
atmospheric-hero-shaders/shaders.json
```

Add a new entry with:
- `slug`
- `title`
- `previewTime`

Example:

```json
{
  "slug": "my-new-shader",
  "title": "My New Shader",
  "previewTime": 4.2
}
```

## 4. Commit and Push Your Shader Changes

Run:

```bash
cd /Users/vimal/Desktop/shaders
git status --short
git add atmospheric-hero-shaders
git commit -m "Add my-new-shader experiment"
git push
```

## 5. Wait for Preview Generation

Pushing to `main` automatically triggers the `Generate Shader Previews` GitHub Action. It will generate the `.webp` preview and commit it back to `main`.

## 6. Sync the Auto-Generated Preview Commit

After the workflow succeeds, pull the updated `main` branch:

```bash
cd /Users/vimal/Desktop/shaders
git pull --rebase origin main
```

## Short Version

```bash
cd /Users/vimal/Desktop/shaders
git add atmospheric-hero-shaders
git commit -m "Add my-new-shader experiment"
git push
```

Then wait for the `Generate Shader Previews` Action to finish and run:

```bash
git pull --rebase origin main
```
```