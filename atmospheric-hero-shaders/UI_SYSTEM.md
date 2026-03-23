# Atmospheric Shaders UI System

This document describes the shared UI system for the shader playground and fullscreen shader pages in this root folder. The goal is to keep the playground visually consistent, lightweight, and easy to extend without reintroducing page-local chrome styles.

## Scope

The shared UI system covers:

- The gallery shell in `index.html`
- The preview shell in `preview.html`
- The fullscreen chrome in each shader page at the root
- Shared styles in `ui.css`
- Shared behavior in `ui.js`

It does not control shader visuals, WebGL setup, uniforms, or fragment logic.

## Design Principles

- Use a single typeface: `Plus Jakarta Sans`
- Keep the UI tokenized with CSS custom properties
- Prefer reusable class patterns over page-specific styling
- Keep fullscreen controls clean and minimal
- Keep gallery cards and fullscreen chrome visually aligned
- Avoid serif fallbacks or mixed typography

## Core Files

- [`ui.css`](./ui.css): shared design tokens and component styles
- [`ui.js`](./ui.js): shared icon injection and fullscreen toolbar positioning
- [`index.html`](./index.html): gallery shell
- [`preview.html`](./preview.html): lightweight iframe preview renderer

## Design Tokens

The UI is built around CSS custom properties in `:root` inside this root folder.

### Typography Tokens

- `--ui-font-sans`: primary UI typeface, `Plus Jakarta Sans`
- `--ui-font-mono`: code font for the source modal

### Color Tokens

- `--ui-color-text`: primary foreground
- `--ui-color-muted`: supporting copy
- `--ui-color-accent`: badges, labels, subtle highlights
- `--ui-color-accent-strong`: high-contrast emphasis
- `--ui-surface`: soft translucent surface
- `--ui-surface-strong`: modal surface
- `--ui-surface-hover`: elevated hover surface
- `--ui-border`: default border
- `--ui-border-strong`: stronger border for toolbar and modal elements

### Shadow Tokens

- `--ui-shadow-sm`: toolbar/button shadow
- `--ui-shadow-md`: cards
- `--ui-shadow-lg`: modal/panel depth

### Radius Tokens

- `--ui-radius-sm`: small elements
- `--ui-radius-md`: panels
- `--ui-radius-lg`: cards and modals
- `--ui-radius-pill`: pill buttons and labels

### Spacing Tokens

- `--ui-space-1` through `--ui-space-8`
- Used for page padding, card gaps, toolbar placement, modal spacing, and internal rhythm

### Motion Tokens

- `--ui-speed-fast`
- `--ui-speed-base`
- `--ui-speed-slow`
- `--ui-ease-out`

These are used for hover states, modal transitions, and toolbar reveal timing.

## Typography System

All UI typography uses `Plus Jakarta Sans`.

### Page Title

Class pattern:

- `.page-title`
- `h1`

Usage:

- Large gallery heading
- Tight tracking
- Heavy weight for a premium editorial feel

### Intro Copy

Class pattern:

- `.page-intro`
- `.intro`

Usage:

- Gallery description
- Softer color
- Higher line-height for readability

### Card Titles and Descriptions

Class patterns:

- `.shader-card__title`
- `.shader-card__description`

Usage:

- Shared card heading and supporting copy
- Single font family, no serif fallback
- Consistent line-height and spacing

### Metadata / Badge Text

Class patterns:

- `.meta`
- `.meta-badge`
- `.eyebrow`
- `.section-label`

Usage:

- Small labels and state chips
- Upper-level section markers
- Card metadata

### Toolbar and Modal Copy

Class patterns:

- `.back-link`
- `.view-code-link`
- `.code-button`
- `.code-panel-header`

Usage:

- Fixed fullscreen controls
- Modal button labels
- Code panel title

## Layout System

### Page Shell

Class patterns:

- `.shell`
- `.page-shell`

Usage:

- Shared outer wrapper for gallery content in `index.html`
- Full-width behavior
- No page-specific shell duplication

### Gallery Grid

Class patterns:

- `.grid`
- `.gallery-grid`

