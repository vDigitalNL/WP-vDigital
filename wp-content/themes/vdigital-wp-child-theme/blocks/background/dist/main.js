/******/ (() => { // webpackBootstrap
/*!****************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/background/javascript/main.js ***!
  \****************************************************************************************/
function adjustSmallContainerGlow() {
  document.querySelectorAll(".block__background").forEach(function (background) {
    var glowElement = background.querySelectorAll(".glow__block");
    if (glowElement.length > 0) {
      glowElement.forEach(function (glow) {
        if (glow.classList.contains("glow--middle-blue-green") && glow.closest(".block__background").offsetHeight < 250) {
          glow.style.top = 0;
          glow.style.setProperty("--tw-translate-y", "-25%");
        }
      });
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  return adjustSmallContainerGlow();
});
window.addEventListener("resize", function () {
  var timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      adjustSmallContainerGlow();
    }, 200);
  };
}());
/******/ })()
;