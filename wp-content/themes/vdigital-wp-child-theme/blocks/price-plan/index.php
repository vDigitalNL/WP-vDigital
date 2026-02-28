<?php
$arguments = [
	'labels'              => [
		'name'          => baseTheme()->__( 'Price Plans' ),
		'singular_name' => baseTheme()->__( 'Price Plan' ),
		'add_new'       => baseTheme()->__( 'Add New' ),
		'add_new_item'  => baseTheme()->__( 'Add New' ),
	],
	'public'              => false,
	'publicly_queryable'  => false,
	'show_ui'             => true,
	'show_in_menu'        => true,
	'query_var'           => true,
	'exclude_from_search' => true,
	'supports'            => [ 'title' ],
	'menu_icon'           => 'dashicons-money',
];

register_post_type( 'price-plan', $arguments );