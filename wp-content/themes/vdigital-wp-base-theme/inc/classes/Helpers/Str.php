<?php

	namespace Theme\Helpers;

	/**
	 * Class Str
	 *
	 * @package Theme\Helpers
	 */
	class Str {

		const STR_RAND_MODE_ALPHABETIC = 0;

		const STR_RAND_MODE_ALPHANUMERIC = 1;

		const STR_RAND_MODE_ALPHANUMERIC_SPECIAL_CHARS = 3;

		const STR_RAND_MODE_NUMERIC = 2;

		/**
		 * Convert a boolean to text
		 *
		 * @param bool $boolean The boolean
		 *
		 * @return string Returns "yes" when $bool evaluates to TRUE, returns "no" otherwise
		 */
		public static function fromBoolean( $boolean ) {
			return ! ! $boolean ? 'yes' : 'no';
		}

		/**
		 * Convert a string from CamelCase to camel_case
		 *
		 * @param string $string
		 * @param bool   $keepCapitals
		 *
		 * @return string
		 */
		public static function fromCamelCase( $string, $keepCapitals = false ) {
			$string = preg_replace( "/(?<=[a-zA-Z])(?=[A-Z])/", "_", $string );

			return $keepCapitals ? $string : mb_strtolower( $string );
		}

		/**
		 * Convert a string from pascalCase to pascal_case
		 *
		 * @param string $string
		 * @param bool   $keepCapitals
		 *
		 * @return string
		 */
		public static function fromPascalCase( $string, $keepCapitals = false ) {
			return static::fromCamelCase( $string, $keepCapitals );
		}

		/**
		 * Replaces all types of dashes with one and the same
		 *
		 * @param string $string
		 * @param mixed  $replacement Optional. The replacement dash. Or any character you would like to replace all dashes with. Defaults to "-"
		 *
		 * @return string
		 */
		public static function normalizeDashes( $string, $replacement = '-' ) {
			//How many types of dashes would you like to have... :s
			$search = [ '־', '-', '–', '‐', '‑', '‒', '—', '―', '−', '⸺', '⸻', '﹘', '﹣', '－' ];

			if ( $replacement != '' ) {
				$search = array_diff( $search, [ $replacement ] );
			}

			return str_replace( $search, $replacement, $string );
		}

		/**
		 * Parses the string into variables
		 *
		 * Parses $str as if it were the query string passed via a URL
		 *
		 * @param string $str The input string
		 *
		 * @return array Array filled with decoded key and value pairs from $str
		 */
		public static function parse( $str ) {
			$return = [];

			mb_parse_str( $str, $return );

			return (array) $return;
		}

		/**
		 * Generates a random string
		 *
		 * @param int $length The length of the output
		 * @param int $type   $type can be STR_RAND_MODE_ALPHABETIC, STR_RAND_MODE_ALPHANUMERIC, STR_RAND_MODE_ALPHANUMERIC_SPECIAL_CHARS or STR_RAND_MODE_NUMERIC. Defaults to STR_RAND_MODE_ALPHANUMERIC
		 *
		 * @return string
		 */
		public static function rand( $length = 8, $type = self::STR_RAND_MODE_ALPHANUMERIC ) {
			$return = '';

			if ( (int) $length < 1 ) {
				$length = 1;
			}

			switch ( $type ) {
				case static::STR_RAND_MODE_ALPHABETIC:
					$range = implode( array_merge( range( 'a', 'z' ), range( 'A', 'Z' ) ) );
					break;

				case static::STR_RAND_MODE_NUMERIC:
					$range = implode( range( 0, 9 ) );
					break;

				case static::STR_RAND_MODE_ALPHANUMERIC_SPECIAL_CHARS:
					//Here we have the full alphabet, three times 0-9 and two times an array of 13 special characters. With this we try to make the chances on a alphabetic or numeric char (almost) even
					$rangeNumbers           = range( 0, 9 );
					$rangeSpecialCharacters = [ '_', '^', '[', ']', '%', '&', '(', ')', '+', '-', '=', '?', '@' ];
					$range                  =
						implode( array_merge( $rangeNumbers, range( 'a', 'm' ), $rangeSpecialCharacters, $rangeNumbers,
							range( 'n', 'z' ), $rangeNumbers, range( 'A', 'M' ), $rangeNumbers, $rangeSpecialCharacters,
							range( 'N', 'Z' ), $rangeNumbers ) );
					break;

				case static::STR_RAND_MODE_ALPHANUMERIC:
				default:
					//Here we have the full alphabet and five times 0-9. With this we try to make the chances on a alphabetic or numeric char (almost) even
					$rangeNumbers = range( 0, 9 );
					$range        =
						implode( array_merge( $rangeNumbers, range( 'a', 'm' ), $rangeNumbers, range( 'n', 'z' ), $rangeNumbers,
							range( 'A', 'M' ), $rangeNumbers, range( 'N', 'Z' ), $rangeNumbers ) );
					break;
			}

			$rangeLength = mb_strlen( $range );

			for ( $i = 1; $i <= $length; $i ++ ) {
				$return .= $range[ rand( 0, ( $rangeLength - 1 ) ) ];
			}

			return $return;
		}

		/**
		 * Reduce the number of times that $needle is in $haystack to $number. This function is case sensitive
		 *
		 * @param string|array $needle
		 * @param string|array $haystack
		 * @param int          $number
		 *
		 * @return string|array
		 */
		public static function reduce( $needle, $haystack, $number = 1 ) {
			$haystackIsArray = false;

			if ( $number <= 0 ) {
				$number = 1;
			}

			if ( ! is_array( $needle ) ) {
				$needle = [ $needle ];
			}

			if ( ! is_array( $haystack ) ) {
				$haystack = [ $haystack ];
			} else {
				$haystackIsArray = true;
			}

			foreach ( $needle as $_needle ) {
				$replace = str_repeat( $_needle, $number );
				$_needle = str_repeat( $_needle, $number + 1 );

				foreach ( $haystack as & $_haystack ) {
					while ( mb_strlen( $_haystack ) > 0 && mb_strpos( $_haystack, $_needle ) !== false ) {
						$_haystack = str_replace( $_needle, $replace, $_haystack );
					}

					unset( $_haystack );
				}
			}

			return $haystackIsArray ? $haystack : $haystack[0];
		}

		/**
		 * Return part of a string with no cut off words
		 *
		 * @param string $string
		 * @param int    $length When $string does not have more characters than $length, $string will be returned untouched
		 *
		 * @return string Returns $string with whole words with a max length of $length characters
		 */
		public static function substrWords( $string, $length ) {
			if ( mb_strlen( $string ) > $length ) {
				$string = mb_substr( $string, 0, $length + 1 );

				if ( ( $last_whitespace = mb_strrpos( $string, ' ' ) ) !== false ) {
					$string = mb_substr( $string, 0, $last_whitespace );
				} else {
					$string = mb_substr( $string, 0, $length );
				}
			}

			return $string;
		}

		/**
		 * Convert "yes" or "no" to TRUE or FALSE
		 *
		 * @param string $string The text
		 *
		 * @return string Returns TRUE for "yes", returns FALSE otherwise
		 */
		public static function toBoolean( $string ) {
			return mb_strtolower( $string ) == 'yes';
		}

		/**
		 * Convert a string from camel_case or camel-case to CamelCase
		 *
		 * @param string $string
		 *
		 * @return string
		 */
		public static function toCamelCase( $string ) {
			return str_replace( ' ', '', ucwords( str_replace( ['_', '-'], ' ', $string ) ) );
		}

		/**
		 * Convert a string from pascal_case or pascal-case to pascalCase
		 *
		 * @param string $string
		 *
		 * @return string
		 */
		public static function toPascalCase( $string ) {
			return lcfirst( static::toCamelCase( $string ) );
		}
	}