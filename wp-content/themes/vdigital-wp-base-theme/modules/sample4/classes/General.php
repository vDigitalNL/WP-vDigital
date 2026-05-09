<?php

	namespace Theme\Modules\Sample4;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class General
	 *
	 * @package ChildTheme\Modules\Sample4
	 *
	 * @property-read General\CustomPostTypes $CustomPostTypes
	 * @property-read General\AcfGroups       $AcfGroups
	 */
	class General extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->CustomPostTypes->init();
			$this->AcfGroups->init();
		}
	}