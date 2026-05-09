<?php

	//Load the vendor autoloader and theme autoloader
	if ( ! file_exists( WP_BASE_THEME_DIR_VENDOR . 'autoload.php' ) ) {
		throw new \Exception(
			'Base theme vendor autoloader not found. Are you sure you ran "composer install" (or "composer install --no-dev" on production)?'
		);
	}

	require_once( WP_BASE_THEME_DIR_VENDOR . 'autoload.php' );

	//Load an autoloader for the theme's classes
	spl_autoload_register( function ( $class ) {
		$class = $file = trim( $class, '\\' );

		if ( strpos( $class, 'Theme\\Modules\\' ) === 0 ) {
			$fileDirMatches = [];

			preg_match( '/Theme\\\Modules\\\([^\\\]+)(\\\(.+))?/', $class, $fileDirMatches );

			if ( ! empty( $fileDirMatches[1] ) ) {
				$dir        = str_replace( '_', '-', \Theme\Helpers\Str::fromCamelCase( $fileDirMatches[1] ) );
				$modulesDir = WP_BASE_THEME_DIR_MODULES;

				if ( defined( 'WP_CHILD_THEME_DIR_TEMP_MODULES' ) && is_dir( WP_CHILD_THEME_DIR_TEMP_MODULES . $dir ) ) {
					$modulesDir = WP_CHILD_THEME_DIR_TEMP_MODULES;
				}

				if ( ! empty( $fileDirMatches[3] ) ) {
					//Load a class within a theme module folder
					$file = $modulesDir . $dir . '/classes/' . $fileDirMatches[3];
				} else {
					//Load a theme module base class
					$file = $modulesDir . $dir . \DS . $fileDirMatches[1];
				}
			}
		} elseif ( strpos( $class, 'Theme\\' ) === 0 ) {
			$file = WP_BASE_THEME_DIR_CLASSES . substr( $class, strlen( 'Theme\\' ) );
		} else {
			$file = WP_BASE_THEME_DIR_CLASSES_VENDOR . $class;
		}

		$file = str_replace( '\\', \DS, $file ) . '.php';

		if ( is_readable( $file ) && is_file( $file ) ) {
			require_once( $file );

			return true;
		}

		return false;
	} );