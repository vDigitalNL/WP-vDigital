export class BlockSupportsManager {
  constructor() {
    this.init();
  }

  init() {
    wp.hooks.addFilter(
      "blocks.registerBlockType",
      "vdigital/column-supports",
      this.modifySupports.bind(this),
    );
  }

  modifySupports(settings, name) {
    if (name !== "core/columns" && name !== "core/column") return settings;

    const commonSupports = {
      shadow: false,
      typography: false,
      color: { text: false, background: false, link: false, gradient: false },
    };

    if (name === "core/columns") {
      const { verticalAlignment, ...remainingAttributes } =
        settings.attributes || {};
      return {
        ...settings,
        attributes: remainingAttributes,
        supports: { ...settings.supports, ...commonSupports },
      };
    }

    return {
      ...settings,
      supports: { ...settings.supports, ...commonSupports },
    };
  }
}
