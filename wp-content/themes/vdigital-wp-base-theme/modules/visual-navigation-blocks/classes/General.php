<?php

namespace Theme\Modules\VisualNavigationBlocks;

use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class General
 *
 * @package ChildTheme\Modules\VisualNavigationBlocks
 *
 * @property-read General\AcfGroups $AcfGroups
 *
 */
class General extends ThemeModuleAbstractClass {

	use ThemeFlexClassTrait;

	public function init() {
		$this->AcfGroups->init();
	}
}