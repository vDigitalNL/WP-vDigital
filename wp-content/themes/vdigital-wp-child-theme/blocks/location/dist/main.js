/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/CssClasses.js"
/*!**************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/CssClasses.js ***!
  \**************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toggleClassOnElement: () => (/* binding */ toggleClassOnElement),
/* harmony export */   toggleClassesOnElement: () => (/* binding */ toggleClassesOnElement)
/* harmony export */ });
function toggleClassesOnElement(element, classes) {
  var remove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (classes instanceof Array) {
    classes.forEach(function (className) {
      toggleClassOnElement(element, className, remove);
    });
  } else if (classes instanceof String) {
    toggleClassOnElement(element, classes, remove);
  }
}
function toggleClassOnElement(element, className) {
  var remove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!remove) {
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
  } else {
    element.classList.remove(className);
  }
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/location/javascript/main.js ***!
  \**************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../resources/js/helpers/CssClasses */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/CssClasses.js");

function initLocationCardAccordion() {
  var locationCards = document.querySelectorAll(".location");
  locationCards.forEach(function (card) {
    var routeHeader = card.querySelector(".location__route-header");
    if (routeHeader) {
      routeHeader.addEventListener("click", function () {
        var isOpen = card.classList.contains("location--route-open");
        toggleRouteAccordion(card, isOpen);
      });
    }
  });
}
function toggleRouteAccordion(card) {
  var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(card, ["location--route-open"], close);
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(card.querySelector(".location__route-icon-plus"), ["tw-hidden"], close);
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(card.querySelector(".location__route-icon-minus"), ["tw-hidden"], !close);
  var toggleButton = card.querySelector(".location__route-toggle");
  if (close) {
    toggleButton.classList.remove("tw-bg-core", "tw-border-2", "tw-border-sky");
    toggleButton.classList.add("tw-bg-sky");
  } else {
    toggleButton.classList.remove("tw-bg-sky");
    toggleButton.classList.add("tw-bg-core", "tw-border-2", "tw-border-sky");
  }
  var routeHeader = card.querySelector(".location__route-header");
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(routeHeader, ["tw-pb-10"], !close);
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(routeHeader, ["tw-pb-5"], close);
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(card.querySelector(".location__route-content"), ["tw-hidden"], !close);
}
document.addEventListener("DOMContentLoaded", function () {
  return initLocationCardAccordion();
});
})();

/******/ })()
;