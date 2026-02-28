function addAsterixToRequiredFields() {
  document.querySelectorAll("input[required]").forEach((input) => {
    if (input.closest(".input__field.compact")) {
      input.placeholder = input.placeholder + "*";
    }
  });
}

export { addAsterixToRequiredFields };
