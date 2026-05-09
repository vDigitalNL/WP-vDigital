<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme;
	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class Html
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class Html extends AbstractClass {

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
			return \esc_attr__( $text, BaseTheme::TEXT_DOMAIN );
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
			return \esc_html__( $text, BaseTheme::TEXT_DOMAIN );
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
			return \esc_html_x( $text, $context, BaseTheme::TEXT_DOMAIN );
		}

		public function init() {
			//Disable formatting and removing "span, div & meta" elements from post content
			add_action( 'print_default_editor_scripts', [ $this, 'print_default_editor_scripts' ] );
			add_filter( 'tiny_mce_before_init', [ $this, 'tiny_mce_before_init' ] );

			// Disable emojis.
            if ( baseTheme()->getOption( 'general.emojis') == false ) {
                $this->disable_emojis();
            }

			// Disable the auto format function that WordPress uses within their TinyMCE editor.
			if ( $this->baseTheme->applyFilters( 'wordpress/tinymce/remove_wpautop', true ) ) {
				remove_filter( 'the_content', 'wpautop' );
			}
		}

		public function print_default_editor_scripts() {
			print '
<script type="text/javascript">
	window.wp.editor.getDefaultSettingsOld = window.wp.editor.getDefaultSettings;
	window.wp.editor.getDefaultSettings    = function() {
		var settings = window.wp.editor.getDefaultSettingsOld();

		settings.tinymce["extended_valid_elements"] = "span[*], div[*], meta[*]";

		return settings;
	};
</script>
				';
		}

		/**
		 * @param array $settings
		 *
		 * @return mixed
		 */
		public function tiny_mce_before_init( $settings ) {
			$settings['extended_valid_elements'] = 'span[*], div[*], meta[*]';

			return $settings;
		}

        /**
         * Disable the emoji's
         */
        public function disable_emojis() {
            remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
            remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
            remove_action( 'wp_print_styles', 'print_emoji_styles' );
            remove_action( 'admin_print_styles', 'print_emoji_styles' );
            remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
            remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
            remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
            add_filter( 'tiny_mce_plugins', [ $this, 'disable_emojis_tinymce' ] ) ;
            add_filter( 'wp_resource_hints', [ $this, 'disable_emojis_remove_dns_prefetch' ], 10, 2 );
        }

        /**
         * Filter function used to remove the tinymce emoji plugin.
         *
         * @param array $plugins
         * @return array Difference betwen the two arrays
         */
        public function disable_emojis_tinymce( $plugins ) {
            if ( is_array( $plugins ) ) {
                return array_diff( $plugins, array( 'wpemoji' ) );
            } else {
                return array();
            }
        }

        /**
         * Remove emoji CDN hostname from DNS prefetching hints.
         *
         * @param array $urls URLs to print for resource hints.
         * @param string $relation_type The relation type the URLs are printed for.
         * @return array Difference betwen the two arrays.
         */
        public function disable_emojis_remove_dns_prefetch( $urls, $relation_type ) {
            if ( 'dns-prefetch' == $relation_type ) {
                $urls = array_diff( $urls, [ 'https://s.w.org/images/core/emoji/2/svg/' ] );
            }
            return $urls;
        }

	}