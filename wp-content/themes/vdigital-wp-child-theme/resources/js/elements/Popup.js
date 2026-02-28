import Tabs from "./Salesforce/Popup/Tabs";
import Fields from "./Popup/Fields";
import Validation from "./Salesforce/Validation";
import HiddenFields from "./Salesforce/HiddenFields";

class Popup {
  element = null;
  tabClass = null;
  fieldClass = null;
  validationClass = null;
  loading = false;
  type = "salesforce";

  constructor(id, forms, disableRegisterFunctions = false, type) {
    this.id = id;
    this.forms = forms;
    this.type = type;

    if (!disableRegisterFunctions) {
      this.#registerCustomEvents();
      this.#registerEventListeners();
    }
  }

  open() {
    // If element is null, the ajax call has not been fired before.
    if (this.element === null && !this.loading) {
      this.#load();
    } else {
      this.element.dispatchEvent(this.loadEvent);
      this.element.classList.remove("tw-hidden");
      this.element
        .querySelectorAll(".dyflexis_popup_hide_on_success")
        .forEach((element) => {
          element.classList.remove("tw-hidden");
        });
      this.element.dispatchEvent(this.afterLoadEvent);
    }
  }

  activateSuccessMessage(tab, small = false) {
    this.element
      .querySelectorAll(".dyflexis_popup_hide_on_success")
      .forEach((element) => {
        element.classList.add("tw-hidden");
      });

    let succssElements = this.element.querySelectorAll(
      '.salesforce_submit_content[data-key="' + tab + '"]',
    );
    if (small) {
      const smallElements = this.element.querySelectorAll(
        '.salesforce_submit_content_small[data-key="' + tab + '"]',
      );
      if (smallElements.length > 0) {
        succssElements = smallElements;
      }
    }

    succssElements.forEach((successElement) => {
      successElement.classList.remove("tw-hidden");
    });
  }

  close(event) {
    const target = event.target;

    if (
      (target.closest(".salesforce_popup__wrapper") != null ||
        target.classList.contains("salesforce_popup__wrapper")) &&
      target.classList.contains(".salesforce_popup__close") === false &&
      target.closest(".salesforce_popup__close") == null
    ) {
      return;
    }

    this.element.classList.remove("open");
    this.element.classList.add("tw-hidden");
    this.element
      .querySelectorAll(
        ".salesforce_submit_content:not(.tw-hidden), .salesforce_submit_content_small:not(.tw-hidden)",
      )
      .forEach((element) => {
        element.classList.add("tw-hidden");
      });

    this.removeUrlParams();
  }

  setActiveTab(tabName, skipActive) {
    document.addEventListener(this.loadEvent.type, () => {
      if (this.tabClass === null) {
        if (
          this.element.querySelectorAll(".salesforce_popup__tabs__tab")
            .length === 0
        ) {
          return;
        }

        const formContents = this.element.querySelectorAll(
          ".salesforce_form_content",
        );
        const submitContent = this.element.querySelectorAll(
          ".salesforce_submit_content",
        );

        this.tabClass = new Tabs(
          formContents,
          submitContent,
          this.element,
          this.id,
          this.forms,
        );
      }

      let tab = null;
      let isInteger = Number.isInteger(parseInt(tabName));
      if (isInteger) {
        tab = this.tabClass.tabs[tabName - 1];

        this.tabClass.makeTabsInactive();
        if (!skipActive) {
          this.tabClass.change(tab, false);
          this.tabClass.setUrlParams(tab);
        }
      } else {
        tab =
          Array.from(this.tabClass.tabs).find(
            (tab) => tab.dataset.key === tabName,
          ) ?? this.tabClass.tabs[0];

        this.tabClass.makeTabsInactive();
        if (!skipActive) {
          this.tabClass.change(tab);
          this.tabClass.setUrlParams(tab);
        }
      }
    });
  }

  setUrlParameters(setSubmit = false) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("dyflexis_popup", "true");
    currentUrl.searchParams.set("dyflexis_popup_id", this.id);
    currentUrl.searchParams.set("dyflexis_popup_type", this.type);
    currentUrl.searchParams.set("dyflexis_popup_tab", 0);
    currentUrl.searchParams.set(
      "dyflexis_popup_forms",
      JSON.stringify(this.forms),
    );

    if (setSubmit) {
      currentUrl.searchParams.set("dyflexis_submit", "true");
    }

