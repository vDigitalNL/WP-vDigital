/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./wp-content/themes/vdigital-wp-child-theme/blocks/cases/sass/main.scss"
/*!*******************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/cases/sass/main.scss ***!
  \*******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Cookiebot.js"
/*!**************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Cookiebot.js ***!
  \**************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Cookiebot = /*#__PURE__*/function () {
  function Cookiebot() {
    _classCallCheck(this, Cookiebot);
    this.setup();
    this.events();
  }
  return _createClass(Cookiebot, [{
    key: "setup",
    value: function setup() {
      this.html = document.querySelector("html");
      this.body = this.html.querySelector("body");
      this.multisitePrefix = this.html.dataset.lang;
      window.cookie_options_selected = [];
    }
  }, {
    key: "events",
    value: function events() {
      var _this = this;
      window.addEventListener("CookiebotOnDialogDisplay", function () {
        return _this.handleBannerLoaded();
      });
      window.addEventListener("CookiebotOnAccept", function () {
        return _this.removeDialogOverlay();
      });
      window.addEventListener("CookiebotOnDecline", function () {
        return _this.removeDialogOverlay();
      });
    }
  }, {
    key: "handleBannerLoaded",
    value: function handleBannerLoaded() {
      var _this2 = this;
      this.addDialogOverlay();
      document.getElementById("CybotCookiebotDialogBodyEdgeMoreDetailsLink").addEventListener("click", function () {
        return _this2.handleAdjustPreferencesClicked();
      });
      document.getElementById("CybotCookiebotDialogBodyLevelButtonPreferences").addEventListener("click", function (event) {
        return _this2.handleCookieTypeClicked(event, "preferences");
      });
      document.getElementById("CybotCookiebotDialogBodyLevelButtonStatistics").addEventListener("click", function (event) {
        return _this2.handleCookieTypeClicked(event, "statistics");
      });
      document.getElementById("CybotCookiebotDialogBodyLevelButtonMarketing").addEventListener("click", function (event) {
        return _this2.handleCookieTypeClicked(event, "marketing");
      });
      document.getElementById("CybotCookiebotDialogBodyLevelButtonMarketing").addEventListener("click", function () {
        return _this2.handleAcceptButtonClicked();
      });
    }
  }, {
    key: "addDialogOverlay",
    value: function addDialogOverlay() {
      this.body.insertAdjacentHTML("beforeend", '<div id="CybotCookiebotDialogBodyUnderlay"></div>');
    }
  }, {
    key: "removeDialogOverlay",
    value: function removeDialogOverlay() {
      var _this$body$querySelec;
      (_this$body$querySelec = this.body.querySelector("#CybotCookiebotDialogBodyUnderlay")) === null || _this$body$querySelec === void 0 || _this$body$querySelec.remove();
    }
  }, {
    key: "handleCookieTypeClicked",
    value: function handleCookieTypeClicked(event, cookieType) {
      if (event.target.checked) {
        cookie_options_selected.push(cookieType);
        return;
      }
      cookie_options_selected.splice(cookie_options_selected.indexOf(cookieType), 1);
    }
  }, {
    key: "handleAcceptButtonClicked",
    value: function handleAcceptButtonClicked() {
      if (typeof ga !== "function") {
        return;
      }
      var analyticsLabel = "Cookie_accept";
      if (typeof document.cookie != "undefined") {
        analyticsLabel = analyticsLabel + "_" + this.multisitePrefix;
      }
      ga("send", "event", "Buttons", "Click", analyticsLabel);
      cookie_options_selected.forEach(function (value) {
        if (value === "preferences") {
          ga("send", "event", "Buttons", "Click", "Cookie_preferences");
        }
        if (value === "statistics") {
          ga("send", "event", "Buttons", "Click", "Cookie_statistics");
        }
        if (value === "marketing") {
          ga("send", "event", "Buttons", "Click", "Cookie_marketing");
        }
        if (value === "self-input") {
          ga("send", "event", "Buttons", "Click", "Cookie_self-input");
        }
      });
    }
  }, {
    key: "handleAdjustPreferencesClicked",
    value: function handleAdjustPreferencesClicked() {
      var selectPane = document.getElementById("CybotCookiebotDialogBodyLevelButtonsSelectPane");
      selectPane === null || selectPane === void 0 || selectPane.classList.toggle("active");
      var preferences = document.getElementById("CybotCookiebotDialogBodyLevelButtonPreferences");
      var statistics = document.getElementById("CybotCookiebotDialogBodyLevelButtonStatistics");
      var marketing = document.getElementById("CybotCookiebotDialogBodyLevelButtonMarketing");
      console.log(preferences);
      console.log(statistics);
      console.log(marketing);
      preferences.checked = false;
      statistics.checked = false;
      marketing.checked = false;
      if (typeof ga === "function") {
        if (selectPane !== null && selectPane !== void 0 && selectPane.classList.contains("active")) {
          cookie_options_selected.push("self-input");
          return;
        }
        cookie_options_selected.splice(cookie_options_selected.indexOf("self-input"), 1);
      }
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Cookiebot);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/FacebookPixel.js"
/*!******************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/FacebookPixel.js ***!
  \******************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var FacebookPixel = /*#__PURE__*/function () {
  function FacebookPixel() {
    _classCallCheck(this, FacebookPixel);
    this.headerLoginButton = document.querySelectorAll(".navbar__container__login-link");
    this.events();
  }
  return _createClass(FacebookPixel, [{
    key: "events",
    value: function events() {
      this.headerLoginButton.forEach(function (button) {
        return button.addEventListener("click", function () {
          if (typeof fbq !== "function") {
            return;
          }
          fbq("trackCustom", "Login_click", {
            page: location.protocol + "//" + location.host + location.pathname
          });
        });
      });

      // window.addEventListener( "load", function () {
      //   if (!demoFormFilled) {
      //     return;
      //   }
      //
      //   if (typeof fbq !== "function") {
      //     return;
      //   }
      //
      //   fbq('trackCustom', 'Demo_submit', {
      //     page: location.protocol + '//' + location.host + location.pathname
      //   });
      // })
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FacebookPixel);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Footer.js"
/*!***********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Footer.js ***!
  \***********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _Footer_brand = /*#__PURE__*/new WeakSet();
var Footer = /*#__PURE__*/function () {
  function Footer() {
    _classCallCheck(this, Footer);
    _classPrivateMethodInitSpec(this, _Footer_brand);
    _defineProperty(this, "columns", null);
    this.columns = document.querySelector(".footer__columns");
    if (this.columns == null) {
      return;
    }
    this.setup();
    this.events();
  }
  return _createClass(Footer, [{
    key: "setup",
    value: function setup() {
      _assertClassBrand(_Footer_brand, this, _keepItemsSameSize).call(this, this.columns);
    }
  }, {
    key: "events",
    value: function events() {
      var _this = this;
      window.addEventListener("resize", function () {
        return _assertClassBrand(_Footer_brand, _this, _handleResize).call(_this);
      });
    }
  }]);
}();
function _handleResize() {
  var _this2 = this;
  clearTimeout(this.resizeTimeout);
  document.querySelectorAll(".footer__column__item").forEach(function (item) {
    return item.style.height = "";
  });
  this.resizeTimeout = setTimeout(function () {
    _assertClassBrand(_Footer_brand, _this2, _keepItemsSameSize).call(_this2, _this2.columns);
  }, 250);
}
function _keepItemsSameSize(columns) {
  if (window.innerWidth < 1024) {
    return;
  }
  var columnItems = columns.querySelectorAll(".footer__column");
  var highestPerRow = {};
  var submenuItems = [];
  columnItems.forEach(function (columnItem, index) {
    var items = columnItem.querySelectorAll(".footer__column__item");
    submenuItems.push(items);
    items.forEach(function (item, index) {
      if (highestPerRow[index] != null && item.offsetHeight < highestPerRow[index]) {
        return;
      }
      highestPerRow[index] = item.offsetHeight;
    });
  });
  submenuItems.forEach(function (items) {
    items.forEach(function (item, index) {
      var highestItem = highestPerRow[index];
      item.style.height = "".concat(highestItem, "px");
    });
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Footer);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Homehero.js"
/*!*************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Homehero.js ***!
  \*************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _Homehero;
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _Homehero_brand = /*#__PURE__*/new WeakSet();
var Homehero = /*#__PURE__*/function () {
  function Homehero() {
    var _this = this;
    _classCallCheck(this, Homehero);
    _classPrivateMethodInitSpec(this, _Homehero_brand);
    _defineProperty(this, "updateWordPositions", function () {
      _this.animationFrameId = 0;
      if (!_this.isHeroVisible) return;
      var scrollProgress = _this.calculateScrollProgress();
      var currentOffset = _this.startOffsetVw + (_this.endOffsetVw - _this.startOffsetVw) * scrollProgress;
      _this.leftWordElement.style.transform = "translate3d(".concat(-currentOffset, "vw, 0, 0)");
      _this.rightWordElement.style.transform = "translate3d(".concat(currentOffset, "vw, 0, 0)");
      _this.animationFrameId = requestAnimationFrame(_this.updateWordPositions);
    });
    var scrollToContentElement = document.querySelector("#scroll_to_content");
    if (scrollToContentElement) {
      scrollToContentElement.addEventListener("click", function (e) {
        e.preventDefault();
        _assertClassBrand(_Homehero_brand, _this, _scrolltoContent).call(_this);
      });
    }
    window.addEventListener("resize", function () {
      return _assertClassBrand(_Homehero_brand, _this, _setupWordAnimations).call(_this);
    });
    _assertClassBrand(_Homehero_brand, this, _setupWordAnimations).call(this);
  }
  return _createClass(Homehero, [{
    key: "clampBetweenZeroAndOne",
    value: function clampBetweenZeroAndOne(value) {
      return Math.max(0, Math.min(1, value));
    }
  }, {
    key: "calculateScrollProgress",
    value: function calculateScrollProgress() {
      var heroRect = this.heroElement.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      var rawProgress = -heroRect.top / viewportHeight;
      return this.clampBetweenZeroAndOne(rawProgress);
    }
  }, {
    key: "createObserver",
    value: function createObserver() {
      var _this2 = this;
      this.heroVisibilityObserver = new IntersectionObserver(function (entries) {
        _this2.isHeroVisible = entries[0].isIntersecting;
        if (_this2.isHeroVisible && !_this2.animationFrameId) {
          _this2.animationFrameId = requestAnimationFrame(_this2.updateWordPositions);
        }
        if (!_this2.isHeroVisible && _this2.animationFrameId) {
          cancelAnimationFrame(_this2.animationFrameId);
          _this2.animationFrameId = 0;
        }
      }, {
        threshold: 0
      });
      this.heroVisibilityObserver.observe(this.heroElement);
    }
  }]);
}();
_Homehero = Homehero;
function _setupWordAnimations() {
  var _this$heroElement, _this$heroElement2;
  this.isMobileViewport = window.matchMedia("(max-width: 1024px)");
  this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!this.isMobileViewport.matches || this.prefersReducedMotion.matches) {
    return;
  }
  this.heroElement = document.querySelector(".home-hero");
  this.leftWordElement = (_this$heroElement = this.heroElement) === null || _this$heroElement === void 0 ? void 0 : _this$heroElement.querySelector(".home-hero__bigword.left");
  this.rightWordElement = (_this$heroElement2 = this.heroElement) === null || _this$heroElement2 === void 0 ? void 0 : _this$heroElement2.querySelector(".home-hero__bigword.right");
  if (!this.heroElement || !this.leftWordElement || !this.rightWordElement) {
    return;
  }
  this.startOffsetVw = 11;
  this.startOffsetPx = 46;
  this.endOffsetVw = 6;
  this.endOffsetPx = 10;
  this.isHeroVisible = false;
  this.animationFrameId = 0;
  this.createObserver();
}
function _scrolltoContent() {
  var homeHeroElement = _assertClassBrand(_Homehero_brand, this, _getHomeHeroElement).call(this);
  if (!homeHeroElement) return;
  var targetScrollTop = _assertClassBrand(_Homehero_brand, this, _calculateTargetScrollPosition).call(this, homeHeroElement);
  _assertClassBrand(_Homehero_brand, this, _performSmoothScroll).call(this, targetScrollTop);
}
function _getHomeHeroElement() {
  return document.querySelector("#home-hero");
}
function _calculateTargetScrollPosition(homeHeroElement) {
  var homeHeroRect = homeHeroElement.getBoundingClientRect();
  var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var targetScrollTop = currentScrollTop + homeHeroRect.bottom;

  // Adjust for admin bar on mobile
  if (_assertClassBrand(_Homehero_brand, this, _shouldAdjustForAdminBar).call(this)) {
    var adminBarHeight = _assertClassBrand(_Homehero_brand, this, _getAdminBarHeight).call(this);
    targetScrollTop -= adminBarHeight;
  }
  return targetScrollTop;
}
function _shouldAdjustForAdminBar() {
  return document.getElementById("wpadminbar") && window.innerWidth > 600;
}
function _getAdminBarHeight() {
  var adminBar = document.getElementById("wpadminbar");
  return (adminBar === null || adminBar === void 0 ? void 0 : adminBar.getBoundingClientRect().height) || 0;
}
function _performSmoothScroll(targetScrollTop) {
  window.isProgrammaticScroll = true;
  window.scrollTo({
    top: targetScrollTop,
    behavior: "smooth"
  });
  setTimeout(function () {
    window.isProgrammaticScroll = false;
  }, _Homehero.PROGRAMMATIC_SCROLL_DURATION);
}
_defineProperty(Homehero, "PROGRAMMATIC_SCROLL_DURATION", 800);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Homehero);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Login.js"
/*!**********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Login.js ***!
  \**********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Tagmanager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Tagmanager */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Tagmanager.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var Login = /*#__PURE__*/function () {
  function Login() {
    _classCallCheck(this, Login);
    this.events();
  }
  return _createClass(Login, [{
    key: "events",
    value: function events() {
      document.querySelectorAll(".login-form__submit").forEach(function (submitButton) {
        submitButton.addEventListener("click", function () {
          _Tagmanager__WEBPACK_IMPORTED_MODULE_0__["default"].pushToDataLayer({
            event: "login",
            eventCategory: "login",
            eventAction: "submit"
          });
        });
      });
      document.querySelectorAll(".login-notice__close").forEach(function (closeButton) {
        closeButton.addEventListener("click", function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
          closeButton.closest(".ww-login-error").remove();
        });
      });

      // Remove error classes when input is focused
      document.querySelectorAll(".login-form__input").forEach(function (inputField) {
        inputField.addEventListener("focus", function () {
          console.log("focus");
          this.classList.remove("tw-text-red-01", "tw-border-red-01", "tw-placeholder-red-01");
        });
      });
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Login);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Menu.js"
/*!*********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Menu.js ***!
  \*********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/CssClasses */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/CssClasses.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }

var _Menu_brand = /*#__PURE__*/new WeakSet();
var Menu = /*#__PURE__*/function () {
  function Menu() {
    _classCallCheck(this, Menu);
    _classPrivateMethodInitSpec(this, _Menu_brand);
    _defineProperty(this, "tailwind", {
      hidden: "tw-hidden",
      align: {
        top: "tw-top-0",
        right: "tw-right-0"
      },
      hide: {
        top: "tw--top-full",
        right: "tw--right-full"
      },
      height: {
        full: "tw-h-full",
        screen: "tw-h-[100vh]"
      },
      zindex: {
        10: "tw-z-10",
        20: "tw-z-20"
      }
    });
    _defineProperty(this, "closingMenuItem", false);
    _defineProperty(this, "preScrollPosition", false);
    this.html = document.querySelector("html");
    this.setup();
    this.events();
  }
  return _createClass(Menu, [{
    key: "setup",
    value: function setup() {
      this.header = document.querySelector("header#header");
      if (this.header === null) return;
      var isMobile = window.innerWidth < 1024;
      this.nav = this.header.querySelector("nav");
      this.header.style.height = this.nav.clientHeight + "px";
      this.navbarItems = this.header.querySelectorAll(".navbar-item");
      this.mobileOpenButton = this.header.querySelector(".mobile-menu-button--open");
      this.mobileCloseButton = this.header.querySelector(".mobile-menu-button--close");
      this.homeHero = document.querySelector("#home_hero_navbar");
      if (this.homeHero) {
        this.mobileOpenButtonHero = this.homeHero.querySelector(".mobile-menu-button--open");
        this.mobileCloseButtonHero = this.homeHero.querySelector(".mobile-menu-button--close");
      }
      if (isMobile && !this.mobileMenuLoaded) {
        _assertClassBrand(_Menu_brand, this, _loadMobile).call(this);
      }
      if (!isMobile) {
        _assertClassBrand(_Menu_brand, this, _setupSubmenus).call(this);
      }
    }
  }, {
    key: "events",
    value: function events() {
      var _document$getElementB,
        _this = this,
        _this$mobileOpenButto,
        _this$mobileOpenButto2,
        _this$mobileCloseButt,
        _this$mobileCloseButt2;
      (_document$getElementB = document.getElementById("navbar")) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener("mouseover", function (evt) {
        return _assertClassBrand(_Menu_brand, _this, _handleOnMouseover).call(_this, evt.target);
      });
      window.addEventListener("resize", function () {
        setTimeout(function () {
          _this.header.style.height = _this.nav.clientHeight + "px";
        }, 200);
        var isMobile = window.innerWidth < 1024;
        if (isMobile && !_this.mobileMenuLoaded) {
          _assertClassBrand(_Menu_brand, _this, _loadMobile).call(_this);
        }
      });
      (_this$mobileOpenButto = this.mobileOpenButton) === null || _this$mobileOpenButto === void 0 || _this$mobileOpenButto.addEventListener("click", function () {
        return _assertClassBrand(_Menu_brand, _this, _handleMobileMenuOpen).call(_this);
      });
      (_this$mobileOpenButto2 = this.mobileOpenButtonHero) === null || _this$mobileOpenButto2 === void 0 || _this$mobileOpenButto2.addEventListener("click", function () {
        return _assertClassBrand(_Menu_brand, _this, _handleMobileMenuOpen).call(_this);
      });
      (_this$mobileCloseButt = this.mobileCloseButton) === null || _this$mobileCloseButt === void 0 || _this$mobileCloseButt.addEventListener("click", function () {
        return _assertClassBrand(_Menu_brand, _this, _handleMobileMenuClose).call(_this);
      });
      (_this$mobileCloseButt2 = this.mobileCloseButtonHero) === null || _this$mobileCloseButt2 === void 0 || _this$mobileCloseButt2.addEventListener("click", function () {
        return _assertClassBrand(_Menu_brand, _this, _handleMobileMenuClose).call(_this);
      });
    }
  }]);
}();
function _loadMobile() {
  var _this2 = this;
  this.mobileMenuLoaded = true;
  var multisitePrefix = this.html.dataset.lang;
  fetch("/" + multisitePrefix + "/wp-admin/admin-ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      action: "load_mobile_menu",
      theme: "vdigital-wp-child-theme__vdigital-wp-base-theme"
    })
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    _this2.nav.insertAdjacentHTML("beforeend", data.html);
    _assertClassBrand(_Menu_brand, _this2, _setupMobile).call(_this2);
  })["catch"](function (error) {
    console.error(error);
    _this2.mobileMenuLoaded = false;
  });
}
function _setupMobile() {
  var _this3 = this;
  this.mobileMenu = this.header.querySelector(".menu--mobile");
  this.mobileMenuNavItems = this.header.querySelectorAll(".navbar-item--mobile");
  this.mobileMenuNavItems.forEach(function (item) {
    return item.addEventListener("click", function (evt) {
      return _assertClassBrand(_Menu_brand, _this3, _handleOpenMobileMenu).call(_this3, evt.target);
    });
  });
  this.mobileMenuNavItems.forEach(function (item) {
    return item.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (e.target.tagName.toLowerCase() !== "a") {
          return;
        }
        if (e.target.getAttribute("href") === "#") {
          e.preventDefault();
          return;
        } else if (e.target.getAttribute("href") === window.location.href || e.target.getAttribute("href").indexOf("#") > -1) {
          e.preventDefault();
          _assertClassBrand(_Menu_brand, _this3, _handleMobileMenuClose).call(_this3);
          setTimeout(function () {
            window.location.href = link.href;
          }, 400);
        }
      });
    });
  });
}
function _keepSameSize() {
  var _this4 = this;
  var submenus = document.querySelectorAll(".submenu");
  var highestSubmenu = 0;
  submenus.forEach(function (submenu) {
    submenu.style.minHeight = false;
  });
  setTimeout(function () {
    submenus.forEach(function (submenu) {
      if (submenu.offsetHeight < highestSubmenu) {
        return;
      }
      highestSubmenu = submenu.offsetHeight;
      _assertClassBrand(_Menu_brand, _this4, _keepItemsSameSize).call(_this4, submenu);
    });
    submenus.forEach(function (submenu) {
      submenu.style.minHeight = "".concat(highestSubmenu, "px");
    });
  }, 500);
}
function _keepItemsSameSize(submenu) {
  var columnItems = submenu.querySelectorAll(".submenu__column__items");
  var highestPerRow = {};
  var submenuItems = [];
  columnItems.forEach(function (columnItem, index) {
    var items = columnItem.querySelectorAll(".submenu__column__items__item");
    submenuItems.push(items);
    items.forEach(function (item, index) {
      if (highestPerRow[index] != null && item.offsetHeight < highestPerRow[index]) {
        return;
      }
      highestPerRow[index] = item.offsetHeight;
    });
  });
  submenuItems.forEach(function (items) {
    items.forEach(function (item, index) {
      var highestItem = highestPerRow[index];
      item.style.height = "".concat(highestItem, "px");
    });
  });
}
function _setupSubmenus() {
  var _this5 = this;
  _assertClassBrand(_Menu_brand, this, _keepSameSize).call(this);
  this.navbarItems.forEach(function (item) {
    var submenu = document.querySelector('.submenu[data-index="' + item.dataset.submenuIndex + '"]');
    if (submenu) {
      submenu.style.top = "-" + (submenu.clientHeight + _this5.nav.clientHeight) + "px";
      submenu.classList.add("lg:tw-invisible");
      setTimeout(function () {
        return _assertClassBrand(_Menu_brand, _this5, _submenuTitleSameSize).call(_this5, submenu);
      }, 100);
      setTimeout(function () {
        submenu.classList.remove("lg:tw-invisible");
      }, 700);
    }
  });
}
function _submenuTitleSameSize(submenu) {
  var columns = submenu.querySelectorAll(".submenu__column");
  var titleCount = 0;
  var titleHeight = 0;
  columns.forEach(function (column) {
    var title = column.querySelector(".submenu__column__title");
    if (title != null && title.textContent.length > 0) {
      titleCount++;
      titleHeight = title.clientHeight > titleHeight ? title.clientHeight : titleHeight;
    }
  });
  if (titleCount > 0 && columns.length > titleCount) {
    columns.forEach(function (column) {
      var title = column.querySelector(".submenu__column__title");
      if (title != null) {
        title.style.height = titleHeight + "px";
      }
    });
  }
}
function _textActive(element) {
  var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(element, "tw-text-blue-01", reverse);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(element, "tw-text-black-01", !reverse);
}
function _open(submenu, target) {
  var _this6 = this;
  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var icon = target.querySelector("svg");
  submenu.style.top = "100%";
  target.dataset.openedSubmenu = true;
  if (icon != null) {
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(icon, "tw-rotate-180");
    _assertClassBrand(_Menu_brand, this, _textActive).call(this, icon);
  }
  document.addEventListener("mouseover", function (evt) {
    return _assertClassBrand(_Menu_brand, _this6, _closeMenuItem).call(_this6, evt.target);
  });
  callback === null || callback === void 0 || callback();
}
function _close(submenu, target) {
  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var icon = target.querySelector("svg");
  submenu.style.top = "-" + (submenu.clientHeight + this.nav.clientHeight) + "px";
  target.dataset.openedSubmenu = false;
  if (icon != null) {
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(icon, "tw-rotate-180", true);
    _assertClassBrand(_Menu_brand, this, _textActive).call(this, icon, true);
  }
  document.removeEventListener("mouseover", _assertClassBrand(_Menu_brand, this, _closeMenuItem));
  callback === null || callback === void 0 || callback();
}
function _closeMenuItem(target) {
  var _this7 = this;
  if (this.closingMenuItem) {
    return false;
  }
  var openNavItem = document.querySelector('.navbar-item[data-opened-submenu="true"]');
  if (openNavItem == null) {
    return;
  }
  var index = openNavItem.dataset.submenuIndex;
  var openSubmenu = document.querySelector('.submenu[data-index="' + index + '"]');
  if (!target.closest('.submenu[data-index="' + index + '"]') && !target.closest('.navbar-item[data-submenu-index="' + index + '"]')) {
    if (target.closest("#navbar")) {
      this.closingMenuItem = true;
      setTimeout(function () {
        var currentHoveredElements = document.querySelectorAll(":hover");
        if (currentHoveredElements.length > 0) {
          var current = currentHoveredElements[currentHoveredElements.length - 1];
          if (current.closest("#navbar")) {
            _assertClassBrand(_Menu_brand, _this7, _close).call(_this7, openSubmenu, openNavItem);
            var closestItem = current.closest(".navbar-item");
            if (closestItem == null || closestItem.classList.contains("navbar-item--has-submenu") === false) {
              _this7.closingMenuItem = false;
              return;
            }
            var newSubmenu = document.querySelector('.submenu[data-index="' + closestItem.dataset.submenuIndex + '"]');
            _assertClassBrand(_Menu_brand, _this7, _open).call(_this7, newSubmenu, closestItem, function () {
              _this7.closingMenuItem = false;
            });
          } else {
            _this7.closingMenuItem = false;
          }
        } else {
          _this7.closingMenuItem = false;
        }
      }, 350);
      return;
    }
    _assertClassBrand(_Menu_brand, this, _close).call(this, openSubmenu, openNavItem, function () {
      return _this7.closingMenuItem = false;
    });
  }
}
function _handleResize() {
  var _this8 = this;
  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout(function () {
    _this8.header.querySelectorAll(".submenu__column__title").forEach(function (title) {
      return title.style.height = "";
    });
    _assertClassBrand(_Menu_brand, _this8, _setupSubmenus).call(_this8);
  }, 250);
}
function _handleOnMouseover(target) {
  var navbarItem = target.closest(".navbar-item");
  var openNavItem = document.querySelector('.navbar-item[data-opened-submenu="true"]');
  if (navbarItem == null || navbarItem.classList.contains("navbar-item--has-submenu") === false || openNavItem != null) {
    return;
  }
  var item = target.classList.contains("navbar-item") ? target : navbarItem;
  var submenu = document.querySelector('.submenu[data-index="' + item.dataset.submenuIndex + '"]');
  _assertClassBrand(_Menu_brand, this, _open).call(this, submenu, item);
}
function _maybeScrollToHeader() {
  /**
   * Used for aligning the viewport with the menu when opening the
   * mobile menu from a lower position. Which is possible with the home hero
   * */
  var headerTop = this.header.getBoundingClientRect().top;
  var isHeaderSticky = getComputedStyle(this.header).position === "sticky";
  if (isHeaderSticky && headerTop === 0) {
    this.preScrollPosition = false;
    return;
  }
  if (_assertClassBrand(_Menu_brand, this, _shouldAdjustForAdminBar).call(this)) {
    var adminBarHeight = _assertClassBrand(_Menu_brand, this, _getAdminBarHeight).call(this);
    headerTop -= adminBarHeight;
  }
  if (headerTop < 0 || headerTop > 0) {
    this.preScrollPosition = window.scrollY;
    window.scrollTo({
      top: window.scrollY + headerTop,
      behavior: "smooth"
    });
  }
}
function _shouldAdjustForAdminBar() {
  return document.getElementById("wpadminbar") && window.innerWidth > 600;
}
function _getAdminBarHeight() {
  var adminBar = document.getElementById("wpadminbar");
  return (adminBar === null || adminBar === void 0 ? void 0 : adminBar.getBoundingClientRect().height) || 0;
}
function _handleMobileMenuOpen() {
  if (this.mobileMenu === undefined) {
    return; // prevent icon toggle if menu is not loaded yet
  }
  _assertClassBrand(_Menu_brand, this, _maybeScrollToHeader).call(this);
  var navbar = document.querySelector("#navbar");
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileOpenButton, this.tailwind.hidden);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileCloseButton, this.tailwind.hidden, true);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.hide.top, true);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.align.top);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.height.full, true);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.height.screen);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.zindex[10]);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.align.top);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(navbar, "opened-mobile-menu");
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(document.querySelector("body"), "opened-mobile-menu");
  if (!this.mobileSubmenusLoaded) {
    _assertClassBrand(_Menu_brand, this, _loadMobileSubmenus).call(this);
  }
}
function _loadMobileSubmenus() {
  var _this9 = this;
  var multisitePrefix = this.html.dataset.lang;
  fetch("/" + multisitePrefix + "/wp-admin/admin-ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      action: "load_mobile_submenus",
      theme: "vdigital-wp-child-theme__vdigital-wp-base-theme"
    })
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    _this9.mobileSubmenusLoaded = true;
    _this9.mobileMenu.insertAdjacentHTML("afterend", data.html);
  })["catch"](function (error) {
    return console.error(error);
  });
}
function _handleMobileMenuClose() {
  var _this0 = this;
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileOpenButton, this.tailwind.hidden, true);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileCloseButton, this.tailwind.hidden);
  var navbar = document.querySelector("#navbar");
  var openSubmenus = document.querySelectorAll(".submenu--mobile.tw-right-0");
  if (openSubmenus.length > 0) {
    openSubmenus.forEach(function (submenu) {
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this0.tailwind.hide.right);
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this0.tailwind.align.right, true);
      setTimeout(function () {
        return (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this0.tailwind.hidden);
      }, 500);
    });
    setTimeout(function () {
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(_this0.mobileMenu, _this0.tailwind.hide.top);
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(_this0.mobileMenu, _this0.tailwind.align.top, true);
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(_this0.mobileMenu, _this0.tailwind.height.full);
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(_this0.mobileMenu, _this0.tailwind.height.screen, true);
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(_this0.mobileMenu, _this0.tailwind.zindex[10], true);
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(_this0.mobileMenu, _this0.tailwind.align.top, true);
    }, 500);
  } else {
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.hide.top);
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.align.top, true);
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.height.full);
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.height.screen, true);
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.zindex[10], true);
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(this.mobileMenu, this.tailwind.align.top, true);
  }
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(navbar, "opened-mobile-menu", true);
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(document.querySelector("body"), "opened-mobile-menu", true);
}
function _handleOpenMobileMenu(target) {
  var _this1 = this;
  if (!this.mobileSubmenusLoaded) {
    return;
  }
  var navbar = document.querySelector("#navbar");
  var navbarItem = target.closest(".navbar-item--mobile");
  var submenu = document.querySelector('.submenu--mobile[data-index="' + navbarItem.dataset.submenuIndex + '"]');
  if (!submenu) {
    console.error("No submenu found for index:", navbarItem.dataset.submenuIndex);
    return;
  }
  (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, this.tailwind.hidden, true);
  setTimeout(function () {
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this1.tailwind.align.right);
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this1.tailwind.hide.right, true);

    // is submenu higher than the viewport?
    if (submenu.offsetHeight > window.innerHeight) {
      if (_this1.preScrollPosition !== false) {
        submenu.scrollTop = 0;
      }
    }
  }, 100);
  submenu.querySelector(".button--back").addEventListener("click", function () {
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this1.tailwind.align.right, true);
    (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this1.tailwind.hide.right);
    setTimeout(function () {
      (0,_helpers_CssClasses__WEBPACK_IMPORTED_MODULE_0__.toggleClassOnElement)(submenu, _this1.tailwind.hidden);
    }, 500);
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Menu);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Overview.js"
/*!*************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Overview.js ***!
  \*************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _Overview_brand = /*#__PURE__*/new WeakSet();
