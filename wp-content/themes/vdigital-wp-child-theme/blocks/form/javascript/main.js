import Fields from "../../../resources/js/elements/Popup/Fields";
import Validation from "../../../resources/js/elements/Salesforce/Validation";
import HiddenFields from "../../../resources/js/elements/Salesforce/HiddenFields";
import Popup from "../../../resources/js/elements/Popup";
import Select from "../../../resources/js/elements/Select";

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll(".form-block__salesforce-form")
    .forEach((container) => {
      const fieldClass = new Fields(container);
      fieldClass.sizeFields();
      fieldClass.phoneField();
      fieldClass.addCorrectClassesToPhoneFields(
        container.querySelector("form"),
      );

      // Initialize select fields
      const isLightTheme =
        container.closest(".form-block--light") !== null ||
        container.closest(".block__background--light") !== null;
      container.querySelectorAll(".sf_type_select").forEach((div) => {
        if (isLightTheme) {
          div.classList.add("on_white");
        }
        new Select(div);
      });

      // Initialize phone field dropdown width
      container.querySelectorAll(".sf_field_phone").forEach((div) => {
        const calculateWidth = () => {
          const width = div.offsetWidth;
          if (div.querySelector(".iti__country-list")) {
            div.querySelector(".iti__country-list").style.width = `${width}px`;
          }
        };
        calculateWidth();
        window.addEventListener("resize", () => {
          clearTimeout(window.phoneResizeTimeout);
          window.phoneResizeTimeout = setTimeout(calculateWidth, 250);
        });
      });

      const validation = new Validation(
        container,
        container.dataset.dyflexisPopupId,
      );
      new HiddenFields(container).fillAll();

      const id = container.dataset.dyflexisPopupId;
      container.addEventListener(id + "-before-submit", function () {
        const forms =
          JSON.parse(container.dataset.dyflexisPopupSettings)?.forms ?? [];

        const popupClass = new Popup(id, forms, true);
        popupClass.setUrlParameters(true);
        validation.executeBeforeSubmitEvent();
      });
    });
});
