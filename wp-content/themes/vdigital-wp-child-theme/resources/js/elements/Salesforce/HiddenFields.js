class HiddenFields {
  constructor(popup) {
    this.popup = popup;
  }

  fillAll() {
    this.#fillFormFields("utm_campaign", "utmCampaign", "utmCampaign__c");
    this.#fillFormFields("utm_medium", "utmMedium", "utmMedium__c");
    this.#fillFormFields("utm_term", "utmTerm", "utmTerm__c");
    this.#fillFormFields("utm_creative", "utmCreative", "utmCreative__c");
    this.#fillFormFields("utm_source", "utmSource", "utmSource__c");
    this.#fillFormFields("utm_content", "utmContent", "utmContent__c");

    this.#fillFormFields("msclkid", "msclkid", "MSCLKID__c");
    this.#fillFormFields("gclid", "gclid", "GCLID__c");
    this.#fillFormFields("gclid", "gclid", "GCLID");
    this.#fillFormFields("matchtype", "gaMatchtype", "gaMatchtype__c");
    this.#fillFormFields("network", "gaNetwork", "gaNetwork__c");
    this.#fillFormFields("device", "gaDevice", "gaDevice__c");
    this.#fillFormFields("loc", "gaLocation", "gaLocation__c");
    this.#fillFormFields(false, "httpReferer", "RefererDomain__c", true);

    this.#fillLanguage();
    this.#fillUtmUrl();
    this.#fillUrlFields();
  }

  static setCookies() {
    const fields = [
      ["utm_campaign", "utmCampaign", "utmCampaign__c"],
      ["utm_medium", "utmMedium", "utmMedium__c"],
      ["utm_term", "utmTerm", "utmTerm__c"],
      ["utm_creative", "utmCreative", "utmCreative__c"],
      ["utm_source", "utmSource", "utmSource__c"],
      ["utm_content", "utmContent", "utmContent__c"],
      ["msclkid", "msclkid", "MSCLKID__c"],
      ["gclid", "gclid", "GCLID__c"],
      ["gclid", "gclid", "GCLID"],
      ["matchtype", "gaMatchtype", "gaMatchtype__c"],
      ["network", "gaNetwork", "gaNetwork__c"],
      ["device", "gaDevice", "gaDevice__c"],
      ["loc", "gaLocation", "gaLocation__c"],
    ];

    const HiddenFieldsClass = new HiddenFields(null);
    fields.forEach((field) => {
      let fieldValue = HiddenFieldsClass.#findGetParameter(field[0]);

      if (fieldValue) {
        HiddenFieldsClass.#setCookie(field[1], fieldValue, 30);

        if (field[0] === "gclid" || field[0] === "msclkid") {
          HiddenFieldsClass.#setCookie("utmUrl", window.location.href, 30);
        }
      }
    });
  }

  #fillUrlFields() {
    const url = window.location.href.split("?")[0];
    const inputs = this.popup.querySelectorAll('input[name="Web_URL__c"]');
    const firstTouchInputs = this.popup.querySelectorAll(
      'input[name="FirstTouchPage__c"]',
    );
    let firstTouchUrl = this.#getCookie("firstTouchUrl");

    if (!firstTouchUrl) {
      firstTouchUrl = url;
      this.#setCookie("firstTouchUrl", url, 30);
    }

    firstTouchInputs.forEach(function (input) {
      input.value = firstTouchUrl;
    });

    inputs.forEach(function (input) {
      input.value = url;
    });
  }

  #fillLanguage() {
    const language = document.querySelector("html").dataset.lang;
    const languageInputs = this.popup.querySelectorAll(
      'input[name="language__c"]',
    );

    languageInputs.forEach((languageInput) => {
      languageInput.value = language.toUpperCase();
    });
  }

  #fillUtmUrl() {
    const gclid = this.#findGetParameter("gclid");
    const msclkid = this.#findGetParameter("msclkid");
    const fbclid = this.#findGetParameter("fbclid");
    let url = this.#getCookie("utmUrl");

    // update cookie if there is any utm parameter in the url
    if (gclid != null || msclkid != null || fbclid != null) {
      url = window.location.href;
      this.#setCookie("utmUrl", url, 30);
    }

    // fill utm input fields
    if (url != null) {
      const utmInputs = this.popup.querySelectorAll('input[name="utmAll__c"]');
      utmInputs?.forEach((utmInput) => {
        utmInput.value = url;
      });
    }
  }

  #fillFormFields(
    getParamName,
    cookieName,
    inputName,
    needsToBeDecoded = false,
  ) {
    let fieldValue = this.#findGetParameter(getParamName);

    if (!fieldValue) {
      fieldValue = this.#getCookie(cookieName);
    }

    if (needsToBeDecoded) {
      fieldValue = decodeURIComponent(fieldValue);
    }

    if (fieldValue) {
      this.#setCookie(cookieName, fieldValue, 30);
      const inputs = this.popup.querySelectorAll(
        'input[name="' + inputName + '"]',
      );

      inputs.forEach((input) => {
        input.value = fieldValue;
      });
    }
  }

  #findGetParameter(parameterName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
  }

  #setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    const domain = "domain=" + document.domain.match(/[^\.]*\.[^.]*$/)[0] + ";";
    document.cookie =
      name + "=" + (value || "") + expires + "; path=/; " + domain;
  }

  #getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");

    for (var i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }
}

export default HiddenFields;
