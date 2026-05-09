<?php
	namespace Theme\Modules;

	use Theme\BaseTheme\Backend\Admin;
	use Theme\BaseTheme\ThemeModuleAbstractBaseClass;

	/**
	 * Class WoocommerceB2b
	 *
	 * @package WoocommerceB2b\Modules
	 *
	 * @property-read WoocommerceB2b\General  $General
	 */
	class WoocommerceB2b extends ThemeModuleAbstractBaseClass {
		const B2B_ROLE_PREFIX = 'b2b_role_';

	    const B2B_ROLE_POST_TYPE = 'b2b_role';

	    public function init() {

		    // Check if dependencies are met
		    // If not, show an admin notice and early return
		    if ( ! class_exists( 'woocommerce' ) ) {
			    Admin::getInstance()->addAdminErrorNotice(
				    baseTheme()->__( 'Module: "WooCommerce B2B" requires plugin: "WooCommerce" to be active.' )
			    );

			    return;
		    }

		    parent::init();
	    }
    }