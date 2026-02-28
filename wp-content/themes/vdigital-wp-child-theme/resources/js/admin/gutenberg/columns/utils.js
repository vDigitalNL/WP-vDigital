export function svgToElement(svgString) {
  return wp.element.createElement(wp.element.RawHTML, null, svgString);
}
