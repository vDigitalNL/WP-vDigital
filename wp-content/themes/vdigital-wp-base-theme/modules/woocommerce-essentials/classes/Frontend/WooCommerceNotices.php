<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Exception;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceNotices
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceNotices extends ThemeModuleAbstractClass {

		/**
		 * Remove billing from the validation message
		 *
		 * @param $error
		 *
		 * @return string|string[]
		 * @see wc_add_notice
		 *
		 */
		public function addError( $error ) {
			if ( strpos( $error, 'Billing ' ) !== false ) {
				$error = str_replace( "Billing ", "", $error );
			}
			if ( strpos( $error, 'Facturering ' ) !== false ) {
				$error = str_replace( "Facturering ", "", $error );
			}

			return $error;
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}

		private function addActions() {
		}

		private function addFilters() {
			add_filter( 'woocommerce_add_error', [ $this, 'addError' ] );
		}
	}