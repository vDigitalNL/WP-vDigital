<?php

if ( ! defined( 'DS' ) ) {
	define( 'DS', DIRECTORY_SEPARATOR );
}

// Override multisite upload limit to 64MB
add_filter( 'upload_size_limit', function( $size ) {
    return 64 * 1024 * 1024; // 64MB
}, 999 );

// AJAX handler for loading form shortcodes in popup
add_action( 'wp_ajax_get_form_shortcode', 'vdigital_get_form_shortcode' );
add_action( 'wp_ajax_nopriv_get_form_shortcode', 'vdigital_get_form_shortcode' );
function vdigital_get_form_shortcode() {
    $form_id = isset( $_GET['form_id'] ) ? sanitize_text_field( $_GET['form_id'] ) : '';

    if ( empty( $form_id ) ) {
        echo '<p class="tw-text-gray-02 tw-text-center">No form ID provided.</p>';
        wp_die();
    }

    // Try WPForms first
    if ( function_exists( 'wpforms' ) ) {
        // Get form HTML
        $form_html = do_shortcode( '[wpforms id="' . $form_id . '"]' );
        
        // Fix the form action URL - WPForms sets it to current URL which is wrong in AJAX context
        // Set it to home URL for non-AJAX fallback (AJAX submission uses admin-ajax.php directly)
        $form_html = preg_replace( '/action="[^"]*"/', 'action="' . esc_url( home_url( '/' ) ) . '"', $form_html );
        
        echo $form_html;
        wp_die();
    }

	wp_die();
}

//Define the base theme and child theme root
define( 'WP_BASE_THEME_DIR_ROOT', get_template_directory() . DS );
define( 'WP_CHILD_THEME_DIR_ROOT', get_stylesheet_directory() . DS );

if (file_exists(__DIR__ . '/../../../vendor/autoload.php')) {
	require_once __DIR__ . '/../../../vendor/autoload.php';
}

//Include the base theme and child theme constants
require_once( WP_BASE_THEME_DIR_ROOT . 'inc/constants.php' );
require_once( WP_CHILD_THEME_DIR_ROOT . 'inc/constants.php' );

//Include the base theme and child theme autoloaders
require_once( WP_BASE_THEME_DIR_INCLUDES . 'autoload.php' );
require_once( WP_CHILD_THEME_DIR_INCLUDES . 'autoload.php' );
require_once( WP_CHILD_THEME_DIR_BLOCKS . 'autoload.php' );

/**
 * @return \ChildTheme\ChildTheme
 */
function childTheme() {
	return \ChildTheme\ChildTheme::getInstance();
}

add_filter( 'acf/format_value/type=image', function ( $value, $post_id, array $field ) {
	// This is a fix for a bug caused by the 'Network Media Library' plugin
	// which broke the image functionality within repeaters
	if ( $post_id == 'options' && ! empty( $field['name'] ) && ( strpos( $field['name'], 'modal_content_' ) !== false ) || strpos( $field['name'], 'archive_connections_blocks_' ) !== false ) {
		return acf_get_value( $post_id, $field );
	}

	return $value;
}, 10000, 3 );

//Initialize the child theme framework
childTheme()->init();

function customBlockCategory( $categories, $post ): array {
	$categories = array_map( function( $category ) {
		$categoryRenames = [
			'text'  => 'Text elements',
			'media' => 'Media elements',
		];

		if ( isset( $categoryRenames[ $category['slug'] ] ) ) {
			$category['title'] = $categoryRenames[ $category['slug'] ];
		}
		return $category;
	}, $categories );

	// Extract media and text from WordPress categories
	$mediaCategory = array_values( array_filter( $categories, fn( $c ) => $c['slug'] === 'media' ) );
	$textCategory = array_values( array_filter( $categories, fn( $c ) => $c['slug'] === 'text' ) );
	$otherCategories = array_values( array_filter( $categories, fn( $c ) => ! in_array( $c['slug'], [ 'media', 'text' ] ) ) );

	return array_merge(
		[
			[ 'slug' => 'ww-backgrounds', 'title' => 'Backgrounds' ],
			[ 'slug' => 'ww-layout', 'title' => 'Layouts' ],
		],
		$textCategory,
		$mediaCategory,
		[
			[ 'slug' => 'ww-custom-only-background-required', 'title' => 'Custom - only background required' ],
			[ 'slug' => 'ww-custom-no-background-required', 'title' => 'Custom - no layout or background required' ],
			[ 'slug' => 'ww-news-reviews', 'title' => 'News / Reviews' ],
			[ 'slug' => 'ww-banner', 'title' => 'Banner' ],
		],
		$otherCategories
	);
}

add_filter( 'block_categories_all', 'customBlockCategory', 10, 2 );
