<header class="woocommerce-products-header">
	<?php if ( apply_filters( 'woocommerce_show_page_title', true ) ) : ?>
		<h1 class="woocommerce-products-header__title page-title"><?php woocommerce_page_title(); ?></h1>
	<?php endif; ?>
</header>

<?php
	/**
	 * Hook: woocommerce_before_main_content.
	 *
	 * @hooked woocommerce_output_content_wrapper - 10 (outputs opening divs for the content)
	 * @hooked woocommerce_breadcrumb - 20
	 * @hooked WC_Structured_Data::generate_website_data() - 30
	 */

	do_action( 'woocommerce_before_main_content' );
?>

<?php
	woocommerce_result_count();

	woocommerce_product_loop_start();

	while ( have_posts() ) {
		the_post();

		/**
		 * Hook: woocommerce_shop_loop.
		 */
		do_action( 'woocommerce_shop_loop' );

		wc_get_template_part( 'content', 'product' );
	}

	woocommerce_product_loop_end();

	/**
	 * Hook: woocommerce_after_shop_loop.
	 *
	 * @hooked woocommerce_pagination - 10
	 */
	//do_action( 'woocommerce_after_shop_loop' );

	woocommerce_pagination();


	/**
	 * Hook: woocommerce_after_main_content.
	 *
	 * @hooked woocommerce_output_content_wrapper_end - 10 (outputs closing divs for the content)
	 */
	do_action( 'woocommerce_after_main_content' );
?>