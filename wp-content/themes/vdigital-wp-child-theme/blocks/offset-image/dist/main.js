/******/ (() => { // webpackBootstrap
/*!******************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/offset-image/javascript/main.js ***!
  \******************************************************************************************/
function getZoomFactor(element) {
  var zoom = window.getComputedStyle(document.querySelector("body")).zoom;
  return zoom ? parseFloat(zoom) : 1;
}
function positionOffsetImage() {
  var offsetImages = document.querySelectorAll(".offset-image");
  offsetImages.forEach(function (offsetImage) {
    var outerContainer = document.querySelector(".outer-container");

    // If we're in the Gutenberg editor, find the closest background content container
    if (!outerContainer) {
      outerContainer = offsetImage.closest(".is-root-container.wp-block-post-content");
    }
    if (!outerContainer) return;
    var img = offsetImage.querySelector("img");
    if (!img) return;
    var rootStyles = getComputedStyle(document.documentElement);
    var containerPaddingMobile = parseFloat(rootStyles.getPropertyValue("--container-padding-mobile")) || 40;
    var isMobile = window.matchMedia("(max-width: 767px)").matches;
    var isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches;
    var isDesktop = window.matchMedia("(min-width: 1025px)").matches;

    // Reset styles
    offsetImage.style.transform = "translateX(0)";
    offsetImage.style.width = "";
    img.style.width = "100%";
    if (isMobile) {
      offsetImage.style.width = "calc(100% + ".concat(containerPaddingMobile * 2, "px)");
      return;
    }
    if (isTablet) {
      offsetImage.style.width = "calc(100% + ".concat(containerPaddingMobile, "px)");
      if (offsetImage.classList.contains("offset-image--left")) {
        offsetImage.style.marginLeft = "-".concat(containerPaddingMobile, "px");
      }
      return;
    }
    if (isDesktop) {
      var zoomFactor = getZoomFactor();
      var outerRect = outerContainer.getBoundingClientRect();
      var offsetRect = offsetImage.getBoundingClientRect();
      var offset = 0;
      if (offsetImage.classList.contains("offset-image--left")) {
        offset = (outerRect.left - offsetRect.left) / zoomFactor;
        offsetImage.style.transform = "translateX(".concat(offset, "px)");
        img.style.width = "calc(100% - ".concat(offset, "px)");
      }
      if (offsetImage.classList.contains("offset-image--right")) {
        offset = (outerRect.right - offsetRect.right) / zoomFactor;
        img.style.width = "calc(100% + ".concat(offset, "px)");
      }
    }
  });
}
window.addEventListener("load", positionOffsetImage);
window.addEventListener("resize", positionOffsetImage);

// For Gutenberg editor: also run when DOM changes (blocks are added/removed/updated)
if (typeof wp !== "undefined" && wp.data) {
  // Run positioning after a short delay to ensure the DOM is updated
  wp.data.subscribe(function () {
    setTimeout(positionOffsetImage, 100);
  });
}
/******/ })()
;