import { toggleClassOnElement } from "../../../resources/js/helpers/CssClasses";

class StepsBlock {
  constructor() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setup();
    });
  }

  #getZoomFactor(el) {
    if (!el) {
      return 1;
    }

    const rect = el.getBoundingClientRect();
    const offsetWidth = el.offsetWidth || el.clientWidth;

    if (!offsetWidth) {
      return 1;
    }

    const factor = rect.width / offsetWidth;
    return factor > 0 ? factor : 1;
  }

  #prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }

  #setPanelsWrapperHeight(block, heightPx) {
    const panelsWrapper = block.querySelector(".steps-block__panels");
    if (!panelsWrapper) {
      return;
    }

    panelsWrapper.style.height = `${Math.max(0, heightPx)}px`;
  }

  #measurePanelHeight(panel) {
    if (!panel) {
      return 0;
    }

    if (panel.offsetHeight) {
      return panel.offsetHeight;
    }

    const rectHeight = panel.getBoundingClientRect().height;
    const zoomFactor =
      this.#getZoomFactor(panel) || this.#getZoomFactor(document.body);

    return zoomFactor ? rectHeight / zoomFactor : rectHeight;
  }

  #observeActivePanelHeight(block, state, activePanel) {
    if (!block || !state || !activePanel) {
      return;
    }

    if (state.panelResizeObserver) {
      state.panelResizeObserver.disconnect();
      state.panelResizeObserver = null;
    }

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    state.panelResizeObserver = new ResizeObserver(() => {
      const height = this.#measurePanelHeight(activePanel);
      if (height > 0) {
        this.#setPanelsWrapperHeight(block, height);
      }
    });

    state.panelResizeObserver.observe(activePanel);
  }

  setup() {
    this.blocks = document.querySelectorAll(".steps-block");

    this.blocks.forEach((block) => {
      const navItems = block.querySelectorAll(".steps-block__nav-item");
      const panels = block.querySelectorAll(".steps-block__panel");

      if (navItems.length === 0 || panels.length === 0) {
        return;
      }

      const state = {
        activeIndex: 0,
        userInteracted: false,
        intervalId: null,
        progressRaf: null,
        progressStart: null,
        progressDurationMs: 5500,
        panelResizeObserver: null,
        isProgrammaticScroll: false,
      };

      navItems.forEach((item) => {
        item.addEventListener("click", () => {
          const index = Number.parseInt(item.dataset.stepIndex, 10);
          if (Number.isNaN(index)) {
            return;
          }

          this.activateByUserInteraction(block, navItems, panels, state, index);
        });
      });

      this.activate(block, navItems, panels, state, 0);

      let started = false;
      const autoStartObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (entry.isIntersecting && !started) {
            started = true;
            this.#startAutoAdvance(block, navItems, panels, state);
            autoStartObserver.disconnect();
          }
        },
        {
          threshold: 0.5,
        },
      );

      autoStartObserver.observe(block);

      // Fallback for late-loading images/fonts affecting height.
      window.addEventListener("load", () => {
        const activePanel = block.querySelector(
          `.steps-block__panel[data-step-panel="${state.activeIndex}"]`,
        );
        this.#setPanelsWrapperHeight(
          block,
          this.#measurePanelHeight(activePanel),
        );
      });

      window.addEventListener("resize", () => {
        this.#syncMobileSegments(block, navItems);

        const activePanel = block.querySelector(
          `.steps-block__panel[data-step-panel="${state.activeIndex}"]`,
        );
        this.#setPanelsWrapperHeight(
          block,
          this.#measurePanelHeight(activePanel),
        );
      });

      const scrollContainer = block.querySelector(".steps-block__nav-scroll");
      const mobileItems = Array.from(
        block.querySelectorAll(".steps-block__nav-item--mobile"),
      );

      let lastActivatedIndex = state.activeIndex;
      let observerStarted = false;
      let observer;

      const startObserver = () => {
        if (observerStarted) return;
        observerStarted = true;

        observer = new IntersectionObserver(
          (entries) => {
            if (state.isProgrammaticScroll) return;

            const visible = entries
              .filter((e) => e.isIntersecting)
              .map((e) => Number(e.target.dataset.stepIndex))
              .filter((i) => !Number.isNaN(i))
              .sort((a, b) => a - b);

            if (!visible.length) return;

            const nextIndex = visible[visible.length - 1];

            if (nextIndex !== lastActivatedIndex) {
              lastActivatedIndex = nextIndex;

              this.activateByUserInteraction(
                block,
                navItems,
                panels,
                state,
                nextIndex,
              );
            }
          },
          {
            root: scrollContainer,
            threshold: 0.8,
          },
        );

        mobileItems.forEach((item) => observer.observe(item));
      };

      scrollContainer.addEventListener(
        "scroll",
        () => {
          startObserver();
        },
        { once: true }, // ← IMPORTANT
      );
    });
  }

  activateByUserInteraction(block, navItems, panels, state, index) {
    state.userInteracted = true;
    this.#stopAutoAdvance(block, state);

    this.activate(block, navItems, panels, state, index);

    // Reset base mobile segments that haven't been completed yet.
    const mobileSegments = block.querySelectorAll(
      ".steps-block__line-segment--mobile",
    );
    mobileSegments.forEach((seg, idx) => {
      if (idx >= state.activeIndex) {
        seg.style.background = "#20a4ff";
      }

      if (
        seg.parentElement.classList.contains("is-visited") &&
        !seg.parentElement.classList.contains("is-active")
      ) {
        seg.style.background = "#ffffff";
      }
    });
  }

  activate(block, navItems, panels, state, nextIndex) {
    if (nextIndex < 0 || nextIndex >= panels.length) {
      return;
    }

    const prevIndex = state.activeIndex;
    const goingForward = nextIndex > prevIndex;
    const transitionDuration = 400;

    panels.forEach((panel, index) => {
      const isTarget = index === nextIndex;
      const wasPrevActive = index === prevIndex && prevIndex !== nextIndex;

      if (isTarget) {
        // Remove hidden, prepare entering position.
        toggleClassOnElement(panel, "tw-hidden", true);
        panel.classList.remove(
          "is-leaving",
          "is-leaving-to-top",
          "is-leaving-to-bottom",
        );

        // Set initial entering position (off-screen).
        if (goingForward) {
          panel.classList.add("is-entering-from-bottom");
        } else {
          panel.classList.add("is-entering-from-top");
        }

        // Force reflow so the browser registers the starting position.
        void panel.offsetWidth;

        // Activate and remove entering class to trigger transition.
        panel.classList.add("is-active");
        panel.classList.remove(
          "is-entering-from-bottom",
          "is-entering-from-top",
        );

        const nextHeight = this.#measurePanelHeight(panel);
        this.#setPanelsWrapperHeight(block, nextHeight);

        this.#observeActivePanelHeight(block, state, panel);

        return;
      }

      if (wasPrevActive) {
        // Animate out the previous panel.
        panel.classList.remove("is-active");
        panel.classList.add("is-leaving");

        if (goingForward) {
          panel.classList.add("is-leaving-to-top");
        } else {
          panel.classList.add("is-leaving-to-bottom");
        }

        // Hide after transition completes.
        window.setTimeout(() => {
          toggleClassOnElement(panel, "tw-hidden");
          panel.classList.remove(
            "is-leaving",
            "is-leaving-to-top",
            "is-leaving-to-bottom",
          );
        }, transitionDuration);

        return;
      }

      // All other panels stay hidden.
      toggleClassOnElement(panel, "tw-hidden");
      panel.classList.remove(
        "is-active",
        "is-leaving",
        "is-leaving-to-top",
        "is-leaving-to-bottom",
      );
    });

    navItems.forEach((item) => {
      const itemIndex = Number.parseInt(item.dataset.stepIndex, 10);
      const isVisited = itemIndex <= nextIndex;
      const isActive = itemIndex === nextIndex;

      item.classList.toggle("is-visited", isVisited);
      item.classList.toggle("is-active", isActive);
      item.classList.toggle("is-unvisited", !isVisited);
    });

    state.activeIndex = nextIndex;

    const mobileNavItems = block.querySelectorAll(
      ".steps-block__nav-item--mobile",
    );
    if (mobileNavItems[nextIndex] && state.userInteracted == false) {
      this.#scrollMobileNavIntoView(block, mobileNavItems[nextIndex], state);
    }
    this.#syncMobileSegments(block, navItems);

    const paginationItems = block.querySelectorAll(
      ".steps-block__pagination-item",
    );
    paginationItems.forEach((item) => {
      const itemIndex = Number.parseInt(item.dataset.stepIndex, 10);
      item.classList.toggle("is-active", itemIndex === nextIndex);
    });
    this.#setProgressBarHeight(navItems, nextIndex);
  }

  #setProgressBarHeight(navItems, nextIndex) {
    document
      .querySelectorAll(
        ".steps-block__nav-item:not(.steps-block__nav-item--mobile)",
      )
      .forEach((item) => {
        const itemIndex = Number.parseInt(item.dataset.stepIndex, 10);
        const nextItem = navItems[itemIndex + 1];

        nextItem.style.removeProperty("--before-height");
        if (itemIndex === nextIndex && itemIndex < navItems.length - 1) {
          let height = 96;
          const zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
          const rectHeight = item.getBoundingClientRect().height / zoom;

          if (rectHeight > 96) {
            height = rectHeight;
          }

          nextItem.style.setProperty("--before-height", height + "px");
        }
      });
  }

  #startAutoAdvance(block, navItems, panels, state) {
    if (state.userInteracted) {
      return;
    }

    this.#startProgress(block, navItems, state, () => {
      // Callback when line animation completes
      if (state.userInteracted) {
        return;
      }

      const nextIndex = state.activeIndex + 1;
      if (nextIndex >= panels.length) {
        this.#stopAutoAdvance(block, state);
        return;
      }

      this.activate(block, navItems, panels, state, nextIndex);
      this.#startAutoAdvance(block, navItems, panels, state);
    });
  }

  #stopAutoAdvance(block, state) {
    if (state.intervalId != null) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }

    if (state.progressRaf != null) {
      cancelAnimationFrame(state.progressRaf);
      state.progressRaf = null;
    }

    state.progressStart = null;

    if (!block) {
      return;
    }

    const progressEls = block.querySelectorAll(
      ".steps-block__nav-item-line-progress",
    );
    progressEls.forEach((el) => {
      el.style.height = "0";
    });

    const mobileProgressEls = block.querySelectorAll(
      ".steps-block__line-segment-progress--mobile",
    );
    mobileProgressEls.forEach((el) => {
      el.style.width = "0";
    });
  }

  #startProgress(block, navItems, state, onComplete = null) {
    const nextIndex = state.activeIndex + 1;
    if (nextIndex >= navItems.length) {
      return;
    }

    const desktopItems = block.querySelectorAll(
      ".steps-block__nav-desktop .steps-block__nav-item",
    );
    const mobileItems = block.querySelectorAll(
      ".steps-block__nav-item--mobile",
    );

    const nextDesktopItem = desktopItems[nextIndex];
    const progressEl = nextDesktopItem?.querySelector(
      ".steps-block__nav-item-line-progress",
    );

    // Get the current segment's progress element (segment flows from current to next)
    const currentMobileItem = mobileItems[state.activeIndex];
    const nextMobileItem = mobileItems[nextIndex];
    const progressElMobile = currentMobileItem?.querySelector(
      `.steps-block__line-segment-progress--mobile[data-segment-index="${state.activeIndex}"]`,
    );

    // Reset the progress bars for this block when starting a new run.
    const progressEls = block.querySelectorAll(
      ".steps-block__nav-item-line-progress",
    );
    progressEls.forEach((el) => {
      el.style.height = "0";
    });

    const mobileProgressEls = block.querySelectorAll(
      ".steps-block__line-segment-progress--mobile",
    );
    mobileProgressEls.forEach((el) => {
      el.style.width = "0";
    });

    // Reset base mobile segments that haven't been completed yet.
    const mobileSegments = block.querySelectorAll(
      ".steps-block__line-segment--mobile",
    );
    mobileSegments.forEach((seg, idx) => {
      if (idx >= state.activeIndex) {
        seg.style.background = "#20a4ff";
      }
    });

    const update = (time) => {
      if (state.progressStart == null) {
        state.progressStart = time;
      }

      const elapsed = time - state.progressStart;
      const t = Math.min(elapsed / state.progressDurationMs, 1);

      // Animate desktop progress line to 96px (filling from top to bottom to reach previous circle)
      if (progressEl) {
        const height = getComputedStyle(progressEl.parentElement)
          .getPropertyValue("--before-height")
          .trim();

        progressEl.style.top = `-${parseFloat(height)}px`;
        progressEl.style.height = `${parseFloat(height) * t}px`;
      }

      // Animate mobile segment progress line (filling from left to right to reach next circle)
      if (progressElMobile && currentMobileItem && nextMobileItem) {
        this.#setMobileSegmentProgress(
          block,
          currentMobileItem,
          nextMobileItem,
          progressElMobile,
          t,
        );
      }

      if (t < 1 && !state.userInteracted) {
        state.progressRaf = requestAnimationFrame(update);
      } else if (t >= 1) {
        // When mobile progress completes, update the base segment to white.
        if (currentMobileItem) {
          const baseSegment = currentMobileItem.querySelector(
            `.steps-block__line-segment--mobile[data-segment-index="${state.activeIndex}"]`,
          );
          if (baseSegment) {
            baseSegment.style.background = "#ffffff";
          }
        }

        if (onComplete) {
          onComplete();
        }
      }
    };

    state.progressStart = null;
    if (state.progressRaf != null) {
      cancelAnimationFrame(state.progressRaf);
    }
    state.progressRaf = requestAnimationFrame(update);
  }

  #scrollMobileNavIntoView(block, targetItem, state) {
    if (!targetItem) {
      return;
    }

    const scrollContainer = block.querySelector(".steps-block__nav-scroll");
    if (!scrollContainer) {
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = targetItem.getBoundingClientRect();

    const leftOverflow = targetRect.left < containerRect.left;
    const rightOverflow = targetRect.right > containerRect.right;

    if (!leftOverflow && !rightOverflow) {
      return;
    }

    const diff =
      targetRect.left - containerRect.left + scrollContainer.scrollLeft - 24;

    if (state) state.isProgrammaticScroll = true;

    scrollContainer.scrollTo({
      left: diff,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      if (state) state.isProgrammaticScroll = false;
    }, 350);
  }

  #setMobileSegmentProgress(block, currentItem, nextItem, progressEl, t) {
    if (!progressEl || !currentItem || !nextItem) {
      return;
    }

    const currentBullet = currentItem.querySelector(
      ".steps-block__bullet--mobile",
    );
    const nextBullet = nextItem.querySelector(".steps-block__bullet--mobile");

    if (!currentBullet || !nextBullet) {
      return;
    }

    const currentRect = currentBullet.getBoundingClientRect();
    const nextRect = nextBullet.getBoundingClientRect();

    // Calculate the distance from the end of current bullet to the start of next bullet
    const segmentWidth = nextRect.left - (currentRect.left + currentRect.width);

    progressEl.style.width = `${Math.max(0, segmentWidth * t)}px`;
    progressEl.style.height = "1px";
  }

  #syncMobileSegments(block, navItems) {
    const mobileItems = block.querySelectorAll(
      ".steps-block__nav-item--mobile",
    );

    mobileItems.forEach((item, index) => {
      if (index >= mobileItems.length - 1) {
        return;
      }

      const currentBullet = item.querySelector(".steps-block__bullet--mobile");
      const nextItem = mobileItems[index + 1];
      const nextBullet = nextItem?.querySelector(
        ".steps-block__bullet--mobile",
      );

      if (!currentBullet || !nextBullet) {
        return;
      }

      const segment = item.querySelector(
        `.steps-block__line-segment--mobile[data-segment-index="${index}"]`,
      );

      if (!segment) {
        return;
      }

      const currentRect = currentBullet.getBoundingClientRect();
      const nextRect = nextBullet.getBoundingClientRect();

      // Calculate the distance from the end of current bullet to the start of next bullet
      const segmentWidth =
        nextRect.left - (currentRect.left + currentRect.width);

      segment.style.width = `${Math.max(0, segmentWidth)}px`;
    });
  }
}

new StepsBlock();
