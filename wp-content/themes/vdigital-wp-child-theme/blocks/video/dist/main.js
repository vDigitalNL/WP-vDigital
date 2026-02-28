/******/ (() => { // webpackBootstrap
/*!***********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/video/javascript/main.js ***!
  \***********************************************************************************/
document.querySelectorAll(".video__element").forEach(function (element) {
  element.addEventListener("click", function () {
    var isValid = element.dataset.isValid === "1";
    var errorMessage = element.dataset.errorMessage;
    var content;
    if (isValid) {
      content = "<iframe id=\"video-element-iframe\" class=\"tw-rounded-[20px]\" width=\"100%\" height=\"100%\"\n            src=\"" + element.dataset.videoUrl + "?autoplay=1&mute=0&rel=0&showinfo=0\"\n            frameBorder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" referrerpolicy=\"strict-origin-when-cross-origin\"\n            allowFullScreen ></iframe>";
    } else {
      content = "<div class=\"tw-flex tw-items-center tw-justify-center tw-h-full tw-bg-gray-100 tw-rounded-[20px]\">\n            <p class=\"!tw-text-core tw-text-xl tw-font-semibold\">" + errorMessage + "</p>\n        </div>";
    }
    var html = "\n      <div class=\"video__popup tw-fixed tw-left-0 tw-top-0 tw-w-full tw-h-full tw-p-4  tw-flex tw-pt-4 tw-overflow-auto\">\n      <div class=\"video__popup__backdrop tw-inset-0 tw-bg-core tw-opacity-80 tw-fixed tw-z-10\"></div> \n\n        <div class=\"tw-transition-all tw-max-w-[1124px] tw-ml-auto tw-mr-auto tw-rounded-[1.25rem] tw-w-full tw-flex tw-flex-col lg:tw-flex-row tw-items-end tw-mt-auto tw-mb-auto tw-relative  tw-z-20\">\n            <div class=\"close-btn__wrapper tw-relative lg:tw-absolute tw-mb-[20px] tw-right-0 lg:tw--right-[3.75rem] lg:tw-top-0\"><button class=\"btn button--close \">\u2715</button></div>\n            \n            <div class=\"video__popup_iframewrapper tw-w-full tw-aspect-video\">" + content + "</div>\n        </div>\n      </div>\n    ";
    document.querySelector("#header").insertAdjacentHTML("afterend", html);
    document.querySelector(".video__popup__backdrop").addEventListener("click", function () {
      document.querySelector(".video__popup").remove();
    });
    document.querySelector(".button--close").addEventListener("click", function () {
      document.querySelector(".video__popup").remove();
    });
  });
});
/******/ })()
;