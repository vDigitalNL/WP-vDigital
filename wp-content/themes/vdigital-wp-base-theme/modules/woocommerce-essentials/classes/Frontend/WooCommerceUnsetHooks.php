<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceUnsetHooks
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceUnsetHooks extends ThemeModuleAbstractClass {

		public function init() {
			$this->removeActions();
		}

		private function removeActions() {
			remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );

			remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_price', 10 );

			add_filter( 'woocommerce_single_product_carousel_options', function ( $options ) {
				$options['touch']     = false;
				$options['swipe']     = false;
				$options['draggable'] = false;
				$options['touchMove'] = false;

				return $options;
			} );

			add_filter( 'woocommerce_single_product_photoswipe_enabled', function () {
				return false;
			} );
		}
	}