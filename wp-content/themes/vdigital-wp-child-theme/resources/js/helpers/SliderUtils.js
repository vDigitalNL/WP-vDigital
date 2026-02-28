/**
 * Shared utility functions for tiny-slider implementations across blocks
 */

/**
 * Updates the visibility and active state of slider navigation dots
 * Handles responsive behavior where the number of visible dots changes based on viewport
 *
 * @param {HTMLElement} container - The container element that holds the dots
 * @param {number} currentIndex - The current slide index
 * @param {Object} slider - The tiny-slider instance
 */
export function updateDots(container, currentIndex, slider) {
  const dots = container.querySelectorAll(".dots .dot");
  const info = slider.getInfo();

  const totalSlides = info.slideCount;
  const itemsVisible = info.items;
  const slideBy = info.slideBy;

  const dotsCount =
    itemsVisible >= totalSlides
      ? 0
      : Math.ceil((totalSlides - itemsVisible) / slideBy) + 1;

  dots.forEach((dot, dotIndex) => {
    dot.classList.remove("fade-out", "fade-in", "active");

    if (dotIndex < dotsCount) {
      dot.classList.add("fade-in");

      const activePosition = Math.floor(currentIndex / slideBy);
      const maxPosition = dotsCount - 1;

      if (dotIndex === Math.min(activePosition, maxPosition)) {
        dot.classList.add("active");
      }
    } else {
      dot.classList.add("fade-out");
    }
  });
}

/**
 * Disables click events on slider links when in WordPress block editor
 * This prevents accidental navigation while editing blocks in Gutenberg
 * Polls for slider containers up to 5 times to handle async block loading
 *
 * @param {string} containerSelector - CSS selector for the slider container
 * @param {string} linkSelector - CSS selector for the clickable elements to disable
 */
export function disableSliderLinks(containerSelector, linkSelector) {
  let attempts = 0;
  const maxAttempts = 5;
  const interval = setInterval(() => {
    const sliderContainers = document.querySelectorAll(containerSelector);
    if (sliderContainers.length > 0) {
      sliderContainers.forEach((container) => {
        const links = container.querySelectorAll(linkSelector);
        links.forEach((link) => {
          link.addEventListener("click", (e) => {
            e.preventDefault();
          });
        });
      });
      clearInterval(interval);
    } else {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }
  }, 1000);
}

// TODO: Refactor the following blocks to use these shared utilities:
// - wp-content/themes/vdigital-wp-child-theme/blocks/references/javascript/main.js
// - wp-content/themes/vdigital-wp-child-theme/blocks/blog-slider/javascript/main.js
// Both blocks have duplicate implementations of updateDots and disableSliderLinks
