<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme;
	use Theme\Helpers\File;

	/**
	 * Class Plugins
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class Plugins extends BaseTheme\AbstractClass {

		/**
		 * @var array
		 */
		private $basisPlugins = [];

		/**
		 * @var array
		 */
		private $debugPlugins = [];

		/**
		 * @var array
		 */
		private $plugins = [];

		/**
		 * @var array
		 */
		private $pluginsConfig;

		public function init() {
			//Register theme plugins with the TGM Plugin Activation plugin
			if ( class_exists( '\\TGM_Plugin_Activation' ) ) {
				add_action( 'tgmpa_register', [ $this, 'tgmpaRegisterPlugins' ] );
			}
		}

		/**
		 * Register theme plugins with the TGM Plugin Activation plugin
		 */
		public function tgmpaRegisterPlugins() {
			/**
			 * Array of plugin arrays. Required keys are name and slug.
			 * If the source is NOT from the .org repo, then source is also required.
			 */

			// Filling the $this->plugins_config variable.
			$this->pluginsPopulateConfig();


			// Filling the $this->plugins variable.
			$this->pluginsPopulateBasisSelection();

			// Maybe mergin, downloading the usage of $this->basis_plugins.
			$this->applyBasisPluginsSelection();

			// Filling the $this->debug_plugins variable.
			$this->pluginsPopulateDebugSelection();

			// Maybe merging, downloading or deleting the usage
			// of $this->debug_plugins.
			$this->applyDebugPluginsSelection();

			// Applying the selection of $this->plugins.
			tgmpa( $this->plugins, $this->pluginsConfig );
		}

		private function applyBasisPluginsSelection() {
			if ( current_user_can( 'administrator' ) ) {
				$this->extractPlugins( $this->basisPlugins );
				$this->plugins = array_merge( $this->plugins, $this->basisPlugins );
			}
		}

		private function applyDebugPluginsSelection() {
			if ( current_user_can( 'administrator' ) && defined( 'DEBUG_BAR' ) && DEBUG_BAR == 'yes' ) {
				$this->plugins = array_merge( $this->plugins, $this->debugPlugins );

				$this->extractPlugins( $this->debugPlugins );
			} else if ( current_user_can( 'administrator' ) && ( ! defined( 'DEBUG_BAR' ) || DEBUG_BAR == 'no' ) ) {
				$this->removePlugins( $this->debugPlugins );
			}
		}

		private function extractPlugins( $plugins ) {
			global $wp_version;

			foreach ( $plugins as $plugin ) {
				if (
					empty( $plugin['slug'] ) ||
					empty( $plugin['force_activation'] ) ||
					( ! empty( $plugin['force_activation'] ) && $plugin['force_activation'] == false ) ||
					\file_exists( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] )
				) {
					continue;
				}

				if ( ! empty( $plugin['external_url'] ) ) {
					$pluginDownload = \wp_remote_get( $plugin['external_url'], [
						'timeout'    => 15,
						'user-agent' => 'WordPress/' . $wp_version . '; ' . home_url( '/' ),
					] );

					if (
						! empty( $pluginDownload ) &&
						! \file_exists( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '.zip' ) &&
						! empty( \wp_remote_retrieve_body( $pluginDownload ) )
					) {
						$pluginSaveFp = \fopen( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '.zip', 'w' );
						\fwrite( $pluginSaveFp, \wp_remote_retrieve_body( $pluginDownload ) );
						\fclose( $pluginSaveFp );
					}
				}

				if (
					! empty( $plugin['source'] ) &&
					! empty( $this->pluginsConfig ) && ! empty( $this->pluginsConfig['default_path'] ) &&
					\file_exists( $this->pluginsConfig['default_path'] . $plugin['slug'] . '.zip' ) &&
					! \file_exists( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '.zip' )
				) {
					\copy(
						$this->pluginsConfig['default_path'] . $plugin['slug'] . '.zip',
						ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '.zip'
					);
				}

				if ( \file_exists( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '.zip' ) ) {
					$zipArchive = new \ZipArchive;
					$zipArchive->open( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '.zip' );
					$zipArchive->extractTo( ABSPATH . 'wp-content/plugins/' );
					$zipArchive->close();

					unlink( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '.zip' );
				}
			}
		}

		private function pluginsPopulateBasisSelection() {
			$this->basisPlugins = [
				'advanced_custom_fields' => [
					'name'               => 'Advanced Custom Fields',
					'slug'               => 'advanced-custom-fields',
					'required'           => true,
					'force_activation'   => true,
					'force_deactivation' => false,
				],
			];

			if ( \file_exists( $pluginsFile = \WP_BASE_THEME_DIR_RESOURCES . 'packages' . DS . 'plugins' . DS . 'plugins.php' ) ) {
				if ( \is_array( $agencyPlugins = @include( $pluginsFile ) ) ) {
					$this->basisPlugins = \array_merge( $this->basisPlugins, $agencyPlugins );
				}
			}
		}

		private function pluginsPopulateConfig() {
			$this->pluginsConfig = array(
				'domain'       => BaseTheme::TEXT_DOMAIN, // Text domain - likely want to be the same as your theme.
				'default_path' => WP_BASE_THEME_DIR_RESOURCES . 'packages' . DS . 'plugins' . DS,
				'parent_slug'  => 'plugins.php', // Default parent menu slug
				'menu'         => 'install-required-plugins', // Menu slug
				'has_notices'  => true, // Show admin notices or not
				'is_automatic' => true, // Automatically activate plugins after installation or not
				'message'      => '', // Message to output right before the plugins table
				'strings'      => [
					'page_title'                      => $this->baseTheme->__( 'Install Required Plugins' ),
					'menu_title'                      => $this->baseTheme->__( 'Install Plugins' ),
					'installing'                      => $this->baseTheme->__( 'Installing Plugin: %s' ),
					// %1$s = plugin name
					'oops'                            => $this->baseTheme->__( 'Something went wrong with the plugin API.' ),
					'notice_can_install_required'     => _n_noop( 'This theme requires the following plugin: %1$s.', 'This theme requires the following plugins: %1$s.' ),
					// %1$s = plugin name(s)
					'notice_can_install_recommended'  => _n_noop( 'This theme recommends the following plugin: %1$s.', 'This theme recommends the following plugins: %1$s.' ),
					// %1$s = plugin name(s)
					'notice_cannot_install'           => _n_noop( 'Sorry, but you do not have the correct permissions to install the %s plugin. Contact the administrator of this site for help on getting the plugin installed.', 'Sorry, but you do not have the correct permissions to install the %s plugins. Contact the administrator of this site for help on getting the plugins installed.' ),
					// %1$s = plugin name(s)
					'notice_can_activate_required'    => _n_noop( 'The following required plugin is currently inactive: %1$s.', 'The following required plugins are currently inactive: %1$s.' ),
					// %1$s = plugin name(s)
					'notice_can_activate_recommended' => _n_noop( 'The following recommended plugin is currently inactive: %1$s.', 'The following recommended plugins are currently inactive: %1$s.' ),
					// %1$s = plugin name(s)
					'notice_cannot_activate'          => _n_noop( 'Sorry, but you do not have the correct permissions to activate the %s plugin. Contact the administrator of this site for help on getting the plugin activated.', 'Sorry, but you do not have the correct permissions to activate the %s plugins. Contact the administrator of this site for help on getting the plugins activated.' ),
					// %1$s = plugin name(s)
					'notice_ask_to_update'            => _n_noop( 'The following plugin needs to be updated to its latest version to ensure maximum compatibility with this theme: %1$s.', 'The following plugins need to be updated to their latest version to ensure maximum compatibility with this theme: %1$s.' ),
					// %1$s = plugin name(s)
					'notice_cannot_update'            => _n_noop( 'Sorry, but you do not have the correct permissions to update the %s plugin. Contact the administrator of this site for help on getting the plugin updated.', 'Sorry, but you do not have the correct permissions to update the %s plugins. Contact the administrator of this site for help on getting the plugins updated.' ),
					// %1$s = plugin name(s)
					'install_link'                    => _n_noop( 'Begin installing plugin', 'Begin installing plugins' ),
					'activate_link'                   => _n_noop( 'Activate installed plugin', 'Activate installed plugins' ),
					'return'                          => $this->baseTheme->__( 'Return to Required Plugins Installer' ),
					'plugin_activated'                => $this->baseTheme->__( 'Plugin activated successfully.' ),
					'complete'                        => $this->baseTheme->__( 'All plugins installed and activated successfully. %s' ),
					// %1$s = dashboard link
					'nag_type'                        => 'updated'
					// Determines admin notice type - can only be 'updated' or 'error'
				]
			);
		}

		private function pluginsPopulateDebugSelection() {
			$this->debugPlugins = [
				[
					'name'               => 'Debug Bar',
					'slug'               => 'debug-bar',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar.zip',
				],
				[
					'name'               => 'Debug Bar Console',
					'slug'               => 'debug-bar-console',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-console.zip',
				],
				[
					'name'               => 'Debug Bar Shortcodes',
					'slug'               => 'debug-bar-shortcodes',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-shortcodes.zip',
				],
				[
					'name'               => 'Debug Bar Constants',
					'slug'               => 'debug-bar-constants',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-constants.zip',
				],
				[
					'name'               => 'Debug Bar Post Types',
					'slug'               => 'debug-bar-post-types',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-post-types.zip',
				],
				[
					'name'               => 'Debug Bar Cron',
					'slug'               => 'debug-bar-cron',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-cron.zip',
				],
				[
					'name'               => 'Debug BarActions and Filters Addon',
					'slug'               => 'debug-bar-actions-and-filters-addon',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-actions-and-filters-addon.zip',
				],
				[
					'name'               => 'Debug Bar Transients',
					'slug'               => 'debug-bar-transients',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-transients.zip',
				],
				[
					'name'               => 'Debug Bar List Script & Style Dependencies',
					'slug'               => 'debug-bar-list-dependencies',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-list-dependencies.zip',
				],
				[
					'name'               => 'Debug Bar Remote Requests',
					'slug'               => 'debug-bar-remote-requests',
					'source'             => '',
					'required'           => false,
					'force_activation'   => true,
					'force_deactivation' => false,
					'external_url'       => 'https://downloads.wordpress.org/plugin/debug-bar-remote-requests.zip',
				]
			];
		}

		private function removePlugins( $plugins ) {
			$pluginRemoved = false;

			foreach ( $plugins as $plugin ) {
				if ( ! \file_exists( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] ) ) {
					continue;
				}

				$file = ABSPATH . 'wp-content/plugins/' . $plugin['slug'] . '/' . $plugin['slug'] . '.php';

				if ( \file_exists( $file ) ) {
					\deactivate_plugins( $file );
				}

				File::removeDirRecursively( ABSPATH . 'wp-content/plugins/' . $plugin['slug'] );

				$pluginRemoved = true;
			}

			if ( $pluginRemoved ) {
				\wp_redirect( $_SERVER['REQUEST_URI'] );

				die();
			}
		}
	}