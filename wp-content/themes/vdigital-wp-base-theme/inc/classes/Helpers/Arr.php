<?php

	namespace Theme\Helpers;

	/**
	 * Class Arr
	 *
	 * @package Theme\Helpers
	 */
	class Arr {

		/**
		 * Calculate the average of values in an array
		 *
		 * @param array $array
		 *
		 * @return number
		 */
		public static function average( $array ) {
			return count( $array ) ? array_sum( $array ) / count( $array ) : 0;
		}

		/**
		 * Check whether two arrays are exactly the same
		 *
		 * @param array $array1
		 * @param array $array2
		 * @param int   $sortFlags Optional sort mode. Can be one of SORT_REGULAR, SORT_NUMERIC, SORT_STRING, SORT_LOCALE_STRING, SORT_NATURAL or SORT_FLAG_CASE. Defaults to SORT_REGULAR
		 *
		 * @return bool
		 */
		public static function compare( $array1, $array2, $sortFlags = SORT_REGULAR ) {
			sort( $array1, $sortFlags );
			sort( $array2, $sortFlags );

			$array1 = array_unique( $array1 );
			$array2 = array_unique( $array2 );

			return $array1 === $array2;
		}

		/**
		 * Flatten a multi-dimensional associative array with dots.
		 *
		 * @param  array   $array
		 * @param  string  $prepend
		 * @return array
		 */
		public static function dot($array, $prepend = '')
		{
			$results = [];

			foreach ($array as $key => $value) {
				if (is_array($value) && ! empty($value)) {
					$results = array_merge($results, static::dot($value, $prepend.$key.'.'));
				} else {
					$results[$prepend.$key] = $value;
				}
			}

			return $results;
		}

		/**
		 * Validate a value against an array with valid values
		 *
		 * @param mixed $value       The value to validate
		 * @param array $validValues The array of valid values
		 * @param mixed $default     The default value to return when $value is not in $valid_values
		 * @param bool  $strict      If set to TRUE this function will also check the type of $value in $valid_values.
		 *
		 * @return mixed
		 */
		public static function filterValidOption( $value, $validValues, $default = '', $strict = false ) {
			return in_array( $value, $validValues, $strict ) ? $value : $default;
		}

		/**
		 * Validate a value against the keys of an array with valid values
		 *
		 * @param mixed $value       The value to validate
		 * @param array $validValues The array of valid values
		 * @param mixed $default     The default value to return when $value is not in $valid_values
		 * @param bool  $strict      If set to TRUE this function will also check the type of $value in $valid_values.
		 *
		 * @return mixed
		 */
		public static function filterValidOptionKey( $value, $validValues, $default = '', $strict = false ) {
			return static::filterValidOption( $value, array_keys( $validValues ), $default, $strict );
		}

		/**
		 * Flatten a multi-dimensional array into a single level.
		 *
		 * @param array $array        The array to flatten
		 * @param bool  $preserveKeys If set to TRUE numeric keys are preserved.
		 * @param int   $depth
		 *
		 * @return array
		 */
		public static function flatten( array $array, $preserveKeys = false, $depth = INF ): array {
			$result = [];

			foreach ( $array as $key => $item ) {
				if ( ! is_array( $item ) ) {
					if ( $preserveKeys ) {
						$result[ $key ] = $item;
					} else {
						$result[] = $item;
					}
				} elseif ( $depth === 1 ) {
					$result = array_merge( $result, $preserveKeys ? $item : array_values( $item ) );
				} else {
					$result = array_merge( $result, static::flatten( $item, $preserveKeys, $depth - 1 ) );
				}
			}

			return $result;
		}

		/**
		 * Flatten a multi-dimensional array into a single level when a callback evaluates to TRUE.
		 *
		 * @param array    $array        The array to flatten
		 * @param callable $callback     The callback function to use. Both the key and the value of the values in $array will be passed to the callback, in that order.
		 * @param bool     $preserveKeys If set to TRUE numeric keys are preserved.
		 * @param int      $depth
		 *
		 * @return array
		 */
		public static function flattenWhen( array $array, callable $callback, $preserveKeys = false, $depth = INF ): array {
			$result = [];

			foreach ( $array as $key => $item ) {
				if ( ! is_array( $item ) || ! $callback($key, $item) ) {
					if ( $preserveKeys ) {
						$result[ $key ] = $item;
					} else {
						$result[] = $item;
					}
				} elseif ( $depth === 1 ) {
					$result = array_merge( $result, $preserveKeys ? $item : array_values( $item ) );
				} else {
					$result = array_merge( $result, static::flattenWhen( $item, $callback, $preserveKeys, $depth - 1 ) );
				}
			}

			return $result;
		}

		/**
		 * Get the first value of an array
		 *
		 * @param array $array The input array
		 *
		 * @return mixed Returns the first value of $array. When the array is empty, this function returns NULL
		 */
		public static function getFirst( $array ) {
			return self::getNth( 0, $array );
		}

		/**
		 * Get the last value of an array
		 *
		 * @param array $array The input array
		 *
		 * @return mixed Returns the last value of $array. When the array is empty, this function returns NULL
		 */
		public static function getLast( $array ) {
			return self::getNth( - 1, $array );
		}

		/**
		 * Get the nth value of an array
		 *
		 * @param int   $n     Starting from zero. If $n is negative, the nth value from the end of the array will be returned
		 * @param array $array The input array
		 *
		 * @return mixed Returns the nth value of $array. When the nth value does not exist, this function returns NULL
		 */
		public static function getNth( $n, $array ) {
			if ( ! is_array( $array ) || ! is_numeric( $n ) || ( $n >= 0 && $n >= count( $array ) ) || ( $n < 0 && abs( $n ) > count( $array ) ) ) {
				return null;
			}

			$array = array_slice( $array, $n, 1 );

			return current( $array );
		}

		/**
		 * Remove a value from an array. Note that the check is case-insensitive
		 *
		 * @param array       $array
		 * @param array|mixed $needle
		 * @param bool        $strict
		 *
		 * @return array
		 */
		public static function iRemove( $array, $needle, $strict = false ) {
			$_array = self::strToLower( $array );

			foreach ( (array) $needle as $_needle ) {
				$_needle = mb_strtolower( $_needle );

				while ( ( $key = array_search( $_needle, $_array, $strict ) ) !== false ) {
					unset ( $array[ $key ], $_array[ $key ] );
				}
			}

			return $array;
		}

		/**
		 * Case insensitive version of array_unique
		 *
		 * @param array $array
		 *
		 * @return array
		 */
		public static function iUnique( $array ) {
			return array_intersect_key( $array, array_unique( array_map( 'mb_strtolower', $array ) ) );
		}

		/**
		 * Decodes a JSON string to an associative array
		 *
		 * @param string $json
		 * @param int    $depth
		 *
		 * @return array
		 */
		public static function jsonDecode( $json, $depth = 512 ) {
			return json_decode( $json, true, $depth );
		}

		/**
		 * Merge two arrays recursively
		 *
		 * Where array_merge_recursive combines the values of the same string keys into an array, this function overwrites or merges the values from the first array with the values of the second array.
		 *
		 * @param array $array1
		 * @param array $array2
		 * @param bool  $append_numeric_keys Optional. Defaults to true
		 *
		 * @return array
		 */
		public static function mergeRecursiveDistinct( $array1, $array2, $append_numeric_keys = true ) {
			if ( ! is_array( $array1 ) ) {
				return [];
			}

			if ( is_array( $array2 ) ) {
				foreach ( $array2 as $key => $value ) {
					if ( $append_numeric_keys && is_numeric( $key ) ) {
						$array1[] = $value;
					} elseif ( is_array( $value ) && array_key_exists( $key, $array1 ) && is_array( $array1[ $key ] ) ) {
						$array1[ $key ] = self::mergeRecursiveDistinct( $array1[ $key ], $value );
					} else {
						$array1[ $key ] = $value;
					}
				}
			}

			return $array1;
		}

		/**
		 * Explodes a string to a multi-dimensional array with key-value pairs
		 *
		 * @param string $outerDelimiter
		 * @param string $innerDelimiter
		 * @param string $input
		 * @param int    $innerLimit
		 *
		 * @return array
		 */
		public static function multiExplode( $outerDelimiter, $innerDelimiter, $input, $innerLimit = 0 ) {
			$return = [];
			$array  = static::recursiveExplode( [ $outerDelimiter, $innerDelimiter ], $input, $innerLimit );

			if ( is_array( $array ) ) {
				foreach ( $array as $val ) {
					if ( is_array( $val ) && count( $val ) > 1 ) {
						$key = array_shift( $val );

						if ( count( $val ) == 1 ) {
							$val = $val[0];
						}

						$return[ $key ] = $val;
						unset( $key, $val );
					} elseif ( is_array( $val ) ) {
						$return[ $val[0] ] = '';
					} else {
						$return[ (string) $val ] = '';
					}
				}
			} else {
				$return = [ (string) $array => '' ];
			}

			return $return;
		}

		/**
		 * Converts an array with keys to a string.
		 *
		 * Keys and values are separated by $glue_inner and these parts are optionally wrapped by $wrapper[0] and $wrapper[1]. These sets are separated by $glue_outer
		 *
		 * @param array  $array
		 * @param string $glueInner
		 * @param string $glueOuter
		 * @param string $wrapper
		 *
		 * @return bool|string Returns the resulting string. Returns FALSE on failure.
		 */
		public static function multiImplode( $array, $glueInner, $glueOuter, $wrapper = '' ) {
			if ( ! is_array( $array ) ) {
				return false;
			}

			if ( ! empty( $wrapper ) && mb_strlen( $wrapper ) == 1 ) {
				$wrapper = $wrapper[0] . $wrapper[0];
			}

			$arrayTmp = [];

			foreach ( $array as $key => $value ) {
				if ( $wrapper !== '' ) {
					$arrayTmp[] = $wrapper[0] . $key . $glueInner . $value . $wrapper[1];
				} else {
					$arrayTmp[] = $key . $glueInner . $value;
				}
			}

			$output = implode( $glueOuter, $arrayTmp );

			return $output;
		}

		/**
		 * Explodes a string to a multi-dimensional array
		 *
		 * @param array|string $delimiters
		 * @param string|array $input
		 * @param int          $innerLimit
		 * @param int          $outerLimit
		 *
		 * @return array
		 */
		public static function recursiveExplode( $delimiters, $input, $innerLimit = 0, $outerLimit = 0 ) {
			if ( $input == '' ) {
				return [];
			}

			if ( is_array( $delimiters ) ) {
				foreach ( $delimiters as $delimiter ) {
					if ( is_array( $input ) ) {
						foreach ( $input as & $i ) {
							$i = static::recursiveExplode( $delimiter, $i, $innerLimit, $outerLimit );
							unset( $i );
						}
					} else {
						$input = ( ! empty( $outerLimit )
							? explode( $delimiter, $input, ( $outerLimit + 1 ) )
							:
							explode( $delimiter, $input ) );
					}
				}
			} elseif ( is_array( $input ) ) {
				foreach ( $input as & $i ) {
					$i = static::recursiveExplode( $delimiters, $i, $innerLimit, $outerLimit );
					unset( $i );
				}
			} else {
				$input =
					( ! empty( $innerLimit ) ? explode( $delimiters, $input, ( $innerLimit + 1 ) ) : explode( $delimiters, $input ) );
			}

			return $input;
		}

		/**
		 * Join elements of a multi-dimensional array with a string
		 *
		 * @param string $glue
		 * @param array  $pieces
		 *
		 * @return string
		 */
		public static function recursiveImplode( $glue, $pieces = [] ) {
			if ( is_array( $glue ) ) {
				$pieces = $glue;
				$glue   = '';
			}

			if ( is_array( $pieces ) ) {
				foreach ( $pieces as & $piece ) {
					$piece = static::recursiveImplode( $glue, $piece );

					unset( $piece );
				}

				return implode( $glue, $pieces );
			} elseif ( is_scalar( $pieces ) ) {
				return (string) $pieces;
			}

			return '';
		}

		/**
		 * Remove a value from an array. Note that the check is case-sensitive
		 *
		 * @param array       $array
		 * @param array|mixed $needle
		 * @param bool        $strict
		 *
		 * @return array
		 */
		public static function remove( $array, $needle, $strict = false ) {
			foreach ( (array) $needle as $_needle ) {
				while ( ( $key = array_search( $_needle, $array, $strict ) ) !== false ) {
					unset ( $array[ $key ] );
				}
			}

			return $array;
		}

		/**
		 * Searches for a key-value pair within a two dimensional array $haystack.
		 *
		 * This function returns the $haystack's first layer key of the second layer array within this key-value pair was found. If $key is NULL or blank, this function doesn't check for a key-value pair and just checks if $needle is in the second layer of $haystack. If $needle is NULL, this function only checks if $key exists and then returns the $haystack's first layer key of the second layer array within this key was found. $key and $needle can't be NULL (or blank) both. This function returns the first match, so multiple matches are ignored. Returns FALSE if no results were found.
		 *
		 * Some examples:
		 *  array_search_m(array('a' => array('x' => 1, 'y' => 2, 'z' => 3), 'b' => array('x' => 4, 'y' => 5, 'z' => 6)), 'y', 5, true) returns 'b'
		 *  array_search_m(array('a' => array('x' => 1, 'y' => 2, 'z' => 3), 'b' => array('x' => 4, 'y' => 5, 'z' => 6)), 'y', '5') returns 'b'
		 *  array_search_m(array('a' => array('x' => 1, 'y' => 2, 'z' => 3), 'b' => array('x' => 4, 'y' => 5, 'z' => 6)), 'y', '5', true) returns false
		 *  array_search_m(array('a' => array('x' => 1, 'y' => 2, 'z' => 3), 'b' => array('x' => 4, 'y' => 5, 'z' => 6)), 'y', '') returns false
		 *  array_search_m(array('a' => array('x' => 1, 'y' => 2, 'z' => 3), 'b' => array('x' => 4, 'y' => 5, 'z' => 6)), 'y', NULL) returns 'a'
		 *  array_search_m(array('a' => array('x' => 1, 'y' => 2, 'z' => 3), 'b' => array('x' => 4, 'y' => 5, 'z' => 6)), NULL, 3) returns 'a'
		 *
		 * @param array $haystack
		 * @param mixed $key
		 * @param mixed $needle
		 * @param bool  $strict
		 *
		 * @return bool|int|string
		 */
		public static function searchMultidimensional( $haystack, $key = null, $needle = null, $strict = false ) {
			if ( ( is_null( $key ) || $key == '' ) && is_null( $needle ) ) {
				return false;
			}

			if ( is_array( $haystack ) ) {
				foreach ( $haystack as $h_key => $h_value ) {
					if ( is_array( $h_value ) ) {
						if ( is_null( $needle ) ) {
							if ( array_key_exists( $key, $h_value ) ) {
								return $h_key;
							}
						} elseif ( is_null( $key ) || $key == '' ) {
							if ( in_array( $needle, $h_value, $strict ) ) {
								return $h_key;
							}
						} elseif ( array_key_exists( $key,
								$h_value ) && ( ( $strict == true && $h_value[ $key ] === $needle ) || $strict == false && $h_value[ $key ] == $needle )
						) {
							return $h_key;
						}
					}
				}
			}

			return false;
		}

		/**
		 * Sort a multidimensional array by a specific key
		 *
		 * @param array      $array
		 * @param int|string $sort_key
		 * @param bool       $reverse_order
		 * @param int|string $fallback_key
		 * @param bool       $fallback_reverse_order
		 *
		 * @return array
		 */
		public static function sortMultidimensional(
			$array,
			$sort_key,
			$reverse_order = false,
			$fallback_key = '',
			$fallback_reverse_order = false
		) {
			if ( ! empty( $array ) && is_array( $array ) ) {
				uasort( $array,
					self::sortMultidimensionalSorter( $sort_key, $reverse_order, $fallback_key, $fallback_reverse_order ) );
			}

			return $array;
		}

		/**
		 * Converts the string children of an array to lowercase strings
		 *
		 * @param array $array
		 *
		 * @see mb_strtolower
		 *
		 * @return array
		 */
		public static function strToLower( $array ) {
			foreach ( $array as & $arr ) {
				$arr = is_array( $arr ) ? self::strToLower( $arr ) : mb_strtolower( $arr );

				unset( $arr );
			}

			return $array;
		}

		/**
		 * Converts all non-array values of a (multidimensional) array to floats
		 *
		 * @param array $array
		 *
		 * @return array
		 */
		public static function toFloat( $array ) {
			foreach ( $array as & $value ) {
				if ( is_array( $value ) ) {
					$value = self::toFloat( $value );
				} else {
					$value = (float) $value;
				}

				unset( $value );
			}

			return $array;
		}

		/**
		 * Converts all non-array values of a (multidimensional) array to integers
		 *
		 * @param array $array
		 *
		 * @return array
		 */
		public static function toInt( $array ) {
			foreach ( $array as & $value ) {

				if ( is_array( $value ) ) {
					$value = self::toInt( $value );
				} else {
					$value = (int) $value;
				}

				unset( $value );
			}

			return $array;
		}

		/**
		 * Transform a multi (at least two) dimensional array so that the first child array containing header names are used for named keys for the remaining child arrays.
		 *
		 * @param array[] $array
		 * @param bool    $includeEmptyHeaders Whether to use empty header names (when the header name equals an empty string)
		 *
		 * @return array[] Returning a two dimensional
		 */
		public static function toNamedArray( $array, $includeEmptyHeaders = false ) {
			$data    = [];
			$headers = array_filter( array_values( (array) array_shift( $array ) ), function ( $header ) use (
				$includeEmptyHeaders
			) {
				return is_scalar( $header ) && ( $includeEmptyHeaders || (string) $header != '' );
			} );

			foreach ( $array as $line => $values ) {
				foreach ( array_values( (array) $values ) as $n => $value ) {
					if ( array_key_exists( $n, $headers ) ) {
						$header                   = $headers[ $n ];
						$data[ $line ][ $header ] = $value;
					}
				}

				foreach ( $headers as $header ) {
					if ( ! array_key_exists( $header, $data[ $line ] ) ) {
						$data[ $line ][ $header ] = '';
					}
				}
			}

			return $data;
		}

		/**
		 * Trims the string children from characters in $charlist or from spaces when $charlist is NULL
		 *
		 * @param array $array
		 * @param null  $charlist
		 *
		 * @see trim()
		 *
		 * @return array
		 */
		public static function trim( $array, $charlist = null ) {
			foreach ( $array as & $arr ) {
				$arr = is_null( $charlist )
					? ( is_array( $arr ) ? self::trim( $arr ) : trim( $arr ) )
					:
					( is_array( $arr ) ? self::trim( $arr, $charlist ) : trim( $arr, $charlist ) );
				unset( $arr );
			}

			return $array;
		}

		/**
		 * Two-, three- or four-level array_unique version
		 *
		 * @param array $array
		 * @param int   $depth Optional. Min 2, max 4. Defaults to 2
		 *
		 * @return array
		 */
		public static function uniqueArrays( $array, $depth = 2 ) {
			$depth = Number::minMax( $depth, 2, 4 );

			if ( ! is_array( $array ) ) {
				return [];
			}

			switch ( $depth ) {
				case 4:
					foreach ( $array as & $_array ) {
						if ( is_array( $_array ) ) {
							foreach ( $_array as & $__array ) {
								if ( is_array( $__array ) ) {
									$__array = array_map( [
										static::class,
										'jsonDecode',
									], array_unique( array_map( 'json_encode', $__array ) ) );
								}

								unset( $__array );
							}

							$_array = array_map( [
								static::class,
								'jsonDecode',
							], array_unique( array_map( 'json_encode', $_array ) ) );
						}

						unset( $_array );
					}
					break;

				case 3:
					foreach ( $array as & $_array ) {
						if ( is_array( $_array ) ) {
							$_array = array_map( [
								static::class,
								'jsonDecode',
							], array_unique( array_map( 'json_encode', $_array ) ) );
						}

						unset( $_array );
					}
					break;
			}

			return array_map( [ static::class, 'jsonDecode' ], array_unique( array_map( 'json_encode', $array ) ) );
		}

		private static function sortMultidimensionalSorter(
			$key,
			$reverse_order = false,
			$fallback_key = '',
			$fallback_reverse_order = false
		) {
			return function ( $a, $b ) use ( $key, $reverse_order, $fallback_key, $fallback_reverse_order ) {
				if ( $fallback_key != '' && $a[ $key ] == $b[ $key ] && array_key_exists( $fallback_key,
						$a ) && array_key_exists( $fallback_key, $b )
				) {
					return $fallback_reverse_order
						? strnatcasecmp( $b[ $fallback_key ], $a[ $fallback_key ] )
						:
						strnatcasecmp( $a[ $fallback_key ], $b[ $fallback_key ] );
				} else {
					return $reverse_order ? strnatcasecmp( $b[ $key ], $a[ $key ] ) : strnatcasecmp( $a[ $key ], $b[ $key ] );
				}
			};
		}
	}