<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class ModifyWidgets
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class ModifyWidgets extends ThemeModuleAbstractClass {

		public function afterWooCommerceWidgetPriceFilter() {
			echo '</div>';
		}

		public function beforeWooCommerceWidgetPriceFilter() {
			echo '<div class="woocommerce_essentials__archive_filters__price__form">';
		}

		public function init() {

			$this->addActions();

			$this->addFilters();
		}

		public function modifyWidgetTitle( $title, $instance, $id_base ) {
			switch ( $id_base ) {
				case 'woocommerce_price_filter':
					return '<div class="woocommerce_essentials__archive_filters__price__title">' . $instance['title'] . '</div>';

					break;

				case 'woocommerce_layered_nav':
					return '<div class="woocommerce_essentials__archive_filters__attribute__title height-expandable">' . $instance['title'] . '</div>';

					break;
			}

			return $title;
		}

		private function addActions() {
			add_action( 'woocommerce_widget_price_filter_start', [ $this, 'beforeWooCommerceWidgetPriceFilter' ] );

			add_action( 'woocommerce_widget_price_filter_end', [ $this, 'afterWooCommerceWidgetPriceFilter' ] );
		}

		private function addFilters() {
			add_filter( 'widget_title', [ $this, 'modifyWidgetTitle' ], 10, 3 );
		}
	}