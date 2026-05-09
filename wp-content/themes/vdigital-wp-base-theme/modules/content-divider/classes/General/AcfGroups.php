<?php

	namespace Theme\Modules\ContentDivider\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Modules\ContentDivider;

	/**
	 * Class AcfGroups
	 *
	 * @package Theme\Modules\ContentDivider\General
	 *
	 * @property-read ContentDivider $themeModule
	 */
	class AcfGroups extends ThemeModuleAbstractClass {
		public function init() {
			$this->registerContentDividerFlexible();
		}

		private function registerContentDividerFlexible() {
			$ContentDividerFlexibleFields = baseTheme()->applyFilters(
				'group__content_divider__flexible_fields', [
				[
					'key'               => 'field__content_divider__margin_vertical',
					'label'             => baseTheme()->__( 'Margin vertical' ),
					'name'              => 'field__content_divider__margin_vertical',
					'type'              => 'select',
					'instructions'      => '',
					'required'          => 0,
					'conditional_logic' => 0,
					'wrapper'           => [
						'width' => '100%',
						'class' => '',
						'id'    => '',
					],
					'choices' => [
						'my-1' => baseTheme()->__( 'Bootstrap: Margin 1' ),
						'my-2' => baseTheme()->__( 'Bootstrap: Margin 2' ),
						'my-3' => baseTheme()->__( 'Bootstrap: Margin 3' ),
						'my-4' => baseTheme()->__( 'Bootstrap: Margin 4' ),
						'my-5' => baseTheme()->__( 'Bootstrap: Margin 5' ),
					],
					'default_value'     => 'my-1',
					'placeholder'       => '',
					'prepend'           => '',
					'append'            => '',
					'maxlength'         => '',
				],
			] );

			$ContentDividerFlexibleLocation = baseTheme()->applyFilters(
				'group__content_divider__flexible_location', [] );

			acf_add_local_field_group(
				[
					'key'                   => 'group__content_divider__flexible',
					'title'                 => baseTheme()->__( 'Content Divider' ),
					'fields'                => (array) $ContentDividerFlexibleFields,
					'location'              => (array) $ContentDividerFlexibleLocation,
					'menu_order'            => 0,
					'position'              => 'normal',
					'style'                 => 'default',
					'label_placement'       => 'top',
					'instruction_placement' => 'label',
					'hide_on_screen'        => '',
					'active'                => 1,
					'description'           => '',
				]
			);

			baseTheme()->addFilter( 'flexible_content_box/layouts', function( $layouts ) {
				$layouts[] = [
					'key'        => 'layout__content_divider__flexible_content',
					'name'       => 'layout__content_divider__flexible_content',
					'label'      => baseTheme()->__( 'Content divider' ),
					'display'    => 'block',
					'sub_fields' => [
						[
							'key'               => 'field__content_divider__flexible_content__content_divider',
							'label'             => baseTheme()->__( 'Content divider' ),
							'name'              => 'field__content_divider__flexible_content__content_divider',
							'type'              => 'clone',
							'instructions'      => '',
							'required'          => 0,
							'conditional_logic' => 0,
							'wrapper'           => [
								'width' => '',
								'class' => '',
								'id'    => '',
							],
							'clone'             => [
								0 => 'group__content_divider__flexible',
							],
							'display'           => 'seamless',
							'layout'            => 'block',
							'prefix_label'      => 0,
							'prefix_name'       => 0,
						],
					],
					'min'        => '',
					'max'        => '',
				];

				return $layouts;
			}, 10, 1 );

			baseTheme()->addFilter( 'flexible_content_box/layouts_template', function( $templates ) {
				$templates['layout__content_divider__flexible_content'] = function() {
					$this->themeModule->loadTemplateFile( 'content-divider' );
				};

				return $templates;
			}, 10, 1 );
		}
	}