var Overview = /*#__PURE__*/function () {
  function Overview() {
    _classCallCheck(this, Overview);
    _classPrivateMethodInitSpec(this, _Overview_brand);
    this.html = document.querySelector("html");
    this.events();
  }
  return _createClass(Overview, [{
    key: "events",
    value: function events() {
      var _this = this;
      document.querySelectorAll(".overview").forEach(function (overview) {
        var loadMoreButton = overview.querySelector(".overview__load-more");
        var loader = overview.querySelector(".overview__loader");
        var container = overview.querySelector(".overview__container");
        var mobileFilterContainer = overview.querySelector(".overview__filters__mob");
        var mobileFilterSelect = overview.querySelector(".overview__filters__mob select");
        loadMoreButton.addEventListener("click", function (e) {
          e.preventDefault();
          _assertClassBrand(_Overview_brand, _this, _loadMore).call(_this, overview, container, loadMoreButton, loader);
        });
        overview.querySelectorAll(".overview__filters__category").forEach(function (categoryButton) {
          categoryButton.addEventListener("click", function () {
            _assertClassBrand(_Overview_brand, _this, _filter).call(_this, overview, container, categoryButton, loadMoreButton);
            mobileFilterContainer._selectInstance.selectByValue(mobileFilterContainer, categoryButton.dataset.category);
          });
        });
        mobileFilterSelect.addEventListener("change", function (e) {
          var categoryId = mobileFilterSelect.value;
          _assertClassBrand(_Overview_brand, _this, _filter).call(_this, overview, container, overview.querySelector('.overview__filters__category[data-category="' + categoryId + '"]'), loadMoreButton);
        });
        var urlParams = new URLSearchParams(window.location.search);
        var categoryId = urlParams.get("category");
        if (categoryId != null) {
          _assertClassBrand(_Overview_brand, _this, _filter).call(_this, overview, container, overview.querySelector('.overview__filters__category[data-category="' + categoryId + '"]'), loadMoreButton);
        }
      });
    }
  }, {
    key: "fetchPosts",
    value: function fetchPosts(action, overviewElement, category) {
      var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var url = "/".concat(this.html.dataset.lang, "/wp-content/themes/vdigital-wp-child-theme/ajax.php");
      var init = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          action: action,
          theme: "vdigital-wp-child-theme__vdigital-wp-base-theme",
          post_type: overviewElement.dataset.postType,
          highlightedPost: overviewElement.dataset.highlightedPost,
          offset: offset,
          category: category,
          nonce: nonces.ajax
        })
      };
      return fetch(url, init).then(function (response) {
        return response.json();
      })["catch"](function (error) {
        return console.error(error);
      });
    }

    // #toggleMobileFilterDropdown(overview, mobileFilterButton) {
    //   const dropdown = overview.querySelector(".overview__filters");
    //   const dropdownIcon = mobileFilterButton.querySelector(
    //     ".overview__filter-button__icon",
    //   );
    //   dropdown.classList.toggle("tw-hidden");
    //   dropdownIcon.classList.toggle("tw-rotate-180");
    // }
  }]);
}();
function _loadMore(overview, container, loadMoreButton, loader) {
  var morePosts = true;
  loadMoreButton.classList.add("tw-hidden");
  loader.classList.remove("tw-hidden");
  this.fetchPosts("fetch_more_posts", overview, loadMoreButton.dataset.category, loadMoreButton.dataset.offset).then(function (data) {
    container.insertAdjacentHTML("beforeend", data.html);
    loadMoreButton.dataset.offset = data.offset;
    if (!data.more) {
      morePosts = false;
    }
  })["finally"](function () {
    if (morePosts) {
      loadMoreButton.classList.remove("tw-hidden");
    }
    loader.classList.add("tw-hidden");
  });
}
function _filter(overview, container, categoryButton, loadMoreButton) {
  var _this2 = this;
  _assertClassBrand(_Overview_brand, this, _activateCategoryButton).call(this, overview, categoryButton);
  overview.style.height = window.getComputedStyle(overview).height;
  var categoryId = categoryButton.dataset.category;
  // const mobileFilterButton = overview.querySelector(
  //   ".overview__filter-button",
  // );
  // const overviewFilterButtonText = overview.querySelector(
  //   ".overview__filter-button > span",
  // );
  // overviewFilterButtonText.textContent = categoryButton.textContent;

  document.querySelectorAll(".overview__container__item:not(.overview_category_" + categoryId + ")").forEach(function (element) {
    element.classList.add("tw-hidden");
  });

  // this.#toggleMobileFilterDropdown(overview, mobileFilterButton);

  overview.querySelector(".overview__no-results").classList.add("tw-hidden");
  overview.querySelectorAll(".overview__filter__item").forEach(function (item) {
    if (categoryButton.dataset.category === "all") {
      item.classList.remove("tw-hidden");
      return;
    }
    item.classList.add("tw-hidden");
    if (item.classList.contains("category-" + categoryButton.dataset.category)) {
      item.classList.remove("tw-hidden");
    }
  });
  if (parseInt(overview.dataset.showAll) !== 1) {
    this.fetchPosts("fetch_posts", overview, categoryId).then(function (data) {
      container.innerHTML = data.html;
      loadMoreButton.dataset.offset = data.offset;
      loadMoreButton.dataset.category = categoryButton.dataset.category;
      loadMoreButton.classList.remove("tw-hidden");
      overview.style.height = "";
      if (!data.more) {
        loadMoreButton.classList.add("tw-hidden");
      }
      _assertClassBrand(_Overview_brand, _this2, _showNoResultsText).call(_this2, overview);
    });
  } else {
    overview.style.height = "";
    _assertClassBrand(_Overview_brand, this, _showNoResultsText).call(this, overview);
  }
}
function _showNoResultsText(overview) {
  var visibleItems = overview.querySelectorAll(".overview__filter__item:not(.tw-hidden)").length;
  if (visibleItems === 0) {
    overview.querySelector(".overview__no-results").classList.remove("tw-hidden");
  }
}
function _activateCategoryButton(overview, categoryButton) {
  overview.querySelectorAll(".overview__filters__category").forEach(function (button) {
    button.classList.remove("button--blue");
    button.classList.add("button--outline");
  });
  if (categoryButton && categoryButton.classList) {
    categoryButton.classList.add("button--blue");
    categoryButton.classList.remove("button--outline");
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Overview);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup.js"
/*!**********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup.js ***!
  \**********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Salesforce_Popup_Tabs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Salesforce/Popup/Tabs */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/Popup/Tabs.js");
/* harmony import */ var _Popup_Fields__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Popup/Fields */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup/Fields.js");
/* harmony import */ var _Salesforce_Validation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Salesforce/Validation */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/Validation.js");
/* harmony import */ var _Salesforce_HiddenFields__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Salesforce/HiddenFields */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/HiddenFields.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }




