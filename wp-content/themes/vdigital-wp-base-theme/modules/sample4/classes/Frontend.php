<?php

	namespace Theme\Modules\Sample4;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class Frontend
	 *
	 * @package ChildTheme\Modules\Sample4
	 *
	 * @property-read Frontend\Typography $Typography
	 */
	class Frontend extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->Typography->init();
		}
	}