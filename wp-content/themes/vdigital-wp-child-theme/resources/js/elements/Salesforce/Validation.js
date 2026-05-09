class Validation {
  fieldTypes =
    '.sf_field input[type="text"], .sf_field input[type="number"], .sf_field input[type="tel"], .sf_field' +
    ' input[type="email"], .sf_field textarea, .sf_field select, .sf_field input[type="checkbox"]';
  constructor(popup, popupId) {
    this.popup = popup;
    this.popupId = popupId;
    this.forms = this.popup.querySelectorAll(
      'form[id^="sf_form_salesforce_w2l_lead_"]',
    );

    // get texts from php variable so that we always have the translated texts
    if (typeof texts !== "undefined" && texts.validation != null) {
      this.texts = texts.validation;
    }

    document.querySelectorAll("form.w2llead")?.forEach((form) => {
      form.addEventListener(this.popupId + "-before-submit", () => {
        this.executeBeforeSubmitEvent();
      });
    });

    this.events();
  }

  events() {
    this.popup.addEventListener("click", (evt) => this.#formClickListener(evt));
    this.popup.querySelectorAll(".select-selected").forEach((select) => {
      select.addEventListener("click", (evt) => {
        this.#markFieldAsNotInvalid(select);
      });
    });
  }

  #formClickListener(evt) {
    const element = evt.target;
    const fieldParent = element.closest(".sf_field");

    if (element.classList.contains("submit")) {
      const form = element.closest("form");
      this.#submitHandler(form, element, evt);
      return;
    }

    if (fieldParent != null || element.classList.contains("sf_field")) {
      const clickedField =
        element.matches(this.fieldTypes) === true
          ? element
          : fieldParent?.querySelector(this.fieldTypes);

      if (clickedField != null) {
        this.#markFieldAsNotInvalid(clickedField);
      }

      this.#toggleFormErrors(fieldParent.closest("form"), false);
    }
  }

  #submitHandler(form, button, evt) {
    evt.preventDefault();

    const formElement = evt.target.closest("form");
    const fields = formElement?.querySelectorAll(this.fieldTypes);
    const submitLoader = button.querySelector(".submitLoader");

    submitLoader?.classList.remove("tw-hidden");

    if (this.#validateFields(fields, form)) {
      this.#validateRecaptchaV3(evt, button, form);
      return;
    }

    submitLoader?.classList.add("tw-hidden");
  }

  #validateFields(fields, form) {
    let validationPassed = true;
    let showFormErrors = false;

    for (let i = 0; i < fields.length; i++) {
      const fieldValidation = this.#isValid(fields[i]);

      if (!fieldValidation.valid) {
        validationPassed = false;
      }

      if (!fieldValidation.valid && !fields[i].classList.contains("invalid")) {
        this.#markFieldAsInvalid(fields[i], fieldValidation.message);
        showFormErrors = true;
      } else if (fieldValidation.valid) {
        this.#markFieldAsNotInvalid(fields[i]);
      }
    }

    if (showFormErrors) {
      this.#toggleFormErrors(form, true);
    }

    return validationPassed;
  }

  #isValid(field) {
    let message = this.texts.required;
    let valid = true;

    if (field.value === "" && field.getAttribute("required") != null) {
      return { valid: false, message: this.texts.required };
    }
    // Validate by field type
    switch (field.getAttribute("type")) {
      case "email":
        if (field.value === "" && field.getAttribute("required") == null) {
          return { valid, message };
        }
        const isValidEmail = this.#validateEmail(field.value);
        const isValidBusinessEmail = this.#validateBusinessEmail(field.value);

        valid = isValidEmail && isValidBusinessEmail;
        message = !isValidEmail
          ? this.texts.invalidEmail
          : this.texts.invalidBusinessEmail;
        break;
      case "checkbox":
        const container = field.closest(".sf_field");
        container.classList.remove("invalid__checkbox__container");
        const isRequired = container.querySelector("label.required") != null;
        if (!isRequired) {
          return { valid, message };
        }

        if (!field.checked) {
          valid = false;
          message = this.texts.required;

          container.classList.add("invalid__checkbox__container");
        }
        break;
    }

    // Validate by field name
    switch (field.getAttribute("name")) {
      case "phone":
        const formattedPhoneNumber = field.getAttribute("formatted-number");
        if (
          field.getAttribute("required") == null &&
          formattedPhoneNumber == null
        ) {
          break;
        }
        valid = this.#validateFieldLength(formattedPhoneNumber, 8);
        message = this.texts.phoneNumberTooShort;

        if (
          valid &&
          formattedPhoneNumber != null &&
          formattedPhoneNumber !== ""
        ) {
          field.value = formattedPhoneNumber;
        }

        break;
      case "first_name":
        valid = this.#validateFieldLength(field.value, 2);
        message = this.texts.firstNameTooShort;
        break;
      case "last_name":
        valid = this.#validateFieldLength(field.value, 2);
        message = this.texts.lastNameTooShort;
        break;
      case "company":
        valid = this.#validateFieldLength(field.value, 2);
        message = this.texts.companyTooShort;
        break;
    }

    return { valid, message };
  }

  #markFieldAsInvalid(field, message) {
    this.#markFieldAsNotInvalid(field);

    if (field.closest(".sf_field") != null) {
      const invalidMessageElement = document.createElement("span");
      invalidMessageElement.innerText = message;
      invalidMessageElement.classList.add("invalid__message");

      field.closest(".sf_field").classList.add("error");
      field.closest(".sf_field").appendChild(invalidMessageElement);
    }
  }

  #toggleFormErrors(form, show) {
    const formErrors = document.querySelectorAll(
      ".error[data-form-id='" + form.id + "']",
    );

    if (formErrors == null) {
      return;
    }

    formErrors.forEach((element) => {
      if (show) {
        element.classList.remove("tw-hidden");
        return;
      }

      element.classList.add("tw-hidden");
    });
  }

  #markFieldAsNotInvalid(field) {
    field.closest(".sf_field")?.classList.remove("error");
    field.closest(".sf_field")?.querySelector(".invalid__message")?.remove();
  }

  #validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  #validateBusinessEmail(email) {
    if (typeof emailExtensionBlacklist === "undefined") {
      return true;
    }

    let valid = true;
    emailExtensionBlacklist.forEach((extension) => {
      if (email.includes(`@${extension}`)) {
        valid = false;
      }
    });

    return valid;
  }

  #validateFieldLength(value, minLength) {
    return value.length >= minLength;
  }

  executeBeforeSubmitEvent() {
    const urlParams = new URLSearchParams(window.location.search);
    const formSettings = urlParams.get("vdigital_popup_forms");
    const formTab = urlParams.get("vdigital_popup_tab") || 0;

    if (!formSettings || formTab.length < 1) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("vdigitalFormInteraction", {
        detail: {
          category: "submit",
          formTemplateId: urlParams.get("vdigital_popup_id"),
          salesforceFormId: Object.values(JSON.parse(formSettings)[formTab])[0],
        },
      }),
    );
  }

  #validateRecaptchaV3(evt, button, form) {
    const recaptchaV3SiteKey = button.dataset.recaptchaV3Key;

    if (recaptchaV3SiteKey == null) {
      return;
    }

    evt.preventDefault();

    const popupId = this.popupId;
    grecaptcha.ready(() => {
      grecaptcha
        .execute(recaptchaV3SiteKey, { action: "submit" })
        .then((token) => {
          // set separate token for hidden field, required for server side recaptcha checks
          form.querySelector('input[name="g-recaptcha-response"]').value =
            token;

          /*
           * This is necessary to prevent an issue where the form doesn't submit properly
           * when submitting the form via JS submit() function.
           * */
          const submitButtonInputClone = document.createElement("input");
          submitButtonInputClone.setAttribute("name", "w2lsubmit");
          submitButtonInputClone.setAttribute("type", "hidden");
          submitButtonInputClone.value = "w2lsubmit";
          form.appendChild(submitButtonInputClone);

          const beforeSubmitEvent = new CustomEvent(
            popupId + "-before-submit",
            { bubbles: true },
          );
          form.dispatchEvent(beforeSubmitEvent);

          form.submit();
        });
    });
  }
}

export default Validation;
