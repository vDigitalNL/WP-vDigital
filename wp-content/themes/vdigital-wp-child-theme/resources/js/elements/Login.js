import Tagmanager from "./Tagmanager";

class Login {
  constructor() {
    this.events();
  }

  events() {
    document
      .querySelectorAll(".login-form__submit")
      .forEach(function (submitButton) {
        submitButton.addEventListener("click", function () {
          Tagmanager.pushToDataLayer({
            event: "login",
            eventCategory: "login",
            eventAction: "submit",
          });
        });
      });

    document
      .querySelectorAll(".login-notice__close")
      .forEach(function (closeButton) {
        closeButton.addEventListener("click", function (evt) {
          evt.preventDefault();
          evt.stopPropagation();

          closeButton.closest(".ww-login-error").remove();
        });
      });

    // Remove error classes when input is focused
    document
      .querySelectorAll(".login-form__input")
      .forEach(function (inputField) {
        inputField.addEventListener("focus", function () {
          console.log("focus");

          this.classList.remove(
            "tw-text-red-01",
            "tw-border-red-01",
            "tw-placeholder-red-01",
          );
        });
      });
  }
}

export default Login;
