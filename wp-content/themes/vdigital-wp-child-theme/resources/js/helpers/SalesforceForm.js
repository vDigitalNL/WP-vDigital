function salesforceFormFilled() {
  const urlParams = new URLSearchParams(window.location.search);
  const salesforceSubmit = urlParams.get("dyflexis_submit");
  const salesforcePopup = urlParams.get("dyflexis_popup");

  return salesforceSubmit === "true" && salesforcePopup === "true";
}

export { salesforceFormFilled };
