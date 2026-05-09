<?php
	/**
	 * Show options for ordering
	 *
	 * This template can be overridden by copying it to yourtheme/woocommerce/loop/orderby.php.
	 *
	 * HOWEVER, on occasion WooCommerce will need to update template files and you
	 * (the theme developer) will need to copy the new files to your theme to
	 * maintain compatibility. We try to do this as little as possible, but it does
	 * happen. When this occurs the version of the template file will be bumped and
	 * the readme will list any important changes.
	 *
	 * @see         https://docs.woocommerce.com/document/template-structure/
	 * @package     WooCommerce/Templates
	 * @version     3.6.0
	 */

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

?>
<div class="d-flex justify-content-end">
	<div class="woocommerce-toggle-filters">
		<button>
			<?php echo baseTheme()->__( 'Filter' ); ?>
			<svg height="394pt" viewBox="-5 0 394 394.00003" width="394pt" xmlns="http://www.w3.org/2000/svg"><path d="m367.820312 0h-351.261718c-6.199219-.0117188-11.878906 3.449219-14.710938 8.960938-2.871094 5.585937-2.367187 12.3125 1.300782 17.414062l128.6875 181.285156c.042968.0625.089843.121094.132812.183594 4.675781 6.3125 7.207031 13.960938 7.21875 21.816406v147.800782c-.027344 4.375 1.691406 8.582031 4.773438 11.6875 3.085937 3.101562 7.28125 4.851562 11.65625 4.851562 2.222656-.003906 4.425781-.445312 6.480468-1.300781l72.3125-27.570313c6.476563-1.980468 10.777344-8.09375 10.777344-15.453125v-120.015625c.011719-7.855468 2.542969-15.503906 7.214844-21.816406.042968-.0625.089844-.121094.132812-.183594l128.691406-181.289062c3.667969-5.097656 4.171876-11.820313 1.300782-17.40625-2.828125-5.515625-8.511719-8.9765628-14.707032-8.964844zm0 0"/></svg>
		</button>
	</div>
	<form class="woocommerce-ordering" method="get">
		<div class="woocommerce-ordering-container">
			<label for="orderby"><?php echo baseTheme()->__( 'Sort on' ); ?></label>
			<select name="orderby" id="orderby" class="orderby" aria-label="<?php esc_attr_e( 'Shop order', 'woocommerce' ); ?>">
				<?php foreach ( $catalog_orderby_options as $id => $name ) : ?>
					<option value="<?php echo esc_attr( $id ); ?>" <?php selected( $orderby, $id ); ?>><?php echo esc_html( $name ); ?></option>
				<?php endforeach; ?>
			</select>
			<input type="hidden" name="paged" value="1" />
			<?php wc_query_string_form_fields( null, array( 'orderby', 'submit', 'paged', 'product-page' ) ); ?>
		</div>
	</form>
</div>
