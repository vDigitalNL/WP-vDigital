<?php

	namespace ChildTheme\ChildTheme\Backend;

	use Theme\BaseTheme;
	use ChildTheme\ChildTheme\AbstractClass;

	/**
	 * Class ThemeOptions
	 *
	 * @package Theme\ChildTheme\ChildTheme\Backend
	 */
	final class ThemeOptions extends AbstractClass {

		const CHILD_THEME_OPTIONS_KEY = BaseTheme\Backend\ThemeOptions::CHILD_THEME_OPTIONS_KEY;

		const THEME_OPTIONS_PAGE_SLUG = BaseTheme\Backend\ThemeOptions::THEME_OPTIONS_PAGE_SLUG;

		public function init() {
			if ( function_exists( 'acf_add_options_page' ) ) {
				//$this->initAcfExampleThemeOptionPage();
			}
		}

		/**
		 * Initialize the example theme options page fields
		 */
		private function initAcfExampleThemeOptionPage() {
			acf_add_options_sub_page( [
				'page_title'  => $this->baseTheme->__( 'Example' ),
				'menu_slug'   => static::THEME_OPTIONS_PAGE_SLUG . '-example',
				'parent_slug' => static::THEME_OPTIONS_PAGE_SLUG,
				'autoload'    => true,
			] );

			add_action( 'acf/init', function() {
				/*
				 * Init the group
				 */
				$optionGroupKey = static::CHILD_THEME_OPTIONS_KEY . '.example';

				acf_add_local_field_group( array(
					'key'                   => $optionGroupKey,
					'title'                 => $this->baseTheme->__( 'Example Child Theme Options' ),
					'location'              => array(
						array(
							array(
								'param'    => 'options_page',
								'operator' => '==',
								'value'    => static::THEME_OPTIONS_PAGE_SLUG . '-example',
							),
						),
					),
					'menu_order'            => 1,
					'position'              => 'normal',
					'style'                 => 'seamless',
					'label_placement'       => 'left',
					'instruction_placement' => 'field',
					'hide_on_screen'        => '',
					'active'                => 1,
					'description'           => '',
				) );

				/*
				 * General options block
				 */
				$optionFieldKeyExample = $optionGroupKey . '.example';

				acf_add_local_field( [
					'parent'     => $optionGroupKey,
					'key'        => $optionFieldKeyExample,
					'label'      => $this->baseTheme->__( 'Example' ),
					'name'       => $optionFieldKeyExample,
					'type'       => 'group',
					'layout'     => 'block',
					'sub_fields' => [
						[
							'key'           => $optionFieldKeyExample . '.example',
							'_name'         => 'example',
							'label'         => $this->baseTheme->__( 'Example' ),
							'message'       => $this->baseTheme->__( 'Example description for an example field' ),
							'type'          => 'true_false',
							'default_value' => false,
						],
					],
				] );
			}, 12);
		}
	}