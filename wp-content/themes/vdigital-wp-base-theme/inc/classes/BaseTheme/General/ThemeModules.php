<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme;
	use Theme\BaseTheme\AbstractClass;
	use Theme\Exceptions\ThemeModuleNotLoadedException;
	use Theme\Helpers\Arr;
	use Theme\Helpers\Str;

	/**
	 * Class ThemeModules
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class ThemeModules extends AbstractClass {

		const MAX_PRIORITY = 99999999999999;

		/**
		 * @var BaseTheme\ThemeModuleAbstractBaseClass[]
		 */
		private $themeModuleObjects = [];

		/**
		 * Get ALL modules from the modules.json file
		 *
		 * @param bool $orderByPriority
		 *
		 * @return array
		 */
		public function getActiveThemeModulesFromJson( bool $orderByPriority = true ): array {
			$themeModules = $this->getAllThemeModulesFromJson( $orderByPriority );
			$themeModules = array_filter( $themeModules, function ( array $themeModule ) {
				return ! empty( $themeModule['active'] );
			} );

			return $themeModules;
		}

		/**
		 * @param bool $orderByPriority
		 *
		 * @return array
		 */
		public function getAllThemeModules( bool $orderByPriority = false ): array {
			$themeModules      = [];
			$themeModuleConfig = $this->getAllThemeModulesFromJson( false );

			if ( is_dir( $this->getBaseThemeModulesPath() ) ) {
				$baseThemeModules = glob( $this->getBaseThemeModulesPath( '*/module.json' ) );

				// Loop through all base theme modules
				foreach ( $baseThemeModules ?: [] as $baseThemeModule ) {
					$moduleDir = basename( dirname( $baseThemeModule ) );

					if ( ! ( $baseThemeModule = @file_get_contents( $baseThemeModule ) ) ) {
						continue;
					}

					if ( ! ( $baseThemeModule = @json_decode( $baseThemeModule, true ) ) ) {
						continue;
					}

					$baseThemeModule['active']   = false;
					$baseThemeModule['parent']   = false;
					$baseThemeModule['priority'] = (float) ( $baseThemeModule['priority'] ?? self::MAX_PRIORITY );
					$baseThemeModule['slug']     = $baseThemeModule['slug'] ?? $moduleDir;
					$baseThemeModule['theme']    = 'base';

					// Restore active and priority state from the theme module config
					if ( array_key_exists( $baseThemeModule['slug'], $themeModuleConfig ) ) {
						$baseThemeModule['active']   = $themeModuleConfig[ $baseThemeModule['slug'] ]['active'] ?? false;
						$baseThemeModule['priority'] = $themeModuleConfig[ $baseThemeModule['slug'] ]['priority'] ?? self::MAX_PRIORITY;
					}

					$themeModules[ $baseThemeModule['slug'] ] = $baseThemeModule;
				}
			}

			if ( is_dir( $this->getTemporaryModulesPath() ) ) {
				$temporaryModules = glob( $this->getTemporaryModulesPath( '*/module.json' ) );

				// Loop through all temporary modules
				foreach ( $temporaryModules ?: [] as $temporaryModule ) {
					$moduleDir = basename( dirname( $temporaryModule ) );

					if ( ! ( $temporaryModule = @file_get_contents( $temporaryModule ) ) ) {
						continue;
					}

					if ( ! ( $temporaryModule = @json_decode( $temporaryModule, true ) ) ) {
						continue;
					}

					$temporaryModule['active']   = false;
					$temporaryModule['parent']   = false;
					$temporaryModule['priority'] = (float) ( $temporaryModule['priority'] ?? self::MAX_PRIORITY );
					$temporaryModule['slug']     = $temporaryModule['slug'] ?? $moduleDir;
					$temporaryModule['theme']    = 'temp';

					// Restore active and priority state from the theme module config
					if ( array_key_exists( $temporaryModule['slug'], $themeModuleConfig ) ) {
						$temporaryModule['active']   = $themeModuleConfig[ $temporaryModule['slug'] ]['active'] ?? false;
						$temporaryModule['priority'] = $themeModuleConfig[ $temporaryModule['slug'] ]['priority'] ?? self::MAX_PRIORITY;
					}

					$themeModules[ $temporaryModule['slug'] ] = $temporaryModule;
				}
			}

			if ( $this->getChildThemeModulesPath() && is_dir( $this->getChildThemeModulesPath() ) ) {
				$childThemeModules = glob( $this->getChildThemeModulesPath( '*/module.json' ) );

				// Loop through all child theme modules
				foreach ( $childThemeModules ?: [] as $childThemeModule ) {
					$moduleDir = basename( dirname( $childThemeModule ) );

					if ( ! ( $childThemeModule = @file_get_contents( $childThemeModule ) ) ) {
						continue;
					}

					if ( ! ( $childThemeModule = @json_decode( $childThemeModule, true ) ) ) {
						continue;
					}

					$childThemeModule['active']   = false;
					$childThemeModule['parent']   = false;
					$childThemeModule['priority'] = (float) ( $childThemeModule['priority'] ?? self::MAX_PRIORITY );
					$childThemeModule['slug']     = $childThemeModule['slug'] ?? $moduleDir;
					$childThemeModule['theme']    = 'child';

					// Restore active and priority state from the theme module config
					if ( array_key_exists( $childThemeModule['slug'], $themeModuleConfig ) ) {
						$childThemeModule['active']   = $themeModuleConfig[ $childThemeModule['slug'] ]['active'] ?? false;
						$childThemeModule['priority'] = $themeModuleConfig[ $childThemeModule['slug'] ]['priority'] ?? self::MAX_PRIORITY;
					}

					// Reference the parent module, if it has one
					if ( array_key_exists( $childThemeModule['slug'], $themeModules ) ) {
						$childThemeModule['parent'] = $themeModules[ $childThemeModule['slug'] ];
					}

					$themeModules[ $childThemeModule['slug'] ] = $childThemeModule;
				}
			}

			if ( $orderByPriority ) {
				$themeModules = Arr::sortMultidimensional( $themeModules, 'priority', false, 'slug' );
			} else {
				ksort( $themeModules );
			}

			return $themeModules;
		}

		/**
		 * Get all ACTIVE modules from the modules.json file
		 *
		 * @param bool $orderByPriority
		 *
		 * @return array
		 */
		public function getAllThemeModulesFromJson( bool $orderByPriority = true ): array {
			$themeModules    = [];
			$themeModuleDirs = array_filter( [
				'child' => $this->getChildThemeModulesPath(),
				'temp'  => $this->getTemporaryModulesPath(),
				'base'  => $this->getBaseThemeModulesPath(),
			] );

			/*
			 * ToDo: Remove this part and the getActiveThemeModulesFromBaseThemeJson() function in the future
			 *
			 * We keep this code here for a while, to give existing websites the chance to be migrated wo work with the
			 *  new structure (saving all module statuses to the child theme instead of to both the base and the child
			 *  theme)
			 */
			$baseThemeModules = $this->getActiveThemeModulesFromBaseThemeJson();
			$themeModules     = array_merge( $themeModules, $baseThemeModules );


			// Get all theme modules from the modules.json file stored in the child theme
			$themeModulesFile = $this->baseTheme->childThemeRootDir() . \DS . 'modules.json';

			if ( ! file_exists( $themeModulesFile ) || ! ( $themeModulesConfig = @json_decode( @file_get_contents( $themeModulesFile ), true ) ) ) {
				/*
				 * ToDo: Remove this part and the getActiveThemeModulesFromBaseThemeJson() function in the future, until the return statement
				 *
				 * We keep this code here for a while, to give existing websites the chance to be migrated wo work with
				 *  the new structure (saving all module statuses to the child theme instead of to both the base and the
				 *  child theme)
				 */
				if ( $themeModules ) {
					$themeModules = array_filter( $themeModules, function ( array $themeModule ) {
						return ! empty( $themeModule['active'] );
					} );

					if ( $orderByPriority ) {
						$themeModules = Arr::sortMultidimensional( $themeModules, 'priority', false, 'slug' );
					} else {
						ksort( $themeModules );
					}
				}

				return $themeModules;
			}

			// Loop through all the theme modules to build the correct config
			array_walk( $themeModulesConfig, function ( array &$themeModule, $slug ) use ( $themeModuleDirs ) {
				/*
				 * Get the theme module config file from the correct folder, in the following order:
				 *  - child
				 *  - temp
				 *  - base
				 */
				$themeModuleConfigLocation = \array_filter( \array_map( function ( string $path ) use ( $slug ) {
					$configFilePath = $path . \DS . $slug . \DS . 'module.json';

					if ( ! \file_exists( $configFilePath ) ) {
						return null;
					}

					return $configFilePath;
				}, $themeModuleDirs ) );

				// Bail early when the theme module could not be found at all
				if ( empty( $themeModuleConfigLocation ) ) {
					$themeModule = null;

					return;
				}

				// Get the theme and the content of the theme module config file
				$themeModuleTheme  = key( $themeModuleConfigLocation );
				$themeModuleConfig = @\json_decode(
					@\file_get_contents( $themeModuleConfigLocation[ $themeModuleTheme ] ), true
				);
				$themeModuleParent = false;

				// Bail early when the theme module config could not be loaded
				if ( empty( $themeModuleConfig ) ) {
					$themeModule = null;

					return;
				}

				if ( $themeModuleTheme == 'child' ) {
					if ( isset( $themeModuleConfigLocation['temp'] ) ) {
						$themeModuleParent = 'temp';
					} elseif ( isset( $themeModuleConfigLocation['base'] ) ) {
						$themeModuleParent = 'base';
					}
				}

				// Replace the $themeModule variable with the full config
				$themeModule = \array_merge( $themeModule, $themeModuleConfig, [
					'slug'     => $slug,
					'priority' => (float) ( $themeModule['priority'] ?? self::MAX_PRIORITY ),
					'theme'    => $themeModuleTheme,
					'parent'   => $themeModuleParent,
				] );
			}, $themeModules );

			$themeModules = array_merge( $themeModules, \array_filter( $themeModulesConfig ) );

			if ( $orderByPriority ) {
				$themeModules = Arr::sortMultidimensional( $themeModules, 'priority', false, 'slug' );
			} else {
				ksort( $themeModules );
			}

			return $themeModules;
		}

		/**
		 * Get a loaded Theme Module instance by its slug
		 *
		 * @param string $slug
		 *
		 * @return BaseTheme\ThemeModuleAbstractBaseClass
		 *
		 * @throws ThemeModuleNotLoadedException Throws an exception when the requested module is not loaded
		 */
		public function getThemeModuleObject( string $slug ): BaseTheme\ThemeModuleAbstractBaseClass {
			if ( ! \array_key_exists( $slug, $this->themeModuleObjects ) ) {
				throw new ThemeModuleNotLoadedException( "Theme Module with slug [{$slug}] is not loaded" );
			}

			return $this->themeModuleObjects[ $slug ];
		}

		public function init() {
			//Load all currently enabled theme modules
			$this->loadThemeModules();
		}

		/**
		 *
		 * @param bool[] $newModuleStates An array with all module slugs as its keys and their active state (boolean) as it values
		 *
		 * @return bool Returns TRUE when one of the modules.json files have been updated or FALSE otherwise
		 */
		public function storeActiveThemeModulesToJson( array $newModuleStates ): bool {
			$themeModules = [];

			// Loop through all active theme modules
			foreach ( $this->getAllThemeModules( true ) as $themeModule ) {
				$themeModule['active'] = ! empty( $newModuleStates[ $themeModule['slug'] ] );

				// Grab only the "active" an "priority" values
				$themeModules[ $themeModule['slug'] ] = array_intersect_key( $themeModule, array_flip( [
					'active',
					'priority'
				] ) );
			}

			$fileUpdated = false;

			// Pretty print the output, so the module files are easier to maintain in version control
			$themeModules           = json_encode( $themeModules, \JSON_PRETTY_PRINT );
			$themeModulesConfigPath = $this->baseTheme->childThemeRootDir() . \DS . 'modules.json';

			if ( ! is_dir( $this->baseTheme->childThemeRootDir() ) ) {
				$themeModulesConfigPath = $this->baseTheme->themeRootDir() . \DS . 'modules.json';
			}

			$currentThemeModules = @file_get_contents( $themeModulesConfigPath );
			if ( ! $currentThemeModules || $currentThemeModules !== $themeModules ) {
				if ( @file_put_contents( $themeModulesConfigPath, $themeModules ) ) {
					$fileUpdated = true;
				}
			}

			if ( $fileUpdated ) {
				//Flush the rewrite rules, to activate rewrites for new custom post types (or to deactivate rewrites for old custom post types)
				flush_rewrite_rules();
			}

			return $fileUpdated;
		}

		/**
		 * @return array
		 *
		 * @deprecated Should be removed in a future version, since all modules are now stored in the child theme JSON file
		 */
		private function getActiveThemeModulesFromBaseThemeJson(): array {
			$themeModules = [];

			$baseThemeModulesFile = $this->baseTheme->themeRootDir() . '/modules.json';

			if ( file_exists( $baseThemeModulesFile ) && ( $baseThemeModules = @file_get_contents( $baseThemeModulesFile ) ) ) {
				$baseThemeModules = @json_decode( $baseThemeModules, true );

				if ( $baseThemeModules ) {
					array_walk( $baseThemeModules, function ( array &$themeModule, $slug ) {
						$themeModuleConfig = @\json_decode( @\file_get_contents(
							$this->getBaseThemeModulesPath( $slug . \DS . 'module.json' )
						), true );

						// Bail early when the theme module config could not be loaded
						if ( empty( $themeModuleConfig ) ) {
							$themeModule = null;

							return;
						}

						$themeModule = \array_merge( $themeModule, $themeModuleConfig );

						$themeModule['slug']   = $slug;
						$themeModule['theme']  = 'base';
						$themeModule['parent'] = false;

						if ( ! empty( $themeModule['priority'] ) && (float) $themeModule['priority'] ) {
							$themeModule['priority'] = (float) $themeModule['priority'];
						} else {
							$themeModule['priority'] = self::MAX_PRIORITY;
						}
					} );

					$themeModules = $baseThemeModules;
				}
			}

			return $themeModules;
		}

		/**
		 * Retrieve the child theme modules dir if it is defined. Without an ending directory separator.
		 *
		 * @param null|string $file Optional file path within the folder
		 *
		 * @return string
		 */
		private function getBaseThemeModulesPath( ?string $file = null ): ?string {
			$path = \rtrim( \WP_BASE_THEME_DIR_MODULES, \DS );

			if ( $file !== null ) {
				$path .= \DS . $file;
			}

			return $path;
		}

		/**
		 * Retrieve the child theme modules dir if it is defined. Without an ending directory separator.
		 *
		 * @param null|string $file Optional file path within the folder
		 *
		 * @return null|string
		 */
		private function getChildThemeModulesPath( ?string $file = null ): ?string {
			if ( ! defined( 'WP_CHILD_THEME_DIR_MODULES' ) ) {
				return null;
			}

			$path = \rtrim( WP_CHILD_THEME_DIR_MODULES, \DS );

			if ( $file !== null ) {
				$path .= \DS . $file;
			}

			return $path;
		}

		/**
		 * Retrieve the temporary modules dir. Without an ending directory separator.
		 *
		 * @param null|string $file Optional file path within the folder
		 *
		 * @return string
		 */
		private function getTemporaryModulesPath( ?string $file = null ): string {
			$path = $this->baseTheme->childThemeRootDir() . \DS . 'temporary-modules';

			if ( defined( 'WP_CHILD_THEME_DIR_TEMP_MODULES' ) ) {
				$path = \rtrim( WP_CHILD_THEME_DIR_TEMP_MODULES, \DS );
			}

			if ( $file !== null ) {
				$path .= \DS . $file;
			}

			return $path;
		}

		/**
		 * @throws \Exception Throws an Exception when a module class does not implement the Theme\BaseTheme\ThemeModule interface
		 */
		private function loadThemeModules(): void {
			foreach ( $this->getActiveThemeModulesFromJson() as $themeModule ) {
				/**
				 *  Fire before the loading a module
				 *
				 * @param array $module The module
				 */
				do_action( 'base_theme/modules/before_load_module', $themeModule );
				do_action( "base_theme/modules/before_load_module/slug={$themeModule['slug']}", $themeModule );

				//Initiate the actual module class
				$themeModuleClass = Str::toCamelCase( $themeModule['slug'] );
				$themeModuleClass = ( $themeModule['theme'] == 'child' ? 'ChildTheme'
						: 'Theme' ) . '\\Modules\\' . $themeModuleClass;

				if ( class_exists( $themeModuleClass ) ) {
					if ( ! ( new \ReflectionClass( $themeModuleClass ) )->isSubclassOf( BaseTheme\ThemeModuleAbstractBaseClass::class ) ) {
						throw new \Exception( "Class {$themeModuleClass} should extend " . BaseTheme\ThemeModuleAbstractBaseClass::class );
					}

					/**
					 * @var BaseTheme\ThemeModuleAbstractBaseClass $themeModuleClass
					 * @var BaseTheme\ThemeModuleAbstractBaseClass $themeModuleObject
					 */
					$themeModuleObject = call_user_func( [ $themeModuleClass, 'getInstance' ] );

					$themeModuleObject->init();

					$this->themeModuleObjects[ $themeModule['slug'] ] = $themeModuleObject;
				}


				/**
				 *  Fire after the loading a module
				 *
				 * @param array $module The module
				 */
				do_action( 'base_theme/modules/after_load_module', $themeModule );
				do_action( "base_theme/modules/after_load_module/slug={$themeModule['slug']}", $themeModule );
			}
		}
	}