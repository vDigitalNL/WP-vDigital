<?php
/**
 * My Account Dashboard
 *
 * Shows the first intro screen on the account dashboard.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/myaccount/dashboard.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see         https://docs.woocommerce.com/document/template-structure/
 * @package     WooCommerce/Templates
 * @version     2.6.0
 */

if ( !defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<div class="row">
	<div class="col-lg-4 col-xl-3">
		<div class="woocommerce-MyAccount-sidebar">
			<?php do_action( 'woocommerce_account_dashboard_sidebar' ); ?>
		</div>
		<!-- /.woocommerce-MyAccount-sidebar -->
	</div>
	<!-- /.col-md-4 -->
	<div class="col-lg-8 col-xl-9">
        <?php
        /**
         * My Account dashboard.
         *
         * @since 2.6.0
         */
        do_action( 'woocommerce_account_dashboard' );

        /**
         * Deprecated woocommerce_before_my_account action.
         *
         * @deprecated 2.6.0
         */
        do_action( 'woocommerce_before_my_account' );

        /**
         * Deprecated woocommerce_after_my_account action.
         *
         * @deprecated 2.6.0
         */
        do_action( 'woocommerce_after_my_account' ); ?>
	</div>
	<!-- /.col-md-8 -->
</div>
<!-- /.row -->

