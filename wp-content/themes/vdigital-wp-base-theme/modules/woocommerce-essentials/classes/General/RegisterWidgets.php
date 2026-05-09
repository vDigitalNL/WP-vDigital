<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class RegisterWidgets
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class RegisterWidgets extends ThemeModuleAbstractClass {

		public function init() {
			$this->addActions();
		}

		public function registerWidgets() {
			if ( class_exists( 'WC_Widget' ) ) {
				if ( class_exists( '\Theme\Modules\WoocommerceEssentials\General\CategoryFilterWidget' ) ) {
					register_widget( '\Theme\Modules\WoocommerceEssentials\General\CategoryFilterWidget' );
				}

				if ( class_exists( '\Theme\Modules\WoocommerceEssentials\General\CategoryHeighestParentFilterWidget' ) ) {
					register_widget( '\Theme\Modules\WoocommerceEssentials\General\CategoryHeighestParentFilterWidget' );
				}
			}
		}

		private function addActions() {
			add_action( 'widgets_init', [ $this, 'registerWidgets' ] );
		}
	}