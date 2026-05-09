<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceCart
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceCart extends ThemeModuleAbstractClass {

		public function addActions() {
			add_action( 'woocommerce_checkout_before_customer_details', [ $this, 'checkoutProcess' ] );
			add_action( 'woocommerce_checkout_after_order_review', [ $this, 'checkoutProcessNavigation' ] );
			add_action( 'woocommerce_before_cart_table', [ $this, 'beforeCartTable' ] );
			add_action( 'woocommerce_before_cart_totals', [ $this, 'couponClone' ] );
			add_action( 'woocommerce_checkout_order_review', [ $this, 'couponClone' ], 1 );
		}

		public function addFilters() {
			add_filter( 'woocommerce_cart_item_remove_link', [ $this, 'cartItemRemoveLink' ], 10, 2 );
		}

		/**
		 * Top cart navigation
		 */
		public function beforeCartTable() {
			$shopLink      = isset( json_decode( $this->baseTheme->getOption( 'woocommerce' )['woocommerce-shop-link'], true )['url'] ) ?
				json_decode( $this->baseTheme->getOption( 'woocommerce' )['woocommerce-shop-link'], true )['url'] : wc_get_page_permalink( 'shop' );
			$previousAngle = '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14"><g fill="#0071BE"><polygon transform="translate(-222 -278)translate(165 264)translate(57 7)translate(4.521895 13.738761)rotate(-90)translate(-4.521895 -13.738761)" points="11 16.5 10.1 17.5 4.5 11.9 -1 17.5 -2 16.5 4.5 10"/></g></svg>';
			$nextAngle     = '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14"><g fill="#FFF"><polygon transform="translate(-1229 -278)translate(1028 264)translate(39 7)translate(166.521895 13.738761)rotate(-270)translate(-166.521895 -13.738761)" points="173 16.5 172.1 17.5 166.5 11.9 161 17.5 160 16.5 166.5 10"/></g></svg>';
			$html          = '<div class="cart-navigation">';
			$html          .= '<a href="' . $shopLink . '" class="btn btn-outline-primary">' . $previousAngle . $this->baseTheme->__( 'Continue shopping' ) . '</a>';
			$html          .= '<a href="' . wc_get_checkout_url() . '" class="btn btn-primary">' . $this->baseTheme->__( 'Proceed to checkout' ) . $nextAngle . '</a>';
			$html          .= '</div>';
			echo $html;
		}

		/**
		 * @param $button
		 * @param $cart_item_key
		 *
		 * @return mixed
		 */
		public function cartItemRemoveLink( $button, $cart_item_key ) {
			$icon   = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19"><g fill="#192043"><path d="M7 0C5.8 0 4.9 1 4.9 2.2L4.9 2.9 0.5 2.9 0.5 4.4 2 4.4 2 16.8C2 18 2.9 19 4.1 19L12.9 19C14.1 19 15 18 15 16.8L15 4.4 16.5 4.4 16.5 2.9 12.1 2.9 12.1 2.2C12.1 1 11.2 0 10 0L7 0ZM7 1.5L10 1.5C10.4 1.5 10.7 1.8 10.7 2.2L10.7 2.9 6.3 2.9 6.3 2.2C6.3 1.8 6.6 1.5 7 1.5ZM3.4 4.4L13.6 4.4 13.6 16.8C13.6 17.2 13.3 17.5 12.9 17.5L4.1 17.5C3.7 17.5 3.4 17.2 3.4 16.8L3.4 4.4ZM4.9 5.8L4.9 16.1 6.3 16.1 6.3 5.8 4.9 5.8ZM7.8 5.8L7.8 16.1 9.2 16.1 9.2 5.8 7.8 5.8ZM10.7 5.8L10.7 16.1 12.1 16.1 12.1 5.8 10.7 5.8Z"/></g></svg>';
			$button = str_replace( '&times;', $icon, $button );

			return $button;
		}

		public function checkoutProcess() {
			?>
			<div class="checkout-process-steps">
				<?php foreach (
					[
						[ '1', $this->baseTheme->__( 'Information' ), 'active' ],
						[ '2', $this->baseTheme->__( 'Delivery' ), '' ],
						[ '3', $this->baseTheme->__( 'Payment' ), '' ],
						[ '4', $this->baseTheme->__( 'Pay' ), '' ],
					] as $step
				) : ?>
					<div class="checkout-process-steps__step <?php echo $step[2] ?>" data-step="<?php echo $step[0] ?>">
					<span>
						<svg class="bi bi-check" width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd"
							      d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/>
						</svg>
						<i><?php echo $step[0] ?></i>
					</span>
						<?php echo $step[1] ?>
					</div>
				<?php endforeach; ?>
			</div>
			<?php
		}

		public function checkoutProcessNavigation() {
			$previousAngle = '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14"><g fill="#0071BE"><polygon transform="translate(-222 -278)translate(165 264)translate(57 7)translate(4.521895 13.738761)rotate(-90)translate(-4.521895 -13.738761)" points="11 16.5 10.1 17.5 4.5 11.9 -1 17.5 -2 16.5 4.5 10"/></g></svg>';
			$nextAngle     = '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14"><g fill="#FFF"><polygon transform="translate(-1229 -278)translate(1028 264)translate(39 7)translate(166.521895 13.738761)rotate(-270)translate(-166.521895 -13.738761)" points="173 16.5 172.1 17.5 166.5 11.9 161 17.5 160 16.5 166.5 10"/></g></svg>';
			?>
			<div class="checkout-process-navigation">
				<a href="<?php echo wc_get_cart_url() ?>"
				   class="checkout-process-navigation__previous btn btn-outline-primary"><?php echo $previousAngle . $this->baseTheme->__( 'Previous' ) ?></a>
				<a href="#" class="checkout-process-navigation__next btn btn-primary"><?php echo $this->baseTheme->__( 'Next' ) . $nextAngle ?></a>
			</div>
			<?php
		}

		public function couponClone() {
			if ( wc_coupons_enabled() ) : ?>
				<div class="coupon-clone checkout-process" data-process-step="3">
					<label for="coupon_code_clone">
						<?php echo $this->baseTheme->__( 'Do you have a discount code? click here' ) ?>
						<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6">
							<polygon transform="translate(-1244 -1038)translate(856 1015)translate(393 26)rotate(-360)translate(-393 -26)"
							         points="398 28.2 397.3 29 393 24.5 388.7 29 388 28.2 393 23" fill="#192043"/>
						</svg>
					</label>
					<div class="coupon-clone__inner">
						<input type="text" name="coupon_code_clone" class="input-text" id="coupon_code_clone" value=""
						       placeholder="<?php esc_attr_e( 'Coupon code', 'woocommerce' ); ?>"/>
						<button type="button" class="button" name="apply_coupon_clone" value="<?php esc_attr_e( 'Apply coupon', 'woocommerce' ); ?>">
							<?php esc_attr_e( 'Apply coupon', 'woocommerce' ); ?>
						</button>
						<?php $this->baseTheme->doAction( 'woocommerce_cart_coupon_clone' ) ?>
					</div>
				</div>
			<?php endif;
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}
	}