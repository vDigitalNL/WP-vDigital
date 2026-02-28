/******/ (() => { // webpackBootstrap
/*!************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/banner/javascript/main.js ***!
  \************************************************************************************/
function centerBannerHeadings() {
  var banners = document.querySelectorAll(".block__banner");
  banners.forEach(function (banner) {
    var buttons = banner.querySelector(".text-block__buttons");
    if (buttons) return;
    var textblock = banner.querySelector(".text-block");
    if (window.innerWidth <= 768) {
      textblock.style.removeProperty("margin-top");
      return;
    }
    var title = banner.querySelector(".text-block__title-wrapper");
    var content = banner.querySelector(".text-block__content");
    if (!textblock || !title || !content) return;
    var textblockHeight = textblock.clientHeight;
    var titleHeight = title.clientHeight;
    var contentHeightCalculated = textblockHeight - titleHeight;
    var marginTop = contentHeightCalculated;
    textblock.style.setProperty("margin-top", "".concat(marginTop, "px"));
  });
}
function loadSharpBannerImages() {
  if (window.innerWidth >= 768) {
    return;
  }
  var banners = document.querySelectorAll(".block__banner[preload-blur]:not(.is-loading-sharp)");
  banners.forEach(function (banner) {
    var sharpImageUrl = banner.dataset.sharpImage;
    var blurredImageUrl = banner.dataset.blurredImage;
    if (!sharpImageUrl || !blurredImageUrl || sharpImageUrl === blurredImageUrl) {
      return;
    }
    banner.classList.add("is-loading-sharp");
    var sharpImage = new Image();
    sharpImage.onload = function () {
      var currentStyle = banner.getAttribute("style") || "";
      var updatedStyle = currentStyle + "; --bg-image-mobile: url(".concat(sharpImageUrl, ")");
      banner.setAttribute("style", updatedStyle);
      banner.removeAttribute("preload-blur");
    };
    sharpImage.onerror = function () {
      console.warn("Failed to load sharp banner image:", sharpImageUrl);
      banner.classList.remove("is-loading-sharp");
    };
    sharpImage.src = sharpImageUrl;
  });
}
var resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    centerBannerHeadings();
    loadSharpBannerImages();
  }, 150);
}
document.addEventListener("DOMContentLoaded", function () {
  centerBannerHeadings();
  loadSharpBannerImages();
});
window.addEventListener("resize", handleResize);
/******/ })()
;