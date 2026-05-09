class Tagmanager {
  constructor() {
    this.languageButtons = document.querySelectorAll(".mlp-language-nav-item");

    this.events();
  }

  events() {
    this.handleMenuClicks();

    this.languageButtons.forEach((button) =>
      button.addEventListener("click", () =>
        this.handleLanguageButtonClick(button),
      ),
    );

    window.addEventListener("vdigitalFormInteraction", (event) => {
      this.pushFormInteraction(
        event.detail.category,
        event.detail.formTemplateId,
        event.detail.salesforceFormId,
      );
    });
  }

  handleMenuClicks() {
    document.querySelectorAll(".footer__columns a").forEach((link) => {
      link.addEventListener("click", () => {});
    });
  }

  handleLanguageButtonClick(button) {
    let language = button.className.match(/flag-([a-z]*)/)[1];
    Tagmanager.pushToDataLayer({
      event: "languageSwitch",
      eventCategory: "language",
      eventAction: language,
    });
  }

  pushFormInteraction(category, formTemplateId, salesforceFormId) {
    Tagmanager.pushToDataLayer({
      event: "formInteraction",
      eventCategory: category,
      language: document.querySelector("html").dataset.lang,
      formTemplateId: formTemplateId,
      salesforceFormId: salesforceFormId,
    });
  }

  static pushToDataLayer(event) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
}

export default Tagmanager;
