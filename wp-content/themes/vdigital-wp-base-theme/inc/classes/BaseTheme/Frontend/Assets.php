<?php

	namespace Theme\BaseTheme\Frontend;

	use Theme\BaseTheme\AbstractClass;
	use Theme\Helpers\Arr;

	/**
	 * Class Assets
	 *
	 * @package Theme\BaseTheme\Frontend
	 */
	final class Assets extends AbstractClass {

		const BOOTSTRAP_JS_MODULES_FILE = 'resources/js/bootstrap-modules.js';

		const BOOTSTRAP_SASS_MODULES_FILE = 'resources/sass/source/bootstrap-modules.scss';

		/**
		 * @var bool[] Array of modules and their default states. Modules will be loaded in this order.
		 */
		private $bootstrapJsModules = [
			/*
			 * Mandatory modules
			 */

			/*
			 * Optional modules
			 */
			'alert'     => false,
			'button'    => false,
			'carousel'  => false,
			'collapse'  => true,
			'dropdown'  => false,
			'modal'     => false,
			'popover'   => false,
			'scrollspy' => false,
			'tab'       => false,
			'tooltip'   => false,
		];

		/**
		 * @var bool[] Array of modules and their default states. Modules will be loaded in this order.
		 */
		private $bootstrapSassModules = [
			/*
			 * Mandatory modules
			 */
			'root'         => true,
			'reboot'       => true,
			'grid'         => true,
			'nav'          => true,
			'navbar'       => true,
			'transitions'  => true,
			'_utilities'   => true,

			/*
			 * Optional modules
			 */
			'type'         => true,
			'images'       => false,
			'code'         => false,
			'tables'       => false,
			'forms'        => true,
			'buttons'      => true,
			'dropdown'     => false,
			'button-group' => false,
			'input-group'  => false,
			'custom-forms' => false,
			'card'         => false,
			'breadcrumb'   => true,
			'pagination'   => false,
			'badge'        => false,
			'jumbotron'    => false,
			'alert'        => false,
			'progress'     => false,
			'media'        => true,
			'list-group'   => true,
			'close'        => true,
			'modal'        => false,
			'tooltip'      => false,
			'popover'      => false,
			'carousel'     => false,
			'print'        => false,
		];

		/**
		 * @var array Array of mandatory Bootstrap Sass modules
		 */
		private $mandatoryBootstrapJsModules = [
			'root',
			'reboot',
			'grid',
			'nav',
			'navbar',
			'_utilities',
		];

		/**
		 * @var array Array of mandatory Bootstrap Sass modules
		 */
		private $mandatoryBootstrapSassModules = [
			'root',
			'reboot',
			'grid',
			'nav',
			'navbar',
			'transitions',
			'_utilities',
		];

		/**
		 * Enqueue frontend theme stylesheets and scripts
		 */
		public function enqueueAssets() {
			$minified = baseTheme()->isProductionSite() ? '.min' : '';

			$cssFiles = [
				[
					'dependencies' => [],
					'handle'       => 'theme-main',
					'media'        => 'all',
					'sources'      => [
						$this->baseTheme->childThemeRootDir() . "/assets/css/main{$minified}.css"   => $this->baseTheme->childThemeRootUri() . "/assets/css/main{$minified}.css",
						$this->baseTheme->childThemeRootDir() . "/assets/css/main.css"              => $this->baseTheme->childThemeRootUri() . "/assets/css/main.css",
					],
				],
				[
					'dependencies' => [],
					'handle'       => 'theme-tablet',
					'media'        => '(min-width:576px)',
					'sources'      => [
						$this->baseTheme->childThemeRootDir() . "/assets/css/tablet{$minified}.css" => $this->baseTheme->childThemeRootUri() . "/assets/css/tablet{$minified}.css",
						$this->baseTheme->childThemeRootDir() . "/assets/css/tablet.css"            => $this->baseTheme->childThemeRootUri() . "/assets/css/tablet.css"
					],
				],
				[
					'dependencies' => [],
					'handle'       => 'theme-desktop',
					'media'        => '(min-width:768px)',
					'sources'      => [
						$this->baseTheme->childThemeRootDir() . "/assets/css/desktop{$minified}.css" => $this->baseTheme->childThemeRootUri() . "/assets/css/desktop{$minified}.css",
						$this->baseTheme->childThemeRootDir() . "/assets/css/desktop.css"            => $this->baseTheme->childThemeRootUri() . "/assets/css/desktop.css"
					],
				],
			];
			$jsFiles  = [
				[
					'dependencies' => [],
					'handle'       => 'theme-header',
					'in_footer'    => false,
					'sources'      => [
						$this->baseTheme->childThemeRootDir() . "/assets/js/header{$minified}.js"   => $this->baseTheme->childThemeRootUri() . "/assets/js/header{$minified}.js",
						$this->baseTheme->childThemeRootDir() . "/assets/js/header.js"              => $this->baseTheme->childThemeRootUri() . "/assets/js/header.js",
					],
				],
				[
					'dependencies' => [],
					'handle'       => 'theme-footer',
					'in_footer'    => true,
					'sources'      => [
						$this->baseTheme->childThemeRootDir() . "/assets/js/footer{$minified}.js"   => $this->baseTheme->childThemeRootUri() . "/assets/js/footer{$minified}.js",
						$this->baseTheme->childThemeRootDir() . "/assets/js/footer.js"              => $this->baseTheme->childThemeRootUri() . "/assets/js/footer.js",
					],
				],
			];

			foreach ( $cssFiles as $cssFile ) {
				if ( ! empty ( $cssFile['sources'] ) ) {
					foreach( $cssFile['sources'] as $dir => $url ) {
						if ( is_readable( $dir ) ) {
							wp_enqueue_style( $cssFile['handle'], $url, $cssFile['dependencies'], filemtime( $dir ), $cssFile['media'] );

							break;
						}
					}
				}
			}

			foreach ( $jsFiles as $jsFile ) {
				if ( ! empty ( $jsFile['sources'] ) ) {
					foreach( $jsFile['sources'] as $dir => $url ) {
						if ( is_readable( $dir ) ) {
							wp_enqueue_script( $jsFile['handle'], $url, $jsFile['dependencies'], filemtime( $dir ), $jsFile['in_footer'] );

							break;
						}
					}
				}
			}

            // Note: Commented because there are still plugins that require jQuery.
			//\wp_deregister_script( 'jquery' );
			//\wp_register_script( 'jquery', false );
		}

		/**
		 * Get all supported bootstrap JS modules and their default states
		 *
		 * @return array
		 */
		public function getBootstrapJsModules(): array {
			return $this->bootstrapJsModules;
		}

		/**
		 * Get all supported bootstrap Sass modules and their default states, in the order that they're loaded
		 *
		 * @return array
		 */
		public function getBootstrapSassModules(): array {
			return $this->bootstrapSassModules;
		}

		/**
		 * Retrieve all Bootstrap JS modules with their current active state
		 *
		 * @return array
		 */
		public function getCurrentBootstrapJsModules(): array {
			$file = $this->baseTheme->themeRootDir() . '/' . static::BOOTSTRAP_JS_MODULES_FILE;

			if ( ! file_exists( $file ) || ! is_readable( $file ) ) {
				return [];
			}

			$mandatoryModules = $this->getMandatoryBootstrapJsModules();
			$activeModules    = Arr::flatten( array_filter( array_map( function ( $line ) {
				$filename = [];

				preg_match( '/^(\/)?.+\/([^\/;]+);$/', trim( $line ), $filename );

				if ( ! $filename[2] ) {
					return [];
				}

				$module = trim( $filename[2], '\'"' );

				// Return an array with the name as the key and whether it's active (so it's not commented, represented by $filename[1]) as its value;
				return [ $module => ! $filename[1] ];
			}, (array) ( @file( $file ) ) ) ), true );

			$allModules = $this->getBootstrapJsModules();

			array_walk( $allModules, function ( & $active, $module ) use ( $activeModules, $mandatoryModules ) {
				//Check if the module is mandatory, then if it's active, or return the default state if it's not in the current file at all.
				$active = in_array( $module, $mandatoryModules ) || ( $activeModules[ $module ] ?? $active );
			}, $allModules );

			return $allModules;
		}

		/**
		 * Retrieve all Bootstrap Sass modules with their current active state, in the order they're loaded
		 *
		 * @return array
		 */
		public function getCurrentBootstrapSassModules(): array {
			$file = $this->baseTheme->themeRootDir() . '/' . static::BOOTSTRAP_SASS_MODULES_FILE;

			if ( ! file_exists( $file ) || ! is_readable( $file ) ) {
				return [];
			}

			$mandatoryModules = $this->getMandatoryBootstrapSassModules();
			$activeModules    = Arr::flatten( array_filter( array_map( function ( $line ) {
				$filename = [];

				preg_match( '/^(\/)?.+\/([^\/;]+);$/', trim( $line ), $filename );

				if ( ! $filename[2] ) {
					return [];
				}

				$module = trim( $filename[2], '\'"' );

				// Return an array with the name as the key and whether it's active (so it's not commented, represented by $filename[1]) as its value;
				return [ $module => ! $filename[1] ];
			}, (array) ( @file( $file ) ) ) ), true );

			$allModules = $this->getBootstrapSassModules();

			array_walk( $allModules, function ( & $active, $module ) use ( $activeModules, $mandatoryModules ) {
				//Check if the module is mandatory, then if it's active, or return the default state if it's not in the current file at all.
				$active = in_array( $module, $mandatoryModules ) || ( $activeModules[ $module ] ?? $active );
			}, $allModules );

			return $allModules;
		}

		/**
		 * Get all mandatory bootstrap JS modules
		 *
		 * @return array
		 */
		public function getMandatoryBootstrapJsModules(): array {
			return $this->mandatoryBootstrapJsModules;
		}

		/**
		 * Get all mandatory bootstrap Sass modules, in the order that they're loaded
		 *
		 * @return array
		 */
		public function getMandatoryBootstrapSassModules(): array {
			return $this->mandatoryBootstrapSassModules;
		}

		public function init() {
			add_action( 'wp_enqueue_scripts', [ $this, 'enqueueAssets' ], 9 );

			if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
				wp_enqueue_script( 'comment-reply' );
			}
		}

		/**
		 * Store Bootstrap JS modules with their current active state, in the order they're loaded
		 *
		 * @param bool[] $newModuleStates An array with all module names as its keys and their active state (boolean) as it values
		 *
		 * @return bool
		 */
		public function storeCurrentBootstrapJsModules(array $newModuleStates): bool {
			$bootstrapModules = $this->getCurrentBootstrapJsModules();
			$mandatoryModules = $this->getMandatoryBootstrapJsModules();

			foreach ( $bootstrapModules as $bootstrapModule => & $currentState ) {
				$currentState = in_array( $bootstrapModule, $mandatoryModules ) || ! empty( $newModuleStates[ $bootstrapModule ] );
				$importLine   = 'import "bootstrap/js/dist/' . $bootstrapModule . '";';

				if ( ! $currentState ) {
					$importLine = '//' . $importLine;
				}

				$currentState = $importLine;

				unset( $currentState );
			}

			$bootstrapModules = implode( "\n", $bootstrapModules );

			if ( @file_get_contents( $this->baseTheme->themeRootDir() . '/' . static::BOOTSTRAP_JS_MODULES_FILE ) != $bootstrapModules ) {
				if ( @file_put_contents( $this->baseTheme->themeRootDir() . '/' . static::BOOTSTRAP_JS_MODULES_FILE, $bootstrapModules ) ) {
					return true;
				}
			}

			return false;
		}

		/**
		 * Store Bootstrap Sass modules with their current active state, in the order they're loaded
		 *
		 * @param bool[] $newModuleStates An array with all module names as its keys and their active state (boolean) as it values
		 *
		 * @return bool
		 */
		public function storeCurrentBootstrapSassModules(array $newModuleStates): bool {
			$bootstrapModules = $this->getCurrentBootstrapSassModules();
			$mandatoryModules = $this->getMandatoryBootstrapSassModules();

			foreach ( $bootstrapModules as $bootstrapModule => & $currentState ) {
				$currentState = in_array( $bootstrapModule, $mandatoryModules ) || ! empty( $newModuleStates[ $bootstrapModule ] );
				$importLine   = '@import "~bootstrap/scss/' . $bootstrapModule . '";';

				if ( ! $currentState ) {
					$importLine = '//' . $importLine;
				}

				$currentState = $importLine;

				unset( $currentState );
			}

			$bootstrapModules = implode( "\n", $bootstrapModules );

			if ( @file_get_contents( $this->baseTheme->themeRootDir() . '/' . static::BOOTSTRAP_SASS_MODULES_FILE ) != $bootstrapModules ) {
				if ( @file_put_contents( $this->baseTheme->themeRootDir() . '/' . static::BOOTSTRAP_SASS_MODULES_FILE, $bootstrapModules ) ) {
					return true;
				}
			}

			return false;
		}
    }