var _Popup_brand = /*#__PURE__*/new WeakSet();
var Popup = /*#__PURE__*/function () {
  function Popup(id, forms) {
    var disableRegisterFunctions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var type = arguments.length > 3 ? arguments[3] : undefined;
    _classCallCheck(this, Popup);
    _classPrivateMethodInitSpec(this, _Popup_brand);
    _defineProperty(this, "element", null);
    _defineProperty(this, "tabClass", null);
    _defineProperty(this, "fieldClass", null);
    _defineProperty(this, "validationClass", null);
    _defineProperty(this, "loading", false);
    _defineProperty(this, "type", "salesforce");
    this.id = id;
    this.forms = forms;
    this.type = type;
    if (!disableRegisterFunctions) {
      _assertClassBrand(_Popup_brand, this, _registerCustomEvents).call(this);
      _assertClassBrand(_Popup_brand, this, _registerEventListeners).call(this);
    }
  }
  return _createClass(Popup, [{
    key: "open",
    value: function open() {
      // If element is null, the ajax call has not been fired before.
      if (this.element === null && !this.loading) {
        _assertClassBrand(_Popup_brand, this, _load).call(this);
      } else {
        this.element.dispatchEvent(this.loadEvent);
        this.element.classList.remove("tw-hidden");
        this.element.querySelectorAll(".vdigital_popup_hide_on_success").forEach(function (element) {
          element.classList.remove("tw-hidden");
        });
        this.element.dispatchEvent(this.afterLoadEvent);
      }
    }
  }, {
    key: "activateSuccessMessage",
    value: function activateSuccessMessage(tab) {
      var small = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.element.querySelectorAll(".vdigital_popup_hide_on_success").forEach(function (element) {
        element.classList.add("tw-hidden");
      });
      var succssElements = this.element.querySelectorAll('.salesforce_submit_content[data-key="' + tab + '"]');
      if (small) {
        var smallElements = this.element.querySelectorAll('.salesforce_submit_content_small[data-key="' + tab + '"]');
        if (smallElements.length > 0) {
          succssElements = smallElements;
        }
      }
      succssElements.forEach(function (successElement) {
        successElement.classList.remove("tw-hidden");
      });
    }
  }, {
    key: "close",
    value: function close(event) {
      var target = event.target;
      if ((target.closest(".salesforce_popup__wrapper") != null || target.classList.contains("salesforce_popup__wrapper")) && target.classList.contains(".salesforce_popup__close") === false && target.closest(".salesforce_popup__close") == null) {
        return;
      }
      this.element.classList.remove("open");
      this.element.classList.add("tw-hidden");
      this.element.querySelectorAll(".salesforce_submit_content:not(.tw-hidden), .salesforce_submit_content_small:not(.tw-hidden)").forEach(function (element) {
        element.classList.add("tw-hidden");
      });
      this.removeUrlParams();
    }
  }, {
    key: "setActiveTab",
    value: function setActiveTab(tabName, skipActive) {
      var _this = this;
      document.addEventListener(this.loadEvent.type, function () {
        if (_this.tabClass === null) {
          if (_this.element.querySelectorAll(".salesforce_popup__tabs__tab").length === 0) {
            return;
          }
          var formContents = _this.element.querySelectorAll(".salesforce_form_content");
          var submitContent = _this.element.querySelectorAll(".salesforce_submit_content");
          _this.tabClass = new _Salesforce_Popup_Tabs__WEBPACK_IMPORTED_MODULE_0__["default"](formContents, submitContent, _this.element, _this.id, _this.forms);
        }
        var tab = null;
        var isInteger = Number.isInteger(parseInt(tabName));
        if (isInteger) {
          tab = _this.tabClass.tabs[tabName - 1];
          _this.tabClass.makeTabsInactive();
          if (!skipActive) {
            _this.tabClass.change(tab, false);
            _this.tabClass.setUrlParams(tab);
          }
        } else {
          var _Array$from$find;
          tab = (_Array$from$find = Array.from(_this.tabClass.tabs).find(function (tab) {
            return tab.dataset.key === tabName;
          })) !== null && _Array$from$find !== void 0 ? _Array$from$find : _this.tabClass.tabs[0];
          _this.tabClass.makeTabsInactive();
          if (!skipActive) {
            _this.tabClass.change(tab);
            _this.tabClass.setUrlParams(tab);
          }
        }
      });
    }
  }, {
    key: "setUrlParameters",
    value: function setUrlParameters() {
      var setSubmit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("vdigital_popup", "true");
      currentUrl.searchParams.set("vdigital_popup_id", this.id);
      currentUrl.searchParams.set("vdigital_popup_type", this.type);
      currentUrl.searchParams.set("vdigital_popup_tab", 0);
      currentUrl.searchParams.set("vdigital_popup_forms", JSON.stringify(this.forms));
      if (setSubmit) {
        currentUrl.searchParams.set("vdigital_submit", "true");
      }
      history.pushState({}, null, currentUrl);
    }
  }, {
    key: "removeUrlParams",
    value: function removeUrlParams() {
      var currentUrl = new URL(window.location.href);
      currentUrl.search = "";
      history.pushState({}, null, currentUrl.toString());
    }
  }]);
}();
function _registerCustomEvents() {
  this.loadEvent = new CustomEvent(this.id + "-popup-loaded", {
    bubbles: true
  });
  this.afterLoadEvent = new CustomEvent(this.id + "-after-popup-loaded", {
    bubbles: true
  });
}
function _registerEventListeners() {
  var _this2 = this;
  document.addEventListener(this.afterLoadEvent.type, function () {
    setTimeout(function () {
      return _assertClassBrand(_Popup_brand, _this2, _setHeight).call(_this2);
    }, 250);
  });
  window.addEventListener("resize", function () {
    if (_this2.element !== null) {
      clearTimeout(_this2.resizeTimeout);
      _this2.resizeTimeout = setTimeout(function () {
        _assertClassBrand(_Popup_brand, _this2, _setHeight).call(_this2);
      }, 250);
    }
  });
}
function _load() {
  var _document$querySelect,
    _this3 = this;
  this.loading = true;
  var prefix = document.querySelector("html").dataset.lang;
  var currentUrl = new URL(window.location.href);
  var serializedForm = (_document$querySelect = document.querySelector('input[name="serialized_salesforce_form"]')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.value;
  fetch("/" + prefix + "/wp-content/themes/vdigital-wp-child-theme/ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      action: "vdigital_render_popup",
      theme: "vdigital-wp-child-theme__vdigital-wp-base-theme",
      popupId: this.id,
      type: this.type,
      forms: JSON.stringify(this.forms),
      getParams: currentUrl.searchParams,
      serializedForm: serializedForm !== null && serializedForm !== void 0 ? serializedForm : null,
      nonce: nonces.ajax
    })
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    document.querySelector("#header").insertAdjacentHTML("afterend", data.html);
    _this3.element = document.querySelector(".salesforce_popup_" + _this3.id);
    _this3.element.addEventListener("click", function (evt) {
      return _this3.close(evt);
    });
    _this3.fieldClass = new _Popup_Fields__WEBPACK_IMPORTED_MODULE_1__["default"](_this3.element);
    _this3.fieldClass.phoneField();
    _this3.fieldClass.addCorrectClassesToFields();
    _this3.element.addEventListener(_this3.loadEvent.type, function () {
      var fieldClass = new _Popup_Fields__WEBPACK_IMPORTED_MODULE_1__["default"](_this3.element);
      fieldClass.sizeFields();
      if (_this3.validationClass === null) {
        _this3.validationClass = new _Salesforce_Validation__WEBPACK_IMPORTED_MODULE_2__["default"](_this3.element, _this3.id);
      }
      new _Salesforce_HiddenFields__WEBPACK_IMPORTED_MODULE_3__["default"](_this3.element).fillAll();
    });
    _this3.element.dispatchEvent(_this3.loadEvent);
    _this3.element.dispatchEvent(_this3.afterLoadEvent);
  })["catch"](function (error) {
    return console.error(error);
  })["finally"](function () {
    _this3.loading = false;
  });
}
function _setHeight() {
  var _activeTab$dataset;
  var wrapper = this.element.querySelector(".salesforce_popup__wrapper");
  if (window.innerWidth < 1024) {
    wrapper.style.height = null;
    return;
  }
  if (!this.element || this.element.classList.contains("tw-hidden") || !this.element.querySelector(".salesforce_submit_content").classList.contains("tw-hidden")) {
    return;
  }
  wrapper.style.height = null;
  var heights = {};
  this.element.querySelectorAll(".vdigital_popup_content_container").forEach(function (container) {
    var elementToClone = container.querySelectorAll(".vdigital_element_to_clone");
    if (elementToClone.length === 0) {
      var _currentUrl = new URL(window.location.href);
      if (_currentUrl.searchParams.get("vdigital_submit") !== null) {
        elementToClone = [container.parentElement.querySelector(":scope > .salesforce_submit_content:not(.tw-hidden), :scope > .salesforce_submit_content_small:not(.tw-hidden)")];
      } else {
        elementToClone = [container];
      }
    }
    elementToClone.forEach(function (element) {
      var key = element.dataset.key;
      var height = 0;
      var clone = element.cloneNode(true);
      clone.classList.add("clone", "tw-absolute", "tw-right-[-9999px]");
      clone.classList.remove("tw-hidden");
      container.after(clone);
      height = height + clone.clientHeight;
      if (heights[key] === undefined) {
        heights[key] = [height];
      } else {
        heights[key].push(height);
      }
      clone.remove();
    });
  });
  for (var key in heights) {
    wrapper.setAttribute("data-" + key + "-height", Math.max.apply(Math, _toConsumableArray(heights[key])));
  }
  var activeTab = this.element.querySelector(".salesforce_popup__tabs__tab--active");
  var currentUrl = new URL(window.location.href);
  var activeTabKey = activeTab === null || activeTab === void 0 || (_activeTab$dataset = activeTab.dataset) === null || _activeTab$dataset === void 0 ? void 0 : _activeTab$dataset.key;
  if (!activeTabKey) {
    if (currentUrl.searchParams.get("vdigital_popup_tab")) {
      activeTabKey = currentUrl.searchParams.get("vdigital_popup_tab");
    } else {
      activeTabKey = 0;
    }
  }
  var height = Math.max.apply(Math, _toConsumableArray(heights[activeTabKey]));
  wrapper.style.height = height + "px";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Popup);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup/Fields.js"
