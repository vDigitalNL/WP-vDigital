<?php

	//Load the vendor autoloader and theme autoloader
	if ( file_exists( WP_CHILD_THEME_DIR_VENDOR ) ) {
		require_once( WP_CHILD_THEME_DIR_VENDOR . 'autoload.php' );
	}

	//Load all other child theme functions
	$function_files = \Theme\Helpers\File::scanDir( WP_CHILD_THEME_DIR_FUNCTIONS, true, SCANDIR_FILETYPE_FILES, true );

	foreach ( (array) $function_files as $function_file ) {
		require_once( $function_file );
	}

	//Load an autoloader for the theme's classes
	spl_autoload_register( function ( $class ) {
		$class = $file = trim( $class, '\\' );

		if ( strpos( $class, 'ChildTheme\\Modules\\' ) === 0 ) {
			$fileDirMatches = [];

			preg_match( '/Theme\\\Modules\\\([^\\\]+)(\\\(.+))?/', $class, $fileDirMatches );

			if ( ! empty( $fileDirMatches[1] ) ) {
				$dir = str_replace( '_', '-', \Theme\Helpers\Str::fromCamelCase( $fileDirMatches[1] ) );

				if (!empty($fileDirMatches[3])) {
					//Load a class within a theme module folder
					$file  = WP_CHILD_THEME_DIR_MODULES . $dir . '/classes/' . $fileDirMatches[3];
				} else {
					//Load a theme module base class
					$file = WP_CHILD_THEME_DIR_MODULES . $dir . DS . $fileDirMatches[1];
				}
			}
		} elseif ( strpos( $class, 'ChildTheme\\' ) === 0 ) {
			$file = WP_CHILD_THEME_DIR_CLASSES . substr( $class, strlen( 'ChildTheme\\' ) );
		} else {
			$file = WP_CHILD_THEME_DIR_CLASSES_VENDOR . $class;
		}

		$file = str_replace( '\\', DS, $file ) . '.php';

		if ( is_readable( $file ) && is_file( $file ) ) {
			require_once( $file );

			return true;
		}

		return false;
	} );

