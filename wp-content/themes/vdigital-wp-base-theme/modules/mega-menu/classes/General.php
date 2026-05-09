<?php

	namespace Theme\Modules\MegaMenu;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class General
	 *
	 * @package Theme\Modules\Sample
	 *
	 * @property-read General\MetaBoxes $MetaBoxes
	 */
	class General extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->MetaBoxes->init();
		}
	}