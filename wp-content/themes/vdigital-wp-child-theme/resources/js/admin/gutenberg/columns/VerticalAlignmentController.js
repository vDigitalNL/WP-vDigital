export class VerticalAlignmentController {
  constructor() {
    this.lastSelectedBlockName = null;
    this.init();
  }

  init() {
    this.hideVerticalAlignmentControls();
    this.setDefaultColumnAlignment();
  }

  hideVerticalAlignmentControls() {
    wp.data.subscribe(() => {
      const selectedBlock = wp.data
        .select("core/block-editor")
        .getSelectedBlock();

      if (!selectedBlock) return;

      if (selectedBlock.name === this.lastSelectedBlockName) return;
      this.lastSelectedBlockName = selectedBlock.name;

      requestAnimationFrame(() => {
        const verticalAlignButtons = document.querySelectorAll(
          '.block-editor-block-toolbar button[aria-label="Change vertical alignment"], ' +
            '.block-editor-block-toolbar .components-dropdown-menu__toggle[aria-label="Change vertical alignment"]',
        );

        verticalAlignButtons.forEach((button) => {
          if (selectedBlock.name === "core/columns") {
            button.style.display = "none";
            const dropdown = button.closest(".components-dropdown");
            if (dropdown) dropdown.style.display = "none";
          } else if (selectedBlock.name === "core/column") {
            button.style.display = "";
            const dropdown = button.closest(".components-dropdown");
            if (dropdown) dropdown.style.display = "";
          }
        });
      });
    });
  }

  setDefaultColumnAlignment() {
    wp.hooks.addFilter(
      "editor.BlockEdit",
      "vdigital/custom-column-alignment",
      wp.compose.createHigherOrderComponent((BlockEdit) => {
        return (props) => {
          if (props.name !== "core/column") {
            return wp.element.createElement(BlockEdit, props);
          }

          const { attributes, setAttributes, clientId } = props;

          const parentBlock = wp.data
            .select("core/block-editor")
            .getBlockParents(clientId)
            .map((id) => wp.data.select("core/block-editor").getBlock(id))
            .find((block) => block?.name === "core/columns");

          const parentClassName = parentBlock?.attributes?.className || "";
          const multiColumnLayouts = [
            "layout-three-columns",
            "layout-four-columns",
            "layout-six-columns",
          ];
          const isMultiColumnLayout = multiColumnLayouts.some((layout) =>
            parentClassName.includes(layout),
          );
          const defaultAlignment = isMultiColumnLayout ? "top" : "center";

          if (!attributes.verticalAlignment) {
            setAttributes({ verticalAlignment: defaultAlignment });
          }

          if (attributes.verticalAlignment === "stretch") {
            setAttributes({ verticalAlignment: defaultAlignment });
          }

          return wp.element.createElement(BlockEdit, props);
        };
      }, "customColumnAlignment"),
    );
  }
}
