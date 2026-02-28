wp.domReady(() => {
  const blockName = "core/html";

  const originalBlock = wp.blocks.getBlockType(blockName);
  if (!originalBlock) {
    return;
  }

  /* Unregister and re-register block in order to change category */
  wp.blocks.unregisterBlockType(blockName);
  wp.blocks.registerBlockType(blockName, {
    ...originalBlock,
    category: "ww-custom-only-background-required",
  });
});
