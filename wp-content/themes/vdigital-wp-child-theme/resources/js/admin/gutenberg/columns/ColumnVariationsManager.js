import { ALLOWED_BLOCKS } from "./constants.js";
import { svgToElement } from "./utils.js";

export class ColumnVariationsManager {
  constructor() {
    this.icons = null;
  }

  init() {
    if (typeof columnIcons === "undefined") {
      return;
    }

    this.setupIcons();

    wp.hooks.addFilter(
      "blocks.registerBlockType",
      "dyflexis/columns-variations",
      (settings, name) => {
        if (name === "core/columns") {
          setTimeout(() => {
            this.unregisterDefaultVariations();
            this.registerCustomVariations();
          }, 0);
        }
        return settings;
      },
    );
  }

  setupIcons() {
    this.icons = {
      twoColumns: svgToElement(columnIcons.twoColumns),
      threeColumns: svgToElement(columnIcons.threeColumns),
      fourColumns: svgToElement(columnIcons.fourColumns),
      sixColumns: svgToElement(columnIcons.sixColumns),
      asymmetricLeftRight: svgToElement(columnIcons.asymmetricLeftRight),
      asymmetricRightLeft: svgToElement(columnIcons.asymmetricRightLeft),
      asymmetricSpaceLeftRight: svgToElement(
        columnIcons.asymmetricSpaceLeftRight,
      ),
      asymmetricSpacedColumns: svgToElement(
        columnIcons.asymmetricSpacedColumns,
      ),
      asymmetricLeftSpacedColumns: svgToElement(
        columnIcons.asymmetricLeftSpacedColumns,
      ),
    };
  }

  unregisterDefaultVariations() {
    const { getBlockVariations, unregisterBlockVariation } = wp.blocks;
    const variations = getBlockVariations("core/columns");
    if (variations) {
      variations.forEach((variation) => {
        unregisterBlockVariation("core/columns", variation.name);
      });
    }
  }

  registerCustomVariations() {
    const { registerBlockVariation } = wp.blocks;

    registerBlockVariation("core/columns", {
      name: "two-columns",
      title: "50/50",
      description: "Two equal columns",
      icon: this.icons.twoColumns,
      innerBlocks: [
        [
          "core/column",
          {
            allowedBlocks: ALLOWED_BLOCKS.twoColumnsEqual,
            className: "column-50",
          },
        ],
        [
          "core/column",
          {
            allowedBlocks: ALLOWED_BLOCKS.twoColumnsEqual,
            className: "column-50",
          },
        ],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-two-columns",
      },
    });

    registerBlockVariation("core/columns", {
      name: "asymmetric-right-left",
      title: "50% / - / 41%",
      description: "Left column 50%, space, right column 41%",
      icon: this.icons.asymmetricRightLeft,
      innerBlocks: [
        [
          "core/column",
          {
            width: "50%",
            allowedBlocks: ALLOWED_BLOCKS.two.half,
            className: "column-50",
          },
        ],
        ["core/column", { width: "9%", className: "spacer-column column-9" }],
        [
          "core/column",
          {
            width: "41%",
            allowedBlocks: ALLOWED_BLOCKS.two.small,
            className: "column-41",
          },
        ],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-asymmetric-right-left",
      },
    });

    registerBlockVariation("core/columns", {
      name: "asymmetric-left-right",
      title: "41% / - / 50%",
      description: "Left column 41%, space, right column 50%",
      icon: this.icons.asymmetricLeftRight,
      innerBlocks: [
        [
          "core/column",
          {
            width: "41%",
            allowedBlocks: ALLOWED_BLOCKS.two.small,
            className: "column-41",
          },
        ],
        ["core/column", { width: "9%", className: "spacer-column column-9" }],
        [
          "core/column",
          {
            width: "50%",
            allowedBlocks: ALLOWED_BLOCKS.two.half,
            className: "column-50",
          },
        ],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-asymmetric-left-right",
      },
    });

    registerBlockVariation("core/columns", {
      name: "asymmetric-space-left-right",
      title: "- / 41% / 50%",
      description: "Space, Left column 41%, right column 50%",
      icon: this.icons.asymmetricSpaceLeftRight,
      innerBlocks: [
        ["core/column", { width: "9%", className: "spacer-column column-9" }],
        [
          "core/column",
          {
            width: "41%",
            allowedBlocks: ALLOWED_BLOCKS.two.small,
            className: "column-41",
          },
        ],
        [
          "core/column",
          {
            width: "50%",
            allowedBlocks: [...ALLOWED_BLOCKS.two.half, "acf/offset-image"],
            className: "column-50",
          },
        ],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-asymmetric-space-left-right",
      },
    });

    registerBlockVariation("core/columns", {
      name: "asymmetric-left-spaced-columns",
      title: "50% / - / 33% / -",
      description: "Left column 50%, space, middle column 33%, space",
      icon: this.icons.asymmetricLeftSpacedColumns,
      innerBlocks: [
        [
          "core/column",
          {
            width: "50%",
            allowedBlocks: ALLOWED_BLOCKS.two.half,
            className: "column-50",
          },
        ],
        ["core/column", { width: "9%", className: "spacer-column column-9" }],
        [
          "core/column",
          {
            width: "33%",
            allowedBlocks: ALLOWED_BLOCKS.two.extraSmall,
            className: "column-33",
          },
        ],
        ["core/column", { width: "8%", className: "spacer-column column-8" }],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-asymmetric-left-spaced-columns",
      },
    });

    registerBlockVariation("core/columns", {
      name: "asymmetric-spaced-columns",
      title: "- / 33% / - / 50%",
      description: "Space, middle column 33%, space, right column 50%",
      icon: this.icons.asymmetricSpacedColumns,
      innerBlocks: [
        ["core/column", { width: "8%", className: "spacer-column column-8" }],
        [
          "core/column",
          {
            width: "33%",
            allowedBlocks: ALLOWED_BLOCKS.two.extraSmall,
            className: "column-33",
          },
        ],
        ["core/column", { width: "9%", className: "spacer-column column-9" }],
        [
          "core/column",
          {
            width: "50%",
            allowedBlocks: ALLOWED_BLOCKS.two.half,
            className: "column-50",
          },
        ],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-asymmetric-spaced-columns",
      },
    });

    registerBlockVariation("core/columns", {
      name: "three-columns",
      title: "33/33/33",
      description: "Three equal columns",
      icon: this.icons.threeColumns,
      innerBlocks: [
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.three }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.three }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.three }],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-three-columns",
      },
    });

    registerBlockVariation("core/columns", {
      name: "four-columns",
      title: "25/25/25/25",
      description: "Four equal columns",
      icon: this.icons.fourColumns,
      innerBlocks: [
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.four }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.four }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.four }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.four }],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-four-columns",
      },
    });

    registerBlockVariation("core/columns", {
      name: "six-columns",
      title: "17/17/17/17/17/17",
      description: "Six equal columns",
      icon: this.icons.sixColumns,
      innerBlocks: [
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.six }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.six }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.six }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.six }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.six }],
        ["core/column", { allowedBlocks: ALLOWED_BLOCKS.six }],
      ],
      scope: ["block"],
      source: "block",
      isDefault: false,
      attributes: {
        className: "layout-six-columns",
      },
    });
  }
}
