(function () {
  if (typeof tinymce === "object") {
    tinymce.PluginManager.add("wwcustomtitleformats", function (editor) {
      // Register custom formats with classes
      editor.on("init", function () {
        editor.formatter.register("h1-small", {
          block: "h1",
          classes: "small",
        });
        editor.formatter.register("h3-small", {
          block: "h3",
          classes: "small",
        });
      });
    });
  }
})();