    history.pushState({}, null, currentUrl);
  }

  removeUrlParams() {
    const currentUrl = new URL(window.location.href);

    currentUrl.search = "";
    history.pushState({}, null, currentUrl.toString());
  }

  #registerCustomEvents() {
    this.loadEvent = new CustomEvent(this.id + "-popup-loaded", {
      bubbles: true,
    });

    this.afterLoadEvent = new CustomEvent(this.id + "-after-popup-loaded", {
      bubbles: true,
    });
  }

  #registerEventListeners() {
    document.addEventListener(this.afterLoadEvent.type, () => {
      setTimeout(() => this.#setHeight(), 250);
    });

    window.addEventListener("resize", () => {
      if (this.element !== null) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.#setHeight();
        }, 250);
      }
    });
  }

  #load() {
    this.loading = true;
    const prefix = document.querySelector("html").dataset.lang;
    const currentUrl = new URL(window.location.href);
    const serializedForm = document.querySelector(
      'input[name="serialized_salesforce_form"]',
    )?.value;

    fetch(
      "/" + prefix + "/wp-content/themes/vdigital-wp-child-theme/ajax.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "dyflexis_render_popup",
          theme: "vdigital-wp-child-theme__vdigital-wp-base-theme",
          popupId: this.id,
          type: this.type,
          forms: JSON.stringify(this.forms),
          getParams: currentUrl.searchParams,
          serializedForm: serializedForm ?? null,
          nonce: nonces.ajax,
        }),
      },
    )
      .then((response) => response.json())
      .then((data) => {
        document
          .querySelector("#header")
          .insertAdjacentHTML("afterend", data.html);
        this.element = document.querySelector(".salesforce_popup_" + this.id);
        this.element.addEventListener("click", (evt) => this.close(evt));

        this.fieldClass = new Fields(this.element);
        this.fieldClass.phoneField();
        this.fieldClass.addCorrectClassesToFields();
        this.element.addEventListener(this.loadEvent.type, () => {
          const fieldClass = new Fields(this.element);
          fieldClass.sizeFields();
          if (this.validationClass === null) {
            this.validationClass = new Validation(this.element, this.id);
          }
          new HiddenFields(this.element).fillAll();
        });

        this.element.dispatchEvent(this.loadEvent);
        this.element.dispatchEvent(this.afterLoadEvent);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.loading = false;
      });
  }

  #setHeight() {
    let wrapper = this.element.querySelector(".salesforce_popup__wrapper");
    if (window.innerWidth < 1024) {
      wrapper.style.height = null;
      return;
    }

    if (
      !this.element ||
      this.element.classList.contains("tw-hidden") ||
      !this.element
        .querySelector(".salesforce_submit_content")
        .classList.contains("tw-hidden")
    ) {
      return;
    }

    wrapper.style.height = null;

    let heights = {};
    this.element
      .querySelectorAll(".dyflexis_popup_content_container")
      .forEach((container) => {
        let elementToClone = container.querySelectorAll(
          ".dyflexis_element_to_clone",
        );
        if (elementToClone.length === 0) {
          const currentUrl = new URL(window.location.href);
          if (currentUrl.searchParams.get("dyflexis_submit") !== null) {
            elementToClone = [
              container.parentElement.querySelector(
                ":scope > .salesforce_submit_content:not(.tw-hidden), :scope > .salesforce_submit_content_small:not(.tw-hidden)",
              ),
            ];
          } else {
            elementToClone = [container];
          }
        }

        elementToClone.forEach((element) => {
          const key = element.dataset.key;
          let height = 0;

          const clone = element.cloneNode(true);
          clone.classList.add("clone", "tw-absolute", "tw-right-[-9999px]");
          clone.classList.remove("tw-hidden");
          container.after(clone);

          height = height + clone.clientHeight;
          if (heights[key] === undefined) {
            heights[key] = [height];
          } else {
            heights[key].push(height);
          }

          clone.remove();
        });
      });

    for (const key in heights) {
      wrapper.setAttribute(
        "data-" + key + "-height",
        Math.max(...heights[key]),
      );
    }

    const activeTab = this.element.querySelector(
      ".salesforce_popup__tabs__tab--active",
    );

    const currentUrl = new URL(window.location.href);
    let activeTabKey = activeTab?.dataset?.key;
    if (!activeTabKey) {
      if (currentUrl.searchParams.get("dyflexis_popup_tab")) {
        activeTabKey = currentUrl.searchParams.get("dyflexis_popup_tab");
      } else {
        activeTabKey = 0;
      }
    }

    let height = Math.max(...heights[activeTabKey]);
    wrapper.style.height = height + "px";
  }
}

export default Popup;
