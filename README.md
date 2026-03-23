# Atmospheric Shaders

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Fullscreen GLSL experiments exploring the boundary between darkness and luminance. Smoke, liquid, silk, aurora, and deep space, each built as a single self-contained HTML file.

The focus is on:
- minimal, atmospheric visuals
- smooth motion and restrained color
- mobile-friendly performance
- single-file HTML shader studies with no build step

## Included

The playground currently includes:
- smoke and veil studies
- premium-tinted atmospheric variants
- dark liquid and caustic studies
- silk flow and glass-liquid experiments
- celestial and cosmic studies (aurora, star field, black hole)
- void, vortex, and orb studies

All shader pages live in `atmospheric-hero-shaders/`.

## Run Locally

Clone the repo and run:

```bash
git clone https://github.com/v1mal/atmospheric-hero-shaders.git
cd atmospheric-hero-shaders
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/atmospheric-hero-shaders/
```

## Project Structure

```text
atmospheric-hero-shaders/
  index.html        # main playground gallery
  preview.html      # lightweight preview renderer used by gallery cards
  ui.css            # shared UI tokens and component styles
  ui.js             # shared toolbar/icon behavior
  *.html            # individual fullscreen shader studies
```

## Notes

- Each shader is a standalone HTML file.
- The playground UI is shared, but shader visuals are self-contained per file.
- The gallery currently uses lightweight live previews.
- Preview generation is handled in GitHub Actions, not at runtime.

## Next

Planned improvements:
- cleanup of tracked macOS metadata files
- more shader families and curated variants
