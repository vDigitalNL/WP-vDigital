/******/ (() => { // webpackBootstrap
/*!****************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/text-panel/javascript/main.js ***!
  \****************************************************************************************/
function getZoomFactor() {
  var zoom = window.getComputedStyle(document.querySelector("body")).zoom;
  return zoom ? parseFloat(zoom) : 1;
}
function positionTextPanels() {
  var panels = document.querySelectorAll(".text-panel");
  panels.forEach(function (panel) {
    var outerContainer = document.querySelector(".outer-container");

    // If we're in the Gutenberg editor, find the closest background content container
    if (!outerContainer) {
      outerContainer = panel.closest(".is-root-container.wp-block-post-content");
    }
    if (!outerContainer) return;
    var inner = panel.querySelector(".text-panel__inner");
    if (!inner) return;
    if (panel.classList.contains("text-panel--left")) {
      panel.style.transform = "translateX(0)";
    }
    if (window.matchMedia("(max-width: 768px)").matches) {
      panel.style.transform = "translateX(0)";
      inner.style.width = "auto";
      return;
    }
    var zoomFactor = getZoomFactor();
    var outerRect = outerContainer.getBoundingClientRect();
    var panelRect = panel.getBoundingClientRect();
    var offset = 0;
    if (panel.classList.contains("text-panel--left")) {
      offset = (outerRect.left - panelRect.left) / zoomFactor;
      panel.style.transform = "translateX(".concat(offset, "px)");
      inner.style.width = "calc(100% - ".concat(offset, "px)");
    }
    if (panel.classList.contains("text-panel--right")) {
      offset = (outerRect.right - panelRect.right) / zoomFactor;
      inner.style.width = "calc(100% + ".concat(offset, "px)");
    }
  });
}
window.addEventListener("load", positionTextPanels);
window.addEventListener("resize", positionTextPanels);
/******/ })()
;