class Topbar {
  constructor(headerElement) {
    this.header = headerElement;
    if (this.header === null) return;

    this.topbar = this.header.querySelector("#topbar");
    this.scrollPosition = 0;

    this.events();
  }

  events() {
    window.addEventListener("scroll", () => this.#handleOnScroll());
    window.addEventListener("resize", () => this.#handleResize());
  }

  #handleOnScroll() {
    if (window.innerWidth < 1024 || window.isProgrammaticScroll) {
      return;
    }
    const homeHeroElement = document.querySelector("#home-hero");
    // check if we are past the home hero section, other wise bail
    if (homeHeroElement) {
      const homeHeroRect = homeHeroElement.getBoundingClientRect();
      if (homeHeroRect.bottom > 0) {
        return;
      }
    }

    const scrollingDown = window.scrollY > this.scrollPosition;
    setTimeout(() => {
      this.topbar.style.height = scrollingDown ? "10px" : "";
      this.topbar.style.overflow = scrollingDown ? "hidden" : "visible";
    }, 100);

    this.scrollPosition = window.scrollY;
  }

  #handleResize() {
    this.topbar.style.height = "";
    this.topbar.style.overflow = "";
  }
}

export default Topbar;
