class Overview {
  constructor() {
    this.html = document.querySelector("html");
    this.events();
  }

  events() {
    document.querySelectorAll(".overview").forEach((overview) => {
      const loadMoreButton = overview.querySelector(".overview__load-more");
      const loader = overview.querySelector(".overview__loader");
      const container = overview.querySelector(".overview__container");
      const mobileFilterContainer = overview.querySelector(
        ".overview__filters__mob",
      );
      const mobileFilterSelect = overview.querySelector(
        ".overview__filters__mob select",
      );

      loadMoreButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.#loadMore(overview, container, loadMoreButton, loader);
      });

      overview
        .querySelectorAll(".overview__filters__category")
        .forEach((categoryButton) => {
          categoryButton.addEventListener("click", () => {
            this.#filter(overview, container, categoryButton, loadMoreButton);
            mobileFilterContainer._selectInstance.selectByValue(
              mobileFilterContainer,
              categoryButton.dataset.category,
            );
          });
        });

      mobileFilterSelect.addEventListener("change", (e) => {
        const categoryId = mobileFilterSelect.value;
        this.#filter(
          overview,
          container,
          overview.querySelector(
            '.overview__filters__category[data-category="' + categoryId + '"]',
          ),
          loadMoreButton,
        );
      });

      const urlParams = new URLSearchParams(window.location.search);
      const categoryId = urlParams.get("category");

      if (categoryId != null) {
        this.#filter(
          overview,
          container,
          overview.querySelector(
            '.overview__filters__category[data-category="' + categoryId + '"]',
          ),
          loadMoreButton,
        );
      }
    });
  }

  fetchPosts(action, overviewElement, category, offset = 0) {
    const url = `/${this.html.dataset.lang}/wp-content/themes/vdigital-wp-child-theme/ajax.php`;
    const init = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action,
        theme: "vdigital-wp-child-theme__vdigital-wp-base-theme",
        post_type: overviewElement.dataset.postType,
        highlightedPost: overviewElement.dataset.highlightedPost,
        offset,
        category,
        nonce: nonces.ajax,
      }),
    };

    return fetch(url, init)
      .then((response) => response.json())
      .catch((error) => console.error(error));
  }

  #loadMore(overview, container, loadMoreButton, loader) {
    let morePosts = true;
    loadMoreButton.classList.add("tw-hidden");
    loader.classList.remove("tw-hidden");

    this.fetchPosts(
      "fetch_more_posts",
      overview,
      loadMoreButton.dataset.category,
      loadMoreButton.dataset.offset,
    )
      .then((data) => {
        container.insertAdjacentHTML("beforeend", data.html);
        loadMoreButton.dataset.offset = data.offset;

        if (!data.more) {
          morePosts = false;
        }
      })
      .finally(() => {
        if (morePosts) {
          loadMoreButton.classList.remove("tw-hidden");
        }
        loader.classList.add("tw-hidden");
      });
  }

  #filter(overview, container, categoryButton, loadMoreButton) {
    this.#activateCategoryButton(overview, categoryButton);

    overview.style.height = window.getComputedStyle(overview).height;

    const categoryId = categoryButton.dataset.category;
    // const mobileFilterButton = overview.querySelector(
    //   ".overview__filter-button",
    // );
    // const overviewFilterButtonText = overview.querySelector(
    //   ".overview__filter-button > span",
    // );
    // overviewFilterButtonText.textContent = categoryButton.textContent;

    document
      .querySelectorAll(
        ".overview__container__item:not(.overview_category_" + categoryId + ")",
      )
      .forEach(function (element) {
        element.classList.add("tw-hidden");
      });

    // this.#toggleMobileFilterDropdown(overview, mobileFilterButton);

    overview.querySelector(".overview__no-results").classList.add("tw-hidden");
    overview.querySelectorAll(".overview__filter__item").forEach((item) => {
      if (categoryButton.dataset.category === "all") {
        item.classList.remove("tw-hidden");
        return;
      }

      item.classList.add("tw-hidden");
      if (
        item.classList.contains("category-" + categoryButton.dataset.category)
      ) {
        item.classList.remove("tw-hidden");
      }
    });

    if (parseInt(overview.dataset.showAll) !== 1) {
      this.fetchPosts("fetch_posts", overview, categoryId).then((data) => {
        container.innerHTML = data.html;
        loadMoreButton.dataset.offset = data.offset;
        loadMoreButton.dataset.category = categoryButton.dataset.category;
        loadMoreButton.classList.remove("tw-hidden");
        overview.style.height = "";

        if (!data.more) {
          loadMoreButton.classList.add("tw-hidden");
        }

        this.#showNoResultsText(overview);
      });
    } else {
      overview.style.height = "";
      this.#showNoResultsText(overview);
    }
  }

  #showNoResultsText(overview) {
    const visibleItems = overview.querySelectorAll(
      ".overview__filter__item:not(.tw-hidden)",
    ).length;

    if (visibleItems === 0) {
      overview
        .querySelector(".overview__no-results")
        .classList.remove("tw-hidden");
    }
  }

  #activateCategoryButton(overview, categoryButton) {
    overview
      .querySelectorAll(".overview__filters__category")
      .forEach((button) => {
        button.classList.remove("button--blue");
        button.classList.add("button--outline");
      });

    if (categoryButton && categoryButton.classList) {
      categoryButton.classList.add("button--blue");
      categoryButton.classList.remove("button--outline");
    }
  }

  // #toggleMobileFilterDropdown(overview, mobileFilterButton) {
  //   const dropdown = overview.querySelector(".overview__filters");
  //   const dropdownIcon = mobileFilterButton.querySelector(
  //     ".overview__filter-button__icon",
  //   );
  //   dropdown.classList.toggle("tw-hidden");
  //   dropdownIcon.classList.toggle("tw-rotate-180");
  // }
}

export default Overview;
