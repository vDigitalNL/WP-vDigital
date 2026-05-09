<?php

	namespace Theme\Modules\Sample4\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Modules\Sample4;

	/**
	 * Class AcfGroups
	 *
	 * @package Theme\Modules\Sample4\General
	 *
	 * @property-read Sample4 $themeModule
	 */
	class AcfGroups extends ThemeModuleAbstractClass {
		// @ToDo: When you're not ACF fields this class can be removed(also unlink within General.php).

		public function init() {
			//$this->registerCarouselPostGroup();
			//$this->registerCarouselFlexible();
		}

		private function registerCarouselFlexible() {
			// @ToDo: When you're not ACF fields this class can be removed(also unlink within General.php).
			$LogoCarouselFlexibleFields = baseTheme()->applyFilters(
				'group__logo_carousel__flexible_fields', [
				[
					'key'               => 'field__logo_carousel__flexible_title',
					'label'             => baseTheme()->__( 'Title' ),
					'name'              => 'field__logo_carousel__flexible_title',
					'type'              => 'text',
					'instructions'      => '',
					'required'          => 0,
					'conditional_logic' => 0,
					'wrapper'           => [
						'width' => '66',
						'class' => '',
						'id'    => '',
					],
					'default_value'     => '',
					'placeholder'       => '',
					'prepend'           => '',
					'append'            => '',
					'maxlength'         => '',
				],
			] );

			$LogoCarouselFlexibleLocation = baseTheme()->applyFilters(
				'group__logo_carousel__flexible_location', [] );

			acf_add_local_field_group(
				[
					'key'                   => 'group__logo_carousel__flexible',
					'title'                 => baseTheme()->__( 'Logo Carousel' ),
					'fields'                => (array) $LogoCarouselFlexibleFields,
					'location'              => (array) $LogoCarouselFlexibleLocation,
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
					'key'        => 'layout__logo_carousel__flexible_content',
					'name'       => 'layout__logo_carousel__flexible_content',
					'label'      => baseTheme()->__( 'Logo carousel' ),
					'display'    => 'block',
					'sub_fields' => [
						[
							'key'               => 'field__logo_carousel__flexible_content__logo_carousel',
							'label'             => baseTheme()->__( 'Logo carousel' ),
							'name'              => 'field__logo_carousel__flexible_content__logo_carousel',
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
								0 => 'group__logo_carousel__flexible',
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
				$templates['layout__logo_carousel__flexible_content'] = function() {
					$this->themeModule->loadTemplateFile( 'sample-template' );
				};

				return $templates;
			}, 10, 1 );
		}

		private function registerCarouselPostGroup() {
			$LogoCarouselFields = baseTheme()->applyFilters(
				'group_logo_carousel_post_fields', [
				[
					'key'               => 'field__logo_carousel__post',
					'label'             => baseTheme()->__( 'Slide' ),
					'name'              => 'field__logo_carousel__post',
					'type'              => 'repeater',
					'instructions'      => '',
					'required'          => 0,
					'conditional_logic' => 0,
					'wrapper'           => [
						'width' => '',
						'class' => '',
						'id'    => '',
					],
					'collapsed'         => '',
					'min'               => 0,
					'max'               => 0,
					'layout'            => 'table',
					'button_label'      => '',
					'sub_fields'        => [
						[
							'key'               => 'field__logo_carousel__post_image',
							'label'             => baseTheme()->__( 'Image' ),
							'name'              => 'field__logo_carousel__post_image',
							'type'              => 'image',
							'instructions'      => '',
							'required'          => 0,
							'conditional_logic' => 0,
							'wrapper'           => [
								'width' => '',
								'class' => '',
								'id'    => '',
							],
							'return_format'     => 'id',
							'preview_size'      => 'medium',
							'library'           => 'all',
							'min_width'         => '',
							'min_height'        => '',
							'min_size'          => '',
							'max_width'         => '',
							'max_height'        => '',
							'max_size'          => '',
							'mime_types'        => '',
						],
					]
				]
			] );

			$LogoCarouselLocation = baseTheme()->applyFilters(
				'group_logo_carousel_locations', [
				[
					[
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'logo_carousel',
					]
				],
			] );

			// Adding ACF fields to the logo_carousel post type.
			acf_add_local_field_group(
				[
					'key'                   => 'group__logo_carousel__post',
					'title'                 => baseTheme()->__( 'Logo carousel' ),
					'fields'                => (array) $LogoCarouselFields,
					'location'              => (array) $LogoCarouselLocation,
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
		}
	}