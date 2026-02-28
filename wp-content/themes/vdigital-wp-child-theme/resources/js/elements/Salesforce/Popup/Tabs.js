class Tabs {
  tailwind = {
    tab: {
      active: [
        "salesforce_popup__tabs__tab--active",
        "tw-text-blue-01",
        "tw-font-bold",
        "tw-border-solid",
        "lg:tw-border-blue-01",
        "lg:tw-border-b-8",
      ],
      inactive: ["lg:tw-text-gray-02"],
    },
  };

  constructor(formContents, submitContents, popup, popupId, forms) {
    this.tabs = document.querySelectorAll(".salesforce_popup__tabs__tab");
    this.mobileActive = document.querySelector(
      ".salesforce_popup__tabs__mobile-active",
    );
    this.mobileActiveText = this.mobileActive.querySelector(
      ".salesforce_popup__tabs__mobile-active__text",
    );
    this.mobileActiveIcon = this.mobileActive.querySelector(
      ".salesforce_popup__tabs__mobile-active__icon",
    );
    this.urlParams = new URLSearchParams(window.location.search);
    this.formContents = formContents;
    this.submitContents = submitContents;
    this.popup = popup;
    this.popupId = popupId;
    this.forms = forms;

    this.#setActive();
    this.events();
  }

  events() {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.change(tab));
    });

    this.mobileActive.addEventListener("click", () =>
      this.#toggleMobileDropdown(),
    );
    this.popup.addEventListener("click", (evt) => this.#handlePopupClick(evt));
  }

  makeTabsInactive() {
    this.tabs.forEach((tab) => {
      tab.classList.remove(...this.tailwind.tab.active);
      tab.classList.add(...this.tailwind.tab.inactive);
    });
  }

  change(tab, dispatchEvent = true) {
    if (
      tab == null ||
      tab.classList.contains("salesforce_popup__tabs__tab--active") ||
      tab?.dataset?.key == null
    ) {
      return;
    }

    const wrapper = tab.closest(".salesforce_popup__wrapper");
    wrapper.style.height =
      wrapper.getAttribute("data-" + [tab.dataset.key + "-height"]) + "px";

    tab.classList.remove(...this.tailwind.tab.inactive);
    tab.classList.add(...this.tailwind.tab.active);
    this.mobileActiveText.innerText = tab.textContent;

    const otherTabs = [...this.tabs].filter((otherTab) => {
      return otherTab !== tab;
    });

    otherTabs.forEach((otherTab) => {
      otherTab.classList.remove(...this.tailwind.tab.active);
      otherTab.classList.add(...this.tailwind.tab.inactive);
    });

    this.formContents.forEach((content) => {
      if (content.dataset.key === tab.dataset.key) {
        content.classList.add("active");
        content.classList.remove("tw-hidden");
        return;
      }

      content.classList.remove("active");
      content.classList.add("tw-hidden");
    });

    this.submitContents.forEach((content) => {
      content.classList.add("tw-hidden");
    });

    this.removeUrlParams();
    this.setUrlParams(tab);
    this.#toggleMobileDropdown(tab);

    const urlParams = new URLSearchParams(window.location.search);
    const formSettings = urlParams.get("dyflexis_popup_forms");
    const formTab = urlParams.get("dyflexis_popup_tab");

    if (!formSettings || formTab.length < 1) {
      return;
    }

    if (dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("dyflexisFormInteraction", {
          detail: {
            category: "switch",
            formTemplateId: urlParams.get("dyflexis_popup_id"),
            salesforceFormId: Object.values(
              JSON.parse(formSettings)[formTab],
            )[0],
          },
        }),
      );
    }
  }

  #setActive() {
    if (
      this.urlParams.has("dyflexis_popup") === false &&
      this.urlParams.has("dyflexis_submit") === false
    ) {
      return;
    }

    const tab = this.#getActive();
    tab.classList.remove(...this.tailwind.tab.inactive);
    tab.classList.add(...this.tailwind.tab.active);

    const key = tab.dataset.key;
    this.mobileActiveText.innerText = tab.textContent;

    this.formContents.forEach((content) => {
      if (
        content.dataset.key === key &&
        this.urlParams.has("dyflexis_submit") === false
      ) {
        content.classList.add("active");
        content.classList.remove("tw-hidden");
        return;
      }

      content.classList.remove("active");
      content.classList.add("tw-hidden");
    });
    this.setUrlParams(tab);
  }

  setUrlParams(tab, isInteger) {
    const currentUrl = new URL(window.location.href);
    const tabParameter = isInteger ? tab : tab.dataset.key;
    currentUrl.searchParams.set("dyflexis_popup", "true");
    currentUrl.searchParams.set("dyflexis_popup_id", this.popupId);
    currentUrl.searchParams.set("dyflexis_popup_tab", tabParameter);
    currentUrl.searchParams.set(
      "dyflexis_popup_forms",
      JSON.stringify(this.forms),
    );
    history.pushState({}, null, currentUrl);
  }

  removeUrlParams() {
    const currentUrl = new URL(window.location.href);

    currentUrl.search = "";
    history.pushState({}, null, currentUrl.toString());
  }

  #getActive() {
    const activeTab = Array.from(this.tabs).find(
      (tab) => tab.dataset.key === this.urlParams.get("dyflexis_popup_tab"),
    );

    return activeTab || this.tabs[0];
  }

  #handlePopupClick(evt) {
    if (
      evt.target.closest(".salesforce_popup__tabs") == null &&
      evt.target.classList.contains("salesforce_popup__tabs") === false
    ) {
      this.#toggleMobileDropdown(true);
    }
  }

  #toggleMobileDropdown(forceClose = false) {
    const dropdown = document.querySelector(
      ".salesforce_popup__tabs .salesforce_popup__tabs__wrapper",
    );

    if (forceClose) {
      dropdown?.classList.add("tw-hidden", "lg:tw-flex");
      dropdown?.classList.remove("tw-flex");
      this.mobileActiveIcon?.classList.remove("tw-rotate-180");
      return;
    }

    dropdown?.classList.toggle("tw-hidden");
    dropdown?.classList.toggle("tw-flex");
    dropdown?.classList.toggle("lg:tw-flex");
    this.mobileActiveIcon?.classList.toggle("tw-rotate-180");
  }
}

export default Tabs;
