<?php

	namespace Theme\BaseTheme\Backend;

	use Theme\BaseTheme;

	/**
	 * Class Admin
	 *
	 * @package Theme\BaseTheme\Backend
	 */
	final class Admin extends BaseTheme\AbstractClass {

		private $notices = [ 'error' => [], 'update' => [] ];

		/**
		 * Add an error message to the admin notices
		 *
		 * @param string $notice
		 * @param int    $priority
		 */
		public function addAdminErrorNotice( $notice, $priority = 10 ) {
			if ( ! array_key_exists( $priority, $this->notices['error'] ) ) {
				$this->notices['error'][ $priority ] = [];
			}

			$this->notices['error'][ $priority ][] = $notice;
		}

		/**
		 * Add an update message to the admin notices
		 *
		 * @param string $notice
		 * @param int    $priority
		 */
		public function addAdminUpdateNotice( $notice, $priority = 10 ) {
			if ( ! array_key_exists( $priority, $this->notices['update'] ) ) {
				$this->notices['update'][ $priority ] = [];
			}

			$this->notices['update'][ $priority ][] = $notice;
		}

		/**
		 * @param string $text
		 *
		 * @return string
		 */
		public function adminFooterText( ?string $text = '' ): string {
			$thank_you_text = __( sprintf(
				'This website is created with a theme made by <a href="%s" target="_blank">%s</a>',
				BaseTheme::getThemeAuthorUrl(),
				BaseTheme::getThemeAuthor()
			), BaseTheme::TEXT_DOMAIN );

			return trim( (string) $text . ' <span id="theme-footer-thank-you">' . $thank_you_text . '</span>' );
		}

		/**
		 * Prevent our admin from being edited or deleted by users other than the agency admin
		 *
		 * @param array $allCaps An array of all the user's capabilities.
		 * @param array $caps    Actual capabilities for meta capability.
		 * @param array $args    Optional parameters passed to has_cap(), typically object ID.
		 *
		 * @return array
		 */
		public function adminUserPreventChanges( array $allCaps, array $caps, array $args ): array {
			$userCaps = [ 'delete_users', 'edit_users', 'remove_users' ];

			// See if we're filtering the right caps
			if ( ! is_array( $caps ) || ! count( array_intersect( $userCaps, $caps ) ) || ! is_array( $args ) ) {
				return $allCaps;
			}

			$agencyAdminIds = \array_map( function ( \WP_User $user ) {
				return $user->ID;
			}, $this->getAgencyAdmins() );

			// Return early when there are no agency admins
			if ( empty( $agencyAdminIds ) ) {
				return $allCaps;
			}

			$selectedUsers = [];

			if ( isset( $_REQUEST['user'] ) || isset( $_REQUEST['users'] ) ) {
				$selectedUsers = isset( $_REQUEST['user'] ) ? array( intval( $_REQUEST['user'] ) )
					: \array_map( 'intval', (array) $_REQUEST['users'] );
			} elseif ( count( $args ) == 3 && ! empty( $args[2] ) ) {
				$selectedUsers = [ \intval( $args[2] ) ];
			}

			if ( ! \count( $selectedUsers ) ) {
				return $allCaps;
			}

			// Return early when no agency admins are selected
			$selectedUsersHasAgencyAdmins = ! empty( \array_intersect( $selectedUsers, $agencyAdminIds ) );
			$currentUserIsAgencyAdmin     = $this->isAgencyAdmin( \wp_get_current_user() );

			if ( ! $selectedUsersHasAgencyAdmins )
				return $allCaps;

			// Agency admins may edit themselves or other agency admins
			// Agency admins may delete other agency admins (deleting your own account is restricted by WP)
			// Non-agency admins may not edit or delete agency admins
			if ($currentUserIsAgencyAdmin) {
				return $allCaps;
			}

			unset( $allCaps['delete_users'], $allCaps['remove_users'] );
			unset( $allCaps['edit_users'] );

			return $allCaps;
		}

		/**
		 * Initialize the admin pages
		 */
		public function init() {
			//Add a "Created by" message in the admin footer. This filter is declared anonymously, so that it can not be removed.
			add_filter( 'admin_footer_text', [ $this, 'adminFooterText' ], 9999 );

			//Print notices
			add_action( 'admin_notices', [ $this, 'printAdminNotices' ], 1 );

			//Prevent our admin user from being edited or deleted and the mainwp plugin from being deactivated or deleted
			add_filter( 'user_has_cap', [ $this, 'mainWpPreventChanges' ], 999, 2 );
			add_filter( 'plugin_action_links', [ $this, 'mainWpPreventChangesFilterActions' ], 999, 2 );
			add_filter( 'user_has_cap', [ $this, 'adminUserPreventChanges' ], 999, 3 );
		}

		/**
		 * Prevent the MainWP plugin from being deactivated or deleted from users other than our admin
		 *
		 * @param array $allCaps An array of all the user's capabilities.
		 * @param array $caps    Actual capabilities for meta capability.
		 *
		 * @return array
		 */
		public function mainWpPreventChanges( array $allCaps, array $caps ): array {
			$pluginCaps = [ 'delete_plugins', 'edit_plugins', 'activate_plugins' ];

			if ( ! count( array_intersect( $pluginCaps, $caps ) ) ) {
				return $allCaps;
			}

			// Return all caps when we don't have any agency admins anymore or when the current user is an agency admin
			if ( ! $this->hasAgencyAdmins() || $this->isAgencyAdmin( \wp_get_current_user() ) ) {
				return $allCaps;
			}

			$action       = isset( $_REQUEST['action'] ) ? $_REQUEST['action'] : '';
			$mainWpPlugin = 'mainwp-child/mainwp-child.php';

			switch ( $action ) {
				case 'deactivate':
					$plugin = isset( $_REQUEST['plugin'] ) ? $_REQUEST['plugin'] : '';

					if ( ! empty( $plugin ) && $plugin == $mainWpPlugin ) {
						unset( $allCaps['activate_plugins'] );
					}

					break;

				case 'deactivate-selected':
					$plugins = isset( $_REQUEST['checked'] ) ? (array) $_REQUEST['checked'] : [];

					if ( ! empty( $plugins ) && in_array( $mainWpPlugin, $plugins ) ) {
						unset( $allCaps['activate_plugins'] );
					}

					break;

				case 'delete-selected':
					$plugins = isset( $_REQUEST['checked'] ) ? (array) $_REQUEST['checked'] : array();

					if ( ! empty( $plugins ) && in_array( $mainWpPlugin, $plugins ) ) {
						unset( $allCaps['delete_plugins'] );
					}

					break;

				default:
					$plugin = isset( $_REQUEST['file'] ) ? $_REQUEST['file'] : '';

					if ( in_array( 'edit_plugins', $caps ) && ! empty( $plugin ) && $plugin === $mainWpPlugin ) {
						unset( $allCaps['edit_plugins'] );
					}
			}

			return $allCaps;
		}

		/**
		 * @param array  $actions
		 * @param string $pluginFile
		 *
		 * @return array
		 */
		public function mainWpPreventChangesFilterActions( array $actions, string $pluginFile ): array {
			$mainwpPlugin = 'mainwp-child/mainwp-child.php';

			if ( $pluginFile === $mainwpPlugin ) {
				$user = wp_get_current_user();

				if ( $this->hasAgencyAdmins() && ! $this->isAgencyAdmin( $user ) ) {
					unset( $actions['deactivate'], $actions['delete'], $actions['edit'] );
				}
			}

			return $actions;
		}

		/**
		 * Print admin messages
		 */
		public function printAdminNotices() {
			if ( ! empty( $this->notices['error'] ) ) {
				foreach ( $this->notices['error'] as $notices ) {
					foreach ( $notices as $notice ) {
						print '<div class="error"><p>' . $notice . '</p></div>';
					}
				}
			}

			if ( ! empty( $this->notices['update'] ) ) {
				foreach ( $this->notices['update'] as $notices ) {
					foreach ( $notices as $notice ) {
						print '<div class="updated"><p>' . $notice . '</p></div>';
					}
				}
			}
		}

		/**
		 * Check whether WordPress has an agency admin according to email address or login name
		 *
		 * @param int $limit
		 *
		 * @return \WP_User[];
		 */
		private function getAgencyAdmins( int $limit = 0 ): array {
			global $wpdb;

			$where = [];

			if ( \defined( '\AGENCY_EMAIL_ADDRESS' ) && \AGENCY_EMAIL_ADDRESS ) {
				$where['user_email'][] = '%' . \strrchr( \AGENCY_EMAIL_ADDRESS, '@' );
			}

			if ( \defined( '\AGENCY_NAME' ) && \AGENCY_NAME ) {
				$where['user_login'][] = '%' . \AGENCY_NAME . '%';
			}

			if ( \defined( '\AGENCY_SLUG' ) && \AGENCY_SLUG ) {
				$where['user_login'][] = '%' . \AGENCY_SLUG . '%';
			}

			// We can't have an agency admin when there are no values to check for
			if ( ! $where ) {
				return [];
			}

			// Convert $where to an array of strings
			$whereValues = [];
			$whereFields = \array_map( function ( string $field, $values ) use ( &$whereValues ) {
				$values = (array) $values;

				foreach ( $values as & $value ) {
					$whereValues[] = $value;
					$value         = "u.{$field} LIKE %s";

					unset( $value );
				}

				return '(' . \implode( ' OR ', $values ) . ')';
			}, \array_keys( $where ), $where );
			$whereFields = implode( ' OR ', $whereFields );

			// Get users from the database
			$blogId = 0;
			$users  = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM {$wpdb->users} u
						INNER JOIN {$wpdb->usermeta} um ON u.ID = um.user_id
					  		AND um.meta_key = '{$wpdb->get_blog_prefix( $blogId )}capabilities' AND um.meta_value LIKE '%\"administrator\"%'
						WHERE {$whereFields}" . ( $limit ? " LIMIT {$limit}" : '' ),
					...$whereValues
				)
			);

			// Convert users to WP_User objects
			$users = \array_map( function ( $userData ) {
				$user = new \WP_User;
				$user->init( $userData );

				return $user;
			}, $users );

			return $users;
		}

		/**
		 * Check whether WordPress has an agency admin according to email address or login name
		 *
		 * @return bool
		 */
		private function hasAgencyAdmins(): bool {
			return ! empty( $this->getAgencyAdmins( 1 ) );
		}

		/**
		 * Check whether a user is an agency admin according to email address or login name
		 *
		 * @param \WP_User $user
		 *
		 * @return bool
		 */
		private function isAgencyAdmin( \WP_User $user ): bool {
			if ( ! $user->exists() ) {
				return false;
			}

			$isAgencyAdmin = false;

			if ( \defined( '\AGENCY_EMAIL_ADDRESS' ) && stripos( $user->user_email, \strrchr( \AGENCY_EMAIL_ADDRESS, '@' ) ) !== false ) {
				$isAgencyAdmin = true;
			} elseif ( \defined( '\AGENCY_NAME' ) && stripos( $user->user_login, \AGENCY_NAME ) !== false ) {
				$isAgencyAdmin = true;
			} elseif ( \defined( '\AGENCY_SLUG' ) && stripos( $user->user_login, \AGENCY_SLUG ) !== false ) {
				$isAgencyAdmin = true;
			}

			return $isAgencyAdmin;
		}
	}
