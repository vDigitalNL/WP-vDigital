<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceBreadcrumbs
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceBreadcrumbs extends ThemeModuleAbstractClass {

		public function addActions() {
		}

		public function addFilters() {
			add_filter( 'woocommerce_breadcrumb_defaults', [ $this, 'breadcrumbDefaults' ], 20 );
		}

		/**
		 * @param $defaults
		 *
		 * @return mixed
		 */
		public function breadcrumbDefaults( $defaults ) {
			$defaults['delimiter'] = '<span class="delimiter"><svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.4" fill-rule="evenodd" clip-rule="evenodd" d="M0.734833 1.56065L1.79549 0.499993L6.32582 5.03032L1.79549 9.56065L0.734833 8.49999L4.2045 5.03032L0.734833 1.56065Z" fill="#494949"/>
</svg></span>';

			return $defaults;
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}
	}