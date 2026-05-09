<?php

	namespace Theme\BaseTheme\Backend\Cache;

	use Theme\BaseTheme;

	/**
	 * Class W3
	 *
	 * @package Theme\BaseTheme\Backend\Cache
	 */
	final class W3 extends BaseTheme\AbstractClass {

		/**
		 * Flush all caches with the W3 Total Cache plugin
		 */
		public function flushAll() {
			if ( function_exists( 'w3tc_flush_all' ) ) {
				w3tc_flush_all();
			}

			$this->baseTheme->doAction( 'w3tc_flush_all' );
		}

		/**
		 * Flush the W3 cache on nav menu changes
		 *
		 * @param null|string $action
		 */
		public function flushCacheOnNavMenuChange( ?string $action ) {
			$menu_post_actions = [ 'add-menu_item', 'move-menu_item', 'nav_menus_bulk_actions', 'save-menu-locations', 'update-nav_menu' ];

			if ( ! empty( $action ) && ( in_array( $action, $menu_post_actions ) || strpos( $action, 'delete-menu_item_' ) !== false || strpos( $action, 'delete-nav_menu-' ) !== false ) ) {
				$this->flushAll();
			}
		}

		/**
		 * Flush the W3 cache on widget changes
		 *
		 * @param null|string $action
		 */
		public function flushCacheOnWidgetChange( ?string $action ) {
			$widget_post_actions = [ 'save-sidebar-widgets', 'update-widget' ];

			if ( defined( 'DOING_AJAX' ) && DOING_AJAX === true && ! empty( $action ) && in_array( $action, $widget_post_actions ) ) {
				$this->flushAll();
			}
		}

		public function init() {
			//Flush the cache when posts are saved, deleted, trashed or untrashed
			add_action( 'delete_attachment', [ $this, 'flushAll' ], 99 );
			add_action( 'delete_post', [ $this, 'flushAll' ], 99 );
			add_action( 'save_post', [ $this, 'purgeFromPageCache' ], 99 );
			add_action( 'trashed_post', [ $this, 'purgeFromPageCache' ], 99 );
			add_action( 'untrashed_post', [ $this, 'purgeFromPageCache' ], 99 );

			//Flush the cache when widgets or navigation menus are adjusted
			add_action( 'check_admin_referer', [ $this, 'flushCacheOnNavMenuChange' ], 99 );
			add_action( 'check_ajax_referer', [ $this, 'flushCacheOnWidgetChange' ], 99 );
		}

		/**
		 * Flush the page cache for a specific post ID and flush the browser cache with the W3 Total Cache plugin
		 *
		 * @param int $post_id
		 */
		public function purgeFromPageCache( int $post_id ) {
			add_action( 'w3tc_purge_from_pgcache', function ( $post_id ) {
				$post = get_post( $post_id );

				if ( function_exists( 'w3tc_browsercache_flush' ) ) {
					w3tc_browsercache_flush();
				}

				if ( $post->post_type ) {
					$this->baseTheme->doAction( "w3tc_purge_from_pgcache_{$post->post_type}", $post_id );
				}

				$this->baseTheme->doAction( 'w3tc_purge_from_pgcache', $post_id );
			}, 999 );

			do_action( 'w3tc_purge_from_pgcache', $post_id );
		}
	}