<?php

	namespace Theme\BaseTheme\Backend;

	use Theme\BaseTheme;
	use Theme\BaseTheme\ThemeOptions as BaseThemeOptions;
	use Theme\Helpers\Arr;

	/**
	 * Class ThemeOptions
	 *
	 * @package Theme\BaseTheme\Backend
	 */
	final class ThemeOptions extends BaseTheme\AbstractClass {

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
			if ( ! function_exists( 'acf_add_options_page' ) || ! $this->baseTheme->applyFilters( 'theme_options/active', true ) ) {
				return;
			}

			//Add a page at the bottom of the menu with all theme options
			$this->initAcfThemeOptionsOverviewPage();

			//Save optimized theme options to the database
			\add_action( 'acf/save_post', [ $this, 'saveAcfThemeOptionField' ], 20 );
		}

		/**
		 * @param int|string $postId
		 */
		public function saveAcfThemeOptionField( $postId ) {
			global $current_screen;

			// Check for the correct options page
			if ( $postId !== 'options' ||
			     \substr( $current_screen->id, - \strlen( BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG ) ) !== BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG ) {
				return;
			}

			// Check for ACF $_POST data.
			if ( empty( $_POST['acf'] ) || ! \is_array( $_POST['acf'] ) ) {
				return;
			}

			// First, delete al existing options
			$this->baseTheme->ThemeOptions->cleanThemeOptions();

			// Second, update all the options
			foreach ( $_POST['acf'] as $key => $value ) {
				// Get field
				$field = \acf_get_field( $key );

				// Update value
				if ( $field ) {
					$this->updateAcfThemeOptionField( $postId, $field, $value );
				}
			}

			// Third, save all the options
			$this->baseTheme->ThemeOptions->saveOptions();
		}

		/**
		 * Initialize the overview theme options page fields
		 */
		private function initAcfThemeOptionsOverviewPage() {
			//We add this page in the admin_menu action, so it will always be ordered last in the menu.
			add_action( 'admin_menu', function () {
				acf_add_options_sub_page( [
					'page_title'  => $this->baseTheme->__( 'Overview' ),
					'menu_slug'   => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-overview',
					'parent_slug' => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG,
				] );
			} );

			if ( ! class_exists( 'acf_field_output' ) ) {
				acf_include( 'includes/fields/class-acf-field-output.php' );
			}


			add_action( 'acf/init', function () {
				/*
				 * Base theme options
				 */
				$optionGroupKey = BaseThemeOptions::THEME_OPTIONS_KEY . '__base_theme_options';

				acf_add_local_field_group( [
					'key'                   => $optionGroupKey,
					'title'                 => $this->baseTheme->__( 'Base Theme Options' ),
					'location'              => [
						[
							[
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-overview',
							],
						],
					],
					'menu_order'            => 0,
					'label_placement'       => 'left',
					'instruction_placement' => 'field',
					'hide_on_screen'        => '',
					'active'                => 1,
					'description'           => '',
				] );

				acf_add_local_field( [
					'parent' => $optionGroupKey,
					'key'    => $optionGroupKey . '__base_theme_options',
					'name'   => 'base_theme_options',
					'type'   => 'output',
					'html'   => function () {
						$options = Arr::dot( $this->baseTheme->ThemeOptions->getBaseThemeOptions() );

						\array_walk( $options, function ( &$option ) {
							if ( \is_string( $option ) && ( $jsonDecodedOption = @json_decode( $option, true ) ) !== null ) {
								$option = $jsonDecodedOption;
							}
						} );
						ksort( $options );

						dump( $options );
						print "<script>jQuery('#acf-theme_options__base_theme_options').addClass('closed');</script>";
					},
				] );


				/*
				 * Child theme options
				 */
				$optionGroupKey = BaseThemeOptions::THEME_OPTIONS_KEY . '__child_theme_options';

				acf_add_local_field_group( [
					'key'                   => $optionGroupKey,
					'title'                 => $this->baseTheme->__( 'Child Theme Options' ),
					'location'              => [
						[
							[
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-overview',
							],
						],
					],
					'menu_order'            => 1,
					'label_placement'       => 'left',
					'instruction_placement' => 'field',
					'hide_on_screen'        => '',
					'active'                => 1,
					'description'           => '',
				] );

				acf_add_local_field( [
					'parent' => $optionGroupKey,
					'key'    => $optionGroupKey . '__child_theme_options',
					'name'   => 'child_theme_options',
					'type'   => 'output',
					'html'   => function () {
						$options = Arr::dot( $this->baseTheme->ThemeOptions->getChildThemeOptions() );

						\array_walk( $options, function ( &$option ) {
							if ( \is_string( $option ) && ( $jsonDecodedOption = @json_decode( $option, true ) ) !== null ) {
								$option = $jsonDecodedOption;
							}
						} );
						ksort( $options );

						dump( $options );
						print "<script>jQuery('#acf-theme_options__child_theme_options').addClass('closed');</script>";
					},
				] );


				/*
				 * Both base and child theme options
				 */
				$optionGroupKey = BaseThemeOptions::THEME_OPTIONS_KEY . '__theme_options';

				acf_add_local_field_group( [
					'key'                   => $optionGroupKey,
					'title'                 => $this->baseTheme->__( 'Theme Options' ),
					'location'              => [
						[
							[
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-overview',
							],
						],
					],
					'menu_order'            => 2,
					'label_placement'       => 'left',
					'instruction_placement' => 'field',
					'hide_on_screen'        => '',
					'active'                => 1,
					'description'           => '',
				] );

				acf_add_local_field( [
					'parent' => $optionGroupKey,
					'key'    => $optionGroupKey . '__theme_options',
					'name'   => 'theme_options',
					'type'   => 'output',
					'html'   => function () {
						$options = Arr::dot( $this->baseTheme->ThemeOptions->getOptions() );

						\array_walk( $options, function ( &$option ) {
							if ( \is_string( $option ) && ( $jsonDecodedOption = @json_decode( $option, true ) ) !== null ) {
								$option = $jsonDecodedOption;
							}
						} );
						ksort( $options );

						dump( $options );
					},
				] );
			} );


			add_action( 'admin_menu', function () {
				$overviewPageSlug = get_plugin_page_hookname( BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG . '-overview',
					BaseThemeOptions::THEME_OPTIONS_PAGE_SLUG );

				add_action( 'load-' . $overviewPageSlug, function () {
					add_action( 'acf/input/admin_head', function () {
						remove_meta_box( 'submitdiv', 'acf_options_page', 'side' );
					}, 11 );
					add_screen_option( 'layout_columns', [ 'max' => 1, 'default' => 1 ] );
				}, 11 );
			}, 100, 0 );
		}

		/**
		 * @param string $postId The field array.
		 * @param array  $field  The field array.
		 * @param mixed  $value  The value to update.
		 */
		private function updateAcfThemeOptionField( string $postId, array $field, $value = null ): void {
			if ( strpos( $field['key'], BaseThemeOptions::THEME_OPTIONS_KEY . '__' ) !== 0 &&
			     strpos( $field['key'], BaseThemeOptions::CHILD_THEME_OPTIONS_KEY . '__' ) !== 0 ) {
				return;
			}

			/*
			 * Update the right value based on whether this is a base theme or child theme option
			 */
			$isChildThemeOption = strpos( $field['key'], BaseThemeOptions::CHILD_THEME_OPTIONS_KEY . '__' ) === 0;
			$fieldThemeKey      = $isChildThemeOption ? BaseThemeOptions::CHILD_THEME_OPTIONS_KEY
				: BaseThemeOptions::THEME_OPTIONS_KEY;

			//Remove the "theme_options__" or "child_theme_options__" part from $field['key'] and replace __ by . for dot notation in the db
			$fieldKey = substr( $field['key'], strlen( $fieldThemeKey . '__' ) );
			$fieldKey = str_replace( '__', '.', $fieldKey );


			// Handle special field types
			switch ( $field['type'] ?? '' ) {
				case 'group':
					if ( ! empty( $value ) ) {
						$values = Arr::flattenWhen( (array) $value, function ( $key, $value ) use ( $fieldThemeKey ) {
							$firstItemKey = Arr::getFirst( array_keys( $value ) );

							return strpos( $key, $fieldThemeKey . '__' ) === 0
							       && strpos( $firstItemKey, $fieldThemeKey . '__' ) === 0;
						}, true );

						foreach ( $values as $subKey => $option ) {
							$subField = \acf_get_field( $subKey );

							if ( ! empty( $subField['parent'] ) ) {
								$subField['name'] = $subField['parent'] . '_' . $subField['name'];
								$option           = \acf_get_value( $postId, $subField );
							}

							$this->updateAcfThemeOptionField( $postId, $subField, $option );
						}
					}

					return;
			}

			//Get the updated value from the database
			$value = \acf_get_value( $postId, $field );

			// Format the value when necessary
			$value = \acf_format_value( $value, $postId, $field );

			// Format the value depending on the type
			switch ( $field['type'] ?? '' ) {
				case 'repeater':
					/* BOF: Fixing issue where the method was called on the wrong class */
					$value = ! empty( $value ) ? BaseThemeOptions::subFieldsTrimKeys( $value ) : [];
					/* EOF */
			}

			// Update the option
			if ( $isChildThemeOption ) {
				$this->baseTheme->ThemeOptions->updateChildThemeOption( $fieldKey, $value, false );
			} else {
				$this->baseTheme->ThemeOptions->updateBaseThemeOption( $fieldKey, $value, false );
			}
		}
	}