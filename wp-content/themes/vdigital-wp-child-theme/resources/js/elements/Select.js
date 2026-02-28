import { closeAllSelects } from "../functions/forms";

export default class Select {
  constructor(wrapper) {
    if (wrapper === undefined) {
      this.wrappers = document.querySelectorAll(".input__select");
    } else {
      this.wrappers = [wrapper];
    }

    if (this.wrappers.length > 0) {
      this.init();
    }
  }

  #getContainLayoutOffset(element) {
    const viewportWidth = window.innerWidth;
    if (viewportWidth >= 1024 && viewportWidth <= 1400) {
      let ancestor = element.parentElement;
      while (ancestor && ancestor !== document.body) {
        const style = getComputedStyle(ancestor);
        if (style.contain && style.contain.includes("layout")) {
          const containerRect = ancestor.getBoundingClientRect();
          return { left: containerRect.left, top: containerRect.top };
        }
        ancestor = ancestor.parentElement;
      }
    }
    return { left: 0, top: 0 };
  }

  #positionOptions(options, selected, wrapper) {
    if (!options || !selected || !wrapper) {
      return;
    }

    const zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
    const rect = selected.getBoundingClientRect();

    options.style.width = `${rect.width / zoom}px`;
    options.style.left = `${rect.left / zoom}px`;

    const optionsRect = options.getBoundingClientRect();
    const optionsHeight = optionsRect.height;

    // Use stored flip state to determine position
    if (options.__openUpTop) {
      // if open to top add 2 px
      const top = (rect.top - optionsHeight) / zoom + 2;
      options.style.top = `${top}px`;
    } else {
      // Applying -3px since it should overlap with the bottom border of the select
      const top = rect.bottom / zoom - 3;
      options.style.top = `${top}px`;
    }
  }

  #calculateInitialPosition(options, selected, wrapper) {
    if (!options || !selected || !wrapper) {
      return;
    }

    const zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
    const rect = selected.getBoundingClientRect();

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const margin = 8;

    options.style.width = `${rect.width / zoom}px`;
    options.style.left = `${rect.left / zoom}px`;

    // Reset flip state
    wrapper.classList.remove("select--open-up-top");
    options.classList.remove("select-items--open-up-top");
    options.__openUpTop = false;

    // Applying -3px since it should overlap with the bottom border of the select
    let top = rect.bottom / zoom - 3;
    options.style.top = `${top}px`;

    const optionsRect = options.getBoundingClientRect();
    const optionsHeight = optionsRect.height;
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;

    const needsFlip = optionsHeight > spaceBelow - margin;

    if (needsFlip && spaceAbove > spaceBelow) {
      wrapper.classList.add("select--open-up-top");
      options.classList.add("select-items--open-up-top");
      options.__openUpTop = true;
      // if open to top add 2 px
      const top = (rect.top - optionsHeight) / zoom + 2;
      options.style.top = `${top}px`;
    }
  }

  #setOptionsOpen(options, selected, wrapper) {
    if (!options || !selected || !wrapper) {
      return;
    }

    options.classList.remove("select-hide");
    selected.classList.add("select-arrow-active");

    this.#calculateInitialPosition(options, selected, wrapper);

    if (!options.__selectPositionHandler) {
      options.__selectPositionHandler = () => {
        if (options.classList.contains("select-hide")) {
          return;
        }

        window.requestAnimationFrame(() => {
          if (options.classList.contains("select-hide")) {
            return;
          }

          this.#positionOptions(options, selected, wrapper);
        });
      };
    }

    window.addEventListener("resize", options.__selectPositionHandler);
    window.addEventListener(
      "orientationchange",
      options.__selectPositionHandler,
    );
    window.addEventListener("scroll", options.__selectPositionHandler, true);
  }

  #setOptionsClosed(options, selected, wrapper) {
    if (!options || !selected || !wrapper) {
      return;
    }

    options.classList.add("select-hide");
    selected.classList.remove("select-arrow-active");
    wrapper.classList.remove("select--open-up-top");

    if (options.__selectPositionHandler) {
      window.removeEventListener("resize", options.__selectPositionHandler);
      window.removeEventListener(
        "orientationchange",
        options.__selectPositionHandler,
      );
      window.removeEventListener(
        "scroll",
        options.__selectPositionHandler,
        true,
      );
    }
  }

  init() {
    this.wrappers.forEach((wrapper) => {
      if (wrapper === undefined) {
        return;
      }
      wrapper._selectInstance = this;
      const select = wrapper.querySelector("select");

      const selected = this.#createSelectedItem(select);
      const options = this.#createOptionsList(select, selected, wrapper);

      wrapper.appendChild(selected);
      // options is now appended to body in #createOptionsList
      wrapper.__selectOptions = options;

      selected.addEventListener("click", (event) => {
        event.stopPropagation();
        this.closeAllSelects(selected);

        if (options.classList.contains("select-hide")) {
          this.#setOptionsOpen(options, selected, wrapper);
        } else {
          this.#setOptionsClosed(options, selected, wrapper);
        }
      });
    });

    document.addEventListener("click", this.closeAllSelects);
  }

  #createSelectedItem(select) {
    const selected = document.createElement("div");
    selected.className = "select-selected";
    selected.textContent = select.options[select.selectedIndex].textContent;
    return selected;
  }

  #createOptionsList(select, selected, wrapper) {
    const optionsWrapper = document.createElement("div");
    optionsWrapper.className = "select-items select-hide";

    // Store reference to wrapper for positioning and cleanup
    optionsWrapper.__selectWrapper = wrapper;
    optionsWrapper.__selectSelected = selected;

    // Detect theme from wrapper or ancestors
    const isLightTheme = this.#detectLightTheme(wrapper);
    if (isLightTheme) {
      optionsWrapper.classList.add("select-items--light");
    }

    // Detect if inside popup and apply higher z-index
    if (wrapper.closest(".salesforce_popup")) {
      optionsWrapper.classList.add("select-items--in-popup");
    }

    Array.from(select.options).forEach((option, index) => {
      if (option.disabled) {
        return;
      }

      const optionDiv = document.createElement("div");
      optionDiv.textContent = option.textContent;

      optionDiv.addEventListener("click", () => {
        this.#updateSelect(select, selected, optionsWrapper, index);
      });

      optionsWrapper.appendChild(optionDiv);
    });

    // Append to body instead of wrapper so it can overlay footer
    document.body.appendChild(optionsWrapper);

    return optionsWrapper;
  }

  #detectLightTheme(wrapper) {
    // Check if wrapper or any ancestor has on_white class or light theme indicators
    let element = wrapper;
    while (element && element !== document.body) {
      if (
        element.classList.contains("on_white") ||
        element.classList.contains("form-block--light") ||
        element.classList.contains("salesforce_popup")
      ) {
        return true;
      }
      // Check for dark background block containing light form
      if (
        element.classList.contains("block__background--light") &&
        wrapper.closest(".form-block--dark")
      ) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  #updateSelect(
    select,
    selected,
    optionsWrapper,
    optionIndex,
    triggerClick = true,
  ) {
    select.selectedIndex = optionIndex;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    selected.textContent = select.options[optionIndex].textContent;

    // Add class when non-initial option is selected (index > 0)
    if (optionIndex > 0) {
      selected.classList.add("select-selected--has-value");
    } else {
      selected.classList.remove("select-selected--has-value");
    }

    optionsWrapper
      .querySelectorAll(".same-as-selected")
      .forEach((el) => el.classList.remove("same-as-selected"));

    optionsWrapper.children[optionIndex].classList.add("same-as-selected");

    if (triggerClick) {
      selected.click();
    }
  }

  closeAllSelects(current) {
    document.querySelectorAll(".select-items").forEach((list) => {
      if (list.__selectSelected !== current) {
        list.classList.add("select-hide");
        list.classList.remove("select-items--open-up-top");

        if (list.__selectWrapper) {
          list.__selectWrapper.classList.remove("select--open-up-top");
        }

        if (list.__selectPositionHandler) {
          window.removeEventListener("resize", list.__selectPositionHandler);
          window.removeEventListener(
            "orientationchange",
            list.__selectPositionHandler,
          );
          window.removeEventListener(
            "scroll",
            list.__selectPositionHandler,
            true,
          );
        }
      }
    });

    document.querySelectorAll(".select-selected").forEach((selected) => {
      if (selected !== current) {
        selected.classList.remove("select-arrow-active");
      }
    });
  }

  /**
   * Public method to select an option programmatically. Option index is zero-based.
   * Example usage:
   * const selectWrapper = document.querySelector(".input__select");
   * selectWrapper._selectInstance.selectOption(selectWrapper, 2); // Selects the third option
   *
   * @param {*} wrapperElement
   * @param {*} optionIndex
   */
  selectOption(wrapperElement, optionIndex) {
    const select = wrapperElement.querySelector("select");
    const selected = wrapperElement.querySelector(".select-selected");
    const optionsWrapper = wrapperElement.__selectOptions;

    if (select && selected && optionsWrapper && select.options[optionIndex]) {
      this.#updateSelect(select, selected, optionsWrapper, optionIndex, false);
    }
  }

  /**
   * Public method to select an option programmatically by its value.
   * Example usage:
   * const selectWrapper = document.querySelector(".input__select");
   * selectWrapper._selectInstance.selectByValue(selectWrapper, "my-value"); // Selects the third option
   *
   * @param {*} wrapperElement
   * @param {*} optionIndex
   */
  selectByValue(wrapperElement, value) {
    const select = wrapperElement.querySelector("select");
    const optionIndex = Array.from(select.options).findIndex(
      (option) => option.value === value,
    );

    if (optionIndex !== -1) {
      this.selectOption(wrapperElement, optionIndex);
    }
  }
}
