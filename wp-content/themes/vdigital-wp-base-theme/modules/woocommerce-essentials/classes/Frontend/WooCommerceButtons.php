<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceButtons
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceButtons extends ThemeModuleAbstractClass {

		public function addActions() {
		}

		public function addFilters() {
			add_filter( 'woocommerce_return_to_shop_redirect', [ $this, 'returnToShopRedirect' ] );
			add_filter( 'woocommerce_continue_shopping_redirect', [ $this, 'returnToShopRedirect' ] );
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}

		public function returnToShopRedirect( $link ) {
			return ( $this->baseTheme->getOption( 'woocommerce.woocommerce-shop-link', [] )['url'] ?? '' ) ?: $link;
		}
	}