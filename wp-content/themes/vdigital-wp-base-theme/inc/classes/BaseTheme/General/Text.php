<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme;
	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class Text
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class Text extends AbstractClass {

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
			$text = (string) $text;

			if ( ( $translated = __( $text, BaseTheme::CHILD_THEME_TEXT_DOMAIN ) ) !== $text ) {
				return $translated;
			}

			if ( ( $translated = __( $text, BaseTheme::TEXT_DOMAIN ) ) !== $text ) {
				return $translated;
			}

			return __( $text );
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
			return \_nx( $single, $plural, $number, $context, BaseTheme::TEXT_DOMAIN );
		}
        public function init() {
		}
	}