function getZoomSize(size) {
  const zoomLevel =
    parseFloat(
      window.getComputedStyle(document.querySelector("body"))?.zoom ?? 1,
    ) * 100;

  if (zoomLevel === 100) return size;

  return (size / zoomLevel) * 100;
}

export { getZoomSize };