/*!*****************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup/Fields.js ***!
  \*****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Select__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Select */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Select.js");
/* harmony import */ var _helpers_Zoom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../helpers/Zoom */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/Zoom.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }


var _Fields_brand = /*#__PURE__*/new WeakSet();
var Fields = /*#__PURE__*/function () {
  function Fields(popup) {
    _classCallCheck(this, Fields);
    _classPrivateMethodInitSpec(this, _Fields_brand);
    _defineProperty(this, "halfWidthFields", ["sf_field_industry", "sf_field_employees"]);
    this.popup = popup;
  }
  return _createClass(Fields, [{
    key: "phoneField",
    value: function phoneField() {
      var _this$popup$querySele;
      document.querySelector("html head").insertAdjacentHTML("beforeend", '<link rel="stylesheet" type="text/css" href="/wp-content/themes/vdigital-wp-child-theme/resources/sass/intlTelInput.css" />');
      var multisitePrefix = document.querySelector("html").dataset.lang;
      (_this$popup$querySele = this.popup.querySelectorAll("form.w2llead input[name='phone']")) === null || _this$popup$querySele === void 0 || _this$popup$querySele.forEach(function (textInput) {
        var preferredCountries = [];
        switch (multisitePrefix) {
          case "nl":
            preferredCountries = ["nl", "be"];
            break;
          case "de":
            preferredCountries = ["de", "at", "lu", "fr"];
            break;
          case "en":
            preferredCountries = ["gb", "us", "fr"];
            break;
        }
        var telInput = window.intlTelInput(textInput, {
          preferredCountries: preferredCountries,
          separateDialCode: true,
          utilsScript: "/wp-content/themes/vdigital-wp-child-theme/resources/js/intlTelInputUtils.min.js"
        });
        textInput.addEventListener("change", function () {
          textInput.setAttribute("formatted-number", telInput.getNumber());
        });
      });
    }
  }, {
    key: "sizeFields",
    value: function sizeFields() {
      var _this = this;
      this.halfWidthFields.forEach(function (field) {
        var fieldElements = _this.popup.querySelectorAll(".".concat(field));
        fieldElements.forEach(function (fieldElement) {
          var nextFieldElement = fieldElement.nextElementSibling;
          var prevFieldElement = fieldElement.previousElementSibling;
          if (_assertClassBrand(_Fields_brand, _this, _isHalfWidthField).call(_this, prevFieldElement) || _assertClassBrand(_Fields_brand, _this, _isHalfWidthField).call(_this, nextFieldElement)) {
            return;
          }
          fieldElement.style.width = "100%";
        });
      });
    }
  }, {
    key: "addCorrectClassesToFields",
    value: function addCorrectClassesToFields() {
      var onWhite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var compact = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var form = this.popup.querySelector(".salesforce_popup__wrapper__right form");
      if (!form) {
        return;
      }
      form.querySelectorAll(".sf_type_select").forEach(function (div) {
        if (onWhite) {
          div.classList.add("on_white");
        }
        new _Select__WEBPACK_IMPORTED_MODULE_0__["default"](div);
      });
      this.addCorrectClassesToPhoneFields(form);
    }
  }, {
    key: "addCorrectClassesToPhoneFields",
    value: function addCorrectClassesToPhoneFields(form) {
      var _this2 = this;
      if (!form) {
        return;
      }
      form.querySelectorAll(".sf_field_phone").forEach(function (div) {
        _assertClassBrand(_Fields_brand, _this2, _calculatePhoneDropdownWidth).call(_this2, div);
        _assertClassBrand(_Fields_brand, _this2, _detectPhoneAutofill).call(_this2, div);
        window.addEventListener("resize", function () {
          clearTimeout(_this2.resizeTimeout);
          _this2.resizeTimeout = setTimeout(function () {
            _assertClassBrand(_Fields_brand, _this2, _calculatePhoneDropdownWidth).call(_this2, div);
          }, 250);
        });
      });
    }
  }]);
}();
function _isHalfWidthField(element, halfWidthFields) {
  var _this3 = this;
  var isHalfWidthField = false;
  element.classList.forEach(function (className) {
    if (_this3.halfWidthFields.includes(className)) {
      isHalfWidthField = true;
    }
  });
  return isHalfWidthField;
}
function _detectPhoneAutofill(div) {
  var phoneInput = div.querySelector("input[name='phone']");
  var dialCode = div.querySelector(".iti__selected-dial-code");
  var arrow = div.querySelector(".iti__arrow");
  if (!phoneInput || !dialCode) {
    return;
  }
  var checkAutofill = function checkAutofill() {
    try {
      var isAutofilled = phoneInput.matches(":-webkit-autofill");
      dialCode.classList.toggle("iti__selected-dial-code--autofilled", isAutofilled);
      if (arrow) {
        arrow.classList.toggle("iti__arrow--autofilled", isAutofilled);
      }
    } catch (e) {
      // Browser doesn't support :-webkit-autofill
    }
  };
  phoneInput.addEventListener("animationstart", function (e) {
    if (e.animationName === "onAutoFillStart" || e.animationName.includes("autofill")) {
      dialCode.classList.add("iti__selected-dial-code--autofilled");
      if (arrow) {
        arrow.classList.add("iti__arrow--autofilled");
      }
    }
  });
  phoneInput.addEventListener("input", checkAutofill);
  phoneInput.addEventListener("change", checkAutofill);
  setTimeout(checkAutofill, 100);
  setTimeout(checkAutofill, 500);
  setTimeout(checkAutofill, 1000);
}
function _calculatePhoneDropdownWidth(div) {
  var width = (0,_helpers_Zoom__WEBPACK_IMPORTED_MODULE_1__.getZoomSize)(div.getBoundingClientRect().width);
  if (div.querySelector(".iti__country-list")) {
    div.querySelector(".iti__country-list").style.width = "".concat(width, "px");
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Fields);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/PopupTriggers.js"
/*!******************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/PopupTriggers.js ***!
  \******************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Popup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Popup.js */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup.js");
/* harmony import */ var _Salesforce_HiddenFields__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Salesforce/HiddenFields */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/HiddenFields.js");
/* harmony import */ var _helpers_SalesforceForm__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../helpers/SalesforceForm */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/SalesforceForm.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }



