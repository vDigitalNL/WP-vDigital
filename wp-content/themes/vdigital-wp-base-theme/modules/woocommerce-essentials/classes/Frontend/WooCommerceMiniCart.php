<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceMiniCart
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceMiniCart extends ThemeModuleAbstractClass {

		public function addActions() {
			$this->baseTheme->addAction( 'childtheme_navbar_right', [ $this, 'renderNavbarMiniCart' ] );
		}

		public function addFilters() {
			add_filter( 'woocommerce_add_to_cart_fragments', [ $this, 'addToCartFragments' ], 30, 1 );
		}

		/**
		 * Get a refreshed cart fragment when products gets added or removed for example, including the mini cart HTML.
		 *
		 * @param $fragments
		 *
		 * @return mixed
		 */
		public function addToCartFragments( $fragments ) {
			global $woocommerce;
			$this->renderNavbarMiniCart();
			ob_start();

			return $fragments;
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}

		public function renderNavbarMiniCart() {
			$this->themeModule->loadTemplateFile( 'navbar-mini-cart' );
		}
	}