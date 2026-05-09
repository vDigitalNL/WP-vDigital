<?php

	namespace Theme\Helpers;

	/**
	 * Class Cache
	 *
	 * To prevent "cache" data to be shown in page-cached frontend pages, this class should only be used within the
	 *  admin area, or on pages that are excluded from the page cache.
	 *
	 * @package Theme\Helpers
	 */
	class Cache {

		/**
		 * In-memory session storage
		 *
		 * @var array
		 */
		private static $data = [];

		/**
		 * Add a value to an array in the session. If the given key is not an array yet, it will be set to a new array
		 *
		 * @param string $key
		 * @param mixed  $value
		 */
		public static function add( string $key, $value ): void {
			if ( ! is_array( self::get( $key ) ) ) {
				self::$data[ $key ] = [];
			}

			self::$data[ $key ][] = $value;
		}

		/**
		 * @param string     $key
		 * @param mixed|null $default
		 *
		 * @return mixed|null
		 */
		public static function get( string $key, $default = null ) {
			if ( ! self::has( $key ) ) {
				return $default;
			}

			return self::$data[ $key ];
		}

		/**
		 * @param string $key
		 *
		 * @return bool
		 */
		public static function has( string $key ): bool {
			return isset( self::$data[ $key ] );
		}

		/**
		 * @param string $key
		 * @param mixed  $value
		 */
		public static function set( string $key, $value ): void {
			self::$data[ $key ] = $value;
		}

		/**
		 * @param string $key
		 */
		public static function unset( string $key ) {
			unset( self::$data[ $key ] );
		}
	}