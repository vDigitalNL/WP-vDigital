<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceShopLoop
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceShopLoop extends ThemeModuleAbstractClass {

		public function afterWooCommerceShopLoopItem() {
			global $product;

			if ( ! empty ( $product ) ) : ?>
				<a class="product-cta" href="<?php echo $product->get_permalink(); ?>"><?php echo $this->baseTheme->__( 'View product' ); ?></a>
			<?php endif;
		}

		public function amountProductColumns( $columns ) {
			if ( is_search() ) {
				return $columns;
			}

			$productColumnsOption = $this->baseTheme->getOption( 'woocommerce' )['archive-columns'];

			return ! is_search() && $productColumnsOption ? (int) $productColumnsOption : $columns;
		}

		public function hideVariableAddToCartInCart( $html, $product ) {
			if ( ! is_cart() || $product->get_type() === 'simple' ) {
				return $html;
			}

			return '';
		}

		public function init() {
			$this->addActions();

			$this->addFilters();

			$this->removeActions();
		}

		public function maybeRemoveAddToCartButton() {
			add_action( 'template_redirect', function () {
				global $post;

				if ( ( empty ( $post ) || empty( $post->ID ) || wc_get_page_id( 'cart' ) !== $post->ID ) ) {
					remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart' );
				}
			} );
		}

		public function removeAddToCartButton() {
			remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart' );
		}

		public function sortingMethods( $sortingMethods ) {
			$sortingMethods = [
				'menu_order' => 'Default sorting',
				'date'       => 'Sort by latest',
				'price'      => 'Price low - high',
				'price-desc' => 'Price high - low'
			];

			$this->baseTheme->applyFilters( 'woocommerce/product_archive/sort_options', $sortingMethods );

			foreach ( $sortingMethods as $sortingMethodKey => $sortingMethod ) {
				$sortingMethods[ $sortingMethodKey ] = $this->baseTheme->__( $sortingMethod );
			}

			return $sortingMethods;
		}

		private function addActions() {
			add_action( 'woocommerce_after_shop_loop_item', [ $this, 'afterWooCommerceShopLoopItem' ] );
		}

		private function addFilters() {
			add_filter( 'loop_shop_columns', [ $this, 'amountProductColumns' ], 10, 1 );

			add_filter( 'woocommerce_catalog_orderby', [ $this, 'sortingMethods' ] );

			add_filter( 'woocommerce_loop_add_to_cart_link', [ $this, 'hideVariableAddToCartInCart' ], 10, 2 );
		}

		private function removeActions() {
			$this->maybeRemoveAddToCartButton();
		}
	}