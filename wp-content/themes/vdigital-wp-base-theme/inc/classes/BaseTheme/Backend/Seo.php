<?php

	namespace Theme\BaseTheme\Backend;

	use Theme\BaseTheme;

	/**
	 * Class Seo
	 *
	 * @package Theme\BaseTheme\Backend
	 */
	final class Seo extends BaseTheme\AbstractClass {

		public function init() {
			/**
			 * Bring back the Yoast redirect option in the Advanced Yoast SEO box
			 */
			add_filter( 'wpseo_metabox_entries_advanced', function ( $field_defs ) {
				if ( ! array_key_exists( 'redirect', $field_defs ) ) {
					$field_defs['redirect'] = [
						'default_value' => '',
						'description'   => __( 'The URL that this page should redirect to.', 'wordpress-seo' ),
						'title'         => __( '301 Redirect', 'wordpress-seo' ),
						'type'          => 'text',
					];
				}

				return $field_defs;
			}, 99 );
		}
	}