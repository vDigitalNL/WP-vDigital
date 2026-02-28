function toggleClassesOnElement(element, classes, remove = false) {
  if(classes instanceof Array) {
    classes.forEach(className => {
      toggleClassOnElement(element, className, remove);
    });
  }
  else if(classes instanceof String) {
    toggleClassOnElement(element, classes, remove);
  }
}

function toggleClassOnElement(element, className, remove = false) {
  if (!remove) {
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
  } else {
    element.classList.remove(className);
  }
}

export {toggleClassOnElement, toggleClassesOnElement};