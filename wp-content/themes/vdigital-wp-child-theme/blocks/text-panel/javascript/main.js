function getZoomFactor() {
  const zoom = window.getComputedStyle(document.querySelector("body")).zoom;
  return zoom ? parseFloat(zoom) : 1;
}

function positionTextPanels() {
  const panels = document.querySelectorAll(".text-panel");

  panels.forEach((panel) => {
    let outerContainer = document.querySelector(".outer-container");

    // If we're in the Gutenberg editor, find the closest background content container
    if (!outerContainer) {
      outerContainer = panel.closest(
        ".is-root-container.wp-block-post-content",
      );
    }

    if (!outerContainer) return;

    const inner = panel.querySelector(".text-panel__inner");
    if (!inner) return;

    if (panel.classList.contains("text-panel--left")) {
      panel.style.transform = "translateX(0)";
    }

    if (window.matchMedia("(max-width: 768px)").matches) {
      panel.style.transform = "translateX(0)";
      inner.style.width = "auto";
      return;
    }

    const zoomFactor = getZoomFactor();
    const outerRect = outerContainer.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    let offset = 0;

    if (panel.classList.contains("text-panel--left")) {
      offset = (outerRect.left - panelRect.left) / zoomFactor;
      panel.style.transform = `translateX(${offset}px)`;
      inner.style.width = `calc(100% - ${offset}px)`;
    }

    if (panel.classList.contains("text-panel--right")) {
      offset = (outerRect.right - panelRect.right) / zoomFactor;
      inner.style.width = `calc(100% + ${offset}px)`;
    }
  });
}

window.addEventListener("load", positionTextPanels);
window.addEventListener("resize", positionTextPanels);