var _PopupTriggers_brand = /*#__PURE__*/new WeakSet();
var PopupTriggers = /*#__PURE__*/function () {
  function PopupTriggers() {
    _classCallCheck(this, PopupTriggers);
    _classPrivateMethodInitSpec(this, _PopupTriggers_brand);
    _defineProperty(this, "type", "salesforce");
    this.popupClassInstances = [];
    _assertClassBrand(_PopupTriggers_brand, this, _registerEventListeners).call(this);
  }
  return _createClass(PopupTriggers, [{
    key: "handleUrl",
    value: function handleUrl() {
      var _this = this;
      var currentUrl = new URL(window.location.href);
      var vdigitalPopup = currentUrl.searchParams.get("vdigital_popup");
      if (vdigitalPopup === "true") {
        var _currentUrl$searchPar, _currentUrl$searchPar2, _currentUrl$searchPar3;
        var id = currentUrl.searchParams.get("vdigital_popup_id");
        this.type = (_currentUrl$searchPar = currentUrl.searchParams.get("vdigital_popup_type")) !== null && _currentUrl$searchPar !== void 0 ? _currentUrl$searchPar : "salesforce";
        var tab = (_currentUrl$searchPar2 = currentUrl.searchParams.get("vdigital_popup_tab")) !== null && _currentUrl$searchPar2 !== void 0 ? _currentUrl$searchPar2 : null;
        var forms = (_currentUrl$searchPar3 = currentUrl.searchParams.get("vdigital_popup_forms")) !== null && _currentUrl$searchPar3 !== void 0 ? _currentUrl$searchPar3 : null;
        forms = decodeURIComponent(forms);
        forms = forms.replace(/\\\"/g, '"');
        if (currentUrl.searchParams.get("vdigital_submit") !== null) {
          this.triggerPopup(id, tab, JSON.parse(forms), true);
          document.addEventListener(id + "-after-popup-loaded", function () {
            var currentUrl = new URL(window.location.href);
            if (currentUrl.searchParams.get("vdigital_submit") !== null) {
              var _currentUrl$searchPar4, _currentUrl$searchPar5;
              var industry = (_currentUrl$searchPar4 = currentUrl.searchParams.get("industry")) !== null && _currentUrl$searchPar4 !== void 0 ? _currentUrl$searchPar4 : null;
              var employees = (_currentUrl$searchPar5 = currentUrl.searchParams.get("employees")) !== null && _currentUrl$searchPar5 !== void 0 ? _currentUrl$searchPar5 : null;
              var smallSuccessMessage = industry !== null && industry !== "Other" && employees !== null && employees === "30";
              var popupClass = _assertClassBrand(_PopupTriggers_brand, _this, _getPopupClass).call(_this, id, JSON.parse(forms));
              popupClass.activateSuccessMessage(tab, smallSuccessMessage);
            }
          });
        } else {
          this.triggerPopup(id, tab, JSON.parse(forms));
        }
      }
    }
  }, {
    key: "handlePopupButton",
    value: function handlePopupButton(event) {
      event.preventDefault();
      var button = event.currentTarget; // Ensures the button itself is selected

      if (button.classList.contains("disabled")) {
        return;
      }
      var settings = button.dataset.vdigitalPopupSettings;
      var tab = button.dataset.vdigitalPopupTab || 1;
      if (!settings) {
        console.error("Error: data-vdigital-popup-settings is missing");
        return;
      }
      window.dispatchEvent(new CustomEvent("vdigitalFormInteraction", {
        detail: {
          category: "click",
          formTemplateId: button.dataset.vdigitalPopupId,
          salesforceFormId: Object.values(JSON.parse(settings).forms[tab - 1])[0]
        }
      }));
      try {
        var _button$dataset$vdigi, _JSON$parse$forms, _JSON$parse;
        var id = button.dataset.vdigitalPopupId;
        var _tab = (_button$dataset$vdigi = button.dataset.vdigitalPopupTab) !== null && _button$dataset$vdigi !== void 0 ? _button$dataset$vdigi : null;
        var forms = (_JSON$parse$forms = (_JSON$parse = JSON.parse(settings)) === null || _JSON$parse === void 0 ? void 0 : _JSON$parse.forms) !== null && _JSON$parse$forms !== void 0 ? _JSON$parse$forms : [];
        this.triggerPopup(id, _tab, forms);
      } catch (error) {
        console.error("Invalid JSON in data-vdigital-popup-settings:", settings, error);
      }
    }
  }, {
    key: "reinitializePopupButtons",
    value: function reinitializePopupButtons(container) {
      var _this2 = this;
      container.querySelectorAll('a[data-vdigital-popup-btn="true"]').forEach(function (buttonElement) {
        buttonElement.addEventListener("click", function (evt) {
          _this2.type = "salesforce";
          _this2.handlePopupButton(evt);
        });
      });
    }
  }, {
    key: "triggerPopup",
    value: function triggerPopup(id, tab, forms) {
      var skipActiveTab = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var popupClass = _assertClassBrand(_PopupTriggers_brand, this, _getPopupClass).call(this, id, forms);
      if (tab) {
        popupClass.setActiveTab(tab, skipActiveTab);
      } else {
        popupClass.setUrlParameters();
      }
      popupClass.open();
    }
  }]);
}();
function _registerEventListeners() {
  var _this3 = this;
  document.addEventListener("DOMContentLoaded", function () {
    _this3.handleUrl();
    _Salesforce_HiddenFields__WEBPACK_IMPORTED_MODULE_1__["default"].setCookies();
  });
  document.querySelectorAll('a[data-vdigital-popup-btn="true"]').forEach(function (buttonElement) {
    buttonElement.addEventListener("click", function (evt) {
      _this3.type = "salesforce";
      _this3.handlePopupButton(evt);
    });
  });
}
function _getPopupClass(id, forms) {
  var popupClass = _assertClassBrand(_PopupTriggers_brand, this, _findInstance).call(this, id, forms);
  if (popupClass === undefined) {
    popupClass = new _Popup_js__WEBPACK_IMPORTED_MODULE_0__["default"](id, forms, false, this.type);
    this.popupClassInstances.push(popupClass);
  }
  return popupClass;
}
function _findInstance(id, forms) {
  return this.popupClassInstances.find(function (instance) {
    return instance.id === id && JSON.stringify(instance.forms) === JSON.stringify(forms);
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PopupTriggers);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/HiddenFields.js"
/*!****************************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/HiddenFields.js ***!
  \****************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _HiddenFields_brand = /*#__PURE__*/new WeakSet();
var HiddenFields = /*#__PURE__*/function () {
  function HiddenFields(popup) {
    _classCallCheck(this, HiddenFields);
    _classPrivateMethodInitSpec(this, _HiddenFields_brand);
    this.popup = popup;
  }
  return _createClass(HiddenFields, [{
    key: "fillAll",
    value: function fillAll() {
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "utm_campaign", "utmCampaign", "utmCampaign__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "utm_medium", "utmMedium", "utmMedium__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "utm_term", "utmTerm", "utmTerm__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "utm_creative", "utmCreative", "utmCreative__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "utm_source", "utmSource", "utmSource__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "utm_content", "utmContent", "utmContent__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "msclkid", "msclkid", "MSCLKID__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "gclid", "gclid", "GCLID__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "gclid", "gclid", "GCLID");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "matchtype", "gaMatchtype", "gaMatchtype__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "network", "gaNetwork", "gaNetwork__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "device", "gaDevice", "gaDevice__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, "loc", "gaLocation", "gaLocation__c");
      _assertClassBrand(_HiddenFields_brand, this, _fillFormFields).call(this, false, "httpReferer", "RefererDomain__c", true);
      _assertClassBrand(_HiddenFields_brand, this, _fillLanguage).call(this);
      _assertClassBrand(_HiddenFields_brand, this, _fillUtmUrl).call(this);
      _assertClassBrand(_HiddenFields_brand, this, _fillUrlFields).call(this);
    }
  }], [{
    key: "setCookies",
    value: function setCookies() {
      var fields = [["utm_campaign", "utmCampaign", "utmCampaign__c"], ["utm_medium", "utmMedium", "utmMedium__c"], ["utm_term", "utmTerm", "utmTerm__c"], ["utm_creative", "utmCreative", "utmCreative__c"], ["utm_source", "utmSource", "utmSource__c"], ["utm_content", "utmContent", "utmContent__c"], ["msclkid", "msclkid", "MSCLKID__c"], ["gclid", "gclid", "GCLID__c"], ["gclid", "gclid", "GCLID"], ["matchtype", "gaMatchtype", "gaMatchtype__c"], ["network", "gaNetwork", "gaNetwork__c"], ["device", "gaDevice", "gaDevice__c"], ["loc", "gaLocation", "gaLocation__c"]];
      var HiddenFieldsClass = new HiddenFields(null);
      fields.forEach(function (field) {
        var fieldValue = _assertClassBrand(_HiddenFields_brand, HiddenFieldsClass, _findGetParameter).call(HiddenFieldsClass, field[0]);
        if (fieldValue) {
          _assertClassBrand(_HiddenFields_brand, HiddenFieldsClass, _setCookie).call(HiddenFieldsClass, field[1], fieldValue, 30);
          if (field[0] === "gclid" || field[0] === "msclkid") {
            _assertClassBrand(_HiddenFields_brand, HiddenFieldsClass, _setCookie).call(HiddenFieldsClass, "utmUrl", window.location.href, 30);
          }
        }
      });
    }
  }]);
}();
function _fillUrlFields() {
  var url = window.location.href.split("?")[0];
  var inputs = this.popup.querySelectorAll('input[name="Web_URL__c"]');
  var firstTouchInputs = this.popup.querySelectorAll('input[name="FirstTouchPage__c"]');
  var firstTouchUrl = _assertClassBrand(_HiddenFields_brand, this, _getCookie).call(this, "firstTouchUrl");
  if (!firstTouchUrl) {
    firstTouchUrl = url;
    _assertClassBrand(_HiddenFields_brand, this, _setCookie).call(this, "firstTouchUrl", url, 30);
  }
  firstTouchInputs.forEach(function (input) {
    input.value = firstTouchUrl;
  });
  inputs.forEach(function (input) {
    input.value = url;
  });
}
function _fillLanguage() {
  var language = document.querySelector("html").dataset.lang;
  var languageInputs = this.popup.querySelectorAll('input[name="language__c"]');
  languageInputs.forEach(function (languageInput) {
    languageInput.value = language.toUpperCase();
  });
}
function _fillUtmUrl() {
  var gclid = _assertClassBrand(_HiddenFields_brand, this, _findGetParameter).call(this, "gclid");
  var msclkid = _assertClassBrand(_HiddenFields_brand, this, _findGetParameter).call(this, "msclkid");
  var fbclid = _assertClassBrand(_HiddenFields_brand, this, _findGetParameter).call(this, "fbclid");
  var url = _assertClassBrand(_HiddenFields_brand, this, _getCookie).call(this, "utmUrl");

  // update cookie if there is any utm parameter in the url
  if (gclid != null || msclkid != null || fbclid != null) {
    url = window.location.href;
    _assertClassBrand(_HiddenFields_brand, this, _setCookie).call(this, "utmUrl", url, 30);
  }

  // fill utm input fields
  if (url != null) {
    var utmInputs = this.popup.querySelectorAll('input[name="utmAll__c"]');
    utmInputs === null || utmInputs === void 0 || utmInputs.forEach(function (utmInput) {
      utmInput.value = url;
    });
  }
}
function _fillFormFields(getParamName, cookieName, inputName) {
  var needsToBeDecoded = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var fieldValue = _assertClassBrand(_HiddenFields_brand, this, _findGetParameter).call(this, getParamName);
  if (!fieldValue) {
    fieldValue = _assertClassBrand(_HiddenFields_brand, this, _getCookie).call(this, cookieName);
  }
  if (needsToBeDecoded) {
    fieldValue = decodeURIComponent(fieldValue);
  }
  if (fieldValue) {
    _assertClassBrand(_HiddenFields_brand, this, _setCookie).call(this, cookieName, fieldValue, 30);
    var inputs = this.popup.querySelectorAll('input[name="' + inputName + '"]');
    inputs.forEach(function (input) {
      input.value = fieldValue;
    });
  }
}
function _findGetParameter(parameterName) {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(parameterName);
}
function _setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  var domain = "domain=" + document.domain.match(/[^\.]*\.[^.]*$/)[0] + ";";
  document.cookie = name + "=" + (value || "") + expires + "; path=/; " + domain;
}
function _getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HiddenFields);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/Popup/Tabs.js"
/*!**************************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/Popup/Tabs.js ***!
  \**************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _Tabs_brand = /*#__PURE__*/new WeakSet();
