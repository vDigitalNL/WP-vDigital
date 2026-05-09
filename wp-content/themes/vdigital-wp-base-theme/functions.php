<?php

	if ( ! defined( 'DS' ) ) {
		define( 'DS', DIRECTORY_SEPARATOR );
	}

	if ( ! defined( 'WP_BASE_THEME_DIR_ROOT' ) ) {
		define( 'WP_BASE_THEME_DIR_ROOT', get_template_directory() . DS );
	}

	//Include the base theme constants
	require_once( WP_BASE_THEME_DIR_ROOT . 'inc/constants.php' );

	//Enable error logging when in debug mode
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		ini_set( 'display_errors', 'On' );
		error_reporting( E_ALL );
	}


	//Include the base theme autoloader
	require_once( WP_BASE_THEME_DIR_INCLUDES . 'autoload.php' );


	/**
	 * @return \Theme\BaseTheme
	 */
	function baseTheme() {
		return \Theme\BaseTheme::getInstance();
	}


	//Initialize the theme framework
	baseTheme()->init();