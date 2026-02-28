<?php

	namespace ChildTheme;

	use Theme\BaseTheme;
	use Theme\Helpers\Arr;
	use Theme\Helpers\File;

	/**
	 * Class ChildTheme
	 *
	 * @package ChildTheme
	 *
	 * @method static ChildTheme\Backend  Backend
	 * @method static ChildTheme\Frontend Frontend
	 * @method static ChildTheme\General  General
	 */
	class ChildTheme {

		use BaseTheme\ThemeFlexClassTrait;

		const TEXT_DOMAIN = BaseTheme::CHILD_THEME_TEXT_DOMAIN;

		const THEME_PREFIX = BaseTheme::CHILD_THEME_PREFIX;

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
		 * @var ChildTheme
		 */
		private static $instance;

		/**
		 * @param string $key
		 * @param string $default
		 *
		 * @return mixed
		 */
		public function config( string $key, $default = '' ) {
			return ! empty( $this->config[ $key ] ) ? $this->config[ $key ] : $default;
		}

		/**
		 * @param string     $option
		 * @param bool|mixed $default
		 *
		 * @return mixed
		 */
		public function getOption( string $option, $default = false ) {
			return baseTheme()->getOption( $option, $default );
		}

		/**
		 *
		 */
		public function init() {
			$this->themeRootDir = rtrim( get_stylesheet_directory(), '/\\' );
			$this->themeRootUri = rtrim( get_stylesheet_directory_uri(), '/' );
			$this->config       = $this->loadThemeConfig();

			//Add the theme setup functions to the WordPress after_setup_theme and after_switch_theme hooks
			add_action( 'after_setup_theme', [ $this, 'themeSetup' ] );
		}

		/**
		 * @return string
		 */
		public function themeRootDir(): string {
			return $this->themeRootDir;
		}

		/**
		 * @return string
		 */
		public function themeRootUri(): string {
			return $this->themeRootUri;
		}

		/**
		 * The theme setup
		 */
		public function themeSetup() {
			//Load the child theme text domain
			if ( ! empty( static::TEXT_DOMAIN ) ) {
				load_theme_textdomain( static::TEXT_DOMAIN, WP_CHILD_THEME_DIR_LANGUAGES );
			}

			//Initialize theme classes
			$this->General->init();

			if ( is_admin() ) {
				$this->Backend->init();
			} else {
				$this->Frontend->init();
			}

			//Load the child theme hooks
			$hook_files = File::scanDir( WP_CHILD_THEME_DIR_HOOKS, true, SCANDIR_FILETYPE_FILES, true );

			foreach ( (array) $hook_files as $hook_file ) {
				if ( 'backend_hooks.php' == $hook_file ) {
					if ( is_admin() ) {
						require_once( $hook_file );
					}
				} elseif ( 'frontend_hooks.php' == $hook_file ) {
					if ( ! is_admin() ) {
						require_once( $hook_file );
					}
				} else {
					require_once( $hook_file );
				}
			}
		}

		/**
		 * Load the theme config from the style.css file
		 *
		 * @return array
		 */
		private function loadThemeConfig(): array {
			$themeConfig = [];

			if ( ! empty( $this->themeRootDir ) && file_exists( $this->themeRootDir ) ) {
				$styleConfig    = file_get_contents( $this->themeRootDir . DS . 'style.css' );
				$configStartPos = strpos( $styleConfig, '/*' );
				$configEndPos   = strpos( $styleConfig, '*/' );

				if ( $styleConfig !== false && $configStartPos !== false && $configEndPos !== false ) {
					$styleConfig = explode( "\n", substr( $styleConfig, $configStartPos, $configEndPos ) );

					foreach ( $styleConfig as $configLine ) {
						$configLine = Arr::trim( explode( ':', $configLine, 2 ) );

						if ( count( $configLine ) == 2 ) {
							$configKey                 = strtolower( str_replace( array( ' ', '-' ), '_', $configLine[0] ) );
							$themeConfig[ $configKey ] = $configLine[1];
						}
					}
				} else {
					add_action( 'admin_notices', function () {
						print '<div class="error"><p>Warning: The format of the default theme\'s style.css file is not valid.</p></div>';
					} );
				}
			}

			return $themeConfig;
		}

		/**
		 * @return ChildTheme
		 */
		public static function getInstance(): ChildTheme {
			if ( empty( static::$instance ) ) {
				static::$instance = new static();
			}

			return static::$instance;
		}
	}