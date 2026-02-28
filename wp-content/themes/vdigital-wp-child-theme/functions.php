<?php

if ( ! defined( 'DS' ) ) {
	define( 'DS', DIRECTORY_SEPARATOR );
}

// Override multisite upload limit to 64MB
add_filter( 'upload_size_limit', function( $size ) {
    return 64 * 1024 * 1024; // 64MB
}, 999 );

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

global $bugsnagWordpress;

if ( $bugsnagWordpress && get_site_option( 'bugsnag_api_key' ) ) {
    if ( ! defined( 'WW_DEV_SITE' ) || ! WW_DEV_SITE ) {
        $bugsnagWordpress->setReleaseStage( 'production' );

        return;
    }

    $bugsnagWordpress->setReleaseStage( 'development' );
}
