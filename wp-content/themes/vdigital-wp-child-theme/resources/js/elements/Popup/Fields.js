import Select from "../Select";
import { getZoomSize } from "../../helpers/Zoom";

class Fields {
  halfWidthFields = ["sf_field_industry", "sf_field_employees"];

  constructor(popup) {
    this.popup = popup;
  }

  phoneField() {
    document
      .querySelector("html head")
      .insertAdjacentHTML(
        "beforeend",
        '<link rel="stylesheet" type="text/css" href="/wp-content/themes/vdigital-wp-child-theme/resources/sass/intlTelInput.css" />',
      );

    const multisitePrefix = document.querySelector("html").dataset.lang;

    this.popup
      .querySelectorAll("form.w2llead input[name='phone']")
      ?.forEach(function (textInput) {
        let preferredCountries = [];

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

        const telInput = window.intlTelInput(textInput, {
          preferredCountries,
          separateDialCode: true,
          utilsScript:
            "/wp-content/themes/vdigital-wp-child-theme/resources/js/intlTelInputUtils.min.js",
        });

        textInput.addEventListener("change", function () {
          textInput.setAttribute("formatted-number", telInput.getNumber());
        });
      });
  }

  sizeFields() {
    this.halfWidthFields.forEach((field) => {
      const fieldElements = this.popup.querySelectorAll(`.${field}`);

      fieldElements.forEach((fieldElement) => {
        const nextFieldElement = fieldElement.nextElementSibling;
        const prevFieldElement = fieldElement.previousElementSibling;

        if (
          this.#isHalfWidthField(prevFieldElement) ||
          this.#isHalfWidthField(nextFieldElement)
        ) {
          return;
        }

        fieldElement.style.width = "100%";
      });
    });
  }

  #isHalfWidthField(element, halfWidthFields) {
    let isHalfWidthField = false;
    element.classList.forEach((className) => {
      if (this.halfWidthFields.includes(className)) {
        isHalfWidthField = true;
      }
    });

    return isHalfWidthField;
  }

  addCorrectClassesToFields(onWhite = true, compact = true) {
    const form = this.popup.querySelector(
      ".salesforce_popup__wrapper__right form",
    );

    if (!form) {
      return;
    }

    form.querySelectorAll(".sf_type_select").forEach((div) => {
      if (onWhite) {
        div.classList.add("on_white");
      }
      new Select(div);
    });

    this.addCorrectClassesToPhoneFields(form);
  }

  addCorrectClassesToPhoneFields(form) {
    if (!form) {
      return;
    }

    form.querySelectorAll(".sf_field_phone").forEach((div) => {
      this.#calculatePhoneDropdownWidth(div);
      this.#detectPhoneAutofill(div);
      window.addEventListener("resize", () => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.#calculatePhoneDropdownWidth(div);
        }, 250);
      });
    });
  }

  #detectPhoneAutofill(div) {
    const phoneInput = div.querySelector("input[name='phone']");
    const dialCode = div.querySelector(".iti__selected-dial-code");
    const arrow = div.querySelector(".iti__arrow");

    if (!phoneInput || !dialCode) {
      return;
    }

    const checkAutofill = () => {
      try {
        const isAutofilled = phoneInput.matches(":-webkit-autofill");
        dialCode.classList.toggle(
          "iti__selected-dial-code--autofilled",
          isAutofilled,
        );
        if (arrow) {
          arrow.classList.toggle("iti__arrow--autofilled", isAutofilled);
        }
      } catch (e) {
        // Browser doesn't support :-webkit-autofill
      }
    };

    phoneInput.addEventListener("animationstart", (e) => {
      if (
        e.animationName === "onAutoFillStart" ||
        e.animationName.includes("autofill")
      ) {
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

  #calculatePhoneDropdownWidth(div) {
    const width = getZoomSize(div.getBoundingClientRect().width);
    if (div.querySelector(".iti__country-list")) {
      div.querySelector(".iti__country-list").style.width = `${width}px`;
    }
  }
}

export default Fields;
