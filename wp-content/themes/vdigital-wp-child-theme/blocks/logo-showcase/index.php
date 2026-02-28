<?php
$arguments = [
	'labels'              => [
		'name'          => baseTheme()->__( 'Logo showcases' ),
		'singular_name' => baseTheme()->__( 'Logo showcase' ),
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
	'menu_icon' => 'data:image/svg+xml;base64,' . base64_encode('<svg fill="#a7aaad" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 800 800"> <path class="st1" d="M720,720H80V80h640v640ZM486.1,223.11v-55.74H131.05v55.74h355.05ZM297.96,380.02v-71.9h-166.91v71.9h166.91ZM483.45,380.02v-71.9h-166.91v71.9h166.91ZM668.95,380.02v-71.9h-166.91v71.9h166.91ZM297.96,505.82v-71.9h-166.91v71.9h166.91ZM483.45,505.82v-71.9h-166.91v71.9h166.91ZM668.95,505.82v-71.9h-166.91v71.9h166.91ZM297.96,631.62v-71.9h-166.91v71.9h166.91ZM483.45,631.62v-71.9h-166.91v71.9h166.91ZM668.95,631.62v-71.9h-166.91v71.9h166.91Z"/> </svg>')
];

register_post_type( 'logo-showcase', $arguments );


