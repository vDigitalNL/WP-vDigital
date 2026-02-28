<?php

	namespace ChildTheme\ChildTheme\Backend;

	use ChildTheme\ChildTheme\AbstractClass;

	/**
	 * Class Assets
	 *
	 * @package Theme\ChildTheme\ChildTheme\Backend
	 */
	final class Assets extends AbstractClass {

		/**
		 * Enqueue backend theme stylesheets and scripts
		 */
		public function enqueueAssets(): void {
			$cssFiles = [
				[
					'dependencies' => [],
					'handle'       => 'theme-admin-css',
					'media'        => 'all',
					'source'       => $this->childTheme->themeRootDir() . '/assets/css/admin/main.css',
					'url'          => $this->childTheme->themeRootUri() . '/assets/css/admin/main.css',
				],
			];

			foreach ( $cssFiles as $cssFile ) {
				if ( is_readable( $cssFile['source'] ) ) {
					wp_enqueue_style( $cssFile['handle'], $cssFile['url'], $cssFile['dependencies'], filemtime( $cssFile['source'] ), $cssFile['media'] );
				}
			}
		}

		/**
		 * Include theme css and js files
		 */
		public function init() {
			add_action( 'admin_enqueue_scripts', [ $this, 'enqueueAssets' ] );
		}
	}