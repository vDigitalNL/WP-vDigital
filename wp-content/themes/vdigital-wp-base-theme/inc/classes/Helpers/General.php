<?php

	namespace Theme\Helpers;

	/**
	 * Class General
	 *
	 * @package Theme\Helpers
	 */
	class General {

		const DB_MAX_STORAGE_LENGTH_LONGTEXT = 4294967295;

		const DB_MAX_STORAGE_LENGTH_MEDIUMTEXT = 16777215;

		const DB_MAX_STORAGE_LENGTH_TEXT = 65535;

		const DB_MAX_STORAGE_LENGTH_VARCHAR = 255;

		const DB_MAX_STORAGE_VALUE_INT = 2147483647;

		const DB_MAX_STORAGE_VALUE_MEDIUMINT_UNSIGNED = 16777215;

		const DB_MIN_STORAGE_VALUE_INT = - 2147483648;

		const TITLE_KEYWORD_MAX_LENGTH = 19;

		/**
		 * Converts a boolean to an integer: TRUE becomes 1 and FALSE becomes 0
		 *
		 * @param bool $bool
		 *
		 * @return int
		 */
		public static function boolToInt( $bool ) {
			return (bool) $bool ? 1 : 0;
		}

		/**
		 * Validate a value against an array with valid values
		 *
		 * @param mixed $value        The value to validate
		 * @param array $valid_values The array of valid values
		 * @param mixed $default      The default value to return when $value is not in $valid_values
		 * @param bool  $strict       If set to TRUE this function will also check the type of $value in $valid_values.
		 *
		 * @return mixed
		 */
		public static function filterValidOption( $value, $valid_values, $default = '', $strict = false ) {
			return in_array( $value, $valid_values, $strict ) ? $value : $default;
		}

		/**
		 * Converts an integer to a boolean: 1 becomes TRUE and 0 becomes FALSE
		 *
		 * @param int $int
		 *
		 * @return bool
		 */
		public static function intToBool( $int ) {
			return (int) $int === 1;
		}

		/**
		 * @param string $name
		 *
		 * @return array
		 */
		public static function dotNameToArray( string $name ): array {
			return explode( '.', $name );
		}
	}