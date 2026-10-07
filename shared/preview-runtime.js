(function () {
  const config = document.currentScript.dataset;
  const capture = config.capture === "true";
  const simulation = config.simulation === "true";
  const time = Number(config.time);
  const nativeRAF = window.requestAnimationFrame.bind(window);
  let started;
  let ready = false;

  function report(type, message) {
    window.parent.postMessage({ type, message }, window.parent.location.origin);
  }
  window.addEventListener("error", function (event) {
    if (event.message) report("shader-preview-error", event.message);
  });
  window.addEventListener("unhandledrejection", function (event) {
    report("shader-preview-error", event.reason?.message || String(event.reason));
  });

  // Seed page-load variation before the shader initializes, only for captures.
  if (capture) {
    let seed = 2166136261;
    for (const character of config.seed) {
      seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
    }
    Math.random = function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  window.requestAnimationFrame = function (callback) {
    return nativeRAF(function (now) {
      if (started === undefined) started = now;
      const elapsed = now - started;
      // Simulations need warm-up frames. Analytic shaders render at an exact time.
      callback(capture && !simulation ? time * 1000 : elapsed);
      if (!ready && (!capture || !simulation || elapsed >= time * 1000)) {
        ready = true;
        window.__shaderPreviewReady = true;
        report("shader-preview-ready");
      }
    });
  };
})();
