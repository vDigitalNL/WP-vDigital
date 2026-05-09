<?php

	namespace Theme\Modules;

	use Theme\BaseTheme\Backend\Admin;
	use Theme\BaseTheme\ThemeModuleAbstractBaseClass;

	/**
	 * Class WoocommerceEssentials
	 *
	 * @package WoocommerceEssentials\Modules
	 *
	 * @property-read WoocommerceEssentials\General  $General
	 * @property-read WoocommerceEssentials\Frontend $Frontend
	 */
	class WoocommerceEssentials extends ThemeModuleAbstractBaseClass {

		public function init() {

			// Check if dependencies are met
			// If not, show an admin notice and early return
			if ( ! class_exists( 'woocommerce' ) ) {
				Admin::getInstance()->addAdminErrorNotice(
					baseTheme()->__( 'Module: "WooCommerce Essentials" requires plugin: "WooCommerce" to be active.' )
				);

				return;
			}

			parent::init();
		}
	}