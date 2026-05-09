<?php

	namespace Theme\BaseTheme\Frontend;

	use Theme\BaseTheme;

	/**
	 * Class WooCommerce
	 *
	 * @package Theme\BaseTheme\Frontend
	 *
	 * @ToDo Check this class when we have a WooCommerce website
	 */
	final class WooCommerce extends BaseTheme\AbstractClass {

		/**
		 * @return array
		 */
		public function breadcrumbs() {
			return [
				'delimiter'   => ' &#47; ',
				'wrap_before' => '<nav class="woocommerce-breadcrumb" itemprop="breadcrumb"><div class="container">',
				'wrap_after'  => '</div></nav>',
				'before'      => '',
				'after'       => '',
				'home'        => _x( 'Home', 'breadcrumb', 'woocommerce' ),
			];
		}

		/**
		 * Cart Fragments.
		 *
		 * Ensure cart contents update when products are added to the cart via AJAX.
		 *
		 * @param array $fragments Fragments to refresh via AJAX.
		 *
		 * @return array Fragments to refresh via AJAX.
		 */
		function cartLinkFragment( $fragments ) {
			ob_start();
			$this->cartLink();
			$fragments['a.cart-contents'] = ob_get_clean();

			return $fragments;
		}

		/**
		 * @param array $fragments
		 *
		 * @return array
		 */
		public function headerAddToCartFragment( $fragments ) {
			global $woocommerce;

			ob_start();

			?>
			<a class="cart-customlocation text-link--white f-left" href="<?php echo $woocommerce->cart->get_cart_url(); ?>" title="<?php echo __( 'View your shopping cart', 'woothemes' ); ?>"><?php echo sprintf( _n( '%d product', '%d producten', $woocommerce->cart->cart_contents_count, 'woothemes' ), $woocommerce->cart->cart_contents_count ); ?>
				- <?php echo $woocommerce->cart->get_cart_total(); ?></a>
			<?php

			$fragments['a.cart-customlocation'] = ob_get_clean();

			return $fragments;
		}
		/**
		 * Cart Link.
		 *
		 * Displayed a link to the cart including the number of items present and the cart total.
		 *
		 * @return void
		 */
		function cartLink() {
			?>
			<a class="cart-contents" href="<?php echo esc_url( wc_get_cart_url() ); ?>" title="<?php echo baseTheme()->esc_attr__( 'View your shopping cart' ); ?>">
				<?php
					$item_count_text = sprintf(
					/* translators: number of items in the mini cart. */
						\baseTheme()->_n( '%d item', '%d items', WC()->cart->get_cart_contents_count() ),
						WC()->cart->get_cart_contents_count()
					);
				?>
				<span class="amount"><?php echo wp_kses_data( WC()->cart->get_cart_subtotal() ); ?></span> <span class="count"><?php echo esc_html( $item_count_text ); ?></span>
			</a>
			<?php
		}

		public function init() {
			add_filter( 'woocommerce_breadcrumb_defaults', [ $this, 'breadcrumbs' ] );

			// Ensure cart contents update when products are added to the cart via AJAX
			// Used in conjunction with https://gist.github.com/DanielSantoro/1d0dc206e242239624eb71b2636ab148
			add_filter( 'add_to_cart_fragments', [ $this, 'headerAddToCartFragment' ] );


			/**
			 * Disable the default WooCommerce stylesheet.
			 *
			 * Removing the default WooCommerce stylesheet and enqueing your own will
			 * protect you during WooCommerce core updates.
			 *
			 * @link https://docs.woocommerce.com/document/disable-the-default-stylesheet/
			 */
			add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );
		}
		/**
		 * Display Header Cart.
		 *
		 * @return void
		 */
		function headerCart() {
			if ( is_cart() ) {
				$class = 'current-menu-item';
			} else {
				$class = '';
			}
			?>
			<ul id="site-header-cart" class="site-header-cart">
				<li class="<?php echo esc_attr( $class ); ?>">
					<?php base_theme_woocommerce_cart_link(); ?>
				</li>
				<li>
					<?php
						$instance = [
							'title' => '',
						];

						the_widget( 'WC_Widget_Cart', $instance );
					?>
				</li>
			</ul>
			<?php
		}
	}