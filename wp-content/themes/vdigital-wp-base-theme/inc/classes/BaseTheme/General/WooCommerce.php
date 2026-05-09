<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class WooCommerce
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class WooCommerce extends AbstractClass {

		public function init() {
			add_theme_support( 'woocommerce' );
			add_theme_support( 'wc-product-gallery-zoom' );
			add_theme_support( 'wc-product-gallery-lightbox' );
			add_theme_support( 'wc-product-gallery-slider' );
		}
	}