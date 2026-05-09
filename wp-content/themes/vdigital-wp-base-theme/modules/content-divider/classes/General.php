<?php

	namespace Theme\Modules\ContentDivider;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class General
	 *
	 * @package ChildTheme\Modules\ContentDivider
	 *
	 * @property-read General\AcfGroups       $AcfGroups
	 */
	class General extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->AcfGroups->init();
		}
	}