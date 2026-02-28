class Cookiebot {
  constructor() {
    this.setup();
    this.events();
  }

  setup() {
    this.html = document.querySelector("html");
    this.body = this.html.querySelector("body");
    this.multisitePrefix = this.html.dataset.lang;
    window.cookie_options_selected = [];
  }

  events() {
    window.addEventListener("CookiebotOnDialogDisplay", () =>
      this.handleBannerLoaded(),
    );
    window.addEventListener("CookiebotOnAccept", () =>
      this.removeDialogOverlay(),
    );

    window.addEventListener("CookiebotOnDecline", () =>
      this.removeDialogOverlay(),
    );
  }

  handleBannerLoaded() {
    this.addDialogOverlay();

    document
      .getElementById("CybotCookiebotDialogBodyEdgeMoreDetailsLink")
      .addEventListener("click", () => this.handleAdjustPreferencesClicked());

    document
      .getElementById("CybotCookiebotDialogBodyLevelButtonPreferences")
      .addEventListener("click", (event) =>
        this.handleCookieTypeClicked(event, "preferences"),
      );

    document
      .getElementById("CybotCookiebotDialogBodyLevelButtonStatistics")
      .addEventListener("click", (event) =>
        this.handleCookieTypeClicked(event, "statistics"),
      );

    document
      .getElementById("CybotCookiebotDialogBodyLevelButtonMarketing")
      .addEventListener("click", (event) =>
        this.handleCookieTypeClicked(event, "marketing"),
      );

    document
      .getElementById("CybotCookiebotDialogBodyLevelButtonMarketing")
      .addEventListener("click", () => this.handleAcceptButtonClicked());
  }

  addDialogOverlay() {
    this.body.insertAdjacentHTML(
      "beforeend",
      '<div id="CybotCookiebotDialogBodyUnderlay"></div>',
    );
  }

  removeDialogOverlay() {
    this.body.querySelector("#CybotCookiebotDialogBodyUnderlay")?.remove();
  }

  handleCookieTypeClicked(event, cookieType) {
    if (event.target.checked) {
      cookie_options_selected.push(cookieType);
      return;
    }

    cookie_options_selected.splice(
      cookie_options_selected.indexOf(cookieType),
      1,
    );
  }

  handleAcceptButtonClicked() {
    if (typeof ga !== "function") {
      return;
    }

    let analyticsLabel = "Cookie_accept";

    if (typeof document.cookie != "undefined") {
      analyticsLabel = analyticsLabel + "_" + this.multisitePrefix;
    }

    ga("send", "event", "Buttons", "Click", analyticsLabel);

    cookie_options_selected.forEach(function (value) {
      if (value === "preferences") {
        ga("send", "event", "Buttons", "Click", "Cookie_preferences");
      }
      if (value === "statistics") {
        ga("send", "event", "Buttons", "Click", "Cookie_statistics");
      }
      if (value === "marketing") {
        ga("send", "event", "Buttons", "Click", "Cookie_marketing");
      }
      if (value === "self-input") {
        ga("send", "event", "Buttons", "Click", "Cookie_self-input");
      }
    });
  }

  handleAdjustPreferencesClicked() {
    const selectPane = document.getElementById(
      "CybotCookiebotDialogBodyLevelButtonsSelectPane",
    );
    selectPane?.classList.toggle("active");

    let preferences = document.getElementById(
      "CybotCookiebotDialogBodyLevelButtonPreferences",
    );
    let statistics = document.getElementById(
      "CybotCookiebotDialogBodyLevelButtonStatistics",
    );
    let marketing = document.getElementById(
      "CybotCookiebotDialogBodyLevelButtonMarketing",
    );

    console.log(preferences);
    console.log(statistics);
    console.log(marketing);

    preferences.checked = false;
    statistics.checked = false;
    marketing.checked = false;

    if (typeof ga === "function") {
      if (selectPane?.classList.contains("active")) {
        cookie_options_selected.push("self-input");
        return;
      }

      cookie_options_selected.splice(
        cookie_options_selected.indexOf("self-input"),
        1,
      );
    }
  }
}

export default Cookiebot;
