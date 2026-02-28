class Footer {
  columns = null;

  constructor() {
    this.columns = document.querySelector(".footer__columns");
    if (this.columns == null) {
      return;
    }

    this.setup();
    this.events();
  }

  setup() {
    this.#keepItemsSameSize(this.columns);
  }

  events() {
    window.addEventListener("resize", () => this.#handleResize());
  }

  #handleResize() {
    clearTimeout(this.resizeTimeout);
    document
      .querySelectorAll(".footer__column__item")
      .forEach((item) => (item.style.height = ""));
    this.resizeTimeout = setTimeout(() => {
      this.#keepItemsSameSize(this.columns);
    }, 250);
  }

  #keepItemsSameSize(columns) {
    if (window.innerWidth < 1024) {
      return;
    }

    const columnItems = columns.querySelectorAll(".footer__column");

    let highestPerRow = {};
    let submenuItems = [];

    columnItems.forEach((columnItem, index) => {
      const items = columnItem.querySelectorAll(".footer__column__item");
      submenuItems.push(items);

      items.forEach((item, index) => {
        if (
          highestPerRow[index] != null &&
          item.offsetHeight < highestPerRow[index]
        ) {
          return;
        }

        highestPerRow[index] = item.offsetHeight;
      });
    });

    submenuItems.forEach((items) => {
      items.forEach((item, index) => {
        const highestItem = highestPerRow[index];
        item.style.height = `${highestItem}px`;
      });
    });
  }
}

export default Footer;
