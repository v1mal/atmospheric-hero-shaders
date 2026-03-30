# Shader Finishing Guide

This repository now uses a **post-profile system** rather than one universal post-processing stack.

The goal is simple:
- preserve the shader's identity
- reinforce its material world
- reduce digital harshness and banding
- only add heavier optics when the image structure can support them

The reusable thing is not one effect chain for all shaders. It is a **shared finishing framework** with **five named profiles**.

---

## Foundation Rules

These techniques are the common base of the system.

### 1. ACES Tonemapping
Use ACES whenever a shader accumulates HDR-like lighting or has strong emissive highlights. It compresses bright areas smoothly without harsh clipping.

```glsl
vec3 aces(vec3 c) {
  mat3 m1 = mat3(
    0.59719, 0.07600, 0.02840,
    0.35458, 0.90834, 0.13383,
    0.04823, 0.01566, 0.83777
  );
  mat3 m2 = mat3(
    1.60475, -0.10208, -0.00327,
    -0.53108, 1.10813, -0.07276,
    -0.07367, -0.00605, 1.07602
  );
  vec3 v = m1 * c;
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return clamp(m2 * (a / b), 0.0, 1.0);
}
```

### 2. Film Grain / Anti-Banding
Gradients, fog, and dark vignettes will band without a small amount of additive high-frequency noise.

```glsl
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float grain = hash(gl_FragCoord.xy + fract(u_time) * 173.0) * 0.02;
color += grain - 0.01;
```

### 3. Vignette
Use vignette to focus the composition, but keep it profile-dependent:
- very light for gradients and atmosphere
- moderate for cinematic emissive work
- minimal or none for hard-edged graphic pieces unless composition needs it

### 4. Bloom Is Selective
Do **not** apply bloom by default.

Bloom only belongs where:
- highlight separation already exists
- emissive structures are thin enough to benefit from glow
- the effect increases depth instead of smearing the image

The failed aurora experiment established an important rule:
- if the shader already contains broad luminous diffusion,
- bloom will usually flatten the structure instead of improving it

---

## The Five Post Profiles

### 1. `minimalClean`
Use for:
- minimal spatial studies
- already-finished gradients
- shaders that only need highlight rolloff and banding protection

Stack:
- ACES or gentle tone shaping
- tiny grain/dither
- optional light vignette

Avoid:
- bloom
- heavy grading
- strong contrast shaping

Current examples:
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/void-levitation.html`
- `/Users/vimal/Desktop/shaders/gradient-shaders/oklab-flow.html`
- `/Users/vimal/Desktop/shaders/gradient-shaders/prism-helix.html`

### 2. `softAtmospheric`
Use for:
- smoke
- veil/fog
- soft glass haze
- broad atmospheric light fields

Stack:
- ACES
- light grain
- restrained vignette
- mild exposure shaping only if needed

Avoid:
- bloom except near-zero or none
- strong contrast boosts
- aggressive saturation

Current examples:
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/extinguish-smoke.html`
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/veil-drift.html`
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/glass-veil.html`

Special case:
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/aurora-borealis.html` should stay at the very light end of this profile. The full cinematic stack washed it out.

### 3. `cinematicGlow`
Use for:
- black holes
- plasma filaments
- emissive cosmic structures
- thin bright forms against dark space

Stack:
- bright-pass bloom
- ACES
- contrast / saturation shaping
- vignette
- grain

Avoid:
- over-softening fine lines
- lifting diffuse nebula mass too much

Current examples:
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/event-horizon.html`
- `/Users/vimal/Desktop/shaders/fractal-universe/spectral-attractor.html`
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/nexus-silk.html`

### 4. `printSurface`
Use for:
- geometric abstraction
- poster-like work
- pigment / paper / gouache / casein looks

Stack:
- matte paper base
- paper or canvas tooth
- slight pigment unevenness
- optional desaturation for chalk/matte finish

Avoid:
- bloom
- glossy highlights
- softening hard edges

Current examples:
- `/Users/vimal/Desktop/shaders/geometric-abstraction/homage-to-the-square.html`
- `/Users/vimal/Desktop/shaders/geometric-abstraction/metaesquema.html`
- `/Users/vimal/Desktop/shaders/geometric-abstraction/mondrian.html`
- `/Users/vimal/Desktop/shaders/geometric-abstraction/perceptual-shift.html`

### 5. `liquidGloss`
Use for:
- liquid caustics
- glossy fluid surfaces
- reflective pools
- premium glass-like flow

Stack:
- restrained ACES rolloff
- subtle highlight shaping
- clean blacks
- light grain
- optional tiny chromatic edging only if justified

Avoid:
- mushy bloom
- haze that hides liquid structure

Current examples:
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/ocean-labs.html`
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/obsidian-tide.html`
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/gilded-current.html`
- `/Users/vimal/Desktop/shaders/atmospheric-hero-shaders/midnight-pool.html`

---

## Collection Defaults

These are starting points, not hard rules.

- `atmospheric-hero-shaders`
  - default: `softAtmospheric`
  - exceptions: `event-horizon` → `cinematicGlow`, `void-levitation` → `minimalClean`, liquid studies → `liquidGloss`

- `fractal-universe`
  - default: `cinematicGlow`

- `geometric-abstraction`
  - default: `printSurface`

- `gradient-shaders`
  - default: `minimalClean`

- `organic-patterns`
  - case-by-case
  - likely `printSurface` or `softAtmospheric` depending on the material read

---

## Decision Framework

Before adding post-finishing, ask:

1. Is the image emissive, matte, diffuse, reflective, or translucent?
2. Does it have highlight structure worth blooming?
3. Is the desired finish optical, atmospheric, liquid, or print-like?
4. What is the likely failure mode?
   - washout
   - banding
   - clipping
   - loss of edge definition
   - overly digital flatness
5. Which profile solves that with the fewest effects?

---

## Standard Parameter Vocabulary

When adding adjustable finishing, prefer this naming:

- `bloomThreshold`
- `bloomIntensity`
- `exposure`
- `contrast`
- `saturation`
- `vignette`
- `grainAmount`

Additional profile-specific names:

For `printSurface`:
- `paperTint`
- `paperGrain`
- `inkBleed`
- `pigmentContrast`

For `liquidGloss`:
- `highlightSoftness`
- `glossIntensity`
- `chromaticEdge`

---

## Current Rollout Status

Validated in phases across the repo:
- `minimalClean`
- `softAtmospheric`
- `cinematicGlow`
- `printSurface`
- `liquidGloss`

Important lesson captured from rollout:
- the same “premium post” cannot be applied to every shader
- the correct abstraction is **profile selection by material intent**

