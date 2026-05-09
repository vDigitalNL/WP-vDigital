<?php

	namespace Theme\BaseTheme\Frontend;

	use Theme\BaseTheme;
	use Theme\WP\WalkerNavMenu;

	/**
	 * Class Html
	 *
	 * @package Theme\BaseTheme\Frontend
	 */
	final class Html extends BaseTheme\AbstractClass {

		/**
		 * @var array[] Array of paths where templates can be loaded from
		 */
		private static $templatePaths = [];

		/**
		 * @return void
		 */
		public function addCustomScriptsToFooter() {
			$footerScripts = stripcslashes( baseTheme()->getOption( 'general.footer_scripts' ) );

			if ( $footerScripts ) {
				echo '<script>' . $footerScripts . '</script>';
			}
		}

		/**
		 * @return void
		 */
		public function addCustomScriptsToHeader() {
			$headerScripts = stripcslashes( baseTheme()->getOption( 'general.header_scripts' ) );

			if ( $headerScripts ) {
				echo '<script>' . $headerScripts . '</script>';
			}
		}

		/**
		 * @return void
		 */
		public function addGoogleTagManagerToHeader() {
			$googleTagManager = baseTheme()->getOption( 'google.tag_manager' );

			if ( $googleTagManager ) { ?>
				<!-- Global site tag (gtag.js) - Google Analytics -->
				<script async
				        src="https://www.googletagmanager.com/gtag/js?id=<?php echo $googleTagManager; ?>"></script>

				<script>
					window.dataLayer = window.dataLayer || [];

					function gtag() {dataLayer.push( arguments );}

					gtag( 'js', new Date() );

					gtag( 'config', '<?php echo $googleTagManager; ?>' );
				</script>
			<?php }
		}

		/**
		 * @return string
		 */
		public function getSiteLogo(): string {
			$logoCode = '<img src="http://via.placeholder.com/120x60">';

			if ( ( $logo = baseTheme()->getOption( 'header.navbar.logo', [] ) ) && ! empty( $logo['url'] ) ) {
				$logoCode = '<img src="' . $logo['url'] . '">';
			}

			return $logoCode;
		}

		/**
		 * Class initializer
		 */
		public function init() {
			//Remove the generator tag
			add_filter( 'the_generator', '__return_empty_string', 99999 );

			add_action( 'wp_head', [ $this, 'addGoogleTagManagerToHeader' ] );

			add_action( 'wp_head', [ $this, 'addCustomScriptsToHeader' ] );

			add_action( 'wp_footer', [ $this, 'addCustomScriptsToFooter' ] );

			//Remove the "This site is optimized with the Yoast WordPress SEO plugin" tag
			add_filter( 'wpseo_debug_markers', '__return_false' );
		}

		/**
		 * @param string $menu
		 * @param array  $args
		 */
		public function loadNavMenu( string $menu, array $args ): void {
			$args = \wp_parse_args( $args, [
				'menu'            => $menu,
				'theme_location'  => $menu,
				'container'       => 'div',
				'container_class' => 'collapse navbar-collapse',
				'container_id'    => 'site-navbar',
				'depth'           => 2,
				'fallback_cb'     => false,
				'menu_class'      => 'navbar-nav',
				'walker'          => new \Dupkey\Bs4Navwalker()
			] );

			$args = $this->baseTheme->applyFilters( 'wp_nav_menu', $args );
			$args = $this->baseTheme->applyFilters( "wp_nav_menu/{$menu}", $args );

			wp_nav_menu( $args );
		}

		/**
		 * @param string      $templatePart
		 * @param null|string $variant
		 */
		public function loadTemplatePart( string $templatePart, string $variant = null ) {
			$templatePart = trim( str_replace( [ '\\/' ], DS, $templatePart ), DS );

			if ( isset( self::$templatePaths[ $templatePart ] ) ) {
				foreach (self::$templatePaths[ $templatePart ] as $templatePath) {
					\ob_start();

					\get_template_part( $templatePath . DS . $templatePart, $variant );

					$content = (string) \ob_get_clean();

					if ($content !== '') {
						print $content;

						return;
					}
				}
			}

			\get_template_part( 'template-parts' . DS . $templatePart, $variant );
		}

		/**
		 * Register a new template path for a specific template part
		 *
		 * @param string $templatePart
		 * @param string $path
		 */
		public function registerTemplatePath( string $templatePart, string $path ) {
			$templatePart = trim( str_replace( [ '\\/' ], DS, $templatePart ), DS );
			$path         = trim( str_replace( [ '\\/' ], DS, $path ), DS );

			if ( ! isset( self::$templatePaths[ $templatePart ] ) ) {
				self::$templatePaths[ $templatePart ] = [];
			}

			if ( ! \in_array( $path, self::$templatePaths[ $templatePart ] ) ) {
				self::$templatePaths[ $templatePart ][] = $path;
			}
		}

		/**
		 * @param array $args
		 *
		 * @return array
		 */
		public function wpNavMenuArgs( array $args = [] ): array {
			$new_args['container'] = false;

			if ( ! $args['items_wrap'] ) {
				$new_args['items_wrap'] = '<ul class="%2$s">%3$s</ul>';
			}

			if ( current_theme_supports( 'bootstrap-top-navbar' ) && ! $args['depth'] ) {
				$new_args['depth'] = 3;
			}

			if ( empty( $args['walker'] ) ) {
				$new_args['walker'] = new WalkerNavMenu();
			}

			return array_merge( $args, $new_args );
		}
	}