Behavior:

- Responsive auto-fit grid
- Cards naturally expand to available columns
- No fixed three-column layout

### Card Layout

Class patterns:

- `.card`
- `.shader-card`
- `.content`
- `.shader-card__body`

Behavior:

- Card content stretches to equal height
- Preview sits above the text body
- Meta label stays pinned to the bottom of the body

### Preview Frame

Class patterns:

- `.card iframe`
- `.shader-card__preview`

Behavior:

- Fixed aspect ratio preview area
- Pointer events disabled
- Shared background and clipping behavior

## UI Components

### Gallery Card

The gallery card is the main repeated component in `index.html`.

Structure:

- preview frame
- title
- description
- meta label

Goals:

- Keep preview and content visually balanced
- Keep card height consistent
- Make it easy to add more shader studies

### Meta Label

The meta label is a reusable pill-style text element used for:

- `Open study`
- `Premium tint`
- `Liquid tint`
- `Liquid glass`

It is styled through the shared label tokens and can be reused anywhere a small status chip is needed.

### Action Buttons

Shared button patterns:

- `.back-link`
- `.view-code-link`
- `.toolbar-button`
- `.code-button`

Design goals:

- Matching height and padding
- Matching font weight and icon alignment
- Same visual family across fullscreen chrome and modal controls

### Fullscreen Toolbar

Fullscreen pages use two primary controls:

- `Back to Playground`
- `View Code`

Behavior:

- Fixed positioning
- Positioned as a clean line with a measured gap
- Hidden until the shared positioning pass is complete
- Revealed after a delay with a soft fade and slight slide from above

### Code Modal

Class patterns:

- `.code-modal`
- `.code-panel`
- `.code-panel-header`
- `.code-panel-actions`
- `.code-scroll`
- `.code-block`

Behavior:

- Fullscreen overlay
- Soft blur backdrop
- Scrollable code surface
- Copy and close actions in the modal header

## Shared Behavior

`ui.js` handles the non-visual shared behavior:

- Inject Lucide icons into shared buttons
- Position `View Code` relative to `Back to Playground`
- Delay the fullscreen toolbar reveal
- Add the `ui-toolbar-ready` class once ready

### Icon System

Icons are sourced from Lucide.

Current icon usage:

- `arrow-left` for back navigation
- `code-2` for source viewing
- `copy` for code copying
- `x` for close

## Page Patterns

### Gallery Page

`index.html` is the homepage for the playground in this root folder.

Characteristics:

- Full-width shell
- Shared typography system
- Responsive card grid
- Cards link to fullscreen shader pages in the root folder
- Card previews use the lightweight preview renderer in `preview.html`

### Preview Page

`preview.html` is a lightweight rendering surface for gallery cards in this root folder.

Characteristics:

- Canvas-only preview rendering
- No fullscreen toolbar
- No modal chrome
- Shared background and error styling

### Fullscreen Shader Page

Each fullscreen shader page in the root folder includes:

- The shader canvas
- `Back to Playground`
- `View Code`
- The code modal

These pages rely on the shared UI system rather than page-local chrome styles.

## Implementation Rules

- Keep all shared UI styling in `ui.css`
- Keep shared UI behavior in `ui.js`
- Avoid serif fonts and per-page typography overrides
- Avoid adding wrappers around the fullscreen buttons
- Avoid duplicating toolbar or modal styles inside individual shader pages
- Keep gallery previews lightweight by using `preview.html`

## Adding New UI Pieces

When adding a new reusable element, prefer this sequence:

1. Add a token if the element needs a new color, spacing, shadow, or timing value.
2. Add a shared class pattern in `ui.css`.
3. Wire behavior in `ui.js` only if the component needs shared interaction.
4. Reuse the class pattern in `index.html`, `preview.html`, or the shader pages at the root.

## Extension Notes

- If a new shader page needs additional controls, they should use the same button system rather than introducing new page-specific chrome.
- If the gallery gains filters or sorting, they should follow the existing tokenized control styles.
- If a new modal is introduced, it should reuse the same overlay, panel, and button tokens.
