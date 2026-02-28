const inactiveButtonClasses = ["button--outline"];
const activeButtonClasses = ["button--blue"];

// Function to equalize description heights within a specific container
function equalizeDescriptionHeights(container) {
  const descriptions = container.querySelectorAll(".price-plan__description");

  if (descriptions.length === 0) {
    return;
  }

  // Reset heights to auto first
  descriptions.forEach((desc) => {
    desc.style.height = "auto";
  });

  // Check screen width and determine how many items per row
  const screenWidth = window.innerWidth;

  // Below 768px: single column, no equalization needed
  if (screenWidth < 768) {
    return;
  }

  // Determine items per row based on breakpoints
  let itemsPerRow;
  if (screenWidth >= 1024) {
    itemsPerRow = 4;
  } else {
    itemsPerRow = 2;
  }

  // Convert NodeList to Array for easier manipulation
  const descriptionsArray = Array.from(descriptions);

  // Process descriptions in rows
  for (let i = 0; i < descriptionsArray.length; i += itemsPerRow) {
    const rowDescriptions = descriptionsArray.slice(i, i + itemsPerRow);

    // Find the maximum height in this row
    let maxHeight = 0;
    rowDescriptions.forEach((desc) => {
      const height = desc.offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    // Apply the maximum height to all descriptions in this row
    rowDescriptions.forEach((desc) => {
      desc.style.height = `${maxHeight}px`;
    });
  }
}

// Initialize each price plan block independently
const pricePlanBlocks = document.querySelectorAll(".price-plan");

pricePlanBlocks.forEach((block) => {
  equalizeDescriptionHeights(block);

  // Handle currency buttons for this block
  const currencyButtons = block.querySelectorAll(".price-plan__currency-btn");
  const monthPrices = block.querySelectorAll(".price-plan__month-price");

  currencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currencyButtons.forEach((btn) => {
        btn.classList.remove(...activeButtonClasses);
        btn.classList.add(...inactiveButtonClasses);
      });

      button.classList.remove(...inactiveButtonClasses);
      button.classList.add(...activeButtonClasses);

      monthPrices.forEach((price) => {
        if (price.dataset.currency === button.dataset.currency) {
          price.classList.remove("tw-hidden");
          return;
        }

        price.classList.add("tw-hidden");
      });
    });
  });
});

// Run on window resize with debounce
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    pricePlanBlocks.forEach((block) => {
      equalizeDescriptionHeights(block);
    });
  }, 250);
});
