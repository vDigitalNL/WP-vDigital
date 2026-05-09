<?php

	namespace Theme\BaseTheme;

	/**
	 * Class Backend
	 *
	 * @package Theme\BaseTheme
	 *
	 * @property-read Backend\Admin        $Admin
	 * @property-read Backend\Assets       $Assets
	 * @property-read Backend\Cache        $Cache
	 * @property-read Backend\Editor       $Editor
	 * @property-read Backend\Seo          $Seo
	 * @property-read Backend\ThemeOptions $ThemeOptions
	 * @property-read Backend\WooCommerce  $WooCommerce
	 */
	final class Backend extends AbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->Cache->init();
			$this->Admin->init();
			$this->Assets->init();
			$this->Editor->init();
			$this->Seo->init();

			$this->ThemeOptions->init();

			if ( class_exists( 'WooCommerce' ) ) {
				$this->WooCommerce->init();
			}
		}
	}