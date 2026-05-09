<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use WC_Product;
	use WC_Product_Variation;

	/**
	 * Class WooCommerceSingleProduct
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceSingleProduct extends ThemeModuleAbstractClass {

		public function addAfterSingleProductSummary() {
			$this->themeModule->loadTemplateFile( 'additional-product-details' );
		}

		public function addEstimatedShippingNoticeToVariation( $attributes, $thisProduct, $variation ) {
			/**
			 * @var WC_Product_Variation $variation
			 */
			$attributes['estimated_shipping_duration'] = $this->wooCommerceShippingEstimateNotice( $variation, 'product_variation' );

			return $attributes;
		}

		public function addProductTitle() {
			if ( is_product() ) {
				print '<div class="container">';
				the_title( '<h1 class="product_title entry-title">', '</h1>' );
				print '</div>';
			}
		}

		public function changeProductDescriptionTabHeading() {
			return $this->baseTheme->__( 'Product description' );
		}

		public function changeProductExtraInformationTabHeading() {
			return $this->baseTheme->__( 'Product properties' );
		}

		public function changeProductTabs( $productTabs ) {
			unset( $productTabs['additional_information'] );

			if ( isset( $productTabs['description'] ) ) {
				$productTabs['description']['title'] = $this->baseTheme->__( 'Product description and product properties' );
			}

			return $productTabs;
		}

		/**
		 * @param WC_Product $product
		 *
		 * @return bool
		 */
		public function getProductVariationsStockQuantity( WC_Product $product ) {
			if ( ! $product ) {
				return false;
			}

			if ( $product->get_type() !== 'variable' ) {
				return false;
			}

			if ( sizeof( $product->get_children() ) > 0 ) {
				$total_stock = max( 0, $product->get_stock_quantity() );

				foreach ( $product->get_children() as $child_id ) {
					if ( 'yes' === get_post_meta( $child_id, '_manage_stock', true ) ) {
						$stock       = get_post_meta( $child_id, '_stock', true );
						$total_stock += max( 0, wc_stock_amount( $stock ) );
					}
				}

				return $total_stock;
			}

			return false;
		}

		public function init() {
			$this->addActions();

			$this->addFilters();
		}

		public function removeProductTabs() {
			return [];
		}

		public function wooCommerceFromPrice() {
			/**
			 * @var WC_Product $product
			 */
			global $product;

			// Getting the WooCommerce price prefix.
			$pricePrefix             = $this->baseTheme->getOption( 'woocommerce.product_prices.from_prefix' );
			$pricePrefix             = $pricePrefix ? "<span class=\"prefix\">{$pricePrefix}</span>" : '';
			$productVariationPrices  = $product->get_variation_prices();

			if ( ! empty ( $productVariationPrices ) && ! empty ( $productVariationPrices['price'] ) ) {
				$productVariation = array_keys( $productVariationPrices['price'], min( $productVariationPrices['price'] ) );

				if ( ! empty ( $productVariation[0] ) ) {
					$productVariation = new WC_Product_Variation( $productVariation[0] );

					print '<div class="woocommerce-product-from-price">' . $pricePrefix . $productVariation->get_price_html() . '</div>';
				}
			}
		}

		public function wooCommerceProductUsps() {
			// Getting the WooCommerce theme settings.
			$themeWooCommerceOptions = $this->baseTheme->getOption( 'woocommerce' );

			// Checking whether the USPS are even being used.
			if (
				empty ( $themeWooCommerceOptions ) ||
				empty ( $themeWooCommerceOptions['product_usps'] ) ||
				empty ( $themeWooCommerceOptions['product_usps']['items'] )
			) {
				return;
			}

			$uspItems = json_decode( $themeWooCommerceOptions['product_usps']['items'], true ); ?>

			<?php if ( ! empty ( $uspItems ) ) : ?>
				<div class="woocommerce-products-usps">
					<ul>
						<?php foreach ( $uspItems as $uspItem ) :
							if ( empty ( $uspItem['text'] ) ) {
								continue;
							} ?>
							<li><span><?php echo $uspItem['text']; ?></span></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endif;
		}

		/**
		 * @param        $object
		 * @param string $postType
		 *
		 * @return string
		 */
		public function wooCommerceShippingEstimateNotice( $object, $postType = 'product' ): string {
			if ( ! $object ) {
				return '';
			}

			// Getting the WooCommerce theme settings.
			$themeWooCommerceOptions      = $this->baseTheme->getOption( 'woocommerce' );
			$shippingEstimateNotification = '';

			// Checking whether the notifications are even being used.
			if (
				empty ( $themeWooCommerceOptions ) ||
				empty ( $themeWooCommerceOptions['estimated_shipping'] ) ||
				empty ( $themeWooCommerceOptions['estimated_shipping']['usage'] )
			) {
				return '';
			}

			// Using the tight doc in order to make the magic methods available.
			// This is not really needed, it just makes it more clear within the editor.
			switch ( $postType ) {
				case 'product':
					/**
					 * @var WC_Product $object
					 */

					break;

				case 'product_variation':
					/**
					 * @var WC_Product_Variation $object
					 */

					break;
			}

			if ( ( ! $object->managing_stock() || $object->managing_stock() && $object->is_in_stock() ) && $object->get_stock_quantity() > 0 && ! empty ( $themeWooCommerceOptions['estimated_shipping']['in_stock'] ) ) {
				$shippingEstimateNotification = $themeWooCommerceOptions['estimated_shipping']['in_stock'];
			}

			if ( $object->managing_stock() && ! $object->is_in_stock() ) {
				if ( $object->backorders_allowed() ) {
					if ( ! empty ( $themeWooCommerceOptions['estimated_shipping']['out_of_stock_but_available'] ) ) {
						$shippingEstimateNotification = $themeWooCommerceOptions['estimated_shipping']['out_of_stock_but_available'];
					}
				} else {
					if ( ! empty ( $themeWooCommerceOptions['estimated_shipping']['out_of_stock'] ) ) {
						$shippingEstimateNotification = $themeWooCommerceOptions['estimated_shipping']['out_of_stock'];
					}
				}
			}

			return ! empty ( $shippingEstimateNotification ) ? "<div class=\"woocommerce-estimated-shipping-notice\"><span>{$shippingEstimateNotification}</span></div>" : '';
		}

		public function wooCommerceSimpleProductPrice() {
			global $product;

			/**
			 * @var WC_Product $product
			 */
			if ( ! $product ) {
				return;
			}

			if ( $product->get_type() !== 'simple' ) {
				return;
			}

			wc_get_template( 'single-product/price.php' );
		}

		public function wooCommerceSimpleProductShippingNotice() {
			global $product;

			/**
			 * @var WC_Product $product
			 */
			if ( ! $product ) {
				return;
			}

			if ( $product->get_type() !== 'simple' ) {
				return;
			}

			print $this->wooCommerceShippingEstimateNotice( $product, 'product' );
		}

		public function wooCommerceSimpleProductStockNotice() {
			global $product;

			/**
			 * @var WC_Product $product
			 */
			if ( ! $product ) {
				return;
			}

			if ( $product->get_type() !== 'simple' ) {
				return;
			}

			print wc_get_stock_html( $product ); // WPCS: XSS ok.
		}

		private function addActions() {

			add_action( 'woocommerce_before_main_content', [ $this, 'addProductTitle' ], 15 );

			add_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );

			//add_action( 'woocommerce_before_add_to_cart_button', [ $this, 'wooCommerceInitialShippingEstimateNotice' ], 20 );

			add_action( 'woocommerce_single_variation', [ $this, 'wooCommerceFromPrice' ], 10 );

			add_action( 'woocommerce_before_add_to_cart_form', [ $this, 'wooCommerceSimpleProductPrice' ], 10 );

			add_action( 'woocommerce_before_add_to_cart_form', [ $this, 'wooCommerceSimpleProductStockNotice' ], 11 );

			add_action( 'woocommerce_before_add_to_cart_form', [ $this, 'wooCommerceSimpleProductShippingNotice' ], 12 );


			add_action( 'woocommerce_after_add_to_cart_form', [ $this, 'wooCommerceProductUsps' ], 30 );

			add_action( 'woocommerce_after_single_product_summary', [ $this, 'addAfterSingleProductSummary' ], 10 );
		}

		private function addFilters() {
			add_filter( 'woocommerce_available_variation', [ $this, 'addEstimatedShippingNoticeToVariation' ], 10, 3 );

			/**
			 * Since were not using tabs, i've commented this.
			 * I've not deleted it since there may be a change
			 * tabs will be used again in the future.
			 */
			//add_filter( 'woocommerce_product_tabs', [ $this, 'changeProductTabs' ], 10, 1 );

			add_filter( 'woocommerce_product_description_heading', [ $this, 'changeProductDescriptionTabHeading' ] );

			add_filter( 'woocommerce_product_additional_information_heading', [ $this, 'changeProductExtraInformationTabHeading' ] );

			add_filter( 'woocommerce_product_tabs', [ $this, 'removeProductTabs' ], 10, 1 );
		}
	}