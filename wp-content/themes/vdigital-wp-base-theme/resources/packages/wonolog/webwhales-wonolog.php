<?php
	/**
	 * Plugin Name: Base Theme Wonolog Loader
	 * Description: Loads the Wonolog package included in the Base Theme
	 * Author: Web Whales
	 * Version: 1.1
	 */

	$templateVendorPath     = get_template_directory() . '/vendor';
	$composerAutoloaderPath = $templateVendorPath . '/autoload.php';

	if ( file_exists( $composerAutoloaderPath ) ) {
		require_once( $composerAutoloaderPath );

		//Load the Wonolog instance if it exists
		if ( function_exists( 'Inpsyde\Wonolog\bootstrap' ) ) {
			Inpsyde\Wonolog\bootstrap();
		}

		$wonologGetDotEnv = ( function () {
			$dotEnv = file_exists( ABSPATH . '.env' )
				? file( ABSPATH . '.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES ) : [];
			$dotEnv = array_column( array_map( function ( $dotEnv ) {
				list( $key, $value ) = explode( '=', trim( $dotEnv ), 2 );

				$value = trim( $value, '\'"' );

				if ( in_array( strtolower( $value ), [ 'true', 'false' ] ) ) {
					$value = strtolower( $value ) === 'true';
				}

				return [ $key, $value ];
			}, $dotEnv ), 1, 0 );

			return $dotEnv;
		} )();

		if ( ! empty( $wonologGetDotEnv['LOG_LEVEL'] ) ) {
			putenv( "WONOLOG_DEFAULT_MIN_LEVEL=" . $dotEnv['LOG_LEVEL'] );
		} else {
			if ( ! empty ( $wonologGetDotEnv['ENVIRONMENT'] ) && $wonologGetDotEnv['ENVIRONMENT'] == 'production' ) {
				putenv( "WONOLOG_DEFAULT_MIN_LEVEL=ERROR" );
			}
		}
	}