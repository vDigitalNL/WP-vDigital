<?php

namespace Theme\Modules\LogoCarousel;

use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class General
 *
 * @package ChildTheme\Modules\LogoCarousel
 *
 * @property-read General\CustomPostTypes $CustomPostTypes
 * @property-read General\AcfGroups       $AcfGroups
 * @property-read General\Media           $Media
 *
 */
class General extends ThemeModuleAbstractClass {

	use ThemeFlexClassTrait;

	public function init() {
		$this->CustomPostTypes->init();
		$this->AcfGroups->init();
		$this->Media->init();
	}
}