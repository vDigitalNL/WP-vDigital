<?php

namespace Theme\Modules\LogoCarousel;

use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class Frontend
 *
 * @package ChildTheme\Modules\LogoCarousel
 *
 * @property-read Frontend\Typography $Typography
 */
class Frontend extends ThemeModuleAbstractClass {

	use ThemeFlexClassTrait;

	public function init() {
		$this->Typography->init();
	}
}