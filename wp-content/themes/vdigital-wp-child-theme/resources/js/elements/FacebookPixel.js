class FacebookPixel {
  constructor() {
    this.headerLoginButton = document.querySelectorAll(
      ".navbar__container__login-link",
    );

    this.events();
  }

  events() {
    this.headerLoginButton.forEach((button) =>
      button.addEventListener("click", function () {
        if (typeof fbq !== "function") {
          return;
        }

        fbq("trackCustom", "Login_click", {
          page: location.protocol + "//" + location.host + location.pathname,
        });
      }),
    );

    // window.addEventListener( "load", function () {
    //   if (!demoFormFilled) {
    //     return;
    //   }
    //
    //   if (typeof fbq !== "function") {
    //     return;
    //   }
    //
    //   fbq('trackCustom', 'Demo_submit', {
    //     page: location.protocol + '//' + location.host + location.pathname
    //   });
    // })
  }
}

export default FacebookPixel;
