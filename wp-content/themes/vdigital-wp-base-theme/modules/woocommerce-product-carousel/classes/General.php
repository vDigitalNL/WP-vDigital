<?php

namespace Theme\Modules\WoocommerceProductCarousel;

use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class General
 *
 * @package ChildTheme\Modules\WoocommerceProductCarousel
 *
 * @property-read General\CustomPostTypes $CustomPostTypes
 * @property-read General\AcfGroups       $AcfGroups
 * @property-read General\Media           $Media
 * @property-read General\TemplateHelpers $TemplateHelpers
 *
 */
class General extends ThemeModuleAbstractClass {

	use ThemeFlexClassTrait;

	public function init() {
		$this->CustomPostTypes->init();
		$this->AcfGroups->init();
		$this->Media->init();
		$this->TemplateHelpers->init();
	}
}