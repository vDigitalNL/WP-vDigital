function centerBannerHeadings() {
  const banners = document.querySelectorAll(".block__banner");
  banners.forEach((banner) => {
    const buttons = banner.querySelector(".text-block__buttons");
    if (buttons) return;

    const textblock = banner.querySelector(".text-block");

    if (window.innerWidth <= 768) {
      textblock.style.removeProperty("margin-top");
      return;
    }

    const title = banner.querySelector(".text-block__title-wrapper");
    const content = banner.querySelector(".text-block__content");

    if (!textblock || !title || !content) return;

    const textblockHeight = textblock.clientHeight;
    const titleHeight = title.clientHeight;

    const contentHeightCalculated = textblockHeight - titleHeight;
    const marginTop = contentHeightCalculated;

    textblock.style.setProperty("margin-top", `${marginTop}px`);
  });
}

function loadSharpBannerImages() {
  if (window.innerWidth >= 768) {
    return;
  }

  const banners = document.querySelectorAll(
    ".block__banner[preload-blur]:not(.is-loading-sharp)",
  );

  banners.forEach((banner) => {
    const sharpImageUrl = banner.dataset.sharpImage;
    const blurredImageUrl = banner.dataset.blurredImage;

    if (
      !sharpImageUrl ||
      !blurredImageUrl ||
      sharpImageUrl === blurredImageUrl
    ) {
      return;
    }

    banner.classList.add("is-loading-sharp");

    const sharpImage = new Image();

    sharpImage.onload = () => {
      const currentStyle = banner.getAttribute("style") || "";
      const updatedStyle =
        currentStyle + `; --bg-image-mobile: url(${sharpImageUrl})`;
      banner.setAttribute("style", updatedStyle);
      banner.removeAttribute("preload-blur");
    };

    sharpImage.onerror = () => {
      console.warn("Failed to load sharp banner image:", sharpImageUrl);
      banner.classList.remove("is-loading-sharp");
    };

    sharpImage.src = sharpImageUrl;
  });
}

let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    centerBannerHeadings();
    loadSharpBannerImages();
  }, 150);
}

document.addEventListener("DOMContentLoaded", () => {
  centerBannerHeadings();
  loadSharpBannerImages();
});

window.addEventListener("resize", handleResize);
