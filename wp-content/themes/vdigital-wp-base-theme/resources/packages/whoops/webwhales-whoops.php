<?php
	/**
	 * Plugin Name: Base Theme Whoops Loader
	 * Description: Loads the Whoops package included in the Base Theme
	 * Author: Web Whales
	 * Version: 1.1
	 */

	//Load the Whoops instance if it exists
	$templateVendorPath     = get_template_directory() . '/vendor';
	$composerAutoloaderPath = $templateVendorPath . '/autoload.php';

	if ( file_exists( $composerAutoloaderPath ) ) {
		require_once( $composerAutoloaderPath );

		if ( class_exists( '\Whoops\Run' ) ) {
			$whoops = new \Whoops\Run;

			// check if is doing ajax
			if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
				$whoops->pushHandler(
					( new \Whoops\Handler\JsonResponseHandler )->addTraceToOutput( true )
				);
			} elseif ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
				$whoops->pushHandler(
					( new \Whoops\Handler\JsonResponseHandler )->addTraceToOutput( true )
				);
			} elseif ( ( defined( 'DOING_CRON' ) && DOING_CRON ) || Whoops\Util\Misc::isCommandLine() ) {
				$whoops->pushHandler( new \Whoops\Handler\PlainTextHandler );
			} else {
				$tables = [
					'$wp'       => function () {
						global $wp;

						if ( ! $wp instanceof \WP ) {
							return [];
						}

						$output = get_object_vars( $wp );

						unset( $output['private_query_vars'] );
						unset( $output['public_query_vars'] );

						return array_filter( $output );
					},
					'$wp_query' => function () {
						global $wp_query;

						if ( ! $wp_query instanceof \WP_Query ) {
							return [];
						}

						$output               = get_object_vars( $wp_query );
						$output['query_vars'] = array_filter( $output['query_vars'] );

						unset( $output['posts'] );
						unset( $output['post'] );

						return array_filter( $output );
					},
					'$post'     => function () {
						$post = get_post();

						if ( ! $post instanceof \WP_Post ) {
							return [];
						}

						return get_object_vars( $post );
					},
				];

				$prettyPageHandler = new \Whoops\Handler\PrettyPageHandler;

				$prettyPageHandler->handleUnconditionally( true );
				$prettyPageHandler->setApplicationPaths( [ ABSPATH ] );

				foreach ( $tables as $name => $callback ) {
					$prettyPageHandler->addDataTableCallback( $name, $callback );
				}

				$whoops->pushHandler( $prettyPageHandler );
				$whoops->allowQuit( false );
			}

			$whoops->register();
		}
	}