var Tabs = /*#__PURE__*/function () {
  function Tabs(formContents, submitContents, popup, popupId, forms) {
    _classCallCheck(this, Tabs);
    _classPrivateMethodInitSpec(this, _Tabs_brand);
    _defineProperty(this, "tailwind", {
      tab: {
        active: ["salesforce_popup__tabs__tab--active", "tw-text-blue-01", "tw-font-bold", "tw-border-solid", "lg:tw-border-blue-01", "lg:tw-border-b-8"],
        inactive: ["lg:tw-text-gray-02"]
      }
    });
    this.tabs = document.querySelectorAll(".salesforce_popup__tabs__tab");
    this.mobileActive = document.querySelector(".salesforce_popup__tabs__mobile-active");
    this.mobileActiveText = this.mobileActive.querySelector(".salesforce_popup__tabs__mobile-active__text");
    this.mobileActiveIcon = this.mobileActive.querySelector(".salesforce_popup__tabs__mobile-active__icon");
    this.urlParams = new URLSearchParams(window.location.search);
    this.formContents = formContents;
    this.submitContents = submitContents;
    this.popup = popup;
    this.popupId = popupId;
    this.forms = forms;
    _assertClassBrand(_Tabs_brand, this, _setActive).call(this);
    this.events();
  }
  return _createClass(Tabs, [{
    key: "events",
    value: function events() {
      var _this = this;
      this.tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          return _this.change(tab);
        });
      });
      this.mobileActive.addEventListener("click", function () {
        return _assertClassBrand(_Tabs_brand, _this, _toggleMobileDropdown).call(_this);
      });
      this.popup.addEventListener("click", function (evt) {
        return _assertClassBrand(_Tabs_brand, _this, _handlePopupClick).call(_this, evt);
      });
    }
  }, {
    key: "makeTabsInactive",
    value: function makeTabsInactive() {
      var _this2 = this;
      this.tabs.forEach(function (tab) {
        var _tab$classList, _tab$classList2;
        (_tab$classList = tab.classList).remove.apply(_tab$classList, _toConsumableArray(_this2.tailwind.tab.active));
        (_tab$classList2 = tab.classList).add.apply(_tab$classList2, _toConsumableArray(_this2.tailwind.tab.inactive));
      });
    }
  }, {
    key: "change",
    value: function change(tab) {
      var _tab$dataset,
        _tab$classList3,
        _tab$classList4,
        _this3 = this;
      var dispatchEvent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (tab == null || tab.classList.contains("salesforce_popup__tabs__tab--active") || (tab === null || tab === void 0 || (_tab$dataset = tab.dataset) === null || _tab$dataset === void 0 ? void 0 : _tab$dataset.key) == null) {
        return;
      }
      var wrapper = tab.closest(".salesforce_popup__wrapper");
      wrapper.style.height = wrapper.getAttribute("data-" + [tab.dataset.key + "-height"]) + "px";
      (_tab$classList3 = tab.classList).remove.apply(_tab$classList3, _toConsumableArray(this.tailwind.tab.inactive));
      (_tab$classList4 = tab.classList).add.apply(_tab$classList4, _toConsumableArray(this.tailwind.tab.active));
      this.mobileActiveText.innerText = tab.textContent;
      var otherTabs = _toConsumableArray(this.tabs).filter(function (otherTab) {
        return otherTab !== tab;
      });
      otherTabs.forEach(function (otherTab) {
        var _otherTab$classList, _otherTab$classList2;
        (_otherTab$classList = otherTab.classList).remove.apply(_otherTab$classList, _toConsumableArray(_this3.tailwind.tab.active));
        (_otherTab$classList2 = otherTab.classList).add.apply(_otherTab$classList2, _toConsumableArray(_this3.tailwind.tab.inactive));
      });
      this.formContents.forEach(function (content) {
        if (content.dataset.key === tab.dataset.key) {
          content.classList.add("active");
          content.classList.remove("tw-hidden");
          return;
        }
        content.classList.remove("active");
        content.classList.add("tw-hidden");
      });
      this.submitContents.forEach(function (content) {
        content.classList.add("tw-hidden");
      });
      this.removeUrlParams();
      this.setUrlParams(tab);
      _assertClassBrand(_Tabs_brand, this, _toggleMobileDropdown).call(this, tab);
      var urlParams = new URLSearchParams(window.location.search);
      var formSettings = urlParams.get("vdigital_popup_forms");
      var formTab = urlParams.get("vdigital_popup_tab");
      if (!formSettings || formTab.length < 1) {
        return;
      }
      if (dispatchEvent) {
        window.dispatchEvent(new CustomEvent("vdigitalFormInteraction", {
          detail: {
            category: "switch",
            formTemplateId: urlParams.get("vdigital_popup_id"),
            salesforceFormId: Object.values(JSON.parse(formSettings)[formTab])[0]
          }
        }));
      }
    }
  }, {
    key: "setUrlParams",
    value: function setUrlParams(tab, isInteger) {
      var currentUrl = new URL(window.location.href);
      var tabParameter = isInteger ? tab : tab.dataset.key;
      currentUrl.searchParams.set("vdigital_popup", "true");
      currentUrl.searchParams.set("vdigital_popup_id", this.popupId);
      currentUrl.searchParams.set("vdigital_popup_tab", tabParameter);
      currentUrl.searchParams.set("vdigital_popup_forms", JSON.stringify(this.forms));
      history.pushState({}, null, currentUrl);
    }
  }, {
    key: "removeUrlParams",
    value: function removeUrlParams() {
      var currentUrl = new URL(window.location.href);
      currentUrl.search = "";
      history.pushState({}, null, currentUrl.toString());
    }
  }]);
}();
function _setActive() {
  var _tab$classList5,
    _tab$classList6,
    _this4 = this;
  if (this.urlParams.has("vdigital_popup") === false && this.urlParams.has("vdigital_submit") === false) {
    return;
  }
  var tab = _assertClassBrand(_Tabs_brand, this, _getActive).call(this);
  (_tab$classList5 = tab.classList).remove.apply(_tab$classList5, _toConsumableArray(this.tailwind.tab.inactive));
  (_tab$classList6 = tab.classList).add.apply(_tab$classList6, _toConsumableArray(this.tailwind.tab.active));
  var key = tab.dataset.key;
  this.mobileActiveText.innerText = tab.textContent;
  this.formContents.forEach(function (content) {
    if (content.dataset.key === key && _this4.urlParams.has("vdigital_submit") === false) {
      content.classList.add("active");
      content.classList.remove("tw-hidden");
      return;
    }
    content.classList.remove("active");
    content.classList.add("tw-hidden");
  });
  this.setUrlParams(tab);
}
function _getActive() {
  var _this5 = this;
  var activeTab = Array.from(this.tabs).find(function (tab) {
    return tab.dataset.key === _this5.urlParams.get("vdigital_popup_tab");
  });
  return activeTab || this.tabs[0];
}
function _handlePopupClick(evt) {
  if (evt.target.closest(".salesforce_popup__tabs") == null && evt.target.classList.contains("salesforce_popup__tabs") === false) {
    _assertClassBrand(_Tabs_brand, this, _toggleMobileDropdown).call(this, true);
  }
}
function _toggleMobileDropdown() {
  var _this$mobileActiveIco2;
  var forceClose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var dropdown = document.querySelector(".salesforce_popup__tabs .salesforce_popup__tabs__wrapper");
  if (forceClose) {
    var _this$mobileActiveIco;
    dropdown === null || dropdown === void 0 || dropdown.classList.add("tw-hidden", "lg:tw-flex");
    dropdown === null || dropdown === void 0 || dropdown.classList.remove("tw-flex");
    (_this$mobileActiveIco = this.mobileActiveIcon) === null || _this$mobileActiveIco === void 0 || _this$mobileActiveIco.classList.remove("tw-rotate-180");
    return;
  }
  dropdown === null || dropdown === void 0 || dropdown.classList.toggle("tw-hidden");
  dropdown === null || dropdown === void 0 || dropdown.classList.toggle("tw-flex");
  dropdown === null || dropdown === void 0 || dropdown.classList.toggle("lg:tw-flex");
  (_this$mobileActiveIco2 = this.mobileActiveIcon) === null || _this$mobileActiveIco2 === void 0 || _this$mobileActiveIco2.classList.toggle("tw-rotate-180");
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Tabs);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/Validation.js"
/*!**************************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/Validation.js ***!
  \**************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _Validation_brand = /*#__PURE__*/new WeakSet();
