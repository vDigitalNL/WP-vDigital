<?php

	namespace Theme\Modules\PreLoader;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class General
	 *
	 * @package ChildTheme\Modules\PreLoader
	 *
	 * @property-read General\ModuleThemeSettings $ModuleThemeSettings
	 */
	class General extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->ModuleThemeSettings->init();
		}
	}