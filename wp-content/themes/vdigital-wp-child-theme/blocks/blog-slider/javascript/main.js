import { tns } from "../../../../../../node_modules/tiny-slider/src/tiny-slider";
let blogSliders = [];

function updateDots(slider_container, currentIndex) {
  const dots = slider_container.querySelectorAll(".dots .dot");

  dots.forEach((dot, dotIndex) => {
    let shouldShow = false;

    if (currentIndex <= 2) {
      shouldShow = dotIndex <= 4;
    } else if (currentIndex >= dots.length - 3) {
      shouldShow = dotIndex >= dots.length - 5;
    } else {
      shouldShow = dotIndex >= currentIndex - 2 && dotIndex <= currentIndex + 2;
    }

    dot.classList.remove("fade-out", "fade-in");

    if (shouldShow) {
      dot.classList.add("fade-in");
    } else {
      dot.classList.add("fade-out");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const sliderContainers = document.querySelectorAll(".blog-slider");

  sliderContainers.forEach((container, index) => {
    if (!container) return;
    const sliderContainer = container.querySelector(".blog-slider__items");
    if (!sliderContainer) return;

    const prevButton = container.querySelector(".button--navigate.prev");
    const nextButton = container.querySelector(".button--navigate.next");
    const navContainer = container.querySelector(
      ".blog-slider__card__navigation .dots",
    );

    if (
      sliderContainer.querySelectorAll(".blog-slider__items__item").length <= 1
    ) {
      prevButton.style.display = "none";
      nextButton.style.display = "none";
      navContainer.style.display = "none";
      return;
    }

    blogSliders[index] = tns({
      container: sliderContainer,
      items: 1,
      slideBy: 1,
      autoplay: false,
      mouseDrag: true,
      controls: false,
      nav: true,
      navContainer: navContainer,
      autoplayButtonOutput: false,
      loop: false,
    });

    updateDots(container, 0);

    prevButton.addEventListener("click", () => {
      blogSliders[index].goTo("prev");
    });
    nextButton.addEventListener("click", () => {
      blogSliders[index].goTo("next");
    });

    blogSliders[index].events.on("indexChanged", (info) => {
      const slides_wrapper = document.getElementById(info.container.id);

      let slider_container = slides_wrapper;
      while (
        slider_container &&
        !slider_container.classList.contains("blog-slider")
      ) {
        slider_container = slider_container.parentNode;
      }

      const currentSlide = info.slideItems[info.index].querySelector(
        ".blog-slider__items__item",
      );

      const label = currentSlide.getAttribute("data-label") || "";
      const labelColor = currentSlide.getAttribute("data-label-color") || "";
      const labelElement = slider_container.querySelector(
        ".blog-slider__label",
      );

      if (!labelElement) return;

      labelElement.textContent = label;
      labelElement.className = "blog-slider__label " + labelColor;

      updateDots(slider_container, info.index);
    });
  });
});
