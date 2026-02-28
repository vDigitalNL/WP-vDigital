import { BLOCK_TITLES } from "./constants.js";

export class BlockTitleWrapper {
  constructor() {
    this.init();
  }

  init() {
    wp.hooks.addFilter(
      "editor.BlockEdit",
      "dyflexis/block-title-wrapper",
      this.createWrapper.bind(this),
    );
  }

  createWrapper(BlockEdit) {
    return (props) => {
      const title = BLOCK_TITLES[props.name];
      const className = props.attributes?.className || "";

      if (!title || className.includes("spacer-column")) {
        return wp.element.createElement(BlockEdit, props);
      }

      const isColumn = props.name === "core/column";
      const columnWidth = isColumn ? props.attributes?.width : null;
      const verticalAlignment = isColumn
        ? props.attributes?.verticalAlignment
        : null;

      const alignSelfMap = {
        top: "start",
        center: "center",
        bottom: "end",
      };

      const wrapperStyle = {
        display: "flex",
        flexDirection: "column",
        width: columnWidth || "100%",
        ...(isColumn && {
          flexBasis: columnWidth || "auto",
          flexGrow: columnWidth ? 0 : 1,
          flexShrink: 1,
          ...(verticalAlignment && {
            alignSelf: alignSelfMap[verticalAlignment] || "center",
          }),
        }),
      };

      const handleWrapperClick = (e) => {
        if (
          e.target.classList.contains("dyflexis-block-wrapper") ||
          e.target.classList.contains("dyflexis-block-title")
        ) {
          wp.data.dispatch("core/block-editor").selectBlock(props.clientId);
          e.stopPropagation();
        }
      };

      return wp.element.createElement(
        "div",
        {
          className: "dyflexis-block-wrapper",
          style: wrapperStyle,
          onClick: handleWrapperClick,
        },
        wp.element.createElement(
          "h3",
          { className: "dyflexis-block-title" },
          title,
        ),
        wp.element.createElement(BlockEdit, props),
      );
    };
  }
}
