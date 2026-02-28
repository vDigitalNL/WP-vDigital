<?php

	namespace ChildTheme\ChildTheme\General;

	use Theme\BaseTheme;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class ThemeOptions
	 *
	 * @package ChildTheme\ChildTheme\General
	 *
	 * @property-read ThemeOptions\Header   $Header
	 * @property-read ThemeOptions\Footer   $Footer
	 * @property-read ThemeOptions\General  $General
	 * @property-read ThemeOptions\Company  $Company
	 * @property-read ThemeOptions\Page404  $page404
	 */
	final class ThemeOptions extends BaseTheme\AbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			/*
			 * Extend BaseTheme tabs
			 */
			$this->Header->init();
			$this->Footer->init();
			$this->General->init();
			$this->Company->init();

			/*
			 * Register new tabs
			 */
			$this->baseTheme->addAction( 'theme_options/after_registering_tabs', [ $this, 'registerTabs' ], 5 );

			// Remove the theme modules tab & the enable SVG field
			add_action('admin_menu', [$this, 'removeThemeOptionsPages'], 999);
			add_filter('acf/load_fields', [$this, 'removeThemeOptionsTabs'], 999);
			$this->baseTheme->addFilter('theme_options/media/sub_fields', '__return_empty_array', 999);
		}

		public function removeThemeOptionsPages(): void {
			remove_submenu_page('theme-options', 'theme-options-theme-modules');
			remove_submenu_page('theme-options', 'theme-options-overview');
		}

		public function removeThemeOptionsTabs( array $fields ): array {
			return array_filter( $fields, function ( $field ) {
				return ! in_array( $field['key'], [ 'theme_options__media', 'theme_options__integrations' ] );
			} );
		}

		/**
		 * Initialize the theme options page fields
		 *
		 * @param string $optionGroupKey
		 */
		public function registerTabs( string $optionGroupKey ) {
			$this->Page404->registerTab( $optionGroupKey );
		}
	}