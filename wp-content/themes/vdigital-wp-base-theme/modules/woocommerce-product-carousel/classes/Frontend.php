<?php

namespace Theme\Modules\WoocommerceProductCarousel;

use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class Frontend
 *
 * @package ChildTheme\Modules\WoocommerceProductCarousel
 *
 * @property-read Frontend\Typography $Typography
 */
class Frontend extends ThemeModuleAbstractClass {

	use ThemeFlexClassTrait;

	public function init() {
		$this->Typography->init();
	}
}