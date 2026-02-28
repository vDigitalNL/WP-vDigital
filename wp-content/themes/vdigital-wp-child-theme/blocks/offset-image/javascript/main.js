function getZoomFactor(element) {
  const zoom = window.getComputedStyle(document.querySelector("body")).zoom;
  return zoom ? parseFloat(zoom) : 1;
}

function positionOffsetImage() {
  const offsetImages = document.querySelectorAll(".offset-image");

  offsetImages.forEach((offsetImage) => {
    let outerContainer = document.querySelector(".outer-container");

    // If we're in the Gutenberg editor, find the closest background content container
    if (!outerContainer) {
      outerContainer = offsetImage.closest(
        ".is-root-container.wp-block-post-content",
      );
    }

    if (!outerContainer) return;

    const img = offsetImage.querySelector("img");
    if (!img) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const containerPaddingMobile =
      parseFloat(rootStyles.getPropertyValue("--container-padding-mobile")) ||
      40;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const isTablet = window.matchMedia(
      "(min-width: 768px) and (max-width: 1024px)",
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 1025px)").matches;

    // Reset styles
    offsetImage.style.transform = "translateX(0)";
    offsetImage.style.width = "";
    img.style.width = "100%";

    if (isMobile) {
      offsetImage.style.width = `calc(100% + ${containerPaddingMobile * 2}px)`;
      return;
    }

    if (isTablet) {
      offsetImage.style.width = `calc(100% + ${containerPaddingMobile}px)`;

      if (offsetImage.classList.contains("offset-image--left")) {
        offsetImage.style.marginLeft = `-${containerPaddingMobile}px`;
      }
      return;
    }

    if (isDesktop) {
      const zoomFactor = getZoomFactor();
      const outerRect = outerContainer.getBoundingClientRect();
      const offsetRect = offsetImage.getBoundingClientRect();

      let offset = 0;

      if (offsetImage.classList.contains("offset-image--left")) {
        offset = (outerRect.left - offsetRect.left) / zoomFactor;

        offsetImage.style.transform = `translateX(${offset}px)`;
        img.style.width = `calc(100% - ${offset}px)`;
      }

      if (offsetImage.classList.contains("offset-image--right")) {
        offset = (outerRect.right - offsetRect.right) / zoomFactor;
        img.style.width = `calc(100% + ${offset}px)`;
      }
    }
  });
}

window.addEventListener("load", positionOffsetImage);
window.addEventListener("resize", positionOffsetImage);

// For Gutenberg editor: also run when DOM changes (blocks are added/removed/updated)
if (typeof wp !== "undefined" && wp.data) {
  // Run positioning after a short delay to ensure the DOM is updated
  wp.data.subscribe(() => {
    setTimeout(positionOffsetImage, 100);
  });
}
