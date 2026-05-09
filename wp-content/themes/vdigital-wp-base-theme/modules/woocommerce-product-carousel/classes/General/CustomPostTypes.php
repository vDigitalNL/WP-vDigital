<?php

namespace Theme\Modules\WoocommerceProductCarousel\General;

use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class CustomPostTypes
 *
 * @package Theme\Modules\WoocommerceProductCarousel\General
 */
class CustomPostTypes extends ThemeModuleAbstractClass {

	public function init() {
		$this->registerProductCarousel();
	}

	private function registerProductCarousel() {
		$labels = [
			'name'               => baseTheme()->__( 'Product Carousels' ),
			'singular_name'      => baseTheme()->__( 'Product Carousel' ),
			'menu_name'          => baseTheme()->__( 'Product Carousels' ),
			'name_admin_bar'     => baseTheme()->__( 'Product carousel' ),
			'add_new'            => baseTheme()->__( 'Add New' ),
			'add_new_item'       => baseTheme()->__( 'Add New Product Carousel' ),
			'new_item'           => baseTheme()->__( 'New Product Carousel' ),
			'edit_item'          => baseTheme()->__( 'Edit Product Carousel' ),
			'view_item'          => baseTheme()->__( 'View Product Carousel' ),
			'all_items'          => baseTheme()->__( 'All Product Carousels' ),
			'search_items'       => baseTheme()->__( 'Search Product Carousels' ),
			'parent_item_colon'  => baseTheme()->__( 'Parent Product Carousels:' ),
			'not_found'          => baseTheme()->__( 'No Product Carousels found.' ),
			'not_found_in_trash' => baseTheme()->__( 'No Product Carousels found in Trash.' ),
		];

		$arguments = [
			'labels'              => $labels,
			'public'              => true,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'query_var'           => true,
			'exclude_from_search' => true,
			'rewrite'             => array( 'slug' => 'product-carousel' ),
			'capability_type'     => 'post',
			'has_archive'         => true,
			'hierarchical'        => false,
			'menu_position'       => null,
			'supports'            => array( 'title' ),
		];

		register_post_type( 'product_carousel', $arguments );
	}
}