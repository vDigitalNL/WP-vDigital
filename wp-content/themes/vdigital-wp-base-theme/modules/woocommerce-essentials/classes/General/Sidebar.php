<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class Sidebar
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class Sidebar extends ThemeModuleAbstractClass {

		public function init() {
			add_action( 'widgets_init', [ $this, 'registerSidebars' ] );
		}

		public function registerSidebars() {
			register_sidebar( array(
				'name'          => $this->baseTheme->__( 'WooCommerce Archive Filters' ),
				'id'            => 'woocommerce_archive_filters',
				'before_widget' => '',
				'after_widget'  => '',
				'before_title'  => '',
				'after_title'   => '',
			) );
		}
	}