/******/ (() => { // webpackBootstrap
/*!*****************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/marketplace/javascript/main.js ***!
  \*****************************************************************************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _MarketplaceOverview_brand = /*#__PURE__*/new WeakSet();
var MarketplaceOverview = /*#__PURE__*/function () {
  function MarketplaceOverview() {
    _classCallCheck(this, MarketplaceOverview);
    _classPrivateMethodInitSpec(this, _MarketplaceOverview_brand);
    this.html = document.querySelector("html");
    this.events();
    this.initMobileSelect();
  }
  return _createClass(MarketplaceOverview, [{
    key: "initMobileSelect",
    value: function initMobileSelect() {
      var selectWrapper = document.querySelector(".marketplace__filters__select");
      if (selectWrapper && window.Select) {
        new window.Select(selectWrapper);
      }
    }
  }, {
    key: "events",
    value: function events() {
      var _this = this;
      document.querySelectorAll(".marketplace").forEach(function (marketplace) {
        var showMoreButton = marketplace.querySelector(".marketplace__show-more");
        var container = marketplace.querySelector(".marketplace__container");
        if (showMoreButton) {
          showMoreButton.addEventListener("click", function (e) {
            e.preventDefault();
            _assertClassBrand(_MarketplaceOverview_brand, _this, _loadMore).call(_this, marketplace, container, showMoreButton);
          });
        }
        marketplace.querySelectorAll(".marketplace__filters__category").forEach(function (categoryButton) {
          categoryButton.addEventListener("click", function (e) {
            e.preventDefault();
            _assertClassBrand(_MarketplaceOverview_brand, _this, _filter).call(_this, marketplace, container, categoryButton, showMoreButton);
          });
        });
        var selectInput = marketplace.querySelector(".marketplace__filters__select-input");
        if (selectInput) {
          selectInput.addEventListener("change", function (e) {
            var selectedOption = e.target.options[e.target.selectedIndex];
            var categoryData = {
              dataset: {
                category: selectedOption.value,
                categoryTitle: selectedOption.getAttribute("data-category-title") || "",
                categoryDescription: selectedOption.getAttribute("data-category-description") || "",
                categoryImage: selectedOption.getAttribute("data-category-image") || ""
              }
            };
            _assertClassBrand(_MarketplaceOverview_brand, _this, _filter).call(_this, marketplace, container, categoryData, showMoreButton);
          });
        }
        var selectWrapper = marketplace.querySelector(".marketplace__filters__select");
        if (selectWrapper) {
          selectWrapper.addEventListener("click", function (e) {
            if (e.target.classList.contains("select-items") || e.target.parentElement.classList.contains("select-items")) {
              setTimeout(function () {
                var changeEvent = new Event("change", {
                  bubbles: true
                });
                if (selectInput) {
                  selectInput.dispatchEvent(changeEvent);
                }
              }, 50);
            }
          });
        }
        var urlParams = new URLSearchParams(window.location.search);
        var categoryId = urlParams.get("category");
        if (categoryId != null) {
          var categoryButton = marketplace.querySelector('.marketplace__filters__category[data-category="' + categoryId + '"]');
          if (categoryButton) {
            _assertClassBrand(_MarketplaceOverview_brand, _this, _filter).call(_this, marketplace, container, categoryButton, showMoreButton);
          }
        }
      });
    }
  }, {
    key: "fetchPosts",
    value: function fetchPosts(action, category) {
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var url = "/".concat(this.html.dataset.lang, "/wp-content/themes/vdigital-wp-child-theme/ajax.php");
      var init = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          action: action,
          category: category,
          offset: offset,
          nonce: nonces.ajax
        })
      };
      return fetch(url, init).then(function (response) {
        return response.json();
      })["catch"](function (error) {
        return console.error(error);
      });
    }
  }]);
}();
function _loadMore(marketplace, container, showMoreButton) {
  var wrapper = marketplace.querySelector(".marketplace__show-more-wrapper");
  var currentPostCount = container.querySelectorAll(".marketplace__card").length;
  this.fetchPosts("fetch_marketplace_posts", showMoreButton.dataset.category, currentPostCount).then(function (data) {
    if (data && data.html) {
      var existingMissingTile = container.querySelector(".marketplace__missing-connection");
      var missingTileHtml = existingMissingTile ? existingMissingTile.outerHTML : null;
      if (existingMissingTile) {
        existingMissingTile.remove();
      }
      container.insertAdjacentHTML("beforeend", data.html);
      if (missingTileHtml) {
        container.insertAdjacentHTML("beforeend", missingTileHtml);
      }
      if (window.popupTriggers) {
        window.popupTriggers.reinitializePopupButtons(container);
      }
    }

    // Show/hide button based on if there are more posts
    if (data.more) {
      wrapper.classList.remove("tw-hidden");
    } else {
      wrapper.classList.add("tw-hidden");
    }
  })["catch"](function (error) {
    console.error(error);
  });
}
function _filter(marketplace, container, categoryButton, showMoreButton) {
  _assertClassBrand(_MarketplaceOverview_brand, this, _activateCategoryButton).call(this, marketplace, categoryButton);
  _assertClassBrand(_MarketplaceOverview_brand, this, _updateMobileSelect).call(this, marketplace, categoryButton);
  var categoryId = categoryButton.dataset.category;
  var categoryTitle = categoryButton.dataset.categoryTitle || "";
  var categoryDescription = categoryButton.dataset.categoryDescription || "";
  var categoryImage = categoryButton.dataset.categoryImage || "";
  var categoryInfoSection = marketplace.querySelector(".marketplace__category-info");
  if (categoryInfoSection) {
    var titleEl = categoryInfoSection.querySelector(".marketplace__category-info__title");
    var descEl = categoryInfoSection.querySelector(".marketplace__category-info__description");
    var imageEl = categoryInfoSection.querySelector(".marketplace__category-info__image");
    if (titleEl) titleEl.textContent = categoryTitle;
    if (descEl) {
      descEl.innerHTML = categoryDescription;
    }
    if (imageEl) {
      var imageContainer = imageEl.parentElement;
      var baseClasses = "marketplace__category-info__image tw-w-full tw-max-h-[400px] md:tw-h-[400px] md:tw-object-cover tw-h-auto tw-rounded-[20px]";
      if (categoryImage) {
        imageEl.src = categoryImage;
        imageEl.alt = categoryTitle;
        imageEl.className = baseClasses;
        if (imageContainer) {
          imageContainer.classList.remove("tw-hidden");
        }
      } else {
        imageEl.className = baseClasses;
        if (imageContainer) {
          imageContainer.classList.add("tw-hidden");
        }
      }
    }

    // Show/hide entire section based on whether there's any content
    var hasContent = categoryTitle || categoryDescription || categoryImage;
    if (hasContent) {
      categoryInfoSection.classList.remove("tw-hidden");
    } else {
      categoryInfoSection.classList.add("tw-hidden");
    }
  }
  this.fetchPosts("fetch_marketplace_posts", categoryId, 0).then(function (data) {
    container.innerHTML = data.html;
    if (window.popupTriggers) {
      window.popupTriggers.reinitializePopupButtons(container);
    }
    var wrapper = marketplace.querySelector(".marketplace__show-more-wrapper");
    if (showMoreButton && wrapper) {
      showMoreButton.dataset.category = categoryId;

      // Reset button state
      showMoreButton.classList.remove("tw-hidden");
      showMoreButton.disabled = false;

      // Show/hide wrapper based on if there are more posts
      if (data.more) {
        wrapper.classList.remove("tw-hidden");
      } else {
        wrapper.classList.add("tw-hidden");
      }
    }
  });
}
function _activateCategoryButton(marketplace, categoryButton) {
  marketplace.querySelectorAll(".marketplace__filters__category").forEach(function (button) {
    button.classList.remove("button--blue");
    button.classList.add("button--outline");
  });
  if (categoryButton.classList) {
    categoryButton.classList.add("button--blue");
    categoryButton.classList.remove("button--outline");
  }
}
function _updateMobileSelect(marketplace, categoryButton) {
  var selectInput = marketplace.querySelector(".marketplace__filters__select-input");
  if (selectInput) {
    var categoryId = categoryButton.dataset.category;
    var option = selectInput.querySelector("option[value=\"".concat(categoryId, "\"]"));
    if (option) {
      selectInput.value = categoryId;
      var selectedDiv = selectInput.parentElement.querySelector(".select-selected");
      if (selectedDiv) {
        selectedDiv.textContent = option.textContent;
      }
    }
  }
}
new MarketplaceOverview();
/******/ })()
;