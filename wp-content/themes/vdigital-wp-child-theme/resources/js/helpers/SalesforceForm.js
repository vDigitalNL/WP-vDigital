function salesforceFormFilled() {
  const urlParams = new URLSearchParams(window.location.search);
  const salesforceSubmit = urlParams.get("vdigital_submit");
  const salesforcePopup = urlParams.get("vdigital_popup");

  return salesforceSubmit === "true" && salesforcePopup === "true";
}

export { salesforceFormFilled };
