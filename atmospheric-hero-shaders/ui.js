(function () {
  var TOOLBAR_GAP = 16;
  var TOOLBAR_REVEAL_DELAY = 1500;
  var toolbarRevealTimer = null;

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

  function enhanceToolbar() {
    enhanceIconButton(".back-link", "arrow-left", "Back to Playground");
    enhanceIconButton(".view-code-link", "code-2", "View Code");
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
