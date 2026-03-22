# Cinematic Shader Guidelines

For future hero-section shaders in this repository, follow these proven techniques to ensure a premium, cinematic, and cohesive aesthetic across the project.

## 1. ACES Tonemapping
Always pass HDR color accumulations through an ACES tonemapper before rendering to `gl_FragColor`. This safely compresses intense, blown-out brights (like lasers, suns, or caustic reflections) into smooth, filmic highlights without harsh digital clipping.

```glsl
// ACES tonemap
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
  return m2 * (a / b);
}

// Usage in main:
// vec3 c = aces(hdrColor);
```

## 2. Cinematic Film Grain (Anti-Banding)
Never use pure mathematical gradients for backgrounds or vignettes, as WebGL will produce visible color banding on standard monitors.
Always apply additive, high-frequency white noise (film grain) at the very end of the shader pipeline. Subtract half of the noise intensity so the average luminance change is 0.

```glsl
// High frequency white noise for film grain
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Usage at the end of main (after ACES, before gl_FragColor):
// float u_time = ...
// vec2 uv = ...
float grain = hash(uv * 1000.0 + u_time) * 0.04;
c += (grain - 0.02); // Additive grain, averages to 0
```

## 3. Optical Flares / Blooms
When designing light core blooms or lens flares, avoid harsh exponential geometry (`exp(-abs(x * 100))`). Instead, use inverse-square distance falloff to mathematically mimic real blooming light through a lens.

```glsl
// Natural optical bloom (Inverse Square)
vec2 coreP = uv;
float coreR = length(coreP);
float coreGlow = 0.01 / (coreR * coreR + 0.01);
```

## 4. Cartesian Liquid Distortion
To create tactile, organic, flowing glass/liquid without breaking structure, apply a subtle rotational sine wave displacement strictly to the mathematical grid, not the final rendered pixels.

```glsl
// Subtle vitreous liquid distortion
vec2 distortion = rot(sin(cartesianGrid * 0.4), time);
cartesianGrid += distortion * 0.4;
```
