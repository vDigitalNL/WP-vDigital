<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceThemeSupport
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceThemeSupport extends ThemeModuleAbstractClass {

		public function addThemeSupport() {
			add_theme_support( 'wc-product-gallery-slider' );
		}

		public function init() {
			add_action( 'init', [ $this, 'addThemeSupport' ] );
		}
	}