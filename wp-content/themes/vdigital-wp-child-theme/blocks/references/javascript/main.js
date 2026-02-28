import { tns } from "../../../../../../node_modules/tiny-slider/src/tiny-slider";
let referencesSliders = [];

function updateDots(slider_container, currentIndex, slider) {
  const dots = slider_container.querySelectorAll(".dots .dot");
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

function initializeSliders() {
  if (
    (document.body.classList.contains("block-editor-page") &&
      document.body.classList.contains("wp-admin")) ||
    document.body.classList.contains("block-editor-iframe__body")
  ) {
    disableSliderLinks();
    return;
  }

  const sliderContainers = document.querySelectorAll(".references");

  sliderContainers.forEach((container, index) => {
    if (!container) return;
    const sliderContainer = container.querySelector(".references__cards");
    if (!sliderContainer) return;

    const navContainer = container.querySelector(
      ".references__cards__navigation .dots",
    );

    const items = sliderContainer.querySelectorAll(".references__cards__card");
    if (
      sliderContainer.querySelectorAll(".references__cards__card").length <= 1
    ) {
      navContainer.style.display = "none";
      return;
    }

    referencesSliders[index] = tns({
      container: sliderContainer,
      items: 1,
      gutter: 20,
      slideBy: 1,
      autoplay: false,
      mouseDrag: true,
      controls: false,
      nav: false,
      autoplayButtonOutput: false,
      loop: false,

      responsive: {
        769: {
          items: 2,
          gutter: 10,
        },
        1024: {
          items: 4,
          gutter: 20,
        },
      },
    });

    updateDots(container, 0, referencesSliders[index]);

    referencesSliders[index].events.on("newBreakpointEnd", (info) => {
      const containerId = info.container.id;
      const slides_wrapper = document.getElementById(containerId);

      let slider_container = slides_wrapper;
      while (
        slider_container &&
        !slider_container.classList.contains("references")
      ) {
        slider_container = slider_container.parentNode;
      }

      updateDots(slider_container, info.index, referencesSliders[index]);
    });

    referencesSliders[index].events.on("indexChanged", (info) => {
      const containerId = info.container.id;
      const slides_wrapper = document.getElementById(containerId);

      let slider_container = slides_wrapper;
      while (
        slider_container &&
        !slider_container.classList.contains("references")
      ) {
        slider_container = slider_container.parentNode;
      }

      updateDots(slider_container, info.index, referencesSliders[index]);
    });
  });
}

function disableSliderLinks() {
  let attempts = 0;
  const maxAttempts = 5;
  const interval = setInterval(() => {
    const sliderContainers = document.querySelectorAll(".references");
    if (sliderContainers.length > 0) {
      sliderContainers.forEach((container) => {
        const links = container.querySelectorAll(".references__cards__card");
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

document.addEventListener("DOMContentLoaded", initializeSliders);
