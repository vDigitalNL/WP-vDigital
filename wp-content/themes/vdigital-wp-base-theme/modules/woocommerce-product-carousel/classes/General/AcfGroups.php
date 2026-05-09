<?php

namespace Theme\Modules\WoocommerceProductCarousel\General;

use Theme\BaseTheme\ThemeModuleAbstractClass;
use Theme\Modules\WoocommerceProductCarousel;

/**
 * Class AcfGroups
 *
 * @package Theme\Modules\WoocommerceProductCarousel\General
 *
 * @property-read WooCommerceProductCarousel $themeModule
 */
class AcfGroups extends ThemeModuleAbstractClass {

	public function init() {
		$this->registerCarouselPostGroup();
		$this->registerCarouselFlexible();
	}

	private function registerCarouselFlexible() {
		$wooCommerceProductCarouselFlexibleFields = baseTheme()->applyFilters(
			'group__woocommerce_product_carousel__flexible_fields', [
			[
				'key'               => 'field__woocommerce_product_carousel__flexible_title',
				'label'             => baseTheme()->__( 'Title' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_title',
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
				'key'               => 'field__woocommerce_product_carousel__flexible_title_format',
				'label'             => baseTheme()->__( 'Title format' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_title_format',
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
				'key'               => 'field__woocommerce_product_carousel__flexible_display_type',
				'label'             => baseTheme()->__( 'Display type' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_display_type',
				'type'              => 'radio',
				'instructions'      => baseTheme()->__( 'The selected display type determines whether you\'re able to choose from product categories or the product carousel post type.' ),
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '',
					'class' => '',
					'id'    => '',
				],
				'choices'           => array(
					'product_category' => 'Product category',
					'product_carousel' => 'Product carousel',
				),
				'message'           => '',
				'allow_null'        => 0,
				'other_choice'      => 0,
				'default_value'     => 0,
				'ui'                => 0,
				'ui_on_text'        => '',
				'ui_off_text'       => '',
				'save_other_choice' => 0,
			],
			[
				'key'               => 'field__woocommerce_product_carousel__flexible_product_carousel',
				'label'             => baseTheme()->__( 'Product carousel' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_product_carousel',
				'type'              => 'post_object',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => [
					[
						[
							'field'    => 'field__woocommerce_product_carousel__flexible_display_type',
							'operator' => '==',
							'value'    => 'product_carousel',
						],
					],
				],
				'wrapper'           => [
					'width' => '',
					'class' => '',
					'id'    => '',
				],
				'post_type'         => [
					0 => 'product_carousel',
				],
				'taxonomy'          => '',
				'allow_null'        => 0,
				'multiple'          => 0,
				'return_format'     => 'id',
				'ui'                => 1,
			],
			[
				'key'               => 'field__woocommerce_product_carousel__flexible_product_categories',
				'label'             => baseTheme()->__( 'Product categories' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_product_categories',
				'type'              => 'taxonomy',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => [
					[
						[
							'field'    => 'field__woocommerce_product_carousel__flexible_display_type',
							'operator' => '==',
							'value'    => 'product_category',
						],
					],
				],
				'wrapper'           => [
					'width' => '',
					'class' => '',
					'id'    => '',
				],
				'taxonomy'          => 'product_cat',
				'field_type'        => 'multi_select',
				'allow_null'        => 0,
				'add_term'          => 1,
				'save_terms'        => 0,
				'load_terms'        => 0,
				'return_format'     => 'id',
				'multiple'          => 0,
			],
			[
				'key'               => 'field__woocommerce_product_carousel__flexible_amount_desktop',
				'label'             => baseTheme()->__( 'Amount per row(desktop)' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_amount_desktop',
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
				'key'               => 'field__woocommerce_product_carousel__flexible_amount_tablet',
				'label'             => baseTheme()->__( 'Amount per row(tablet)' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_amount_tablet',
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
				'key'               => 'field__woocommerce_product_carousel__flexible_amount_mobile',
				'label'             => baseTheme()->__( 'Amount per row(mobile)' ),
				'name'              => 'field__woocommerce_product_carousel__flexible_amount_mobile',
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

		$wooCommerceProductCarouselFlexibleLocation = baseTheme()->applyFilters(
			'group__woocommerce_product_carousel__flexible_location', [] );

		acf_add_local_field_group(
			[
				'key'                   => 'group__woocommerce_product_carousel__flexible',
				'title'                 => baseTheme()->__( 'WooCommerce Product Carousel' ),
				'fields'                => (array) $wooCommerceProductCarouselFlexibleFields,
				'location'              => (array) $wooCommerceProductCarouselFlexibleLocation,
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
				'key'        => 'layout__woocommerce_product_carousel__flexible_content',
				'name'       => 'layout__woocommerce_product_carousel__flexible_content',
				'label'      => baseTheme()->__( 'Product carousel' ),
				'display'    => 'block',
				'sub_fields' => [
					[
						'key'               => 'field__woocommerce_product_carousel__flexible_content__product_carousel',
						'label'             => baseTheme()->__( 'Product carousel' ),
						'name'              => 'field__woocommerce_product_carousel__flexible_content__product_carousel',
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
							0 => 'group__woocommerce_product_carousel__flexible',
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
			$templates[ 'layout__woocommerce_product_carousel__flexible_content' ] = function () {
				$this->themeModule->loadTemplateFile( 'woocommerce-product-carousel' );
			};

			return $templates;
		}, 10, 1 );
	}

	private function registerCarouselPostGroup() {
		$wooCommerceProductCarouselFields = baseTheme()->applyFilters(
			'group_woocommerce_product_carousel_post_fields', [
			[
				'key'               => 'field__woocommerce_product_carousel__post_products',
				'label'             => baseTheme()->__( 'Product' ),
				'name'              => 'field__woocommerce_product_carousel__post_products',
				'type'              => 'relationship',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '',
					'class' => '',
					'id'    => '',
				],
				'post_type'         => [
					0 => 'product',
				],
				'taxonomy'          => '',
				'filters'           => '',
				'elements'          => '',
				'min'               => '',
				'max'               => '',
				'return_format'     => 'id',
			]
		] );

		$wooCommerceProductCarouselLocation = baseTheme()->applyFilters(
			'group_woocommerce_product_carousel_locations', [
			[
				[
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'product_carousel',
				]
			],
		] );

		// Adding ACF fields to the product_carousel post type.
		acf_add_local_field_group(
			[
				'key'                   => 'group__woocommerce_product_carousel__post',
				'title'                 => baseTheme()->__( 'WooCommerce Product Carousel' ),
				'fields'                => (array) $wooCommerceProductCarouselFields,
				'location'              => (array) $wooCommerceProductCarouselLocation,
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