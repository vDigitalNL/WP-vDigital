class MarketplaceOverview {
  constructor() {
    this.html = document.querySelector("html");
    this.events();
    this.initMobileSelect();
  }

  initMobileSelect() {
    const selectWrapper = document.querySelector(
      ".marketplace__filters__select",
    );
    if (selectWrapper && window.Select) {
      new window.Select(selectWrapper);
    }
  }

  events() {
    document.querySelectorAll(".marketplace").forEach((marketplace) => {
      const showMoreButton = marketplace.querySelector(
        ".marketplace__show-more",
      );
      const container = marketplace.querySelector(".marketplace__container");

      if (showMoreButton) {
        showMoreButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.#loadMore(marketplace, container, showMoreButton);
        });
      }

      marketplace
        .querySelectorAll(".marketplace__filters__category")
        .forEach((categoryButton) => {
          categoryButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.#filter(
              marketplace,
              container,
              categoryButton,
              showMoreButton,
            );
          });
        });

      const selectInput = marketplace.querySelector(
        ".marketplace__filters__select-input",
      );
      if (selectInput) {
        selectInput.addEventListener("change", (e) => {
          const selectedOption = e.target.options[e.target.selectedIndex];
          const categoryData = {
            dataset: {
              category: selectedOption.value,
              categoryTitle:
                selectedOption.getAttribute("data-category-title") || "",
              categoryDescription:
                selectedOption.getAttribute("data-category-description") || "",
              categoryImage:
                selectedOption.getAttribute("data-category-image") || "",
            },
          };
          this.#filter(marketplace, container, categoryData, showMoreButton);
        });
      }

      const selectWrapper = marketplace.querySelector(
        ".marketplace__filters__select",
      );
      if (selectWrapper) {
        selectWrapper.addEventListener("click", (e) => {
          if (
            e.target.classList.contains("select-items") ||
            e.target.parentElement.classList.contains("select-items")
          ) {
            setTimeout(() => {
              const changeEvent = new Event("change", { bubbles: true });
              if (selectInput) {
                selectInput.dispatchEvent(changeEvent);
              }
            }, 50);
          }
        });
      }

      const urlParams = new URLSearchParams(window.location.search);
      const categoryId = urlParams.get("category");

      if (categoryId != null) {
        const categoryButton = marketplace.querySelector(
          '.marketplace__filters__category[data-category="' + categoryId + '"]',
        );
        if (categoryButton) {
          this.#filter(marketplace, container, categoryButton, showMoreButton);
        }
      }
    });
  }

  fetchPosts(action, category, offset = 0) {
    const url = `/${this.html.dataset.lang}/wp-content/themes/vdigital-wp-child-theme/ajax.php`;
    const init = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action,
        category,
        offset,
        nonce: nonces.ajax,
      }),
    };

    return fetch(url, init)
      .then((response) => response.json())
      .catch((error) => console.error(error));
  }

  #loadMore(marketplace, container, showMoreButton) {
    const wrapper = marketplace.querySelector(
      ".marketplace__show-more-wrapper",
    );

    const currentPostCount =
      container.querySelectorAll(".marketplace__card").length;

    this.fetchPosts(
      "fetch_marketplace_posts",
      showMoreButton.dataset.category,
      currentPostCount,
    )
      .then((data) => {
        if (data && data.html) {
          const existingMissingTile = container.querySelector(
            ".marketplace__missing-connection",
          );
          const missingTileHtml = existingMissingTile
            ? existingMissingTile.outerHTML
            : null;

          if (existingMissingTile) {
            existingMissingTile.remove();
          }

          container.insertAdjacentHTML("beforeend", data.html);

          if (missingTileHtml) {
            container.insertAdjacentHTML("beforeend", missingTileHtml);
          }

          if (window.popupTriggers) {
            window.popupTriggers.reinitializePopupButtons(container);
          }
        }

        // Show/hide button based on if there are more posts
        if (data.more) {
          wrapper.classList.remove("tw-hidden");
        } else {
          wrapper.classList.add("tw-hidden");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  #filter(marketplace, container, categoryButton, showMoreButton) {
    this.#activateCategoryButton(marketplace, categoryButton);
    this.#updateMobileSelect(marketplace, categoryButton);

    const categoryId = categoryButton.dataset.category;
    const categoryTitle = categoryButton.dataset.categoryTitle || "";
    const categoryDescription =
      categoryButton.dataset.categoryDescription || "";
    const categoryImage = categoryButton.dataset.categoryImage || "";

    const categoryInfoSection = marketplace.querySelector(
      ".marketplace__category-info",
    );
    if (categoryInfoSection) {
      const titleEl = categoryInfoSection.querySelector(
        ".marketplace__category-info__title",
      );
      const descEl = categoryInfoSection.querySelector(
        ".marketplace__category-info__description",
      );
      const imageEl = categoryInfoSection.querySelector(
        ".marketplace__category-info__image",
      );

      if (titleEl) titleEl.textContent = categoryTitle;
      if (descEl) {
        descEl.innerHTML = categoryDescription;
      }
      if (imageEl) {
        const imageContainer = imageEl.parentElement;
        const baseClasses =
          "marketplace__category-info__image tw-w-full tw-max-h-[400px] md:tw-h-[400px] md:tw-object-cover tw-h-auto tw-rounded-[20px]";
        if (categoryImage) {
          imageEl.src = categoryImage;
          imageEl.alt = categoryTitle;
          imageEl.className = baseClasses;
          if (imageContainer) {
            imageContainer.classList.remove("tw-hidden");
          }
        } else {
          imageEl.className = baseClasses;
          if (imageContainer) {
            imageContainer.classList.add("tw-hidden");
          }
        }
      }

      // Show/hide entire section based on whether there's any content
      const hasContent = categoryTitle || categoryDescription || categoryImage;
      if (hasContent) {
        categoryInfoSection.classList.remove("tw-hidden");
      } else {
        categoryInfoSection.classList.add("tw-hidden");
      }
    }

    this.fetchPosts("fetch_marketplace_posts", categoryId, 0).then((data) => {
      container.innerHTML = data.html;

      if (window.popupTriggers) {
        window.popupTriggers.reinitializePopupButtons(container);
      }

      const wrapper = marketplace.querySelector(
        ".marketplace__show-more-wrapper",
      );

      if (showMoreButton && wrapper) {
        showMoreButton.dataset.category = categoryId;

        // Reset button state
        showMoreButton.classList.remove("tw-hidden");
        showMoreButton.disabled = false;

        // Show/hide wrapper based on if there are more posts
        if (data.more) {
          wrapper.classList.remove("tw-hidden");
        } else {
          wrapper.classList.add("tw-hidden");
        }
      }
    });
  }

  #activateCategoryButton(marketplace, categoryButton) {
    marketplace
      .querySelectorAll(".marketplace__filters__category")
      .forEach((button) => {
        button.classList.remove("button--blue");
        button.classList.add("button--outline");
      });

    if (categoryButton.classList) {
      categoryButton.classList.add("button--blue");
      categoryButton.classList.remove("button--outline");
    }
  }

  #updateMobileSelect(marketplace, categoryButton) {
    const selectInput = marketplace.querySelector(
      ".marketplace__filters__select-input",
    );
    if (selectInput) {
      const categoryId = categoryButton.dataset.category;
      const option = selectInput.querySelector(`option[value="${categoryId}"]`);
      if (option) {
        selectInput.value = categoryId;
        const selectedDiv =
          selectInput.parentElement.querySelector(".select-selected");
        if (selectedDiv) {
          selectedDiv.textContent = option.textContent;
        }
      }
    }
  }
}

new MarketplaceOverview();
