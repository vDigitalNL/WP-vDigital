<?php

	namespace Theme\Modules\WoocommerceEssentials;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class Frontend
	 *
	 * @package ChildTheme\Modules\WoocommerceEssentials
	 *
	 * @property-read Frontend\Typography               $Typography
	 * @property-read Frontend\WooCommerceShopLoop      $WooCommerceShopLoop
	 * @property-read Frontend\WooCommerceTemplates     $WooCommerceTemplates
	 * @property-read Frontend\WooCommerceThemeSupport  $WooCommerceThemeSupport
	 * @property-read Frontend\WooCommerceUnsetHooks    $WooCommerceUnsetHooks
	 * @property-read Frontend\WooCommerceSingleProduct $WooCommerceSingleProduct
	 * @property-read Frontend\WooCommerceMyAccount     $WooCommerceMyAccount
	 * @property-read Frontend\WooCommerceCart          $WooCommerceCart
	 * @property-read Frontend\WooCommerceMiniCart      $WooCommerceMiniCart
	 * @property-read Frontend\WooCommerceCheckout      $WooCommerceCheckout
	 * @property-read Frontend\WooCommerceFields        $WooCommerceFields
	 * @property-read Frontend\WooCommerceNotices       $WooCommerceNotices
	 * @property-read Frontend\WooCommerceBreadcrumbs   $WooCommerceBreadcrumbs
	 * @property-read Frontend\WooCommerceButtons       $WooCommerceButtons
	 * @property-read Frontend\WooCommerceSearchResults $WooCommerceSearchResults
	 */
	class Frontend extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->WooCommerceThemeSupport->init();

			$this->WooCommerceUnsetHooks->init();

			$this->WooCommerceTemplates->init();

			$this->Typography->init();

			$this->WooCommerceShopLoop->init();

			$this->WooCommerceSingleProduct->init();

			$this->WooCommerceMyAccount->init();

			$this->WooCommerceCart->init();

			$this->WooCommerceMiniCart->init();

			$this->WooCommerceCheckout->init();

			$this->WooCommerceFields->init();

			$this->WooCommerceNotices->init();

			$this->WooCommerceBreadcrumbs->init();

			$this->WooCommerceButtons->init();

			$this->WooCommerceSearchResults->init();
		}
	}