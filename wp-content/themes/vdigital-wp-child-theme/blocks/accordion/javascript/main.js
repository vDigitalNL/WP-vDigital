import { toggleClassesOnElement } from "../../../resources/js/helpers/CssClasses";

const accordionItems = document.querySelectorAll(".accordion__item");

accordionItems.forEach((item) => {
  const header = item.querySelector(".accordion__item__header");

  header.addEventListener("click", () => {
    const openAccordionItems = document.querySelectorAll(
      ".accordion__item.open",
    );

    toggleAccordionItem(item, item.classList.contains("open"));

    if (item.classList.contains("open")) {
      openAccordionItems.forEach((openItem) => {
        toggleAccordionItem(openItem, true);
      });
    }
  });
});

function toggleAccordionItem(item, close = false) {
  toggleClassesOnElement(item, ["open"], close);

  toggleClassesOnElement(
    item.querySelector(".accordion__item__header__icon-plus"),
    ["tw-hidden"],
    close,
  );
  toggleClassesOnElement(
    item.querySelector(".accordion__item__header__icon-minus"),
    ["tw-hidden"],
    !close,
  );

  toggleClassesOnElement(
    item.querySelector(".accordion__item__body"),
    ["tw-hidden"],
    !close,
  );
}
