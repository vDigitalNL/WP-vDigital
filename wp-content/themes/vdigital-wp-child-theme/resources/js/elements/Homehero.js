class Homehero {
  static PROGRAMMATIC_SCROLL_DURATION = 800;

  constructor() {
    const scrollToContentElement = document.querySelector("#scroll_to_content");
    if (scrollToContentElement) {
      scrollToContentElement.addEventListener("click", (e) => {
        e.preventDefault();
        this.#scrolltoContent();
      });
    }
    window.addEventListener("resize", () => this.#setupWordAnimations());
    this.#setupWordAnimations();
  }

  #setupWordAnimations() {
    this.isMobileViewport = window.matchMedia("(max-width: 1024px)");
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (!this.isMobileViewport.matches || this.prefersReducedMotion.matches) {
      return;
    }

    this.heroElement = document.querySelector(".home-hero");
    this.leftWordElement = this.heroElement?.querySelector(
      ".home-hero__bigword.left",
    );
    this.rightWordElement = this.heroElement?.querySelector(
      ".home-hero__bigword.right",
    );

    if (!this.heroElement || !this.leftWordElement || !this.rightWordElement) {
      return;
    }

    this.startOffsetVw = 11;
    this.startOffsetPx = 46;
    this.endOffsetVw = 6;
    this.endOffsetPx = 10;

    this.isHeroVisible = false;
    this.animationFrameId = 0;

    this.createObserver();
  }

  #scrolltoContent() {
    const homeHeroElement = this.#getHomeHeroElement();
    if (!homeHeroElement) return;

    const targetScrollTop =
      this.#calculateTargetScrollPosition(homeHeroElement);
    this.#performSmoothScroll(targetScrollTop);
  }

  #getHomeHeroElement() {
    return document.querySelector("#home-hero");
  }

  #calculateTargetScrollPosition(homeHeroElement) {
    const homeHeroRect = homeHeroElement.getBoundingClientRect();
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
    let targetScrollTop = currentScrollTop + homeHeroRect.bottom;

    // Adjust for admin bar on mobile
    if (this.#shouldAdjustForAdminBar()) {
      const adminBarHeight = this.#getAdminBarHeight();
      targetScrollTop -= adminBarHeight;
    }

    return targetScrollTop;
  }

  #shouldAdjustForAdminBar() {
    return document.getElementById("wpadminbar") && window.innerWidth > 600;
  }

  #getAdminBarHeight() {
    const adminBar = document.getElementById("wpadminbar");
    return adminBar?.getBoundingClientRect().height || 0;
  }

  #performSmoothScroll(targetScrollTop) {
    window.isProgrammaticScroll = true;

    window.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });

    setTimeout(() => {
      window.isProgrammaticScroll = false;
    }, Homehero.PROGRAMMATIC_SCROLL_DURATION);
  }

  clampBetweenZeroAndOne(value) {
    return Math.max(0, Math.min(1, value));
  }

  calculateScrollProgress() {
    const heroRect = this.heroElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const rawProgress = -heroRect.top / viewportHeight;

    return this.clampBetweenZeroAndOne(rawProgress);
  }

  updateWordPositions = () => {
    this.animationFrameId = 0;
    if (!this.isHeroVisible) return;

    const scrollProgress = this.calculateScrollProgress();

    const currentOffset =
      this.startOffsetVw +
      (this.endOffsetVw - this.startOffsetVw) * scrollProgress;

    this.leftWordElement.style.transform = `translate3d(${-currentOffset}vw, 0, 0)`;

    this.rightWordElement.style.transform = `translate3d(${currentOffset}vw, 0, 0)`;

    this.animationFrameId = requestAnimationFrame(this.updateWordPositions);
  };

  createObserver() {
    this.heroVisibilityObserver = new IntersectionObserver(
      (entries) => {
        this.isHeroVisible = entries[0].isIntersecting;

        if (this.isHeroVisible && !this.animationFrameId) {
          this.animationFrameId = requestAnimationFrame(
            this.updateWordPositions,
          );
        }

        if (!this.isHeroVisible && this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = 0;
        }
      },
      { threshold: 0 },
    );

    this.heroVisibilityObserver.observe(this.heroElement);
  }
}

export default Homehero;
