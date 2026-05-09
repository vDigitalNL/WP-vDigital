<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme;
	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeOptions as BaseThemeOptions;

	/**
	 * Class ThemeOptions
	 *
	 * @package Theme\BaseTheme\General
	 *
	 * @property-read ThemeOptions\Company            $Company
	 * @property-read ThemeOptions\Email              $Email
	 * @property-read ThemeOptions\Media              $Media
	 * @property-read ThemeOptions\Footer             $Footer
	 * @property-read ThemeOptions\General            $General
	 * @property-read ThemeOptions\GoogleIntegrations $GoogleIntegrations
	 * @property-read ThemeOptions\Header             $Header
	 * @property-read ThemeOptions\Integrations       $Integrations
	 * @property-read ThemeOptions\Development        $Development
	 */
	final class ThemeOptions extends BaseTheme\AbstractClass {

		use ThemeFlexClassTrait;

		/**
		 * @deprecated Use \Theme\BaseTheme\ThemeOptions::CHILD_THEME_OPTIONS_KEY instead
		 *
		 * @todo Remove in a next release
		 */
		const CHILD_THEME_OPTIONS_KEY = BaseThemeOptions::CHILD_THEME_OPTIONS_KEY;

		/**
		 * @deprecated Use \Theme\BaseTheme\ThemeOptions::THEME_OPTIONS_KEY instead
		 *
		 * @todo Remove in a next release
		 */
		const THEME_OPTIONS_KEY = BaseThemeOptions::THEME_OPTIONS_KEY;

		/**
		 * @deprecated Use \Theme\BaseTheme\ThemeOptions::THEME_OPTIONS_PAGE_SLUG instead
		 *
		 * @todo Remove in a next release
		 */
		const THEME_OPTIONS_PAGE_SLUG = BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG;

		public function init() {
			if ( ! function_exists( 'acf_add_options_page' ) ) {
				return;
			}

			// When the theme options are not active, the theme modules page still has to be registered
			if ( ! $this->baseTheme->applyFilters( 'theme_options/active', true ) ) {
				$this->registerAcfThemeModulesPage( true );

				return;
			}

			$this->registerAcfThemeOptionsPage();
			$this->registerAcfThemeModulesPage();
			$this->acfActions();
		}

		public function acfSavePostStripSlash() {
			if ( ! empty ( $_POST['acf']['theme_options__general']['theme_options__general__header_scripts'] ) ) {
				stripslashes( $_POST['acf']['theme_options__general']['theme_options__general__header_scripts'] );
			}

			if ( ! empty ( $_POST['acf']['theme_options__general']['theme_options__general__footer_scripts'] ) ) {
				stripslashes( $_POST['acf']['theme_options__general']['theme_options__general__footer_scripts'] );
			}
		}

		public function flushPermalinkRewrites() {
			if ( strpos(get_current_screen()->id, BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG ) !== false ) {
				flush_rewrite_rules( false );
			}
		}

		private function acfActions() {
			//add_action( 'acf/save_post', [ $this, 'acfSavePostStripSlash' ] );

			add_action( 'acf/save_post', [ $this, 'flushPermalinkRewrites' ] );
		}

		/**
		 * Initialize the theme modules theme options page fields
		 *
		 * @param bool $standalone Whether to register the page as a standalone page in the admin menu bar
		 */
		private function registerAcfThemeModulesPage( bool $standalone = false ) {
			$parentPageSlug = $this->baseTheme->applyFilters( 'theme_options/theme_modules/parent_slug',
				$standalone ? '' : BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG );

			if ( $parentPageSlug ) {
				acf_add_options_sub_page( [
					'page_title'      => $this->baseTheme->__( 'Theme Modules' ),
					'menu_slug'       => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-theme-modules',
					'parent_slug'     => $parentPageSlug,
					'autoload'        => true,
					'updated_message' => baseTheme()->__(
						'The modules have been updated. Make sure to run Gulp to affect frontend CSS and JavaScript.' ),
				] );
			} else {
				acf_add_options_page( [
					'page_title'      => $this->baseTheme->__( 'Theme Modules' ),
					'menu_slug'       => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-theme-modules',
					'redirect'        => false,
					'autoload'        => true,
					'updated_message' => baseTheme()->__(
						'The modules have been updated. Make sure to run Gulp to affect frontend CSS and JavaScript.' ),
				] );
			}

			add_action( 'acf/init', function () {
				/*
				 * Init the theme modules group
				 */
				$optionGroupKey = 'theme__modules';

				acf_add_local_field_group( [
					'key'            => $optionGroupKey,
					'title'          => $this->baseTheme->__( 'Theme Modules' ),
					'location'       => [
						[
							[
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-theme-modules',
							],
						],
					],
					'menu_order'     => 0,
					'position'       => 'normal',
					'style'          => 'normal',
					'hide_on_screen' => '',
					'active'         => 1,
					'description'    => '',
				] );

				acf_add_local_field( [
					'parent' => $optionGroupKey,
					'key'    => $optionGroupKey . '__active_theme_modules',
					'name'   => 'theme_modules',
					'type'   => 'theme_modules',
				] );


				/*
				 * Init the Bootstrap JS modules group
				 */
				$optionGroupKey = 'theme__bootstrap_js_modules';

				acf_add_local_field_group( [
					'key'            => $optionGroupKey,
					'title'          => $this->baseTheme->__( 'Bootstrap JavaScript Modules' ),
					'location'       => [
						[
							[
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-theme-modules',
							],
						],
					],
					'menu_order'     => 10,
					'position'       => 'normal',
					'style'          => 'normal',
					'hide_on_screen' => '',
					'active'         => 1,
					'description'    => '',
				] );

				acf_add_local_field( [
					'parent' => $optionGroupKey,
					'key'    => $optionGroupKey . '__active_bootstrap_js_modules',
					'name'   => 'bootstrap_js_modules',
					'type'   => 'bootstrap_js_modules',
				] );


				/*
				 * Init the Bootstrap Sass modules group
				 */
				$optionGroupKey = 'theme__bootstrap_sass_modules';

				acf_add_local_field_group( [
					'key'            => $optionGroupKey,
					'title'          => $this->baseTheme->__( 'Bootstrap Sass Modules' ),
					'location'       => [
						[
							[
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-theme-modules',
							],
						],
					],
					'menu_order'     => 10,
					'position'       => 'normal',
					'style'          => 'normal',
					'hide_on_screen' => '',
					'active'         => 1,
					'description'    => '',
				] );

				acf_add_local_field( [
					'parent' => $optionGroupKey,
					'key'    => $optionGroupKey . '__active_bootstrap_sass_modules',
					'name'   => 'bootstrap_sass_modules',
					'type'   => 'bootstrap_sass_modules',
				] );
			} );
		}

		/**
		 * Initialize the theme options page fields
		 */
		private function registerAcfThemeOptionsPage() {
			acf_add_options_page( [
				'page_title' => $this->baseTheme->__( 'Theme Options' ),
				'menu_slug'  => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG,
				'redirect'   => false,
				'autoload'   => true,
			] );

			// BOF: Changed hook because acf/init hook no longer seems to run at the correct time
			add_action( 'init', function () {
			// EOF
				/*
				 * Init the group
				 */
				$optionGroupKey = BaseThemeOptions::THEME_OPTIONS_KEY;

				acf_add_local_field_group( [
					'key'                   => $optionGroupKey,
					'title'                 => $this->baseTheme->__( 'Theme Options' ),
					'location'              => [
						[
							[
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG,
							],
						],
					],
					'menu_order'            => 0,
					'position'              => 'normal',
					'style'                 => 'default',
					'label_placement'       => 'top',
					'instruction_placement' => 'label',
					'hide_on_screen'        => '',
					'active'                => true,
					'description'           => '',
				] );

				/*
				 * General options block
				 */
				$this->General->registerTab( $optionGroupKey );


				/**
				 * Development options block
				 */
				$this->Development->registerTab( $optionGroupKey );

				/*
				 * Company information
				 */
				$this->Company->registerTab( $optionGroupKey );


				/*
				 * Header and Footer options blocks
				 */
				$this->Header->registerTab( $optionGroupKey );
				$this->Footer->registerTab( $optionGroupKey );


				/*
				 * Integrations options blocks
				 */
				$this->Integrations->registerTab( $optionGroupKey );
				$this->GoogleIntegrations->registerTab( $optionGroupKey );


				/*
				 * Email options block
				 */
				$this->Email->registerTab( $optionGroupKey );

				/**
				 * Media options block
				 */
				$this->Media->registerTab( $optionGroupKey );


				/*
				 * Let the Child Theme extend the options easily
				 */
				$this->baseTheme->doAction( 'theme_options/after_registering_tabs', $optionGroupKey );
			} );
		}
	}