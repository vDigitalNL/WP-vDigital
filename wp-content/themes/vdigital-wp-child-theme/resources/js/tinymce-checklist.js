(function () {
  if (typeof tinymce === "object") {
    tinymce.create("tinymce.plugins.WWCheckmarkPlugin", {
      init: function (ed, url) {
        ed.addButton("checkmark-list", {
          title: "Checkmark list",
          cmd: "checkmark-list",
          image:
            "/wp-content/themes/vdigital-wp-child-theme/assets/images/check-blue.svg",
          onPostRender: function () {
            const btn = this;
            ed.on("NodeChange", function (e) {
              const isActive =
                tinymce.activeEditor.dom.getParent(
                  e.element,
                  "ul.checkmark-list",
                ) !== null;
              btn.active(isActive);
            });
          },
        });

        ed.addCommand("checkmark-list", function () {
          ed.execCommand(
            "mceInsertContent",
            0,
            "<ul class='checkmark-list'><li></li></ul>",
          );
        });
      },

      createControl: function (n, cm) {
        return null;
      },
    });

    tinymce.PluginManager.add(
      "wwcheckmarkplugin",
      tinymce.plugins.WWCheckmarkPlugin,
    );
  }
})();
