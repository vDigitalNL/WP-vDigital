/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
        this.element.querySelectorAll(".dyflexis_popup_hide_on_success").forEach(function (element) {
          element.classList.remove("tw-hidden");
        });
        this.element.dispatchEvent(this.afterLoadEvent);
      }
    }
  }, {
    key: "activateSuccessMessage",
    value: function activateSuccessMessage(tab) {
      var small = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.element.querySelectorAll(".dyflexis_popup_hide_on_success").forEach(function (element) {
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
      currentUrl.searchParams.set("dyflexis_popup", "true");
      currentUrl.searchParams.set("dyflexis_popup_id", this.id);
      currentUrl.searchParams.set("dyflexis_popup_type", this.type);
      currentUrl.searchParams.set("dyflexis_popup_tab", 0);
      currentUrl.searchParams.set("dyflexis_popup_forms", JSON.stringify(this.forms));
      if (setSubmit) {
        currentUrl.searchParams.set("dyflexis_submit", "true");
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
      action: "dyflexis_render_popup",
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
  this.element.querySelectorAll(".dyflexis_popup_content_container").forEach(function (container) {
    var elementToClone = container.querySelectorAll(".dyflexis_element_to_clone");
    if (elementToClone.length === 0) {
      var _currentUrl = new URL(window.location.href);
      if (_currentUrl.searchParams.get("dyflexis_submit") !== null) {
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
    if (currentUrl.searchParams.get("dyflexis_popup_tab")) {
      activeTabKey = currentUrl.searchParams.get("dyflexis_popup_tab");
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
      var formSettings = urlParams.get("dyflexis_popup_forms");
      var formTab = urlParams.get("dyflexis_popup_tab");
      if (!formSettings || formTab.length < 1) {
        return;
      }
      if (dispatchEvent) {
        window.dispatchEvent(new CustomEvent("dyflexisFormInteraction", {
          detail: {
            category: "switch",
            formTemplateId: urlParams.get("dyflexis_popup_id"),
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
      currentUrl.searchParams.set("dyflexis_popup", "true");
      currentUrl.searchParams.set("dyflexis_popup_id", this.popupId);
      currentUrl.searchParams.set("dyflexis_popup_tab", tabParameter);
      currentUrl.searchParams.set("dyflexis_popup_forms", JSON.stringify(this.forms));
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
  if (this.urlParams.has("dyflexis_popup") === false && this.urlParams.has("dyflexis_submit") === false) {
    return;
  }
  var tab = _assertClassBrand(_Tabs_brand, this, _getActive).call(this);
  (_tab$classList5 = tab.classList).remove.apply(_tab$classList5, _toConsumableArray(this.tailwind.tab.inactive));
  (_tab$classList6 = tab.classList).add.apply(_tab$classList6, _toConsumableArray(this.tailwind.tab.active));
  var key = tab.dataset.key;
  this.mobileActiveText.innerText = tab.textContent;
  this.formContents.forEach(function (content) {
    if (content.dataset.key === key && _this4.urlParams.has("dyflexis_submit") === false) {
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
    return tab.dataset.key === _this5.urlParams.get("dyflexis_popup_tab");
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
      var formSettings = urlParams.get("dyflexis_popup_forms");
      var formTab = urlParams.get("dyflexis_popup_tab") || 0;
      if (!formSettings || formTab.length < 1) {
        return;
      }
      window.dispatchEvent(new CustomEvent("dyflexisFormInteraction", {
        detail: {
          category: "submit",
          formTemplateId: urlParams.get("dyflexis_popup_id"),
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
/*!**********************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/form/javascript/main.js ***!
  \**********************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _resources_js_elements_Popup_Fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../resources/js/elements/Popup/Fields */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup/Fields.js");
/* harmony import */ var _resources_js_elements_Salesforce_Validation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../resources/js/elements/Salesforce/Validation */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/Validation.js");
/* harmony import */ var _resources_js_elements_Salesforce_HiddenFields__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../resources/js/elements/Salesforce/HiddenFields */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Salesforce/HiddenFields.js");
/* harmony import */ var _resources_js_elements_Popup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../resources/js/elements/Popup */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Popup.js");
/* harmony import */ var _resources_js_elements_Select__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../resources/js/elements/Select */ "./wp-content/themes/vdigital-wp-child-theme/resources/js/elements/Select.js");





document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".form-block__salesforce-form").forEach(function (container) {
    var fieldClass = new _resources_js_elements_Popup_Fields__WEBPACK_IMPORTED_MODULE_0__["default"](container);
    fieldClass.sizeFields();
    fieldClass.phoneField();
    fieldClass.addCorrectClassesToPhoneFields(container.querySelector("form"));

    // Initialize select fields
    var isLightTheme = container.closest(".form-block--light") !== null || container.closest(".block__background--light") !== null;
    container.querySelectorAll(".sf_type_select").forEach(function (div) {
      if (isLightTheme) {
        div.classList.add("on_white");
      }
      new _resources_js_elements_Select__WEBPACK_IMPORTED_MODULE_4__["default"](div);
    });

    // Initialize phone field dropdown width
    container.querySelectorAll(".sf_field_phone").forEach(function (div) {
      var calculateWidth = function calculateWidth() {
        var width = div.offsetWidth;
        if (div.querySelector(".iti__country-list")) {
          div.querySelector(".iti__country-list").style.width = "".concat(width, "px");
        }
      };
      calculateWidth();
      window.addEventListener("resize", function () {
        clearTimeout(window.phoneResizeTimeout);
        window.phoneResizeTimeout = setTimeout(calculateWidth, 250);
      });
    });
    var validation = new _resources_js_elements_Salesforce_Validation__WEBPACK_IMPORTED_MODULE_1__["default"](container, container.dataset.dyflexisPopupId);
    new _resources_js_elements_Salesforce_HiddenFields__WEBPACK_IMPORTED_MODULE_2__["default"](container).fillAll();
    var id = container.dataset.dyflexisPopupId;
    container.addEventListener(id + "-before-submit", function () {
      var _JSON$parse$forms, _JSON$parse;
      var forms = (_JSON$parse$forms = (_JSON$parse = JSON.parse(container.dataset.dyflexisPopupSettings)) === null || _JSON$parse === void 0 ? void 0 : _JSON$parse.forms) !== null && _JSON$parse$forms !== void 0 ? _JSON$parse$forms : [];
      var popupClass = new _resources_js_elements_Popup__WEBPACK_IMPORTED_MODULE_3__["default"](id, forms, true);
      popupClass.setUrlParameters(true);
      validation.executeBeforeSubmitEvent();
    });
  });
});
})();

/******/ })()
;