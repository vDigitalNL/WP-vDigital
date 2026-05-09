<?php

	namespace Theme\Traits;

	use Theme\Helpers\General;

	/**
	 * Trait ThemeOptions
	 *
	 * @package Theme\Traits
	 */
	trait Options {

		/**
		 * @param array  $options     The target options array. Updated by reference.
		 * @param string $optionsName The options array name in the WP options table.
		 * @param string $optionKey   The name of the option to delete (e.g. "general.header.template").
		 *
		 * @return bool
		 */
		protected function _deleteOption( array &$options, string $optionsName, string $optionKey ): bool {
			$originalOptions = $options;

			if ( ! $this->_deleteOptionKey( $options, $optionKey ) ) {
				return false;
			}

			if ( $options != $originalOptions ) {
				$result = update_option( $optionsName, $options, true );

				if ( $result && \method_exists( $this, 'loadOptions' ) ) {
					$this->loadOptions();
				}

				return $result;
			}

			return false;
		}

		/**
		 * @param array  $options     The target options array. Updated by reference.
		 * @param string $optionKey   The name of the option to delete (e.g. "general.header.template").
		 *
		 * @return bool
		 */
		protected function _deleteOptionKey( array &$options, string $optionKey ): bool {
			if ( ! ( $keys = General::dotNameToArray( $optionKey ) ) ) {
				return false;
			}

			$_options = &$options;

			while ( count( $keys ) > 1 ) {
				$key = array_shift( $keys );

				// If the key doesn't exist at this depth, just return FALSE.
				if ( ! isset( $_options[ $key ] ) || ! is_array( $_options[ $key ] ) ) {
					return false;
				}

				$_options = &$_options[ $key ];
			}

			unset( $_options[ array_shift( $keys ) ] );

			return true;
		}

		/**
		 * Retrieve a base theme option by name using Dot notation
		 *
		 * @param array      $options   The target options array.
		 * @param string     $optionKey (E.g. "general.header.template").
		 * @param null|mixed $default   Optional. The default value.
		 *
		 * @return mixed
		 */
		protected function _getOption( array $options, string $optionKey, $default = null ) {
			// Convert a dot notated key to an array of sub keys
			if ( ! ( $keys = General::dotNameToArray( $optionKey ) ) ) {
				return $default;
			}

			// Loop through all keys
			foreach ( $keys as $key ) {
				if ( ! \is_array( $options ) || ! \array_key_exists( $key, $options ) ) {
					return $default;
				}

				$options = $options[ $key ];
			}

			// After the last key, $option will contain the result
			if ( \is_string( $options ) && ( $jsonDecodedOptions = @json_decode( $options, true ) ) !== null ) {
				$options = $jsonDecodedOptions;
			}

			return $options;
		}

		/**
		 * Load the options from the database
		 *
		 * @param array|null $options     The target options array. Updated by reference.
		 * @param string     $optionsName The options array name in the WP options table
		 *
		 * @return $this
		 */
		protected function _loadOptions( ?array &$options, string $optionsName ): self {
			$options = (array) get_option( $optionsName, [] );

			return $this;
		}

		/**
		 * Save the options to the database
		 *
		 * @param string $optionsName The options array name in the WP options table.
		 * @param array  $options     The options to save in the database.
		 *
		 * @return bool
		 */
		protected function _saveOptions( string $optionsName, array $options ): bool {
			return update_option( $optionsName, $options, true );
		}

		/**
		 * @param array  $options     The target options array. Updated by reference.
		 * @param string $optionsName The options array name in the WP options table.
		 * @param string $optionKey   The name of the option to update (e.g. "general.header.template").
		 * @param mixed  $value       The value of the option.
		 * @param bool   $autoSave    Whether to save the update to the db immediately.
		 *
		 * @return bool
		 */
		protected function _updateOption( array &$options, string $optionsName, string $optionKey, $value, bool $autoSave = true ): bool {
			if ( ! ( $keys = General::dotNameToArray( $optionKey ) ) ) {
				return false;
			}

			// JSON encode the value when necessary
			if ( \is_array( $value ) || \is_object( $value ) ) {
				$value = \json_encode( $value );
			}

			$originalOptions = $options;
			$_options        = &$options;

			while ( count( $keys ) > 1 ) {
				$key = array_shift( $keys );

				// If the key doesn't exist at this depth, we will just create an empty array
				// to hold the next value, allowing us to create the arrays to hold final
				// values at the correct depth. Then we'll keep digging into the array.
				if ( ! isset( $_options[ $key ] ) || ! is_array( $_options[ $key ] ) ) {
					$_options[ $key ] = [];
				}

				$_options = &$_options[ $key ];
			}

			$_options[ array_shift( $keys ) ] = $value;

			if ( $autoSave && $options != $originalOptions ) {
				$result = update_option( $optionsName, $options, true );

				if ( $result && \method_exists( $this, 'loadOptions' ) ) {
					$this->loadOptions();
				}

				return $result;
			}

			return true;
		}
	}