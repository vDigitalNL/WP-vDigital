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
/*!***************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/accordion/javascript/main.js ***!
  \***************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../resources/js/helpers/CssClasses */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/CssClasses.js");

var accordionItems = document.querySelectorAll(".accordion__item");
accordionItems.forEach(function (item) {
  var header = item.querySelector(".accordion__item__header");
  header.addEventListener("click", function () {
    var openAccordionItems = document.querySelectorAll(".accordion__item.open");
    toggleAccordionItem(item, item.classList.contains("open"));
    if (item.classList.contains("open")) {
      openAccordionItems.forEach(function (openItem) {
        toggleAccordionItem(openItem, true);
      });
    }
  });
});
function toggleAccordionItem(item) {
  var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(item, ["open"], close);
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(item.querySelector(".accordion__item__header__icon-plus"), ["tw-hidden"], close);
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(item.querySelector(".accordion__item__header__icon-minus"), ["tw-hidden"], !close);
  (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassesOnElement)(item.querySelector(".accordion__item__body"), ["tw-hidden"], !close);
}
})();

/******/ })()
;