var Validation = /*#__PURE__*/function () {
  function Validation(popup, _popupId) {
    var _document$querySelect,
      _this = this;
    _classCallCheck(this, Validation);
    _classPrivateMethodInitSpec(this, _Validation_brand);
    _defineProperty(this, "fieldTypes", '.sf_field input[type="text"], .sf_field input[type="number"], .sf_field input[type="tel"], .sf_field' + ' input[type="email"], .sf_field textarea, .sf_field select, .sf_field input[type="checkbox"]');
    this.popup = popup;
    this.popupId = _popupId;
    this.forms = this.popup.querySelectorAll('form[id^="sf_form_salesforce_w2l_lead_"]');

    // get texts from php variable so that we always have the translated texts
    if (typeof texts !== "undefined" && texts.validation != null) {
      this.texts = texts.validation;
    }
    (_document$querySelect = document.querySelectorAll("form.w2llead")) === null || _document$querySelect === void 0 || _document$querySelect.forEach(function (form) {
      form.addEventListener(_this.popupId + "-before-submit", function () {
        _this.executeBeforeSubmitEvent();
      });
    });
    this.events();
  }
  return _createClass(Validation, [{
    key: "events",
    value: function events() {
      var _this2 = this;
      this.popup.addEventListener("click", function (evt) {
        return _assertClassBrand(_Validation_brand, _this2, _formClickListener).call(_this2, evt);
      });
      this.popup.querySelectorAll(".select-selected").forEach(function (select) {
        select.addEventListener("click", function (evt) {
          _assertClassBrand(_Validation_brand, _this2, _markFieldAsNotInvalid).call(_this2, select);
        });
      });
    }
  }, {
    key: "executeBeforeSubmitEvent",
    value: function executeBeforeSubmitEvent() {
      var urlParams = new URLSearchParams(window.location.search);
      var formSettings = urlParams.get("vdigital_popup_forms");
      var formTab = urlParams.get("vdigital_popup_tab") || 0;
      if (!formSettings || formTab.length < 1) {
        return;
      }
      window.dispatchEvent(new CustomEvent("vdigitalFormInteraction", {
        detail: {
          category: "submit",
          formTemplateId: urlParams.get("vdigital_popup_id"),
          salesforceFormId: Object.values(JSON.parse(formSettings)[formTab])[0]
        }
      }));
    }
  }]);
}();
function _formClickListener(evt) {
  var element = evt.target;
  var fieldParent = element.closest(".sf_field");
  if (element.classList.contains("submit")) {
    var form = element.closest("form");
    _assertClassBrand(_Validation_brand, this, _submitHandler).call(this, form, element, evt);
    return;
  }
  if (fieldParent != null || element.classList.contains("sf_field")) {
    var clickedField = element.matches(this.fieldTypes) === true ? element : fieldParent === null || fieldParent === void 0 ? void 0 : fieldParent.querySelector(this.fieldTypes);
    if (clickedField != null) {
      _assertClassBrand(_Validation_brand, this, _markFieldAsNotInvalid).call(this, clickedField);
    }
    _assertClassBrand(_Validation_brand, this, _toggleFormErrors).call(this, fieldParent.closest("form"), false);
  }
}
function _submitHandler(form, button, evt) {
  evt.preventDefault();
  var formElement = evt.target.closest("form");
  var fields = formElement === null || formElement === void 0 ? void 0 : formElement.querySelectorAll(this.fieldTypes);
  var submitLoader = button.querySelector(".submitLoader");
  submitLoader === null || submitLoader === void 0 || submitLoader.classList.remove("tw-hidden");
  if (_assertClassBrand(_Validation_brand, this, _validateFields).call(this, fields, form)) {
    _assertClassBrand(_Validation_brand, this, _validateRecaptchaV).call(this, evt, button, form);
    return;
  }
  submitLoader === null || submitLoader === void 0 || submitLoader.classList.add("tw-hidden");
}
function _validateFields(fields, form) {
  var validationPassed = true;
  var showFormErrors = false;
  for (var i = 0; i < fields.length; i++) {
    var fieldValidation = _assertClassBrand(_Validation_brand, this, _isValid).call(this, fields[i]);
    if (!fieldValidation.valid) {
      validationPassed = false;
    }
    if (!fieldValidation.valid && !fields[i].classList.contains("invalid")) {
      _assertClassBrand(_Validation_brand, this, _markFieldAsInvalid).call(this, fields[i], fieldValidation.message);
      showFormErrors = true;
    } else if (fieldValidation.valid) {
      _assertClassBrand(_Validation_brand, this, _markFieldAsNotInvalid).call(this, fields[i]);
    }
  }
  if (showFormErrors) {
    _assertClassBrand(_Validation_brand, this, _toggleFormErrors).call(this, form, true);
  }
  return validationPassed;
}
function _isValid(field) {
  var message = this.texts.required;
  var valid = true;
  if (field.value === "" && field.getAttribute("required") != null) {
    return {
      valid: false,
      message: this.texts.required
    };
  }
  // Validate by field type
  switch (field.getAttribute("type")) {
    case "email":
      if (field.value === "" && field.getAttribute("required") == null) {
        return {
          valid: valid,
          message: message
        };
      }
      var isValidEmail = _assertClassBrand(_Validation_brand, this, _validateEmail).call(this, field.value);
      var isValidBusinessEmail = _assertClassBrand(_Validation_brand, this, _validateBusinessEmail).call(this, field.value);
      valid = isValidEmail && isValidBusinessEmail;
      message = !isValidEmail ? this.texts.invalidEmail : this.texts.invalidBusinessEmail;
      break;
    case "checkbox":
      var container = field.closest(".sf_field");
      container.classList.remove("invalid__checkbox__container");
      var isRequired = container.querySelector("label.required") != null;
      if (!isRequired) {
        return {
          valid: valid,
          message: message
        };
      }
      if (!field.checked) {
        valid = false;
        message = this.texts.required;
        container.classList.add("invalid__checkbox__container");
      }
      break;
  }

  // Validate by field name
  switch (field.getAttribute("name")) {
    case "phone":
      var formattedPhoneNumber = field.getAttribute("formatted-number");
      if (field.getAttribute("required") == null && formattedPhoneNumber == null) {
        break;
      }
      valid = _assertClassBrand(_Validation_brand, this, _validateFieldLength).call(this, formattedPhoneNumber, 8);
      message = this.texts.phoneNumberTooShort;
      if (valid && formattedPhoneNumber != null && formattedPhoneNumber !== "") {
        field.value = formattedPhoneNumber;
      }
      break;
    case "first_name":
      valid = _assertClassBrand(_Validation_brand, this, _validateFieldLength).call(this, field.value, 2);
      message = this.texts.firstNameTooShort;
      break;
    case "last_name":
      valid = _assertClassBrand(_Validation_brand, this, _validateFieldLength).call(this, field.value, 2);
      message = this.texts.lastNameTooShort;
      break;
    case "company":
      valid = _assertClassBrand(_Validation_brand, this, _validateFieldLength).call(this, field.value, 2);
      message = this.texts.companyTooShort;
      break;
  }
  return {
    valid: valid,
    message: message
  };
}
function _markFieldAsInvalid(field, message) {
  _assertClassBrand(_Validation_brand, this, _markFieldAsNotInvalid).call(this, field);
  if (field.closest(".sf_field") != null) {
    var invalidMessageElement = document.createElement("span");
    invalidMessageElement.innerText = message;
    invalidMessageElement.classList.add("invalid__message");
    field.closest(".sf_field").classList.add("error");
    field.closest(".sf_field").appendChild(invalidMessageElement);
  }
}
function _toggleFormErrors(form, show) {
  var formErrors = document.querySelectorAll(".error[data-form-id='" + form.id + "']");
  if (formErrors == null) {
    return;
  }
  formErrors.forEach(function (element) {
    if (show) {
      element.classList.remove("tw-hidden");
      return;
    }
    element.classList.add("tw-hidden");
  });
}
function _markFieldAsNotInvalid(field) {
  var _field$closest, _field$closest2;
  (_field$closest = field.closest(".sf_field")) === null || _field$closest === void 0 || _field$closest.classList.remove("error");
  (_field$closest2 = field.closest(".sf_field")) === null || _field$closest2 === void 0 || (_field$closest2 = _field$closest2.querySelector(".invalid__message")) === null || _field$closest2 === void 0 || _field$closest2.remove();
}
function _validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
function _validateBusinessEmail(email) {
  if (typeof emailExtensionBlacklist === "undefined") {
    return true;
  }
  var valid = true;
  emailExtensionBlacklist.forEach(function (extension) {
    if (email.includes("@".concat(extension))) {
      valid = false;
    }
  });
  return valid;
}
function _validateFieldLength(value, minLength) {
  return value.length >= minLength;
}
function _validateRecaptchaV(evt, button, form) {
  var recaptchaV3SiteKey = button.dataset.recaptchaV3Key;
  if (recaptchaV3SiteKey == null) {
    return;
  }
  evt.preventDefault();
  var popupId = this.popupId;
  grecaptcha.ready(function () {
    grecaptcha.execute(recaptchaV3SiteKey, {
      action: "submit"
    }).then(function (token) {
      // set separate token for hidden field, required for server side recaptcha checks
      form.querySelector('input[name="g-recaptcha-response"]').value = token;

      /*
       * This is necessary to prevent an issue where the form doesn't submit properly
       * when submitting the form via JS submit() function.
       * */
      var submitButtonInputClone = document.createElement("input");
      submitButtonInputClone.setAttribute("name", "w2lsubmit");
      submitButtonInputClone.setAttribute("type", "hidden");
      submitButtonInputClone.value = "w2lsubmit";
      form.appendChild(submitButtonInputClone);
      var beforeSubmitEvent = new CustomEvent(popupId + "-before-submit", {
        bubbles: true
      });
      form.dispatchEvent(beforeSubmitEvent);
      form.submit();
    });
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Validation);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Select.js"
/*!***********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Select.js ***!
  \***********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Select)
/* harmony export */ });
/* harmony import */ var _functions_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functions/forms */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/functions/forms.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }

