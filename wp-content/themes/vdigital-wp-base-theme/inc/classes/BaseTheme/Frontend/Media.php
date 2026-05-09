<?php

	namespace Theme\BaseTheme\Frontend;

	use Theme\BaseTheme;

	/**
	 * Class Media
	 *
	 * @package Theme\BaseTheme\Frontend
	 */
	final class Media extends BaseTheme\AbstractClass {

		public function init() {
			//Fix attachment pages: redirect to the parent post if it has one or add a robots text otherwise
			add_action( 'template_redirect', [$this, 'attachmentFix' ] );
		}

		/**
		 * Fix the WP attachment pages: redirect to it's parent or add a value to the robots tag if that media has no parent
		 */
		public function attachmentFix() {
			global $post;

			if ( is_attachment() ) {
				if ( ! empty( $post ) && ! empty( $post->post_parent ) ) {
					wp_redirect( get_permalink( $post->post_parent ) );
				} else {
					add_filter( 'wpseo_robots', function ( $robotsstr ) {
						if ( stripos( $robotsstr, 'noindex' ) === false ) {
							$robotsstr = trim( str_ireplace( [ 'index', ',,' ], [ '', ',' ], $robotsstr ), ',' );
							$robotsstr .= ',noindex';
						}

						return $robotsstr;
					}, 99999 );
				}
			}
		}
	}