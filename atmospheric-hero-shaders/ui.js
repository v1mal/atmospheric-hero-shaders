(function () {
  var TOOLBAR_GAP = 16;
  var TOOLBAR_REVEAL_DELAY = 1500;
  var toolbarRevealTimer = null;

  var PRISM_CSS = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css";
  var PRISM_JS  = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";
  var prismState = "idle"; // idle | loading | ready
  var prismQueue = [];

  function loadPrism(cb) {
    if (prismState === "ready")   { cb(); return; }
    prismQueue.push(cb);
    if (prismState === "loading") return;
    prismState = "loading";

    var link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = PRISM_CSS;
    document.head.appendChild(link);

    var script = document.createElement("script");
    script.src = PRISM_JS;
    script.onload = function () {
      window.Prism.manual = true; // disable auto-highlight; we call it ourselves
      prismState = "ready";
      prismQueue.forEach(function (fn) { fn(); });
      prismQueue = [];
    };
    document.head.appendChild(script);
  }

  function enhanceIconButton(selector, iconName, label) {
    const el = document.querySelector(selector);
    if (!el) return null;
    el.setAttribute("aria-label", label);
    el.innerHTML = '<span class="ui-icon" data-lucide="' + iconName + '"></span><span>' + label + "</span>";
    return el;
  }

  function positionToolbarButtons() {
    const back = document.querySelector(".back-link");
    const viewCode = document.querySelector(".view-code-link");

    if (!back || !viewCode) return;

    const backRect = back.getBoundingClientRect();
    const top = backRect.top;
    const left = Math.round(backRect.right + TOOLBAR_GAP);

    viewCode.style.top = top + "px";
    viewCode.style.left = left + "px";

    if (toolbarRevealTimer) {
      clearTimeout(toolbarRevealTimer);
    }

    toolbarRevealTimer = window.setTimeout(function () {
      document.documentElement.classList.add("ui-toolbar-ready");
    }, TOOLBAR_REVEAL_DELAY);
  }

  function injectModalShell() {
    if (document.querySelector(".code-modal")) return;
    var modal = document.createElement("div");
    modal.className = "code-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("data-ui-injected", "true");
    modal.innerHTML =
      '<div class="code-panel">' +
        '<div class="code-panel-header">' +
          '<span>Shader Source</span>' +
          '<div class="code-panel-actions">' +
            '<button class="code-button copy-code-button" type="button">Copy Code</button>' +
            '<button class="code-button close-code-button" type="button">Close</button>' +
          "</div>" +
        "</div>" +
        '<div class="code-scroll"><pre class="code-block"><code class="language-html"></code></pre></div>' +
      "</div>";
    document.body.appendChild(modal);
  }

  function injectModalFooter() {
    const panel = document.querySelector(".code-panel");
    if (!panel || panel.querySelector(".code-panel-footer")) return;
    const footer = document.createElement("div");
    footer.className = "code-panel-footer";
    footer.setAttribute("data-ui-injected", "true");
    footer.innerHTML =
      '<span>&copy; <span class="code-panel-footer__year"></span> <a href="https://vimal.works/" target="_blank" rel="noopener">Vimal Kandoth</a></span>' +
      '<span>Released under the <a href="https://github.com/v1mal/atmospheric-hero-shaders/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a></span>';
    footer.querySelector(".code-panel-footer__year").textContent = new Date().getFullYear();
    panel.appendChild(footer);
  }

  function initModalBehavior() {
    var viewCodeLink = document.querySelector(".view-code-link");
    var codeModal = document.querySelector(".code-modal");
    if (!viewCodeLink || !codeModal) return;

    var codeElement = codeModal.querySelector(".code-block code");
    var copyCodeButton = codeModal.querySelector(".copy-code-button");
    var closeCodeButton = codeModal.querySelector(".close-code-button");

    function escapeHtml(v) {
      return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function getSource() {
      var clone = document.documentElement.cloneNode(true);
      clone.querySelectorAll("[data-ui-injected]").forEach(function (el) { el.remove(); });
      return "<!DOCTYPE html>\n" + clone.outerHTML;
    }

    function openCodeModal() {
      codeElement.innerHTML = escapeHtml(getSource());
      codeModal.classList.add("is-open");
      codeModal.setAttribute("aria-hidden", "false");
      loadPrism(function () { window.Prism.highlightElement(codeElement); });
    }

    function closeCodeModal() {
      codeModal.classList.remove("is-open");
      codeModal.setAttribute("aria-hidden", "true");
    }

    viewCodeLink.addEventListener("click", openCodeModal);
    closeCodeButton.addEventListener("click", closeCodeModal);
    codeModal.addEventListener("click", function (event) {
      if (event.target === codeModal) closeCodeModal();
    });
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeCodeModal();
    });
    copyCodeButton.addEventListener("click", async function () {
      await navigator.clipboard.writeText(getSource());
      var textSpan = copyCodeButton.querySelector("span:last-child");
      if (textSpan) textSpan.textContent = "Copied";
      window.setTimeout(function () {
        if (textSpan) textSpan.textContent = "Copy Code";
      }, 1200);
    });
  }

  function enhanceToolbar() {
    if (window.self !== window.top) {
      var back = document.querySelector(".back-link");
      var vc = document.querySelector(".view-code-link");
      if (back) back.style.display = "none";
      if (vc) vc.style.display = "none";
      return;
    }

    enhanceIconButton(".back-link", "arrow-left", "Back to Playground");
    enhanceIconButton(".view-code-link", "code-2", "View Code");

    injectModalShell();
    injectModalFooter();
    initModalBehavior();

    enhanceIconButton(".copy-code-button", "copy", "Copy Code");
    enhanceIconButton(".close-code-button", "x", "Close");

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    requestAnimationFrame(positionToolbarButtons);
    window.addEventListener("resize", positionToolbarButtons, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        requestAnimationFrame(positionToolbarButtons);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceToolbar, { once: true });
  } else {
    enhanceToolbar();
  }
})();
