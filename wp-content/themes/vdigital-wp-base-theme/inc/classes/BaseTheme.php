<?php

	namespace Theme;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractBaseClass;
	use Theme\Exceptions\ThemeModuleNotLoadedException;
	use Theme\Helpers\Log;

	/**
	 * Class BaseTheme
	 *
	 * @package Theme
	 *
	 * @method static BaseTheme\Backend      Backend
	 * @method static BaseTheme\Frontend     Frontend
	 * @method static BaseTheme\General      General
	 * @method static BaseTheme\ThemeOptions ThemeOptions
	 *
	 * @property-read BaseTheme\Backend      $Backend
	 * @property-read BaseTheme\Frontend     $Frontend
	 * @property-read BaseTheme\General      $General
	 * @property-read BaseTheme\ThemeOptions $ThemeOptions
	 */
	class BaseTheme {

		use ThemeFlexClassTrait;

		const CHILD_THEME_PREFIX = 'wp_ct_';

		const CHILD_THEME_TEXT_DOMAIN = 'wp-child-theme';

		const TEXT_DOMAIN = 'wp-base-theme';

		const THEME_PREFIX = 'wp_bt_';

		/**
		 * @var string
		 */
		private $childThemeRootDir;

		/**
		 * @var string
		 */
		private $childThemeRootUri;

		/**
		 * @var array
		 */
		private $config = [];

		/**
		 * @var string
		 */
		private $themeRootDir;

		/**
		 * @var string
		 */
		private $themeRootUri;

		/**
		 * @var BaseTheme
		 */
		private static $instance;

		/**
		 * Retrieve the translation of $text.
		 *
		 * If there is no translation, or the text domain isn't loaded, the original text is returned.
		 *
		 * @param string $text Text to translate
		 *
		 * @return string Translated text
		 */
		public function __( $text ) {
			return $this->General->Text->__( $text );
		}

		/**
		 * Translates and retrieves the singular or plural form based on the supplied number, with gettext context.
		 *
		 * This is a hybrid of _n() and _x(). It supports context and plurals.
		 *
		 * Used when you want to use the appropriate form of a string with context based on whether a
		 * number is singular or plural.
		 *
		 * Example of a generic phrase which is disambiguated via the context parameter:
		 *
		 *     printf( _nx( '%s group', '%s groups', $people, 'group of people', 'text-domain' ), number_format_i18n( $people ) );
		 *     printf( _nx( '%s group', '%s groups', $animals, 'group of animals', 'text-domain' ), number_format_i18n( $animals ) );
		 *
		 * @param string $single  The text to be used if the number is singular.
		 * @param string $plural  The text to be used if the number is plural.
		 * @param int    $number  The number to compare against to use either the singular or plural form.
		 * @param string $context Context information for the translators.
		 *
		 * @return string The translated singular or plural form.
		 */
		public function _nx( $single, $plural, $number, $context ) {
			return $this->General->Text->_nx( $single, $plural, $number, $context );
		}

		/**
		 * Hook a function or method to a specific action.
		 *
		 * @param string   $tag           The name of the action to which the $functionToAdd is hooked.
		 * @param callable $functionToAdd The name of the function you wish to be called.
		 * @param int      $priority      Optional. Used to specify the order in which the functions
		 *                                associated with a particular action are executed. Default 10.
		 *                                Lower numbers correspond with earlier execution,
		 *                                and functions with the same priority are executed
		 *                                in the order in which they were added to the action.
		 * @param int      $acceptedArgs  Optional. The number of arguments the function accepts. Default 1.
		 *
		 * @return true Will always return true.
		 */
		public function addAction( string $tag, callable $functionToAdd, int $priority = 10, int $acceptedArgs = 1 ) {
			$tag = self::THEME_PREFIX . 'action/' . $tag;

			return \add_action( $tag, $functionToAdd, $priority, $acceptedArgs );
		}

		/**
		 * Hook a function or method to a specific filter action.
		 *
		 * @param string   $tag             The name of the filter to hook the $function_to_add callback to.
		 * @param callable $functionToAdd   The callback to be run when the filter is applied.
		 * @param int      $priority        Optional. Used to specify the order in which the functions
		 *                                  associated with a particular action are executed. Default 10.
		 *                                  Lower numbers correspond with earlier execution,
		 *                                  and functions with the same priority are executed
		 *                                  in the order in which they were added to the action.
		 * @param int      $acceptedArgs    Optional. The number of arguments the function accepts. Default 1.
		 *
		 * @return true
		 */
		public function addFilter( string $tag, callable $functionToAdd, int $priority = 10, int $acceptedArgs = 1 ) {
			$tag = self::THEME_PREFIX . 'filter/' . $tag;

			return \add_filter( $tag, $functionToAdd, $priority, $acceptedArgs );
		}

		/**
		 * Calls the callback functions that have been added to a filter hook.
		 *
		 * @param string $tag       The name of the filter hook.
		 * @param mixed  ...$values The values to filter.
		 *
		 * @return mixed The filtered value after all hooked functions are applied to it.
		 */
		public function applyFilters( string $tag, ...$values ) {
			$tag = self::THEME_PREFIX . 'filter/' . $tag;

			return \apply_filters( $tag, ...$values );
		}

		/**
		 * Retrieve the child theme root dir. Without an ending directory separator.
		 *
		 * @return string
		 */
		public function childThemeRootDir(): string {
			return $this->childThemeRootDir;
		}

		/**
		 * Retrieve the child theme root uri. Without an ending slash.
		 *
		 * @return string
		 */
		public function childThemeRootUri(): string {
			return $this->childThemeRootUri;
		}

		/**
		 * @param string $key
		 * @param string $default
		 *
		 * @return mixed
		 */
		public function config( $key, $default = '' ) {
			return ! empty( $this->config[ $key ] ) ? $this->config[ $key ] : $default;
		}

		/**
		 * Execute functions hooked on a specific action hook.
		 *
		 * @param string $tag       The name of the action to be executed.
		 * @param mixed  ...$values Optional. Additional arguments which are passed on to the
		 *                          functions hooked to the action. Default empty.
		 */
		public function doAction( string $tag, ...$values ) {
			$tag = self::THEME_PREFIX . 'action/' . $tag;

			\do_action( $tag, ...$values );
		}

		/**
		 * Retrieve an env variable
		 *
		 * @param string     $key
		 * @param mixed|null $default
		 *
		 * @return mixed|null
		 */
		public function env( string $key, $default = null ) {
			global $dotEnv;

			if ( empty( $dotEnv ) ) {
				$dotEnv = file_exists( __DIR__ . '/.env' )
					? file( __DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES ) : [];
				$dotEnv = array_column( array_map( function ( $dotEnv ) {
					list( $key, $value ) = explode( '=', trim( $dotEnv ), 2 );

					$value = trim( $value, '\'"' );

					if ( in_array( strtolower( $value ), [ 'true', 'false' ] ) ) {
						$value = boolval( $value );
					}

					return [ $key, $value ];
				}, $dotEnv ), 1, 0 );
			}

			return $dotEnv[ $key ] ?? $default;
		}

		/**
		 * Retrieve the translation of $text and escapes it for safe use in an attribute.
		 *
		 * If there is no translation, or the text domain isn't loaded, the original text is returned.
		 *
		 * @param string $text Text to translate
		 *
		 * @return string Translated text on success, original text on failure
		 */
		public function esc_attr__( $text ) {
			return $this->General->Html->esc_attr__( $text );
		}

		/**
		 * Retrieve the translation of $text and escapes it for safe use in HTML output.
		 *
		 * If there is no translation, or the text domain isn't loaded, the original text
		 * is escaped and returned..
		 *
		 * @param string $text Text to translate
		 *
		 * @return string Translated text on success, original text on failure
		 */
		public function esc_html__( $text ) {
			return $this->General->Html->esc_html__( $text );
		}

		/**
		 * Translate string with gettext context, and escapes it for safe use in HTML output.
		 *
		 * @param string $text    Text to translate.
		 * @param string $context Context information for the translators.
		 *
		 * @return string Translated text.
		 */
		public function esc_html_x( $text, $context ) {
			return $this->General->Html->esc_html_x( $text, $context );
		}

		/**
		 * Retrieve a theme option by name using Dot notation. The value is being retrieved from the base theme, overridden by options from the child theme.
		 *
		 * @param string     $option  (E.g. "general.header.template")
		 * @param null|mixed $default Optional. The default value
		 *
		 * @return mixed
		 *
		 * @see ThemeOptions::getOption()
		 */
		public function getOption( string $option, $default = null ) {
			return $this->ThemeOptions->getOption( $option, $default );
		}

		/**
		 *
		 */
		public function init() {
			$this->childThemeRootDir = rtrim( get_stylesheet_directory(), '/\\' );
			$this->childThemeRootUri = rtrim( get_stylesheet_directory_uri(), '/' );

			$this->themeRootDir = rtrim( get_template_directory(), '/\\' );
			$this->themeRootUri = rtrim( get_template_directory_uri(), '/' );

			$this->loadThemeConfig();
			$this->ThemeOptions->init();

			//Add the theme setup functions to the WordPress after_setup_theme and after_switch_theme hooks
			add_action( 'after_setup_theme', [ $this, 'themeSetup' ] );
			add_action( 'after_switch_theme', [ $this, 'themeSwitch' ] );
		}

		public function initNavMenus() {
			register_nav_menus( $this->applyFilters( 'menu_locations', [
				'primary'  => $this->__( 'Primary Menu' ),
			] ) );
		}

		public function initWidgets() {
			register_sidebar( [
				'id'            => 'blog-sidebar',
				'name'          => __( 'Blog Sidebar', static::TEXT_DOMAIN ),
				'description'   => __( 'Shown on blog pages (posts, archives etc.)', static::TEXT_DOMAIN ),
				'class'         => 'sidebar',
				'before_widget' => '<div id="%1$s" class="sidebar-widget %2$s">',
				'after_widget'  => '</div>',
				'before_title'  => '<h4 class="sidebar-widget-title">',
				'after_title'   => '</h4>',
			] );

			register_sidebar( [
				'id'            => 'page-sidebar',
				'name'          => __( 'Page Sidebar', static::TEXT_DOMAIN ),
				'description'   => __( 'Shown as a sidebar on regular pages with the sidebar template enabled', static::TEXT_DOMAIN ),
				'class'         => 'sidebar',
				'before_widget' => '<div id="%1$s" class="sidebar-widget %2$s">',
				'after_widget'  => '</div>',
				'before_title'  => '<h4 class="sidebar-widget-title">',
				'after_title'   => '</h4>',
			] );

			foreach ( range( 1, 4 ) as $footer_sidebar_n ) {
				register_sidebar( [
					'id'            => 'footer-sidebar-' . $footer_sidebar_n,
					'name'          => __( 'Footer Sidebar ' . $footer_sidebar_n, static::TEXT_DOMAIN ),
					'class'         => 'footer-sidebar',
					'before_widget' => '<div id="%1$s" class="footer-sidebar-widget %2$s">',
					'after_widget'  => '</div>',
					'before_title'  => '<h4 class="footer-sidebar-widget-title">',
					'after_title'   => '</h4>',
				] );
			}
		}

		/**
		 * @return bool
		 */
		public function isDevSite(): bool {
			if ( $this->env( 'ENVIRONMENT' ) && strtolower( $this->env( 'ENVIRONMENT' ) ) != 'production' ) {
				return true;
			}

			return defined( 'DEV_SITE' ) && DEV_SITE;
		}

		/**
		 * @return bool
		 */
		public function isProductionSite(): bool {
			if ( $this->env( 'ENVIRONMENT' ) && strtolower( $this->env( 'ENVIRONMENT' ) ) == 'production' ) {
				return true;
			}

			return defined( 'PRODUCTION_SITE' ) && PRODUCTION_SITE;
		}

		/**
		 * @param \Exception $e
		 */
		public function printException( \Exception $e ) {
			dump( Log::generateExceptionData( $e ) );
		}

		/**
		 * Removes a function from a specified action hook.
		 *
		 * @param string   $tag              The action hook to which the function to be removed is hooked.
		 * @param callable $functionToRemove The name of the function which should be removed.
		 * @param int      $priority         Optional. The priority of the function. Default 10.
		 *
		 * @return bool Whether the function is removed.
		 */
		function removeAction( string $tag, callable $functionToRemove, int $priority = 10 ) {
			return \remove_action( $tag, $functionToRemove, $priority );
		}

		/**
		 * Remove all of the hooks from an action.
		 *
		 * @param string   $tag      The action to remove hooks from.
		 * @param int|bool $priority The priority number to remove them from. Default false.
		 *
		 * @return bool True when finished.
		 */
		function removeAllActions( string $tag, $priority = false ) {
			return \remove_all_actions( $tag, $priority );
		}

		/**
		 * Remove all of the hooks from a filter.
		 *
		 * @param string    $tag      The filter to remove hooks from.
		 * @param int|false $priority Optional. The priority number to remove. Default false.
		 *
		 * @return bool True when finished.
		 */
		public function removeAllFilters( string $tag, $priority = false ) {
			$tag = self::THEME_PREFIX . 'filter/' . $tag;

			return \remove_all_filters( $tag, $priority );
		}

		/**
		 * Removes a function from a specified filter hook.
		 *
		 * To remove a hook, the $functionToRemove and $priority arguments must match
		 * when the hook was added. This goes for both filters and actions. No warning
		 * will be given on removal failure.
		 *
		 * @param string   $tag              The filter hook to which the function to be removed is hooked.
		 * @param callable $functionToRemove The name of the function which should be removed.
		 * @param int      $priority         Optional. The priority of the function. Default 10.
		 *
		 * @return bool Whether the function existed before it was removed.
		 */
		public function removeFilter( string $tag, callable $functionToRemove, int $priority = 10 ) {
			$tag = self::THEME_PREFIX . 'filter/' . $tag;

			return \remove_filter( $tag, $functionToRemove, $priority );
		}

		/**
		 * Get a loaded Theme Module instance by its slug
		 *
		 * @param string $slug
		 *
		 * @return ThemeModuleAbstractBaseClass|null
		 */
		public function themeModule( string $slug ): ?ThemeModuleAbstractBaseClass {
			try {
				$themeModule = $this->General->ThemeModules->getThemeModuleObject( $slug );
			} catch ( ThemeModuleNotLoadedException $e ) {
			}

			return $themeModule ?? null;
		}

		/**
		 * Retrieve the base theme root dir. Without an ending directory separator.
		 *
		 * @return string
		 */
		public function themeRootDir(): string {
			return $this->themeRootDir;
		}

		/**
		 * Retrieve the base theme root uri. Without an ending slash.
		 *
		 * @return string
		 */
		public function themeRootUri(): string {
			return $this->themeRootUri;
		}

		/**
		 * The theme setup
		 */
		public function themeSetup() {
			$this->initLogPackages();

			if ( ! empty( static::TEXT_DOMAIN ) ) {
				load_theme_textdomain( static::TEXT_DOMAIN, WP_BASE_THEME_DIR_LANGUAGES );
			}

			//Let WordPress manage the document title
			add_theme_support( 'title-tag' );

			//Enable support for Post Thumbnails on posts and pages
			add_theme_support( 'post-thumbnails' );
			set_post_thumbnail_size( 817.5 );

			//Add core markup support for a couple of HTML5 supported elements
			add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list' ] );

			//Add support for Gutenberg options
			add_theme_support( 'align-wide' );

			//Register navigation menu's
			add_action( 'init', [ $this, 'initNavMenus' ], 1 );

			//Register sidebars
			add_action( 'widgets_init', [ $this, 'initWidgets' ], 1 );


			//Initialize theme classes
			$this->General->init();

			if ( is_admin() ) {
				$this->Backend->init();
			} else {
				$this->Frontend->init();
			}
		}

		/**
		 * Action that will be executed when the active theme has been switched
		 *
		 * @param $oldTheme
		 */
		public function themeSwitch( $oldTheme ) {
			/*
			 * Check if theme is just installed
			 */
			if ( empty( $oldTheme ) || $oldTheme != $this->config( 'theme_name' ) ) {
				/*
				 * Add a new menu (if it does not exist yet) and set it to the primary location (if that one is empty)
				 */
				$newNavMenuId = wp_create_nav_menu( 'Main Menu' );

				if ( is_wp_error( $newNavMenuId ) ) {
					$existingNavMenu = get_term_by( 'name', 'Main Menu', 'nav_menu' );

					if ( $existingNavMenu && ! empty( $existingNavMenu->term_id ) ) {
						$newNavMenuId = $existingNavMenu->term_id;
					}
				}

				if ( ! is_wp_error( $newNavMenuId ) ) {
					$navLocations = get_theme_mod( 'nav_menu_locations' );

					if ( is_array( $navLocations ) && empty( $navLocations['primary'] ) ) {
						$navLocations['primary'] = $newNavMenuId;

						set_theme_mod( 'nav_menu_locations', $navLocations );
					}
				}
			} else {
				/*
				 * Theme is just uninstalled
				 */
			}
		}

		private function initLogPackages() {
			require_once( ABSPATH . 'wp-admin/includes/plugin.php' );

			foreach (
				[
					'whoops'  => 'webwhales-whoops.php',
					'wonolog' => 'webwhales-wonolog.php'
				] as $package => $filename
			) {
				$muPluginFile     = WPMU_PLUGIN_DIR . DS . $filename;
				$sourcePluginFile = WP_BASE_THEME_DIR_RESOURCES . 'packages/' . $package . DS . $filename;

				if ( ! file_exists( $sourcePluginFile ) ) {
					return;
				}

				$muPluginVersion     = '0.0';
				$sourcePluginVersion = get_plugin_data( $sourcePluginFile, false, false )['Version'] ?? '0.0';

				if ( file_exists( $muPluginFile ) ) {
					$muPluginVersion = get_plugin_data( $muPluginFile, false, false )['Version'] ?? $muPluginVersion;
				}

				if ( ! file_exists( $muPluginFile ) || version_compare( $muPluginVersion, $sourcePluginVersion, '<' ) ) {
					if ( ! file_exists( dirname( $muPluginFile ) ) ) {
						mkdir( dirname( $muPluginFile ), 0775, true );
					}

					copy( $sourcePluginFile, $muPluginFile );
				}
			}
		}

		/**
		 * Load the theme config from the style.css file
		 *
		 * @return void
		 */
		private function loadThemeConfig(): void {
			$themeConfig = [];

			if ( ! empty( $this->themeRootDir ) && file_exists( $this->themeRootDir ) ) {
				$styleConfig    = file_get_contents( $this->themeRootDir . DS . 'style.css' );
				$configStartPos = strpos( $styleConfig, '/*' );
				$configEndPos   = strpos( $styleConfig, '*/' );

				if ( $styleConfig !== false && $configStartPos !== false && $configEndPos !== false ) {
					$styleConfig = explode( "\n", substr( $styleConfig, $configStartPos, $configEndPos ) );

					foreach ( $styleConfig as $configLine ) {
						$configLine = Helpers\Arr::trim( explode( ':', $configLine, 2 ) );

						if ( count( $configLine ) == 2 ) {
							$configKey                 = strtolower( str_replace( [ ' ', '-' ], '_', $configLine[0] ) );
							$themeConfig[ $configKey ] = $configLine[1];
						}
					}
				} else {
					add_action( 'admin_notices', function () {
						print '<div class="error"><p>Warning: The format of the default theme\'s style.css file is not valid.</p></div>';
					} );
				}
			}

			$this->config = $themeConfig;
		}

		/**
		 * @return BaseTheme
		 */
		public static function getInstance(): BaseTheme {
			if ( empty( static::$instance ) ) {
				static::$instance = new static();
			}

			return static::$instance;
		}

		/**
		 * @return string
		 */
		public static function getThemeAuthor(): string {
			return defined( '\AGENCY_NAME' ) ? \AGENCY_NAME : '';
		}

		/**
		 * @return string
		 */
		public static function getThemeAuthorEmailAddress(): string {
			return defined( '\AGENCY_EMAIL_ADDRESS' ) ? \AGENCY_EMAIL_ADDRESS : '';
		}

		/**
		 * @return string
		 */
		public static function getThemeAuthorUrl(): string {
			return defined( '\AGENCY_WEBSITE_URL' ) ? \AGENCY_WEBSITE_URL : '';
		}
	}