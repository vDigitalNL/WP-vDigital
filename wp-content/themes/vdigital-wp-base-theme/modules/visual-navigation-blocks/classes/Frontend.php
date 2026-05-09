<?php

namespace Theme\Modules\VisualNavigationBlocks;

use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class Frontend
 *
 * @package ChildTheme\Modules\VisualNavigationBlocks
 *
 * @property-read Frontend\Typography $Typography
 */
class Frontend extends ThemeModuleAbstractClass {

	use ThemeFlexClassTrait;

	public function init() {
		$this->Typography->init();
	}
}