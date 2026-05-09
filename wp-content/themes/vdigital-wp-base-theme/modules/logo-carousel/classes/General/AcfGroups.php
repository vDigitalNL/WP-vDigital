<?php

namespace Theme\Modules\LogoCarousel\General;

use Theme\BaseTheme\ThemeModuleAbstractClass;
use Theme\Modules\LogoCarousel;

/**
 * Class AcfGroups
 *
 * @package Theme\Modules\LogoCarousel\General
 *
 * @property-read LogoCarousel $themeModule
 */
class AcfGroups extends ThemeModuleAbstractClass {

	public function init() {
		$this->registerCarouselPostGroup();
		$this->registerCarouselFlexible();
	}

	private function registerCarouselFlexible() {
		$logoCarouselFlexibleFields = baseTheme()->applyFilters(
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
			[
				'key'               => 'field__logo_carousel__flexible_title_format',
				'label'             => baseTheme()->__( 'Title format' ),
				'name'              => 'field__logo_carousel__flexible_title_format',
				'type'              => 'select',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
					'class' => '',
					'id'    => '',
				],
				'choices'           => [
					'span' => baseTheme()->__( 'Plain text' ),
					'p'    => baseTheme()->__( 'Paragraph' ),
					'h2'   => baseTheme()->__( 'Heading 2' ),
					'h3'   => baseTheme()->__( 'Heading 3' ),
					'h4'   => baseTheme()->__( 'Heading 4' ),
				],
				'default_value'     => [
					0 => 'span',
				],
				'allow_null'        => 0,
				'multiple'          => 0,
				'ui'                => 0,
				'return_format'     => 'value',
				'ajax'              => 0,
				'placeholder'       => '',
			],
			[
				'key'               => 'field__logo_carousel__flexible_object',
				'label'             => baseTheme()->__( 'Logo carousel' ),
				'name'              => 'field__logo_carousel__flexible_object',
				'type'              => 'post_object',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '',
					'class' => '',
					'id'    => '',
				],
				'post_type'         => [
					0 => 'logo_carousel',
				],
				'taxonomy'          => '',
				'allow_null'        => 0,
				'multiple'          => 0,
				'return_format'     => 'id',
				'ui'                => 1,
			],
			[
				'key'               => 'field__logo_carousel__flexible_amount_desktop',
				'label'             => baseTheme()->__( 'Amount per row(desktop)' ),
				'name'              => 'field__logo_carousel__flexible_amount_desktop',
				'type'              => 'number',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
					'class' => '',
					'id'    => '',
				],
				'default_value'     => '',
				'placeholder'       => '',
				'prepend'           => '',
				'append'            => '',
				'min'               => '',
				'max'               => '',
				'step'              => '',
			],
			[
				'key'               => 'field__logo_carousel__flexible_amount_tablet',
				'label'             => baseTheme()->__( 'Amount per row(tablet)' ),
				'name'              => 'field__logo_carousel__flexible_amount_tablet',
				'type'              => 'number',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
					'class' => '',
					'id'    => '',
				],
				'default_value'     => '',
				'placeholder'       => '',
				'prepend'           => '',
				'append'            => '',
				'min'               => '',
				'max'               => '',
				'step'              => '',
			],
			[
				'key'               => 'field__logo_carousel__flexible_amount_mobile',
				'label'             => baseTheme()->__( 'Amount per row(mobile)' ),
				'name'              => 'field__logo_carousel__flexible_amount_mobile',
				'type'              => 'number',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
					'class' => '',
					'id'    => '',
				],
				'default_value'     => '',
				'placeholder'       => '',
				'prepend'           => '',
				'append'            => '',
				'min'               => '',
				'max'               => '',
				'step'              => '',
			]
		] );

		$logoCarouselFlexibleLocation = baseTheme()->applyFilters(
			'group__logo_carousel__flexible_location', [] );

		acf_add_local_field_group(
			[
				'key'                   => 'group__logo_carousel__flexible',
				'title'                 => baseTheme()->__( 'Logo Carousel' ),
				'fields'                => (array) $logoCarouselFlexibleFields,
				'location'              => (array) $logoCarouselFlexibleLocation,
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

		baseTheme()->addFilter( 'flexible_content_box/layouts', function ( $layouts ) {
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

		baseTheme()->addFilter( 'flexible_content_box/layouts_template', function ( $templates ) {
			$templates[ 'layout__logo_carousel__flexible_content' ] = function () {
				$this->themeModule->loadTemplateFile( 'logo-carousel' );
			};

			return $templates;
		}, 10, 1 );
	}

	private function registerCarouselPostGroup() {
		$logoCarouselFields = baseTheme()->applyFilters(
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

		$logoCarouselLocation = baseTheme()->applyFilters(
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
				'fields'                => (array) $logoCarouselFields,
				'location'              => (array) $logoCarouselLocation,
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