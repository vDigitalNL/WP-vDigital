import { BlockTitleWrapper } from "./columns/BlockTitleWrapper.js";
import { VerticalAlignmentController } from "./columns/VerticalAlignmentController.js";
import { BlockSupportsManager } from "./columns/BlockSupportsManager.js";
import { ColumnVariationsManager } from "./columns/ColumnVariationsManager.js";

new BlockTitleWrapper();
new VerticalAlignmentController();
new BlockSupportsManager();

const variationsManager = new ColumnVariationsManager();
variationsManager.init();
