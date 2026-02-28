/******/ (() => { // webpackBootstrap
/*!****************************************************************************************!*\
  !*** ./wp-content/themes/vdigital-wp-child-theme/blocks/price-plan/javascript/main.js ***!
  \****************************************************************************************/
var inactiveButtonClasses = ["button--outline"];
var activeButtonClasses = ["button--blue"];

// Function to equalize description heights within a specific container
function equalizeDescriptionHeights(container) {
  var descriptions = container.querySelectorAll(".price-plan__description");
  if (descriptions.length === 0) {
    return;
  }

  // Reset heights to auto first
  descriptions.forEach(function (desc) {
    desc.style.height = "auto";
  });

  // Check screen width and determine how many items per row
  var screenWidth = window.innerWidth;

  // Below 768px: single column, no equalization needed
  if (screenWidth < 768) {
    return;
  }

  // Determine items per row based on breakpoints
  var itemsPerRow;
  if (screenWidth >= 1024) {
    itemsPerRow = 4;
  } else {
    itemsPerRow = 2;
  }

  // Convert NodeList to Array for easier manipulation
  var descriptionsArray = Array.from(descriptions);

  // Process descriptions in rows
  var _loop = function _loop() {
    var rowDescriptions = descriptionsArray.slice(i, i + itemsPerRow);

    // Find the maximum height in this row
    var maxHeight = 0;
    rowDescriptions.forEach(function (desc) {
      var height = desc.offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    // Apply the maximum height to all descriptions in this row
    rowDescriptions.forEach(function (desc) {
      desc.style.height = "".concat(maxHeight, "px");
    });
  };
  for (var i = 0; i < descriptionsArray.length; i += itemsPerRow) {
    _loop();
  }
}

// Initialize each price plan block independently
var pricePlanBlocks = document.querySelectorAll(".price-plan");
pricePlanBlocks.forEach(function (block) {
  equalizeDescriptionHeights(block);

  // Handle currency buttons for this block
  var currencyButtons = block.querySelectorAll(".price-plan__currency-btn");
  var monthPrices = block.querySelectorAll(".price-plan__month-price");
  currencyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var _button$classList, _button$classList2;
      currencyButtons.forEach(function (btn) {
        var _btn$classList, _btn$classList2;
        (_btn$classList = btn.classList).remove.apply(_btn$classList, activeButtonClasses);
        (_btn$classList2 = btn.classList).add.apply(_btn$classList2, inactiveButtonClasses);
      });
      (_button$classList = button.classList).remove.apply(_button$classList, inactiveButtonClasses);
      (_button$classList2 = button.classList).add.apply(_button$classList2, activeButtonClasses);
      monthPrices.forEach(function (price) {
        if (price.dataset.currency === button.dataset.currency) {
          price.classList.remove("tw-hidden");
          return;
        }
        price.classList.add("tw-hidden");
      });
    });
  });
});

// Run on window resize with debounce
var resizeTimeout;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    pricePlanBlocks.forEach(function (block) {
      equalizeDescriptionHeights(block);
    });
  }, 250);
});
/******/ })()
;