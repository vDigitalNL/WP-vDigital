/**
 * Solution Showcase Toggle and Slider Functionality
 */

import { tns } from "../../../../../../node_modules/tiny-slider/src/tiny-slider";
import {
  updateDots,
  disableSliderLinks,
} from "../../../resources/js/helpers/SliderUtils";

let showcaseSliders = [];
let resizeTimeout;
let lastWidth = window.innerWidth;

function destroySliders() {
  // Destroy all existing sliders
  Object.keys(showcaseSliders).forEach((key) => {
    if (
      showcaseSliders[key] &&
      typeof showcaseSliders[key].destroy === "function"
    ) {
      showcaseSliders[key].destroy();
    }
  });
  showcaseSliders = [];
}

function initializeSliders() {
  // Check if we're in the WordPress block editor (Gutenberg)
  // If so, disable tile links to prevent navigation while editing
  if (
    (document.body.classList.contains("block-editor-page") &&
      document.body.classList.contains("wp-admin")) ||
    document.body.classList.contains("block-editor-iframe__body")
  ) {
    disableSliderLinks(".solution-showcase", ".solution-showcase__tile");
    return;
  }

  // Only initialize slider on screens smaller than 1280px (xl breakpoint)
  // On xl screens and above, CSS grid handles the layout
  if (window.innerWidth >= 1280) {
    // Destroy sliders if they exist
    destroySliders();

    // Hide navigation on desktop since we're not using the slider
    const navContainers = document.querySelectorAll(
      ".solution-showcase__navigation",
    );
    navContainers.forEach((nav) => {
      nav.style.display = "none";
    });
    return;
  }

  const sliderContainers = document.querySelectorAll(".solution-showcase");

  sliderContainers.forEach((container, index) => {
    if (!container) return;

    const showcases = container.querySelectorAll(
      ".solution-showcase__showcase",
    );

    showcases.forEach((showcase, showcaseIndex) => {
      const sliderContainer = showcase.querySelector(
        ".solution-showcase__tiles",
      );
      if (!sliderContainer) return;

      const navContainer = showcase.querySelector(
        ".solution-showcase__navigation .dots",
      );
      const items = sliderContainer.querySelectorAll(".wrapper");

      if (items.length <= 1) {
        if (navContainer) navContainer.style.display = "none";
        return;
      }

      const sliderIndex = `${index}_${showcaseIndex}`;

      // Skip if slider already exists for this index
      if (showcaseSliders[sliderIndex]) {
        return;
      }

      // Show navigation
      if (navContainer) {
        navContainer.parentElement.style.display = "";
      }

      showcaseSliders[sliderIndex] = tns({
        container: sliderContainer,
        items: 1,
        gutter: 20,
        slideBy: 1,
        autoplay: false,
        mouseDrag: true,
        controls: false,
        nav: true,
        navContainer: navContainer,
        autoplayButtonOutput: false,
        loop: false,

        responsive: {
          550: {
            items: 2,
            gutter: 10,
          },
          1024: {
            items: 3,
            gutter: 20,
          },
        },
      });

      updateDots(showcase, 0, showcaseSliders[sliderIndex]);

      showcaseSliders[sliderIndex].events.on("newBreakpointEnd", (info) => {
        updateDots(showcase, info.index, showcaseSliders[sliderIndex]);
      });

      showcaseSliders[sliderIndex].events.on("indexChanged", (info) => {
        updateDots(showcase, info.index, showcaseSliders[sliderIndex]);
      });
    });
  });
}

/**
 * Align titles to have the same height across all tiles
 * This ensures all titles start at the same vertical position
 * regardless of whether they are 1, 2, or 3 lines
 */
function alignTitles() {
  const showcases = document.querySelectorAll(".solution-showcase__showcase");

  showcases.forEach((showcase) => {
    const titles = showcase.querySelectorAll(".solution-showcase__tile-title");

    // Reset heights first
    titles.forEach((title) => {
      title.style.minHeight = "";
    });

    // Find the tallest title
    let maxHeight = 0;
    titles.forEach((title) => {
      const height = title.offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    // Apply the max height to all titles
    // This ensures all titles occupy the same vertical space
    // Combined with justify-end, this makes all titles start at the same position
    titles.forEach((title) => {
      title.style.minHeight = maxHeight + "px";
    });
  });
}

function handleResize() {
  const currentWidth = window.innerWidth;
  // Ignore height-only resize events (e.g. mobile browser address bar appearing/disappearing)
  if (currentWidth === lastWidth) return;
  lastWidth = currentWidth;

  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    destroySliders();
    initializeSliders();
    alignTitles();
  }, 250);
}

function setupToggle(block) {
  const toggleBtn = block.querySelector(".solution-showcase__toggle-btn");
  const sectorShowcase = block.querySelector(
    ".solution-showcase__showcase--sector",
  );
  const roleShowcase = block.querySelector(
    ".solution-showcase__showcase--role",
  );

  if (!toggleBtn || !sectorShowcase || !roleShowcase) {
    return;
  }

  // Set initial state
  let currentShowcase = "sector";

  // Store button text for toggling
  toggleBtn.setAttribute("data-role-text", toggleBtn.textContent);
  toggleBtn.setAttribute("data-sector-text", "Show by sector");

  // Toggle button click handler
  toggleBtn.addEventListener("click", () => {
    if (currentShowcase === "sector") {
      // Switch to role showcase
      sectorShowcase.classList.add("tw-hidden");
      roleShowcase.classList.remove("tw-hidden");
      toggleBtn.textContent =
        toggleBtn.getAttribute("data-sector-text") || "Show by sector";
      currentShowcase = "role";
    } else {
      // Switch to sector showcase
      roleShowcase.classList.add("tw-hidden");
      sectorShowcase.classList.remove("tw-hidden");
      toggleBtn.textContent =
        toggleBtn.getAttribute("data-role-text") || "Show by role";
      currentShowcase = "sector";
    }

    // Re-align titles after toggle
    alignTitles();
  });
}

if (window.acf) {
  // In the block editor, ACF fires this action every time a block preview
  // renders, passing the block's root element. Use it to re-initialise
  // the toggle so it works without duplicating code in the template.
  window.acf.addAction("render_block_preview/type=solution-showcase", ($el) => {
    const block = $el[0].querySelector(".solution-showcase");
    if (block) {
      setupToggle(block);
      alignTitles();
    }
  });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".solution-showcase").forEach(setupToggle);
    initializeSliders();
    alignTitles();

    window.addEventListener("resize", handleResize);
  });
}
