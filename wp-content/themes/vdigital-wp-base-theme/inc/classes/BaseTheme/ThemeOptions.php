<?php

	namespace Theme\BaseTheme;

	use Theme\BaseTheme;
	use Theme\Helpers\Arr;
	use Theme\Traits\Options;

	/**
	 * Class ThemeOptions
	 *
	 * @package Theme\BaseTheme
	 */
	final class ThemeOptions extends AbstractClass {

		use Options;

		const CHILD_THEME_OPTIONS_KEY = 'child_theme_options';

		const THEME_OPTIONS_KEY = 'theme_options';

		const THEME_OPTIONS_PAGE_SLUG = 'theme-options';

		/**
		 * @var array
		 */
		private $baseThemeOptions;

		/**
		 * @var array
		 */
		private $childThemeOptions;

		/**
		 * @var array
		 */
		private $options;

		/**
		 * Clean the current options in the cache
		 */
		public function cleanThemeOptions() {
			$this->baseThemeOptions  = [];
			$this->childThemeOptions = [];
			$this->options           = [];
		}

		/**
		 * @param string $option
		 *
		 * @return bool
		 */
		public function deleteBaseThemeOption( $option ): bool {
			return $this->_deleteOption( $this->baseThemeOptions, BaseTheme::THEME_PREFIX . 'options', $option );
		}

		/**
		 * @param string $option
		 *
		 * @return bool
		 */
		public function deleteChildThemeOption( $option ): bool {
			return $this->_deleteOption( $this->baseThemeOptions, BaseTheme::CHILD_THEME_PREFIX . 'options', $option );
		}

		/**
		 * Retrieve a base theme option by name using Dot notation
		 *
		 * @param string     $optionKey (E.g. "general.header.template")
		 * @param null|mixed $default   Optional. The default value
		 *
		 * @return mixed
		 */
		public function getBaseThemeOption( string $optionKey, $default = null ) {
			return $this->_getOption( $this->baseThemeOptions, $optionKey, $default );
		}

		/**
		 * Retrieve all base theme options. The options from the base theme are overridden by options from the child theme.
		 *
		 * @return array
		 */
		public function getBaseThemeOptions(): array {
			return $this->baseThemeOptions;
		}

		/**
		 * Retrieve a child theme option by name using Dot notation
		 *
		 * @param string     $optionKey (E.g. "general.header.template")
		 * @param null|mixed $default   Optional. The default value
		 *
		 * @return mixed
		 */
		public function getChildThemeOption( string $optionKey, $default = null ) {
			return $this->_getOption( $this->childThemeOptions, $optionKey, $default );
		}

		/**
		 * Retrieve all child theme options. The options from the base theme are overridden by options from the child theme.
		 *
		 * @return array
		 */
		public function getChildThemeOptions(): array {
			return $this->childThemeOptions;
		}

		/**
		 * Retrieve a theme option by name using Dot notation. The value is being retrieved from the base theme, overridden by options from the child theme.
		 *
		 * @param string     $optionKey (E.g. "general.header.template")
		 * @param null|mixed $default   Optional. The default value
		 *
		 * @return mixed
		 */
		public function getOption( string $optionKey, $default = null ) {
			return $this->_getOption( $this->options, $optionKey, $default );
		}

		/**
		 * Retrieve all theme options. The options from the base theme are overridden by options from the child theme.
		 *
		 * @return array
		 */
		public function getOptions(): array {
			return $this->options;
		}

		/**
		 *
		 */
		public function init() {
			$this->loadOptions();
		}

		/**
		 * Save the options to the database
		 *
		 * @return bool
		 */
		public function saveOptions(): bool {
			return update_option( BaseTheme::THEME_PREFIX . 'options', $this->baseThemeOptions, true ) &&
			       update_option( BaseTheme::CHILD_THEME_PREFIX . 'options', $this->childThemeOptions, true );
		}

		/**
		 * @param string $option
		 * @param mixed  $value
		 * @param bool   $autoSave Whether to save the update to the db immediately
		 *
		 * @return bool
		 */
		public function updateBaseThemeOption( string $option, $value, bool $autoSave = true ): bool {
			return $this->_updateOption(
				$this->baseThemeOptions,
				BaseTheme::THEME_PREFIX . 'options',
				$option,
				$value,
				$autoSave
			);
		}

		/**
		 * @param string $option
		 * @param mixed  $value
		 * @param bool   $autoSave Whether to save the update to the db immediately
		 *
		 * @return bool
		 */
		public function updateChildThemeOption( string $option, $value, bool $autoSave = true ): bool {
			return $this->_updateOption(
				$this->childThemeOptions,
				BaseTheme::CHILD_THEME_PREFIX . 'options',
				$option,
				$value,
				$autoSave
			);
		}

		/**
		 * @return void
		 */
		private function loadOptions(): void {
			$this->_loadOptions( $this->baseThemeOptions, BaseTheme::THEME_PREFIX . 'options' )
			     ->_loadOptions( $this->childThemeOptions, BaseTheme::CHILD_THEME_PREFIX . 'options' );

			$this->options = Arr::mergeRecursiveDistinct( $this->baseThemeOptions, $this->childThemeOptions );
		}

		/**
		 * Trim the underscores (__) in front of sub field key names
		 *
		 * @param array $values
		 *
		 * @return array
		 */
		public static function subFieldsTrimKeys( array $values ): array {
			$newValues = [];

			foreach ( $values as $key => $value ) {
				if ( ! \is_numeric( $key ) ) {
					$key = ltrim( $key, '_' );
				}

				if ( \is_array( $value ) ) {
					$value = self::subFieldsTrimKeys( $value );
				}

				$newValues[ $key ] = $value;
			}

			return $newValues;
		}
	}