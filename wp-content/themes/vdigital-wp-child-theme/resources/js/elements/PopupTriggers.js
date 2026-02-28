import Popup from "./Popup.js";
import HiddenFields from "./Salesforce/HiddenFields";
import { salesforceFormFilled } from "../helpers/SalesforceForm";

class PopupTriggers {
  type = "salesforce";

  constructor() {
    this.popupClassInstances = [];
    this.#registerEventListeners();
  }

  handleUrl() {
    const currentUrl = new URL(window.location.href);

    const dyflexisPopup = currentUrl.searchParams.get("dyflexis_popup");
    if (dyflexisPopup === "true") {
      const id = currentUrl.searchParams.get("dyflexis_popup_id");
      this.type =
        currentUrl.searchParams.get("dyflexis_popup_type") ?? "salesforce";
      const tab = currentUrl.searchParams.get("dyflexis_popup_tab") ?? null;
      let forms = currentUrl.searchParams.get("dyflexis_popup_forms") ?? null;
      forms = decodeURIComponent(forms);
      forms = forms.replace(/\\\"/g, '"');

      if (currentUrl.searchParams.get("dyflexis_submit") !== null) {
        this.triggerPopup(id, tab, JSON.parse(forms), true);
        document.addEventListener(id + "-after-popup-loaded", () => {
          const currentUrl = new URL(window.location.href);
          if (currentUrl.searchParams.get("dyflexis_submit") !== null) {
            const industry = currentUrl.searchParams.get("industry") ?? null;
            const employees = currentUrl.searchParams.get("employees") ?? null;
            const smallSuccessMessage =
              industry !== null &&
              industry !== "Other" &&
              employees !== null &&
              employees === "30";

            let popupClass = this.#getPopupClass(id, JSON.parse(forms));
            popupClass.activateSuccessMessage(tab, smallSuccessMessage);
          }
        });
      } else {
        this.triggerPopup(id, tab, JSON.parse(forms));
      }
    }
  }

  handlePopupButton(event) {
    event.preventDefault();

    const button = event.currentTarget; // Ensures the button itself is selected

    if (button.classList.contains("disabled")) {
      return;
    }

    const settings = button.dataset.dyflexisPopupSettings;
    const tab = button.dataset.dyflexisPopupTab || 1;

    if (!settings) {
      console.error("Error: data-dyflexis-popup-settings is missing");
      return;
    }

    window.dispatchEvent(
      new CustomEvent("dyflexisFormInteraction", {
        detail: {
          category: "click",
          formTemplateId: button.dataset.dyflexisPopupId,
          salesforceFormId: Object.values(
            JSON.parse(settings).forms[tab - 1],
          )[0],
        },
      }),
    );

    try {
      const id = button.dataset.dyflexisPopupId;
      const tab = button.dataset.dyflexisPopupTab ?? null;
      const forms = JSON.parse(settings)?.forms ?? [];

      this.triggerPopup(id, tab, forms);
    } catch (error) {
      console.error(
        "Invalid JSON in data-dyflexis-popup-settings:",
        settings,
        error,
      );
    }
  }

  #registerEventListeners() {
    document.addEventListener("DOMContentLoaded", () => {
      this.handleUrl();
      HiddenFields.setCookies();
    });

    document
      .querySelectorAll('a[data-dyflexis-popup-btn="true"]')
      .forEach((buttonElement) => {
        buttonElement.addEventListener("click", (evt) => {
          this.type = "salesforce";
          this.handlePopupButton(evt);
        });
      });
  }

  reinitializePopupButtons(container) {
    container
      .querySelectorAll('a[data-dyflexis-popup-btn="true"]')
      .forEach((buttonElement) => {
        buttonElement.addEventListener("click", (evt) => {
          this.type = "salesforce";
          this.handlePopupButton(evt);
        });
      });
  }

  triggerPopup(id, tab, forms, skipActiveTab = false) {
    let popupClass = this.#getPopupClass(id, forms);

    if (tab) {
      popupClass.setActiveTab(tab, skipActiveTab);
    } else {
      popupClass.setUrlParameters();
    }

    popupClass.open();
  }

  #getPopupClass(id, forms) {
    let popupClass = this.#findInstance(id, forms);
    if (popupClass === undefined) {
      popupClass = new Popup(id, forms, false, this.type);
      this.popupClassInstances.push(popupClass);
    }

    return popupClass;
  }

  #findInstance(id, forms) {
    return this.popupClassInstances.find(
      (instance) =>
        instance.id === id &&
        JSON.stringify(instance.forms) === JSON.stringify(forms),
    );
  }
}

export default PopupTriggers;
