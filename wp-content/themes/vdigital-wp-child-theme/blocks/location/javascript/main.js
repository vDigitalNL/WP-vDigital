import { toggleClassesOnElement } from "../../../resources/js/helpers/CssClasses";

function initLocationCardAccordion() {
  const locationCards = document.querySelectorAll(".location");

  locationCards.forEach((card) => {
    const routeHeader = card.querySelector(".location__route-header");

    if (routeHeader) {
      routeHeader.addEventListener("click", () => {
        const isOpen = card.classList.contains("location--route-open");
        toggleRouteAccordion(card, isOpen);
      });
    }
  });
}

function toggleRouteAccordion(card, close = false) {
  toggleClassesOnElement(card, ["location--route-open"], close);

  toggleClassesOnElement(
    card.querySelector(".location__route-icon-plus"),
    ["tw-hidden"],
    close,
  );
  toggleClassesOnElement(
    card.querySelector(".location__route-icon-minus"),
    ["tw-hidden"],
    !close,
  );

  const toggleButton = card.querySelector(".location__route-toggle");
  if (close) {
    toggleButton.classList.remove("tw-bg-core", "tw-border-2", "tw-border-sky");
    toggleButton.classList.add("tw-bg-sky");
  } else {
    toggleButton.classList.remove("tw-bg-sky");
    toggleButton.classList.add("tw-bg-core", "tw-border-2", "tw-border-sky");
  }

  const routeHeader = card.querySelector(".location__route-header");
  toggleClassesOnElement(routeHeader, ["tw-pb-10"], !close);
  toggleClassesOnElement(routeHeader, ["tw-pb-5"], close);

  toggleClassesOnElement(
    card.querySelector(".location__route-content"),
    ["tw-hidden"],
    !close,
  );
}

document.addEventListener("DOMContentLoaded", () =>
  initLocationCardAccordion(),
);
