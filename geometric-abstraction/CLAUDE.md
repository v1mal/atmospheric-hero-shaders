# Geometric Abstraction -- Shader Technique Guide

## Core Approach

Structure-first. Build everything from distance fields and domain transforms. No noise, no organic textures.

---

## Core Techniques

### 1. Signed Distance Fields (SDF) -- primary tool

Build everything from distance. Use for circles, lines, polygons, grids, tiling, and boolean ops.

```glsl
float d = sdCircle(p, r);
d = min(d, sdBox(p, b));
float line = smoothstep(w, 0.0, abs(d));
```

### 2. Domain Repetition (tiling)

Repeat space instead of drawing more shapes.

```glsl
p = mod(p, cellSize) - 0.5 * cellSize;
```

### 3. Domain Transforms

Transform space before evaluating shapes. This is how you get abstraction without randomness.

- **Rotation**: `p = rot(a) * p;`
- **Polar transform**: `vec2 polar = vec2(length(p), atan(p.y, p.x));`
- **Mirror / symmetry**: `p = abs(p);`

### 4. Shape Composition

Combine primitives cleanly:

- Union: `min(a, b)`
- Intersection: `max(a, b)`
- Subtraction: `max(a, -b)`
- Smooth versions: `float smin(float a, float b, float k)`

### 5. Analytical Patterns (not noise)

Use math, not randomness.

- Stripes: `sin(p.x * freq)`
- Grids: `fract(p * scale)`
- Radial bands: `sin(length(p) * freq)`

### 6. Anti-aliasing via Derivatives

Mandatory for clean lines.

```glsl
float w = fwidth(d);
float line = smoothstep(w, 0.0, abs(d));
```

### 7. Layered Composition

Build scenes in layers: base grid, overlay shapes, accent lines, masks.

### 8. Color Systems (controlled)

Use limited palettes (2-4 colors). Avoid full-spectrum rainbow unless intentional.

### 9. Temporal Structure

Animate parameters, not noise: rotation over time, scale oscillation, phase shifts.

### 10. Clipping + Masking

Use shapes as masks:

```glsl
float mask = step(d, 0.0);
col *= mask;
```

---

## Style Frameworks

| Framework | Description | Inspiration |
|-----------|-------------|-------------|
| Constructive Geometry | Primitives + boolean ops, clean edges | Bauhaus, minimal abstraction |
| Parametric Patterns | Equations + repeat + transform | Islamic geometry, generative tiling |
| Polar / Radial Systems | Rings, spokes, spirals in polar space | Strong visual identity, easy complexity |
| Grid + Deformation | Grid with slight controlled warp (`< 0.2` scale) | Controlled distortion |
| Layered Interference | Multiple periodic functions combined | Moire, interference patterns |

---

## What to Avoid

1. **Noise-heavy workflows** -- Perlin/simplex everywhere, random distortions. Looks like VFX, not geometry.
2. **Over-warping** -- Keep warp `< 0.2` scale. Too much domain distortion kills structure.
3. **Soft / blurry edges** -- No heavy bloom, no low contrast. Sharp, intentional edges only.
4. **Over-coloring** -- No gradient spam. Stick to 2-4 colors with controlled transitions.
5. **Organic by accident** -- If it looks like smoke, fire, or fluid, you are off track.
6. **Deep iteration loops** -- No 50+ iteration raymarch loops or particle simulations.
7. **Arbitrary complexity** -- If you cannot describe the system in one sentence, it is too messy.

---

## Starting Constraints (first shaders)

- Only SDF primitives
- Only domain transforms
- No noise
- Max 3 layers
- Max 3 colors
