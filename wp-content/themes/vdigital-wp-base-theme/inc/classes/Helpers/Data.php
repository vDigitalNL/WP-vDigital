<?php

	namespace Theme\Helpers;

	/**
	 * Class Data
	 *
	 * @package Theme\Helpers
	 */
	class Data {

		/**
		 * Convert an array to a CSV string, optional with keys as headers
		 *
		 * @param array  $data               The data as a two-dimensional array
		 * @param bool   $useKeysAsFirstLine Optional. Whether to use the array keys as headers in the first line. Defaults to TRUE
		 * @param string $delimiter          Optional. The field delimiter character (one character only). Defaults to a comma sign (,)
		 * @param string $enclosure          Optional. The field enclosure character (one character only). Defaults to a double quote sign (")
		 * @param string $escape             Optional. The escape character (one character only). Defaults to a backslash sign (\)
		 *
		 * @return string Returns the CSV content as a string
		 */
		public static function arrayToCsv(
			$data,
			$useKeysAsFirstLine = true,
			$delimiter = ',',
			$enclosure = '"',
			$escape = '\\'
		) {
			$keys = [];
			$csv  = [];

			if ( is_array( $data ) ) {
				if ( $useKeysAsFirstLine ) {
					foreach ( $data as $_data ) {
						if ( is_array( $_data ) ) {
							foreach ( array_keys( $_data ) as $key ) {
								if ( ! in_array( $key, $keys ) ) {
									$keys[] = $key;
								}
							}
						}
					}

					$csv[] = implode( $delimiter, array_map( function ( $value ) use ( $enclosure, $escape ) {
						return $enclosure . str_replace( $enclosure, $escape . $enclosure, $value ) . $enclosure;
					}, $keys ) );

					foreach ( $data as $_data ) {
						if ( is_array( $_data ) ) {
							$_csv = [];
							foreach ( $keys as $key ) {
								$_csv[] = array_key_exists( $key, $_data ) ?
									$enclosure . str_replace( $enclosure, $escape . $enclosure, $_data[ $key ] ) . $enclosure : '';
							}
							$csv[] = implode( $delimiter, $_csv );
						}
					}
				} else {
					foreach ( $data as $_data ) {
						if ( is_array( $_data ) ) {
							$csv[] = implode( $delimiter, array_map( function ( $value ) use ( $enclosure, $escape ) {
								return $enclosure . str_replace( $enclosure, $escape . $enclosure, $value ) . $enclosure;
							}, $_data ) );
						}
					}
				}
			}

			return implode( "\n", $csv );
		}

		/**
		 * Convert CSV to an array, optional with headers as keys
		 *
		 * @param string $csv                The CSV content. Cannot be a single CSV string, unless the CSV content contains only one string
		 * @param bool   $useFirstLineAsKeys Optional. Whether to use the values of the first line as the array keys. Defaults to FALSE
		 * @param string $delimiter          Optional. The field delimiter character (one character only). Defaults to a comma sign (,)
		 * @param string $enclosure          Optional. The field enclosure character (one character only). Defaults to a double quote sign (")
		 * @param string $escape             Optional. The escape character (one character only). Defaults to a backslash sign (\)
		 *
		 * @return array Returns the CSV content converted as an array
		 */
		public static function csvToArray(
			$csv,
			$useFirstLineAsKeys = false,
			$delimiter = ',',
			$enclosure = '"',
			$escape = '\\'
		) {
			$csv  = array_map( function ( $_data ) use ( $delimiter, $enclosure, $escape ) {
				return str_getcsv( $_data, $delimiter, $enclosure, $escape );
			}, explode( "\n", str_ireplace( [ "\r\n", "\r" ], "\n", $csv ) ) );
			$data = [];

			if ( ! empty( $csv ) ) {
				if ( $useFirstLineAsKeys ) {
					$headers = array_shift( $csv );

					foreach ( $csv as $line => $values ) {
						foreach ( (array) $values as $n => $value ) {
							$header                   =
								array_key_exists( $n, $headers ) && (string) $headers[ $n ] != '' ? $headers[ $n ] : $n;
							$data[ $line ][ $header ] = $value;
						}
					}
				} else {
					$data = $csv;
				}
			}

			return $data;
		}
	}