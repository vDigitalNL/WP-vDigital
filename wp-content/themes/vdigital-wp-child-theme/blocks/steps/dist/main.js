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
/*!***********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/steps/javascript/main.js ***!
  \***********************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../resources/js/helpers/CssClasses */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/CssClasses.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }

var _StepsBlock_brand = /*#__PURE__*/new WeakSet();
var StepsBlock = /*#__PURE__*/function () {
  function StepsBlock() {
    var _this = this;
    _classCallCheck(this, StepsBlock);
    _classPrivateMethodInitSpec(this, _StepsBlock_brand);
    document.addEventListener("DOMContentLoaded", function () {
      _this.setup();
    });
  }
  return _createClass(StepsBlock, [{
    key: "setup",
    value: function setup() {
      var _this2 = this;
      this.blocks = document.querySelectorAll(".steps-block");
      this.blocks.forEach(function (block) {
        var navItems = block.querySelectorAll(".steps-block__nav-item");
        var panels = block.querySelectorAll(".steps-block__panel");
        if (navItems.length === 0 || panels.length === 0) {
          return;
        }
        var state = {
          activeIndex: 0,
          userInteracted: false,
          intervalId: null,
          progressRaf: null,
          progressStart: null,
          progressDurationMs: 5500,
          panelResizeObserver: null,
          isProgrammaticScroll: false
        };
        navItems.forEach(function (item) {
          item.addEventListener("click", function () {
            var index = Number.parseInt(item.dataset.stepIndex, 10);
            if (Number.isNaN(index)) {
              return;
            }
            _this2.activateByUserInteraction(block, navItems, panels, state, index);
          });
        });
        _this2.activate(block, navItems, panels, state, 0);
        var started = false;
        var autoStartObserver = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          if (entry.isIntersecting && !started) {
            started = true;
            _assertClassBrand(_StepsBlock_brand, _this2, _startAutoAdvance).call(_this2, block, navItems, panels, state);
            autoStartObserver.disconnect();
          }
        }, {
          threshold: 0.5
        });
        autoStartObserver.observe(block);

        // Fallback for late-loading images/fonts affecting height.
        window.addEventListener("load", function () {
          var activePanel = block.querySelector(".steps-block__panel[data-step-panel=\"".concat(state.activeIndex, "\"]"));
          _assertClassBrand(_StepsBlock_brand, _this2, _setPanelsWrapperHeight).call(_this2, block, _assertClassBrand(_StepsBlock_brand, _this2, _measurePanelHeight).call(_this2, activePanel));
        });
        window.addEventListener("resize", function () {
          _assertClassBrand(_StepsBlock_brand, _this2, _syncMobileSegments).call(_this2, block, navItems);
          var activePanel = block.querySelector(".steps-block__panel[data-step-panel=\"".concat(state.activeIndex, "\"]"));
          _assertClassBrand(_StepsBlock_brand, _this2, _setPanelsWrapperHeight).call(_this2, block, _assertClassBrand(_StepsBlock_brand, _this2, _measurePanelHeight).call(_this2, activePanel));
        });
        var scrollContainer = block.querySelector(".steps-block__nav-scroll");
        var mobileItems = Array.from(block.querySelectorAll(".steps-block__nav-item--mobile"));
        var lastActivatedIndex = state.activeIndex;
        var observerStarted = false;
        var observer;
        var startObserver = function startObserver() {
          if (observerStarted) return;
          observerStarted = true;
          observer = new IntersectionObserver(function (entries) {
            if (state.isProgrammaticScroll) return;
            var visible = entries.filter(function (e) {
              return e.isIntersecting;
            }).map(function (e) {
              return Number(e.target.dataset.stepIndex);
            }).filter(function (i) {
              return !Number.isNaN(i);
            }).sort(function (a, b) {
              return a - b;
            });
            if (!visible.length) return;
            var nextIndex = visible[visible.length - 1];
            if (nextIndex !== lastActivatedIndex) {
              lastActivatedIndex = nextIndex;
              _this2.activateByUserInteraction(block, navItems, panels, state, nextIndex);
            }
          }, {
            root: scrollContainer,
            threshold: 0.8
          });
          mobileItems.forEach(function (item) {
            return observer.observe(item);
          });
        };
        scrollContainer.addEventListener("scroll", function () {
          startObserver();
        }, {
          once: true
        } // ← IMPORTANT
        );
      });
    }
  }, {
    key: "activateByUserInteraction",
    value: function activateByUserInteraction(block, navItems, panels, state, index) {
      state.userInteracted = true;
      _assertClassBrand(_StepsBlock_brand, this, _stopAutoAdvance).call(this, block, state);
      this.activate(block, navItems, panels, state, index);

      // Reset base mobile segments that haven't been completed yet.
      var mobileSegments = block.querySelectorAll(".steps-block__line-segment--mobile");
      mobileSegments.forEach(function (seg, idx) {
        if (idx >= state.activeIndex) {
          seg.style.background = "#20a4ff";
        }
        if (seg.parentElement.classList.contains("is-visited") && !seg.parentElement.classList.contains("is-active")) {
          seg.style.background = "#ffffff";
        }
      });
    }
  }, {
    key: "activate",
    value: function activate(block, navItems, panels, state, nextIndex) {
      var _this3 = this;
      if (nextIndex < 0 || nextIndex >= panels.length) {
        return;
      }
      var prevIndex = state.activeIndex;
      var goingForward = nextIndex > prevIndex;
      var transitionDuration = 400;
      panels.forEach(function (panel, index) {
        var isTarget = index === nextIndex;
        var wasPrevActive = index === prevIndex && prevIndex !== nextIndex;
        if (isTarget) {
          // Remove hidden, prepare entering position.
          (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(panel, "tw-hidden", true);
          panel.classList.remove("is-leaving", "is-leaving-to-top", "is-leaving-to-bottom");

          // Set initial entering position (off-screen).
          if (goingForward) {
            panel.classList.add("is-entering-from-bottom");
          } else {
            panel.classList.add("is-entering-from-top");
          }

          // Force reflow so the browser registers the starting position.
          void panel.offsetWidth;

          // Activate and remove entering class to trigger transition.
          panel.classList.add("is-active");
          panel.classList.remove("is-entering-from-bottom", "is-entering-from-top");
          var nextHeight = _assertClassBrand(_StepsBlock_brand, _this3, _measurePanelHeight).call(_this3, panel);
          _assertClassBrand(_StepsBlock_brand, _this3, _setPanelsWrapperHeight).call(_this3, block, nextHeight);
          _assertClassBrand(_StepsBlock_brand, _this3, _observeActivePanelHeight).call(_this3, block, state, panel);
          return;
        }
        if (wasPrevActive) {
          // Animate out the previous panel.
          panel.classList.remove("is-active");
          panel.classList.add("is-leaving");
          if (goingForward) {
            panel.classList.add("is-leaving-to-top");
          } else {
            panel.classList.add("is-leaving-to-bottom");
          }

          // Hide after transition completes.
          window.setTimeout(function () {
            (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(panel, "tw-hidden");
            panel.classList.remove("is-leaving", "is-leaving-to-top", "is-leaving-to-bottom");
          }, transitionDuration);
          return;
        }

        // All other panels stay hidden.
        (0,_resources_js_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(panel, "tw-hidden");
        panel.classList.remove("is-active", "is-leaving", "is-leaving-to-top", "is-leaving-to-bottom");
      });
      navItems.forEach(function (item) {
        var itemIndex = Number.parseInt(item.dataset.stepIndex, 10);
        var isVisited = itemIndex <= nextIndex;
        var isActive = itemIndex === nextIndex;
        item.classList.toggle("is-visited", isVisited);
        item.classList.toggle("is-active", isActive);
        item.classList.toggle("is-unvisited", !isVisited);
      });
      state.activeIndex = nextIndex;
      var mobileNavItems = block.querySelectorAll(".steps-block__nav-item--mobile");
      if (mobileNavItems[nextIndex] && state.userInteracted == false) {
        _assertClassBrand(_StepsBlock_brand, this, _scrollMobileNavIntoView).call(this, block, mobileNavItems[nextIndex], state);
      }
      _assertClassBrand(_StepsBlock_brand, this, _syncMobileSegments).call(this, block, navItems);
      var paginationItems = block.querySelectorAll(".steps-block__pagination-item");
      paginationItems.forEach(function (item) {
        var itemIndex = Number.parseInt(item.dataset.stepIndex, 10);
        item.classList.toggle("is-active", itemIndex === nextIndex);
      });
      _assertClassBrand(_StepsBlock_brand, this, _setProgressBarHeight).call(this, navItems, nextIndex);
    }
  }]);
}();
function _getZoomFactor(el) {
  if (!el) {
    return 1;
  }
  var rect = el.getBoundingClientRect();
  var offsetWidth = el.offsetWidth || el.clientWidth;
  if (!offsetWidth) {
    return 1;
  }
  var factor = rect.width / offsetWidth;
  return factor > 0 ? factor : 1;
}
function _prefersReducedMotion() {
  var _window$matchMedia, _window;
  return (_window$matchMedia = (_window = window).matchMedia) === null || _window$matchMedia === void 0 || (_window$matchMedia = _window$matchMedia.call(_window, "(prefers-reduced-motion: reduce)")) === null || _window$matchMedia === void 0 ? void 0 : _window$matchMedia.matches;
}
function _setPanelsWrapperHeight(block, heightPx) {
  var panelsWrapper = block.querySelector(".steps-block__panels");
  if (!panelsWrapper) {
    return;
  }
  panelsWrapper.style.height = "".concat(Math.max(0, heightPx), "px");
}
function _measurePanelHeight(panel) {
  if (!panel) {
    return 0;
  }
  if (panel.offsetHeight) {
    return panel.offsetHeight;
  }
  var rectHeight = panel.getBoundingClientRect().height;
  var zoomFactor = _assertClassBrand(_StepsBlock_brand, this, _getZoomFactor).call(this, panel) || _assertClassBrand(_StepsBlock_brand, this, _getZoomFactor).call(this, document.body);
  return zoomFactor ? rectHeight / zoomFactor : rectHeight;
}
function _observeActivePanelHeight(block, state, activePanel) {
  var _this4 = this;
  if (!block || !state || !activePanel) {
    return;
  }
  if (state.panelResizeObserver) {
    state.panelResizeObserver.disconnect();
    state.panelResizeObserver = null;
  }
  if (typeof ResizeObserver === "undefined") {
    return;
  }
  state.panelResizeObserver = new ResizeObserver(function () {
    var height = _assertClassBrand(_StepsBlock_brand, _this4, _measurePanelHeight).call(_this4, activePanel);
    if (height > 0) {
      _assertClassBrand(_StepsBlock_brand, _this4, _setPanelsWrapperHeight).call(_this4, block, height);
    }
  });
  state.panelResizeObserver.observe(activePanel);
}
function _setProgressBarHeight(navItems, nextIndex) {
  document.querySelectorAll(".steps-block__nav-item:not(.steps-block__nav-item--mobile)").forEach(function (item) {
    var itemIndex = Number.parseInt(item.dataset.stepIndex, 10);
    var nextItem = navItems[itemIndex + 1];
    nextItem.style.removeProperty("--before-height");
    if (itemIndex === nextIndex && itemIndex < navItems.length - 1) {
      var height = 96;
      var zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
      var rectHeight = item.getBoundingClientRect().height / zoom;
      if (rectHeight > 96) {
        height = rectHeight;
      }
      nextItem.style.setProperty("--before-height", height + "px");
    }
  });
}
function _startAutoAdvance(block, navItems, panels, state) {
  var _this5 = this;
  if (state.userInteracted) {
    return;
  }
  _assertClassBrand(_StepsBlock_brand, this, _startProgress).call(this, block, navItems, state, function () {
    // Callback when line animation completes
    if (state.userInteracted) {
      return;
    }
    var nextIndex = state.activeIndex + 1;
    if (nextIndex >= panels.length) {
      _assertClassBrand(_StepsBlock_brand, _this5, _stopAutoAdvance).call(_this5, block, state);
      return;
    }
    _this5.activate(block, navItems, panels, state, nextIndex);
    _assertClassBrand(_StepsBlock_brand, _this5, _startAutoAdvance).call(_this5, block, navItems, panels, state);
  });
}
function _stopAutoAdvance(block, state) {
  if (state.intervalId != null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  if (state.progressRaf != null) {
    cancelAnimationFrame(state.progressRaf);
    state.progressRaf = null;
  }
  state.progressStart = null;
  if (!block) {
    return;
  }
  var progressEls = block.querySelectorAll(".steps-block__nav-item-line-progress");
  progressEls.forEach(function (el) {
    el.style.height = "0";
  });
  var mobileProgressEls = block.querySelectorAll(".steps-block__line-segment-progress--mobile");
  mobileProgressEls.forEach(function (el) {
    el.style.width = "0";
  });
}
function _startProgress(block, navItems, state) {
  var _this6 = this;
  var onComplete = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var nextIndex = state.activeIndex + 1;
  if (nextIndex >= navItems.length) {
    return;
  }
  var desktopItems = block.querySelectorAll(".steps-block__nav-desktop .steps-block__nav-item");
  var mobileItems = block.querySelectorAll(".steps-block__nav-item--mobile");
  var nextDesktopItem = desktopItems[nextIndex];
  var progressEl = nextDesktopItem === null || nextDesktopItem === void 0 ? void 0 : nextDesktopItem.querySelector(".steps-block__nav-item-line-progress");

  // Get the current segment's progress element (segment flows from current to next)
  var currentMobileItem = mobileItems[state.activeIndex];
  var nextMobileItem = mobileItems[nextIndex];
  var progressElMobile = currentMobileItem === null || currentMobileItem === void 0 ? void 0 : currentMobileItem.querySelector(".steps-block__line-segment-progress--mobile[data-segment-index=\"".concat(state.activeIndex, "\"]"));

  // Reset the progress bars for this block when starting a new run.
  var progressEls = block.querySelectorAll(".steps-block__nav-item-line-progress");
  progressEls.forEach(function (el) {
    el.style.height = "0";
  });
  var mobileProgressEls = block.querySelectorAll(".steps-block__line-segment-progress--mobile");
  mobileProgressEls.forEach(function (el) {
    el.style.width = "0";
  });

  // Reset base mobile segments that haven't been completed yet.
  var mobileSegments = block.querySelectorAll(".steps-block__line-segment--mobile");
  mobileSegments.forEach(function (seg, idx) {
    if (idx >= state.activeIndex) {
      seg.style.background = "#20a4ff";
    }
  });
  var _update = function update(time) {
    if (state.progressStart == null) {
      state.progressStart = time;
    }
    var elapsed = time - state.progressStart;
    var t = Math.min(elapsed / state.progressDurationMs, 1);

    // Animate desktop progress line to 96px (filling from top to bottom to reach previous circle)
    if (progressEl) {
      var height = getComputedStyle(progressEl.parentElement).getPropertyValue("--before-height").trim();
      progressEl.style.top = "-".concat(parseFloat(height), "px");
      progressEl.style.height = "".concat(parseFloat(height) * t, "px");
    }

    // Animate mobile segment progress line (filling from left to right to reach next circle)
    if (progressElMobile && currentMobileItem && nextMobileItem) {
      _assertClassBrand(_StepsBlock_brand, _this6, _setMobileSegmentProgress).call(_this6, block, currentMobileItem, nextMobileItem, progressElMobile, t);
    }
    if (t < 1 && !state.userInteracted) {
      state.progressRaf = requestAnimationFrame(_update);
    } else if (t >= 1) {
      // When mobile progress completes, update the base segment to white.
      if (currentMobileItem) {
        var baseSegment = currentMobileItem.querySelector(".steps-block__line-segment--mobile[data-segment-index=\"".concat(state.activeIndex, "\"]"));
        if (baseSegment) {
          baseSegment.style.background = "#ffffff";
        }
      }
      if (onComplete) {
        onComplete();
      }
    }
  };
  state.progressStart = null;
  if (state.progressRaf != null) {
    cancelAnimationFrame(state.progressRaf);
  }
  state.progressRaf = requestAnimationFrame(_update);
}
function _scrollMobileNavIntoView(block, targetItem, state) {
  if (!targetItem) {
    return;
  }
  var scrollContainer = block.querySelector(".steps-block__nav-scroll");
  if (!scrollContainer) {
    return;
  }
  var containerRect = scrollContainer.getBoundingClientRect();
  var targetRect = targetItem.getBoundingClientRect();
  var leftOverflow = targetRect.left < containerRect.left;
  var rightOverflow = targetRect.right > containerRect.right;
  if (!leftOverflow && !rightOverflow) {
    return;
  }
  var diff = targetRect.left - containerRect.left + scrollContainer.scrollLeft - 24;
  if (state) state.isProgrammaticScroll = true;
  scrollContainer.scrollTo({
    left: diff,
    behavior: "smooth"
  });
  window.setTimeout(function () {
    if (state) state.isProgrammaticScroll = false;
  }, 350);
}
function _setMobileSegmentProgress(block, currentItem, nextItem, progressEl, t) {
  if (!progressEl || !currentItem || !nextItem) {
    return;
  }
  var currentBullet = currentItem.querySelector(".steps-block__bullet--mobile");
  var nextBullet = nextItem.querySelector(".steps-block__bullet--mobile");
  if (!currentBullet || !nextBullet) {
    return;
  }
  var currentRect = currentBullet.getBoundingClientRect();
  var nextRect = nextBullet.getBoundingClientRect();

  // Calculate the distance from the end of current bullet to the start of next bullet
  var segmentWidth = nextRect.left - (currentRect.left + currentRect.width);
  progressEl.style.width = "".concat(Math.max(0, segmentWidth * t), "px");
  progressEl.style.height = "1px";
}
function _syncMobileSegments(block, navItems) {
  var mobileItems = block.querySelectorAll(".steps-block__nav-item--mobile");
  mobileItems.forEach(function (item, index) {
    if (index >= mobileItems.length - 1) {
      return;
    }
    var currentBullet = item.querySelector(".steps-block__bullet--mobile");
    var nextItem = mobileItems[index + 1];
    var nextBullet = nextItem === null || nextItem === void 0 ? void 0 : nextItem.querySelector(".steps-block__bullet--mobile");
    if (!currentBullet || !nextBullet) {
      return;
    }
    var segment = item.querySelector(".steps-block__line-segment--mobile[data-segment-index=\"".concat(index, "\"]"));
    if (!segment) {
      return;
    }
    var currentRect = currentBullet.getBoundingClientRect();
    var nextRect = nextBullet.getBoundingClientRect();

    // Calculate the distance from the end of current bullet to the start of next bullet
    var segmentWidth = nextRect.left - (currentRect.left + currentRect.width);
    segment.style.width = "".concat(Math.max(0, segmentWidth), "px");
  });
}
new StepsBlock();
})();

/******/ })()
;