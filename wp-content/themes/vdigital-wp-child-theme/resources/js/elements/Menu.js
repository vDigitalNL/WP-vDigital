import { toggleClassOnElement } from "../helpers/CssClasses";

class Menu {
  tailwind = {
    hidden: "tw-hidden",
    align: {
      top: "tw-top-0",
      right: "tw-right-0",
    },
    hide: {
      top: "tw--top-full",
      right: "tw--right-full",
    },
    height: {
      full: "tw-h-full",
      screen: "tw-h-[100vh]",
    },
    zindex: {
      10: "tw-z-10",
      20: "tw-z-20",
    },
  };
  closingMenuItem = false;
  preScrollPosition = false;

  constructor() {
    this.html = document.querySelector("html");

    this.setup();
    this.events();
  }

  setup() {
    this.header = document.querySelector("header#header");
    if (this.header === null) return;

    const isMobile = window.innerWidth < 1024;
    this.nav = this.header.querySelector("nav");
    this.header.style.height = this.nav.clientHeight + "px";
    this.navbarItems = this.header.querySelectorAll(".navbar-item");
    this.mobileOpenButton = this.header.querySelector(
      ".mobile-menu-button--open",
    );

    this.mobileCloseButton = this.header.querySelector(
      ".mobile-menu-button--close",
    );

    this.homeHero = document.querySelector("#home_hero_navbar");
    if (this.homeHero) {
      this.mobileOpenButtonHero = this.homeHero.querySelector(
        ".mobile-menu-button--open",
      );
      this.mobileCloseButtonHero = this.homeHero.querySelector(
        ".mobile-menu-button--close",
      );
    }

    if (isMobile && !this.mobileMenuLoaded) {
      this.#loadMobile();
    }

    if (!isMobile) {
      this.#setupSubmenus();
    }
  }

  #loadMobile() {
    this.mobileMenuLoaded = true;

