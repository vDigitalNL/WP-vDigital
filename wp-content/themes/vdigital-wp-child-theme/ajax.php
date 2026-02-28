<?php

define( 'DOING_AJAX', true );

$filePath = $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';

if ( ! file_exists( $filePath ) ) {
	wp_die( 'given path for wp-load does not exist.' );
}
require_once( $filePath );

header( 'Pragma: no-cache' );

send_nosniff_header();

$action = esc_attr( trim( $_REQUEST['action'] ) );

if ( ! wp_verify_nonce( $_REQUEST['nonce'], 'ajax_nonce' ) ) {
	wp_send_json_error( 'Invalid nonce' );
	exit;
}

$allowedActions = [
	'fetch_posts',
	'fetch_more_posts',
	'dyflexis_render_popup',
	'fetch_marketplace_posts',
];

if ( ! in_array( $action, $allowedActions ) ) {
	wp_send_json_error( 'This ajax call is not allowed' );
	exit;
}

do_action( 'wp_dyflexis_ajax_' . $action );