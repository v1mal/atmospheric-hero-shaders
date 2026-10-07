(function () {
  const query = new URLSearchParams(location.search);
  const slug = query.get("shader");
  const capture = query.get("capture") === "1";
  window.__shaderPreviewReady = false;

  function fail(message) {
    window.__shaderPreviewError = String(message);
    window.__shaderPreviewReady = false;
    const error = document.createElement("div");
    error.className = "error";
    error.textContent = String(message);
    document.body.replaceChildren(error);
  }

  async function init() {
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Invalid shader preview request.");
    }

    const [manifestResponse, sourceResponse] = await Promise.all([
      fetch("./shaders.json"),
      fetch("./" + slug + ".html")
    ]);
    if (!manifestResponse.ok || !sourceResponse.ok) {
      throw new Error("Unable to load preview shader.");
    }
    const manifest = await manifestResponse.json();
    const entry = manifest.find((shader) => shader.slug === slug);
    if (!entry) throw new Error("Shader is missing from the preview manifest.");

    const time = query.has("t") ? Number(query.get("t")) : (entry.previewTime ?? 4);
    if (!Number.isFinite(time) || time < 0) throw new Error("Invalid preview time.");

    // Run the original page, including all uniforms and every rendering pass.
    const doc = new DOMParser().parseFromString(await sourceResponse.text(), "text/html");
    const base = document.createElement("base");
    base.href = new URL("./", location.href).href;
    const runtime = document.createElement("script");
    runtime.src = new URL("../shared/preview-runtime.js", location.href).href;
    runtime.dataset.capture = String(capture);
    runtime.dataset.time = String(time);
    runtime.dataset.simulation = String(entry.direct === true);
    runtime.dataset.seed = slug;
    doc.head.prepend(base, runtime);

    const frame = document.createElement("iframe");
    frame.className = "preview-frame";
    frame.title = entry.title + " preview";
    window.addEventListener("message", function (event) {
      if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
      if (event.data?.type === "shader-preview-error") fail(event.data.message);
      if (event.data?.type === "shader-preview-ready" && !window.__shaderPreviewError) {
        window.__shaderPreviewReady = true;
        document.documentElement.dataset.previewReady = "true";
      }
    });
    frame.srcdoc = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    document.title = entry.title;
    document.body.replaceChildren(frame);
  }

  init().catch((error) => fail(error.message || "Preview failed."));
})();
