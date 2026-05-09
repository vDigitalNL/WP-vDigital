<?php
	/**
	 * Single variation cart button
	 *
	 * @see https://docs.woocommerce.com/document/template-structure/
	 * @package WooCommerce/Templates
	 * @version 3.4.0
	 */

	defined( 'ABSPATH' ) || exit;

	global $product;
?>
<div class="woocommerce-variation-add-to-cart variations_button">
	<?php do_action( 'woocommerce_before_add_to_cart_button' ); ?>

	<div class="row">
		<div class="col-lg-4">
			<?php
				do_action( 'woocommerce_before_add_to_cart_quantity' );

				woocommerce_quantity_input(
					array(
						'min_value'   => apply_filters( 'woocommerce_quantity_input_min', $product->get_min_purchase_quantity(), $product ),
						'max_value'   => apply_filters( 'woocommerce_quantity_input_max', $product->get_max_purchase_quantity(), $product ),
						'input_value' => isset( $_POST['quantity'] ) ? wc_stock_amount( wp_unslash( $_POST['quantity'] ) ) : $product->get_min_purchase_quantity(), // WPCS: CSRF ok, input var ok.
					)
				);

				do_action( 'woocommerce_after_add_to_cart_quantity' );
			?>
		</div>

		<div class="col-lg-8">
			<button type="submit" class="single_add_to_cart_button button alt">
				<div class="single_add_to_cart_button__content">
					<svg xmlns="http://www.w3.org/2000/svg" width="23" height="21" viewBox="0 0 23 21"><path d="M17.8 16L9.2 16 8.7 13.9 19.8 13.9 22.2 4.4 6.3 4.4 5.5 1 1 1 1 2.3 4.5 2.3 8 16.1C7 16.3 6.2 17.2 6.2 18.2 6.2 19.5 7.2 20.5 8.4 20.5 9.7 20.5 10.7 19.5 10.7 18.2 10.7 17.9 10.6 17.6 10.4 17.3L15.7 17.3C15.6 17.6 15.5 17.9 15.5 18.2 15.5 19.5 16.5 20.5 17.8 20.5 19 20.5 20 19.5 20 18.2 20 17 19 16 17.8 16ZM6.6 5.6L20.6 5.6 18.9 12.7 8.4 12.7 6.6 5.6ZM8.4 19.2C7.9 19.2 7.4 18.8 7.4 18.2 7.4 17.7 7.9 17.3 8.4 17.3 9 17.3 9.4 17.7 9.4 18.2 9.4 18.8 9 19.2 8.4 19.2ZM17.8 19.2C17.2 19.2 16.8 18.8 16.8 18.2 16.8 17.7 17.2 17.3 17.8 17.3 18.3 17.3 18.7 17.7 18.7 18.2 18.7 18.8 18.3 19.2 17.8 19.2Z" style="fill:#fff;stroke-width:0.2;stroke:#fff"></path></svg>
					<span class="text">
						<?php echo esc_html( $product->single_add_to_cart_text() ); ?>
					</span>
				</div>
			</button>

			<?php do_action( 'woocommerce_after_add_to_cart_button' ); ?>
		</div>
	</div>

	<input type="hidden" name="add-to-cart" value="<?php echo absint( $product->get_id() ); ?>" />
	<input type="hidden" name="product_id" value="<?php echo absint( $product->get_id() ); ?>" />
	<input type="hidden" name="variation_id" class="variation_id" value="0" />
</div>