var _Select_brand = /*#__PURE__*/new WeakSet();
var Select = /*#__PURE__*/function () {
  function Select(_wrapper) {
    _classCallCheck(this, Select);
    _classPrivateMethodInitSpec(this, _Select_brand);
    if (_wrapper === undefined) {
      this.wrappers = document.querySelectorAll(".input__select");
    } else {
      this.wrappers = [_wrapper];
    }
    if (this.wrappers.length > 0) {
      this.init();
    }
  }
  return _createClass(Select, [{
    key: "init",
    value: function init() {
      var _this = this;
      this.wrappers.forEach(function (wrapper) {
        if (wrapper === undefined) {
          return;
        }
        wrapper._selectInstance = _this;
        var select = wrapper.querySelector("select");
        var selected = _assertClassBrand(_Select_brand, _this, _createSelectedItem).call(_this, select);
        var options = _assertClassBrand(_Select_brand, _this, _createOptionsList).call(_this, select, selected, wrapper);
        wrapper.appendChild(selected);
        // options is now appended to body in #createOptionsList
        wrapper.__selectOptions = options;
        selected.addEventListener("click", function (event) {
          event.stopPropagation();
          _this.closeAllSelects(selected);
          if (options.classList.contains("select-hide")) {
            _assertClassBrand(_Select_brand, _this, _setOptionsOpen).call(_this, options, selected, wrapper);
          } else {
            _assertClassBrand(_Select_brand, _this, _setOptionsClosed).call(_this, options, selected, wrapper);
          }
        });
      });
      document.addEventListener("click", this.closeAllSelects);
    }
  }, {
    key: "closeAllSelects",
    value: function closeAllSelects(current) {
      document.querySelectorAll(".select-items").forEach(function (list) {
        if (list.__selectSelected !== current) {
          list.classList.add("select-hide");
          list.classList.remove("select-items--open-up-top");
          if (list.__selectWrapper) {
            list.__selectWrapper.classList.remove("select--open-up-top");
          }
          if (list.__selectPositionHandler) {
            window.removeEventListener("resize", list.__selectPositionHandler);
            window.removeEventListener("orientationchange", list.__selectPositionHandler);
            window.removeEventListener("scroll", list.__selectPositionHandler, true);
          }
        }
      });
      document.querySelectorAll(".select-selected").forEach(function (selected) {
        if (selected !== current) {
          selected.classList.remove("select-arrow-active");
        }
      });
    }

    /**
     * Public method to select an option programmatically. Option index is zero-based.
     * Example usage:
     * const selectWrapper = document.querySelector(".input__select");
     * selectWrapper._selectInstance.selectOption(selectWrapper, 2); // Selects the third option
     *
     * @param {*} wrapperElement
     * @param {*} optionIndex
     */
  }, {
    key: "selectOption",
    value: function selectOption(wrapperElement, optionIndex) {
      var select = wrapperElement.querySelector("select");
      var selected = wrapperElement.querySelector(".select-selected");
      var optionsWrapper = wrapperElement.__selectOptions;
      if (select && selected && optionsWrapper && select.options[optionIndex]) {
        _assertClassBrand(_Select_brand, this, _updateSelect).call(this, select, selected, optionsWrapper, optionIndex, false);
      }
    }

    /**
     * Public method to select an option programmatically by its value.
     * Example usage:
     * const selectWrapper = document.querySelector(".input__select");
     * selectWrapper._selectInstance.selectByValue(selectWrapper, "my-value"); // Selects the third option
     *
     * @param {*} wrapperElement
     * @param {*} optionIndex
     */
  }, {
    key: "selectByValue",
    value: function selectByValue(wrapperElement, value) {
      var select = wrapperElement.querySelector("select");
      var optionIndex = Array.from(select.options).findIndex(function (option) {
        return option.value === value;
      });
      if (optionIndex !== -1) {
        this.selectOption(wrapperElement, optionIndex);
      }
    }
  }]);
}();
function _getContainLayoutOffset(element) {
  var viewportWidth = window.innerWidth;
  if (viewportWidth >= 1024 && viewportWidth <= 1400) {
    var ancestor = element.parentElement;
    while (ancestor && ancestor !== document.body) {
      var style = getComputedStyle(ancestor);
      if (style.contain && style.contain.includes("layout")) {
        var containerRect = ancestor.getBoundingClientRect();
        return {
          left: containerRect.left,
          top: containerRect.top
        };
      }
      ancestor = ancestor.parentElement;
    }
  }
  return {
    left: 0,
    top: 0
  };
}
function _positionOptions(options, selected, wrapper) {
  if (!options || !selected || !wrapper) {
    return;
  }
  var zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
  var rect = selected.getBoundingClientRect();
  options.style.width = "".concat(rect.width / zoom, "px");
  options.style.left = "".concat(rect.left / zoom, "px");
  var optionsRect = options.getBoundingClientRect();
  var optionsHeight = optionsRect.height;

  // Use stored flip state to determine position
  if (options.__openUpTop) {
    // if open to top add 2 px
    var top = (rect.top - optionsHeight) / zoom + 2;
    options.style.top = "".concat(top, "px");
  } else {
    // Applying -3px since it should overlap with the bottom border of the select
    var _top = rect.bottom / zoom - 3;
    options.style.top = "".concat(_top, "px");
  }
}
function _calculateInitialPosition(options, selected, wrapper) {
  if (!options || !selected || !wrapper) {
    return;
  }
  var zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
  var rect = selected.getBoundingClientRect();
  var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  var margin = 8;
  options.style.width = "".concat(rect.width / zoom, "px");
  options.style.left = "".concat(rect.left / zoom, "px");

  // Reset flip state
  wrapper.classList.remove("select--open-up-top");
  options.classList.remove("select-items--open-up-top");
  options.__openUpTop = false;

  // Applying -3px since it should overlap with the bottom border of the select
  var top = rect.bottom / zoom - 3;
  options.style.top = "".concat(top, "px");
  var optionsRect = options.getBoundingClientRect();
  var optionsHeight = optionsRect.height;
  var spaceAbove = rect.top;
  var spaceBelow = viewportHeight - rect.bottom;
  var needsFlip = optionsHeight > spaceBelow - margin;
  if (needsFlip && spaceAbove > spaceBelow) {
    wrapper.classList.add("select--open-up-top");
    options.classList.add("select-items--open-up-top");
    options.__openUpTop = true;
    // if open to top add 2 px
    var _top2 = (rect.top - optionsHeight) / zoom + 2;
    options.style.top = "".concat(_top2, "px");
  }
}
function _setOptionsOpen(options, selected, wrapper) {
  var _this2 = this;
  if (!options || !selected || !wrapper) {
    return;
  }
  options.classList.remove("select-hide");
  selected.classList.add("select-arrow-active");
  _assertClassBrand(_Select_brand, this, _calculateInitialPosition).call(this, options, selected, wrapper);
  if (!options.__selectPositionHandler) {
    options.__selectPositionHandler = function () {
      if (options.classList.contains("select-hide")) {
        return;
      }
      window.requestAnimationFrame(function () {
        if (options.classList.contains("select-hide")) {
          return;
        }
        _assertClassBrand(_Select_brand, _this2, _positionOptions).call(_this2, options, selected, wrapper);
      });
    };
  }
  window.addEventListener("resize", options.__selectPositionHandler);
  window.addEventListener("orientationchange", options.__selectPositionHandler);
  window.addEventListener("scroll", options.__selectPositionHandler, true);
}
function _setOptionsClosed(options, selected, wrapper) {
  if (!options || !selected || !wrapper) {
    return;
  }
  options.classList.add("select-hide");
  selected.classList.remove("select-arrow-active");
  wrapper.classList.remove("select--open-up-top");
  if (options.__selectPositionHandler) {
    window.removeEventListener("resize", options.__selectPositionHandler);
    window.removeEventListener("orientationchange", options.__selectPositionHandler);
    window.removeEventListener("scroll", options.__selectPositionHandler, true);
  }
}
function _createSelectedItem(select) {
  var selected = document.createElement("div");
  selected.className = "select-selected";
  selected.textContent = select.options[select.selectedIndex].textContent;
  return selected;
}
function _createOptionsList(select, selected, wrapper) {
  var _this3 = this;
  var optionsWrapper = document.createElement("div");
  optionsWrapper.className = "select-items select-hide";

  // Store reference to wrapper for positioning and cleanup
  optionsWrapper.__selectWrapper = wrapper;
  optionsWrapper.__selectSelected = selected;

  // Detect theme from wrapper or ancestors
  var isLightTheme = _assertClassBrand(_Select_brand, this, _detectLightTheme).call(this, wrapper);
  if (isLightTheme) {
    optionsWrapper.classList.add("select-items--light");
  }

  // Detect if inside popup and apply higher z-index
  if (wrapper.closest(".salesforce_popup")) {
    optionsWrapper.classList.add("select-items--in-popup");
  }
  Array.from(select.options).forEach(function (option, index) {
    if (option.disabled) {
      return;
    }
    var optionDiv = document.createElement("div");
    optionDiv.textContent = option.textContent;
    optionDiv.addEventListener("click", function () {
      _assertClassBrand(_Select_brand, _this3, _updateSelect).call(_this3, select, selected, optionsWrapper, index);
    });
    optionsWrapper.appendChild(optionDiv);
  });

  // Append to body instead of wrapper so it can overlay footer
  document.body.appendChild(optionsWrapper);
  return optionsWrapper;
}
function _detectLightTheme(wrapper) {
  // Check if wrapper or any ancestor has on_white class or light theme indicators
  var element = wrapper;
  while (element && element !== document.body) {
    if (element.classList.contains("on_white") || element.classList.contains("form-block--light") || element.classList.contains("salesforce_popup")) {
      return true;
    }
    // Check for dark background block containing light form
    if (element.classList.contains("block__background--light") && wrapper.closest(".form-block--dark")) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}
function _updateSelect(select, selected, optionsWrapper, optionIndex) {
  var triggerClick = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  select.selectedIndex = optionIndex;
  select.dispatchEvent(new Event("change", {
    bubbles: true
  }));
  selected.textContent = select.options[optionIndex].textContent;

  // Add class when non-initial option is selected (index > 0)
  if (optionIndex > 0) {
    selected.classList.add("select-selected--has-value");
  } else {
    selected.classList.remove("select-selected--has-value");
  }
  optionsWrapper.querySelectorAll(".same-as-selected").forEach(function (el) {
    return el.classList.remove("same-as-selected");
  });
  optionsWrapper.children[optionIndex].classList.add("same-as-selected");
  if (triggerClick) {
    selected.click();
  }
}


/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Tagmanager.js"
/*!***************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Tagmanager.js ***!
  \***************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Tagmanager = /*#__PURE__*/function () {
  function Tagmanager() {
    _classCallCheck(this, Tagmanager);
    this.languageButtons = document.querySelectorAll(".mlp-language-nav-item");
    this.events();
  }
  return _createClass(Tagmanager, [{
    key: "events",
    value: function events() {
      var _this = this;
      this.handleMenuClicks();
      this.languageButtons.forEach(function (button) {
        return button.addEventListener("click", function () {
          return _this.handleLanguageButtonClick(button);
        });
      });
      window.addEventListener("vdigitalFormInteraction", function (event) {
        _this.pushFormInteraction(event.detail.category, event.detail.formTemplateId, event.detail.salesforceFormId);
      });
    }
  }, {
    key: "handleMenuClicks",
    value: function handleMenuClicks() {
      document.querySelectorAll(".footer__columns a").forEach(function (link) {
        link.addEventListener("click", function () {});
      });
    }
  }, {
    key: "handleLanguageButtonClick",
    value: function handleLanguageButtonClick(button) {
      var language = button.className.match(/flag-([a-z]*)/)[1];
      Tagmanager.pushToDataLayer({
        event: "languageSwitch",
        eventCategory: "language",
        eventAction: language
      });
    }
  }, {
    key: "pushFormInteraction",
    value: function pushFormInteraction(category, formTemplateId, salesforceFormId) {
      Tagmanager.pushToDataLayer({
        event: "formInteraction",
        eventCategory: category,
        language: document.querySelector("html").dataset.lang,
        formTemplateId: formTemplateId,
        salesforceFormId: salesforceFormId
      });
    }
  }], [{
    key: "pushToDataLayer",
    value: function pushToDataLayer(event) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(event);
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Tagmanager);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Topbar.js"
/*!***********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Topbar.js ***!
  \***********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _Topbar_brand = /*#__PURE__*/new WeakSet();
var Topbar = /*#__PURE__*/function () {
  function Topbar(headerElement) {
    _classCallCheck(this, Topbar);
    _classPrivateMethodInitSpec(this, _Topbar_brand);
    this.header = headerElement;
    if (this.header === null) return;
    this.topbar = this.header.querySelector("#topbar");
    this.scrollPosition = 0;
    this.events();
  }
  return _createClass(Topbar, [{
    key: "events",
    value: function events() {
      var _this = this;
      window.addEventListener("scroll", function () {
        return _assertClassBrand(_Topbar_brand, _this, _handleOnScroll).call(_this);
      });
      window.addEventListener("resize", function () {
        return _assertClassBrand(_Topbar_brand, _this, _handleResize).call(_this);
      });
    }
  }]);
}();
function _handleOnScroll() {
  var _this2 = this;
  if (window.innerWidth < 1024 || window.isProgrammaticScroll) {
    return;
  }
  var homeHeroElement = document.querySelector("#home-hero");
  // check if we are past the home hero section, other wise bail
  if (homeHeroElement) {
    var homeHeroRect = homeHeroElement.getBoundingClientRect();
    if (homeHeroRect.bottom > 0) {
      return;
    }
  }
  var scrollingDown = window.scrollY > this.scrollPosition;
  setTimeout(function () {
    _this2.topbar.style.height = scrollingDown ? "10px" : "";
    _this2.topbar.style.overflow = scrollingDown ? "hidden" : "visible";
  }, 100);
  this.scrollPosition = window.scrollY;
}
function _handleResize() {
  this.topbar.style.height = "";
  this.topbar.style.overflow = "";
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Topbar);

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/footer.js"
/*!**************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/footer.js ***!
  \**************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _elements_Topbar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./elements/Topbar */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Topbar.js");
/* harmony import */ var _elements_Menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./elements/Menu */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Menu.js");
/* harmony import */ var _elements_Footer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./elements/Footer */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Footer.js");
/* harmony import */ var _elements_Tagmanager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./elements/Tagmanager */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Tagmanager.js");
/* harmony import */ var _elements_FacebookPixel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./elements/FacebookPixel */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/FacebookPixel.js");
/* harmony import */ var _elements_Cookiebot__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./elements/Cookiebot */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Cookiebot.js");
/* harmony import */ var _elements_Overview__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./elements/Overview */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Overview.js");
/* harmony import */ var _elements_PopupTriggers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./elements/PopupTriggers */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/PopupTriggers.js");
/* harmony import */ var _elements_Login__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./elements/Login */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Login.js");
/* harmony import */ var _elements_Select__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./elements/Select */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Select.js");
/* harmony import */ var _functions_forms__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./functions/forms */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/functions/forms.js");
/* harmony import */ var _elements_Homehero__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./elements/Homehero */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Homehero.js");












var headerElement = document.querySelector("header#header");
new _elements_Topbar__WEBPACK_IMPORTED_MODULE_0__["default"](headerElement);
new _elements_Menu__WEBPACK_IMPORTED_MODULE_1__["default"]();
new _elements_Tagmanager__WEBPACK_IMPORTED_MODULE_3__["default"]();
new _elements_FacebookPixel__WEBPACK_IMPORTED_MODULE_4__["default"]();
new _elements_Footer__WEBPACK_IMPORTED_MODULE_2__["default"]();
new _elements_Cookiebot__WEBPACK_IMPORTED_MODULE_5__["default"]();
new _elements_Overview__WEBPACK_IMPORTED_MODULE_6__["default"]();
window.popupTriggers = new _elements_PopupTriggers__WEBPACK_IMPORTED_MODULE_7__["default"]();
new _elements_Select__WEBPACK_IMPORTED_MODULE_9__["default"]();
if (document.querySelector(".login-section")) {
  new _elements_Login__WEBPACK_IMPORTED_MODULE_8__["default"]();
}
if (document.querySelector(".home-hero")) {
  new _elements_Homehero__WEBPACK_IMPORTED_MODULE_11__["default"]();
}
function maybeDevDomain() {
  var url = location.protocol + "//" + location.host + location.pathname;
  if (url.indexOf(".dev01.") > -1 || url.indexOf(".dev.") > -1) {
    return true;
  }
  return false;
}
(0,_functions_forms__WEBPACK_IMPORTED_MODULE_10__.addAsterixToRequiredFields)();

/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/functions/forms.js"
/*!***********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/functions/forms.js ***!
  \***********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAsterixToRequiredFields: () => (/* binding */ addAsterixToRequiredFields)
/* harmony export */ });
function addAsterixToRequiredFields() {
  document.querySelectorAll("input[required]").forEach(function (input) {
    if (input.closest(".input__field.compact")) {
      input.placeholder = input.placeholder + "*";
    }
  });
}


/***/ },

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


/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/SalesforceForm.js"
/*!******************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/SalesforceForm.js ***!
  \******************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   salesforceFormFilled: () => (/* binding */ salesforceFormFilled)
/* harmony export */ });
function salesforceFormFilled() {
  var urlParams = new URLSearchParams(window.location.search);
  var salesforceSubmit = urlParams.get("vdigital_submit");
  var salesforcePopup = urlParams.get("vdigital_popup");
  return salesforceSubmit === "true" && salesforcePopup === "true";
}


/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/Zoom.js"
/*!********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/js/helpers/Zoom.js ***!
  \********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getZoomSize: () => (/* binding */ getZoomSize)
/* harmony export */ });
function getZoomSize(size) {
  var _window$getComputedSt, _window$getComputedSt2;
  var zoomLevel = parseFloat((_window$getComputedSt = (_window$getComputedSt2 = window.getComputedStyle(document.querySelector("body"))) === null || _window$getComputedSt2 === void 0 ? void 0 : _window$getComputedSt2.zoom) !== null && _window$getComputedSt !== void 0 ? _window$getComputedSt : 1) * 100;
  if (zoomLevel === 100) return size;
  return size / zoomLevel * 100;
}


/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/sass/admin/acf-fields/wysiwyg.scss"
/*!************************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/sass/admin/acf-fields/wysiwyg.scss ***!
  \************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/sass/admin/main.scss"
/*!**********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/sass/admin/main.scss ***!
  \**********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./wp-content/themes/vdigital-wp-child-theme/resources/sass/main.scss"
/*!****************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/resources/sass/main.scss ***!
  \****************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/wp-content/themes/vdigital-wp-child-theme/assets/js/footer": 0,
/******/ 			"wp-content/themes/vdigital-wp-child-theme/assets/css/main": 0,
/******/ 			"wp-content/themes/vdigital-wp-child-theme/assets/css/admin/main": 0,
/******/ 			"wp-content/themes/vdigital-wp-child-theme/blocks/cases/dist/main": 0,
/******/ 			"wp-content/themes/vdigital-wp-child-theme/assets/css/admin/acf-fields/wysiwyg": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkhtml"] = self["webpackChunkhtml"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["wp-content/themes/vdigital-wp-child-theme/assets/css/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/main","wp-content/themes/vdigital-wp-child-theme/blocks/cases/dist/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/acf-fields/wysiwyg"], () => (__webpack_require__("./wp-content/themes/vdigital-wp-child-theme/resources/js/footer.js")))
/******/ 	__webpack_require__.O(undefined, ["wp-content/themes/vdigital-wp-child-theme/assets/css/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/main","wp-content/themes/vdigital-wp-child-theme/blocks/cases/dist/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/acf-fields/wysiwyg"], () => (__webpack_require__("./wp-content/themes/vdigital-wp-child-theme/resources/sass/admin/main.scss")))
/******/ 	__webpack_require__.O(undefined, ["wp-content/themes/vdigital-wp-child-theme/assets/css/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/main","wp-content/themes/vdigital-wp-child-theme/blocks/cases/dist/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/acf-fields/wysiwyg"], () => (__webpack_require__("./wp-content/themes/vdigital-wp-child-theme/resources/sass/admin/acf-fields/wysiwyg.scss")))
/******/ 	__webpack_require__.O(undefined, ["wp-content/themes/vdigital-wp-child-theme/assets/css/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/main","wp-content/themes/vdigital-wp-child-theme/blocks/cases/dist/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/acf-fields/wysiwyg"], () => (__webpack_require__("./wp-content/themes/vdigital-wp-child-theme/resources/sass/main.scss")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["wp-content/themes/vdigital-wp-child-theme/assets/css/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/main","wp-content/themes/vdigital-wp-child-theme/blocks/cases/dist/main","wp-content/themes/vdigital-wp-child-theme/assets/css/admin/acf-fields/wysiwyg"], () => (__webpack_require__("./wp-content/themes/vdigital-wp-child-theme/blocks/cases/sass/main.scss")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;