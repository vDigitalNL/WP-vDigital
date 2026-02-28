function adjustSmallContainerGlow() {
  document.querySelectorAll(".block__background").forEach((background) => {
    const glowElement = background.querySelectorAll(".glow__block");
    if (glowElement.length > 0) {
      glowElement.forEach((glow) => {
        if (
          glow.classList.contains("glow--middle-blue-green") &&
          glow.closest(".block__background").offsetHeight < 250
        ) {
          glow.style.top = 0;
          glow.style.setProperty("--tw-translate-y", "-25%");
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => adjustSmallContainerGlow());
window.addEventListener(
  "resize",
  (() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        adjustSmallContainerGlow();
      }, 200);
    };
  })(),
);