    const multisitePrefix = this.html.dataset.lang;
    fetch("/" + multisitePrefix + "/wp-admin/admin-ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "load_mobile_menu",
        theme: "vdigital-wp-child-theme__vdigital-wp-base-theme",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.nav.insertAdjacentHTML("beforeend", data.html);

        this.#setupMobile();
      })
      .catch((error) => {
        console.error(error);
        this.mobileMenuLoaded = false;
      });
  }

  #setupMobile() {
    this.mobileMenu = this.header.querySelector(".menu--mobile");
    this.mobileMenuNavItems = this.header.querySelectorAll(
      ".navbar-item--mobile",
    );
    this.mobileMenuNavItems.forEach((item) =>
      item.addEventListener("click", (evt) =>
        this.#handleOpenMobileMenu(evt.target),
      ),
    );

    this.mobileMenuNavItems.forEach((item) =>
      item.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (e) => {
          if (e.target.tagName.toLowerCase() !== "a") {
            return;
          }
          if (e.target.getAttribute("href") === "#") {
            e.preventDefault();
            return;
          } else if (
            e.target.getAttribute("href") === window.location.href ||
            e.target.getAttribute("href").indexOf("#") > -1
          ) {
            e.preventDefault();
            this.#handleMobileMenuClose();
            setTimeout(() => {
              window.location.href = link.href;
            }, 400);
          }
        });
      }),
    );
  }

  events() {
    document
      .getElementById("navbar")
      ?.addEventListener("mouseover", (evt) =>
        this.#handleOnMouseover(evt.target),
      );
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.header.style.height = this.nav.clientHeight + "px";
      }, 200);
      const isMobile = window.innerWidth < 1024;

      if (isMobile && !this.mobileMenuLoaded) {
        this.#loadMobile();
      }
    });

    this.mobileOpenButton?.addEventListener("click", () =>
      this.#handleMobileMenuOpen(),
    );
    this.mobileOpenButtonHero?.addEventListener("click", () =>
      this.#handleMobileMenuOpen(),
    );

    this.mobileCloseButton?.addEventListener("click", () =>
      this.#handleMobileMenuClose(),
    );
    this.mobileCloseButtonHero?.addEventListener("click", () =>
      this.#handleMobileMenuClose(),
    );
  }

  #keepSameSize() {
    const submenus = document.querySelectorAll(".submenu");
    let highestSubmenu = 0;

    submenus.forEach((submenu) => {
      submenu.style.minHeight = false;
    });

    setTimeout(() => {
      submenus.forEach((submenu) => {
        if (submenu.offsetHeight < highestSubmenu) {
          return;
        }

        highestSubmenu = submenu.offsetHeight;

        this.#keepItemsSameSize(submenu);
      });

      submenus.forEach((submenu) => {
        submenu.style.minHeight = `${highestSubmenu}px`;
      });
    }, 500);
  }

  #keepItemsSameSize(submenu) {
    const columnItems = submenu.querySelectorAll(".submenu__column__items");
    let highestPerRow = {};
    let submenuItems = [];

    columnItems.forEach((columnItem, index) => {
      const items = columnItem.querySelectorAll(
        ".submenu__column__items__item",
      );
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

  #setupSubmenus() {
    this.#keepSameSize();
    this.navbarItems.forEach((item) => {
      const submenu = document.querySelector(
        '.submenu[data-index="' + item.dataset.submenuIndex + '"]',
      );

      if (submenu) {
        submenu.style.top =
          "-" + (submenu.clientHeight + this.nav.clientHeight) + "px";
        submenu.classList.add("lg:tw-invisible");

        setTimeout(() => this.#submenuTitleSameSize(submenu), 100);
        setTimeout(() => {
          submenu.classList.remove("lg:tw-invisible");
        }, 700);
      }
    });
  }

  #submenuTitleSameSize(submenu) {
    let columns = submenu.querySelectorAll(".submenu__column");

    let titleCount = 0;
    let titleHeight = 0;

    columns.forEach((column) => {
      const title = column.querySelector(".submenu__column__title");
      if (title != null && title.textContent.length > 0) {
        titleCount++;
        titleHeight =
          title.clientHeight > titleHeight ? title.clientHeight : titleHeight;
      }
    });

    if (titleCount > 0 && columns.length > titleCount) {
      columns.forEach((column) => {
        const title = column.querySelector(".submenu__column__title");
        if (title != null) {
          title.style.height = titleHeight + "px";
        }
      });
    }
  }

  #textActive(element, reverse = false) {
    toggleClassOnElement(element, "tw-text-blue-01", reverse);
    toggleClassOnElement(element, "tw-text-black-01", !reverse);
  }

  #open(submenu, target, callback = null) {
    const icon = target.querySelector("svg");

    submenu.style.top = "100%";
    target.dataset.openedSubmenu = true;

    if (icon != null) {
      toggleClassOnElement(icon, "tw-rotate-180");
      this.#textActive(icon);
    }

    document.addEventListener("mouseover", (evt) =>
      this.#closeMenuItem(evt.target),
    );

    callback?.();
  }

  #close(submenu, target, callback = null) {
    const icon = target.querySelector("svg");

    submenu.style.top =
      "-" + (submenu.clientHeight + this.nav.clientHeight) + "px";
    target.dataset.openedSubmenu = false;

    if (icon != null) {
      toggleClassOnElement(icon, "tw-rotate-180", true);
      this.#textActive(icon, true);
    }

    document.removeEventListener("mouseover", this.#closeMenuItem);

    callback?.();
  }

  #closeMenuItem(target) {
    if (this.closingMenuItem) {
      return false;
    }

    const openNavItem = document.querySelector(
      '.navbar-item[data-opened-submenu="true"]',
    );
    if (openNavItem == null) {
      return;
    }

    const index = openNavItem.dataset.submenuIndex;
    const openSubmenu = document.querySelector(
      '.submenu[data-index="' + index + '"]',
    );

    if (
      !target.closest('.submenu[data-index="' + index + '"]') &&
      !target.closest('.navbar-item[data-submenu-index="' + index + '"]')
    ) {
      if (target.closest("#navbar")) {
        this.closingMenuItem = true;

        setTimeout(() => {
          const currentHoveredElements = document.querySelectorAll(":hover");

          if (currentHoveredElements.length > 0) {
            const current =
              currentHoveredElements[currentHoveredElements.length - 1];
            if (current.closest("#navbar")) {
              this.#close(openSubmenu, openNavItem);

              const closestItem = current.closest(".navbar-item");
              if (
                closestItem == null ||
                closestItem.classList.contains("navbar-item--has-submenu") ===
                  false
              ) {
                this.closingMenuItem = false;
                return;
              }

              const newSubmenu = document.querySelector(
                '.submenu[data-index="' +
                  closestItem.dataset.submenuIndex +
                  '"]',
              );
              this.#open(newSubmenu, closestItem, () => {
                this.closingMenuItem = false;
              });
            } else {
              this.closingMenuItem = false;
            }
          } else {
            this.closingMenuItem = false;
          }
        }, 350);
        return;
      }

      this.#close(
        openSubmenu,
        openNavItem,
        () => (this.closingMenuItem = false),
      );
    }
  }

  #handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.header
        .querySelectorAll(".submenu__column__title")
        .forEach((title) => (title.style.height = ""));
      this.#setupSubmenus();
    }, 250);
  }

  #handleOnMouseover(target) {
    const navbarItem = target.closest(".navbar-item");
    const openNavItem = document.querySelector(
      '.navbar-item[data-opened-submenu="true"]',
    );

    if (
      navbarItem == null ||
      navbarItem.classList.contains("navbar-item--has-submenu") === false ||
      openNavItem != null
    ) {
      return;
    }

    const item = target.classList.contains("navbar-item") ? target : navbarItem;
    const submenu = document.querySelector(
      '.submenu[data-index="' + item.dataset.submenuIndex + '"]',
    );

    this.#open(submenu, item);
  }

  #maybeScrollToHeader() {
    /**
     * Used for aligning the viewport with the menu when opening the
     * mobile menu from a lower position. Which is possible with the home hero
     * */
    let headerTop = this.header.getBoundingClientRect().top;

    const isHeaderSticky = getComputedStyle(this.header).position === "sticky";
    if (isHeaderSticky && headerTop === 0) {
      this.preScrollPosition = false;
      return;
    }

    if (this.#shouldAdjustForAdminBar()) {
      const adminBarHeight = this.#getAdminBarHeight();
      headerTop -= adminBarHeight;
    }

    if (headerTop < 0 || headerTop > 0) {
      this.preScrollPosition = window.scrollY;
      window.scrollTo({
        top: window.scrollY + headerTop,
        behavior: "smooth",
      });
    }
  }
  #shouldAdjustForAdminBar() {
    return document.getElementById("wpadminbar") && window.innerWidth > 600;
  }

  #getAdminBarHeight() {
    const adminBar = document.getElementById("wpadminbar");
    return adminBar?.getBoundingClientRect().height || 0;
  }

  #handleMobileMenuOpen() {
    if (this.mobileMenu === undefined) {
      return; // prevent icon toggle if menu is not loaded yet
    }
    this.#maybeScrollToHeader();

    const navbar = document.querySelector("#navbar");
    toggleClassOnElement(this.mobileOpenButton, this.tailwind.hidden);
    toggleClassOnElement(this.mobileCloseButton, this.tailwind.hidden, true);

    toggleClassOnElement(this.mobileMenu, this.tailwind.hide.top, true);
    toggleClassOnElement(this.mobileMenu, this.tailwind.align.top);

    toggleClassOnElement(this.mobileMenu, this.tailwind.height.full, true);
    toggleClassOnElement(this.mobileMenu, this.tailwind.height.screen);
    toggleClassOnElement(this.mobileMenu, this.tailwind.zindex[10]);
    toggleClassOnElement(this.mobileMenu, this.tailwind.align.top);

    toggleClassOnElement(navbar, "opened-mobile-menu");

    toggleClassOnElement(document.querySelector("body"), "opened-mobile-menu");

    if (!this.mobileSubmenusLoaded) {
      this.#loadMobileSubmenus();
    }
  }

  #loadMobileSubmenus() {
    const multisitePrefix = this.html.dataset.lang;
    fetch("/" + multisitePrefix + "/wp-admin/admin-ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "load_mobile_submenus",
        theme: "vdigital-wp-child-theme__vdigital-wp-base-theme",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.mobileSubmenusLoaded = true;
        this.mobileMenu.insertAdjacentHTML("afterend", data.html);
      })
      .catch((error) => console.error(error));
  }

  #handleMobileMenuClose() {
    toggleClassOnElement(this.mobileOpenButton, this.tailwind.hidden, true);
    toggleClassOnElement(this.mobileCloseButton, this.tailwind.hidden);

    const navbar = document.querySelector("#navbar");
    const openSubmenus = document.querySelectorAll(
      ".submenu--mobile.tw-right-0",
    );
    if (openSubmenus.length > 0) {
      openSubmenus.forEach((submenu) => {
        toggleClassOnElement(submenu, this.tailwind.hide.right);
        toggleClassOnElement(submenu, this.tailwind.align.right, true);

        setTimeout(
          () => toggleClassOnElement(submenu, this.tailwind.hidden),
          500,
        );
      });

      setTimeout(() => {
        toggleClassOnElement(this.mobileMenu, this.tailwind.hide.top);
        toggleClassOnElement(this.mobileMenu, this.tailwind.align.top, true);
        toggleClassOnElement(this.mobileMenu, this.tailwind.height.full);
        toggleClassOnElement(
          this.mobileMenu,
          this.tailwind.height.screen,
          true,
        );
        toggleClassOnElement(this.mobileMenu, this.tailwind.zindex[10], true);
        toggleClassOnElement(this.mobileMenu, this.tailwind.align.top, true);
      }, 500);
    } else {
      toggleClassOnElement(this.mobileMenu, this.tailwind.hide.top);
      toggleClassOnElement(this.mobileMenu, this.tailwind.align.top, true);
      toggleClassOnElement(this.mobileMenu, this.tailwind.height.full);
      toggleClassOnElement(this.mobileMenu, this.tailwind.height.screen, true);
      toggleClassOnElement(this.mobileMenu, this.tailwind.zindex[10], true);
      toggleClassOnElement(this.mobileMenu, this.tailwind.align.top, true);
    }

    toggleClassOnElement(navbar, "opened-mobile-menu", true);
    toggleClassOnElement(
      document.querySelector("body"),
      "opened-mobile-menu",
      true,
    );
  }

  #handleOpenMobileMenu(target) {
    if (!this.mobileSubmenusLoaded) {
      return;
    }
    const navbar = document.querySelector("#navbar");
    const navbarItem = target.closest(".navbar-item--mobile");
    let submenu = document.querySelector(
      '.submenu--mobile[data-index="' + navbarItem.dataset.submenuIndex + '"]',
    );

    if (!submenu) {
      console.error(
        "No submenu found for index:",
        navbarItem.dataset.submenuIndex,
      );
      return;
    }
    toggleClassOnElement(submenu, this.tailwind.hidden, true);

    setTimeout(() => {
      toggleClassOnElement(submenu, this.tailwind.align.right);
      toggleClassOnElement(submenu, this.tailwind.hide.right, true);

      // is submenu higher than the viewport?
      if (submenu.offsetHeight > window.innerHeight) {
        if (this.preScrollPosition !== false) {
          submenu.scrollTop = 0;
        }
      }
    }, 100);

    submenu.querySelector(".button--back").addEventListener("click", () => {
      toggleClassOnElement(submenu, this.tailwind.align.right, true);
      toggleClassOnElement(submenu, this.tailwind.hide.right);

      setTimeout(() => {
        toggleClassOnElement(submenu, this.tailwind.hidden);
      }, 500);
    });
  }
}

export default Menu;
