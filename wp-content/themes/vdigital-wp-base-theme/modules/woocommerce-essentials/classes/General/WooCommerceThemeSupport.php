<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceThemeSupport
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class WooCommerceThemeSupport extends ThemeModuleAbstractClass {

		public function init() {
			add_theme_support( 'wc-product-gallery-zoom' );
			add_theme_support( 'wc-product-gallery-lightbox' );
			add_theme_support( 'wc-product-gallery-slider' );
		}
	}