<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

class Tiles {
	private static function getSizeFields( $baseKey, $dimension, $sizes, $device = 'desktop', $keyPrefix = '', $width = '100%' ): array {
		return [
			'key'     => $keyPrefix . $baseKey . 'tile_' . $dimension . '_' . $device,
			'label'   => baseTheme()->__( ucfirst( $dimension ) . ' (' . $device . ')' ),
			'name'    => $baseKey . 'tile_' . $dimension . '_' . $device,
			'type'    => 'select',
			'choices' => $sizes,
			'wrapper' => [
				'width' => $width,
			],
		];
	}

	public static function getFields( string $baseKey ): array {
		$widths = [
			'1/5' => '1/5 (20%)',
			'1/3' => '1/3 (33%)',
			'2/5' => '2/5 (40%)',
			'1/2' => '1/2 (50%)',
			'3/5' => '3/5 (60%)',
			'2/3' => '2/3 (66%)',
			'1'   => '1 (100%)',
		];

		$heights   = [
			'xxs'  => baseTheme()->__( 'XXS' ),
			'xs'   => baseTheme()->__( 'XS' ),
			'sm'   => baseTheme()->__( 'Small' ),
			'md'   => baseTheme()->__( 'Medium' ),
			'lg'   => baseTheme()->__( 'Large' ),
			'xl'   => baseTheme()->__( 'XL' ),
			'xxl'  => baseTheme()->__( 'XXL' ),
			'xxxl' => baseTheme()->__( 'XXXL' ),
		];
		$keyPrefix = str_starts_with( $baseKey, 'field_' ) ? '' : 'field_';

		return [
			'key'          => $keyPrefix . $baseKey . 'tile',
			'label'        => baseTheme()->__( 'Tiles' ),
			'name'         => $baseKey . 'tile',
			'type'         => 'repeater',
			'layout'       => 'block',
			'button_label' => baseTheme()->__( 'Add tile' ),
			'sub_fields'   => [
				[
					'key'     => $keyPrefix . $baseKey . 'tile_type',
					'label'   => baseTheme()->__( 'Type' ),
					'name'    => $baseKey . 'tile_type',
					'type'    => 'select',
					'choices' => [
						'branche'  => baseTheme()->__( 'Sector or role' ),
						'news'     => baseTheme()->__( 'News item' ),
						'gradient' => baseTheme()->__( 'Gradient' ),
						'color'    => baseTheme()->__( 'Color' ),
						'image'    => baseTheme()->__( 'Image' ),
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'news_article',
					'label'             => baseTheme()->__( 'News item' ),
					'name'              => $baseKey . 'news_article',
					'type'              => 'post_object',
					'required'          => 1,
					'post_type'         => [
						0 => 'post',
					],
					'return_format'     => 'id',
					'ui'                => 1,
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '==',
								'value'    => 'news',
							],
						],
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'tile_title',
					'label'             => baseTheme()->__( 'Title' ),
					'name'              => $baseKey . 'tile_title',
					'type'              => 'text',
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'news',
							],
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'image',
							],
						],
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'tile_text',
					'label'             => baseTheme()->__( 'Text' ),
					'name'              => $baseKey . 'tile_text',
					'type'              => 'wysiwyg',
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'branche',
							],
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'news',
							],
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'image',
							],
						],
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'tile_gradient',
					'label'             => baseTheme()->__( 'Gradient type' ),
					'name'              => $baseKey . 'tile_gradient',
					'type'              => 'select',
					'choices'           => Gradient::getChoices(),
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '==',
								'value'    => 'gradient',
							],
						],
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'tile_color',
					'label'             => baseTheme()->__( 'Background color' ),
					'name'              => $baseKey . 'tile_color',
					'type'              => 'select',
					'choices'           => Color::getChoices(),
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '==',
								'value'    => 'color',
							],
						],
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'tile_inner_image',
					'label'             => baseTheme()->__( 'Image' ),
					'name'              => $baseKey . 'tile_inner_image',
					'type'              => 'image',
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'color',
							],
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'news',
							],
						],
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'tile_link',
					'label'             => baseTheme()->__( 'Link' ),
					'name'              => $baseKey . 'tile_link',
					'type'              => 'link',
					'return_format'     => 'url',
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'news',
							],
							[
								'field'    => $keyPrefix . $baseKey . 'tile_type',
								'operator' => '!=',
								'value'    => 'image',
							],
						],
					],
				],
				self::getSizeFields( $baseKey, 'width', $widths, 'desktop', $keyPrefix, '50%' ),
				self::getSizeFields( $baseKey, 'height', $heights, 'desktop', $keyPrefix, '50%' ),

				self::getSizeFields( $baseKey, 'width', $widths, 'mobile', $keyPrefix, '50%' ),
				self::getSizeFields( $baseKey, 'height', $heights, 'mobile', $keyPrefix, '50%' ),

				[
					'key'   => $keyPrefix . $baseKey . 'hide_mobile',
					'label' => baseTheme()->__( 'Hide (mobile)' ),
					'name'  => $baseKey . 'hide_mobile',
					'type'  => 'true_false',
					'ui'    => 1,
					'wrapper' => [
						'width' => '50%',
					],
				],
				[
					'key'   => $keyPrefix . $baseKey . 'hide_tablet',
					'label' => baseTheme()->__( 'Hide (tablet)' ),
					'name'  => $baseKey . 'hide_tablet',
					'type'  => 'true_false',
					'ui'    => 1,
					'wrapper' => [
						'width' => '50%',
					],
				],
			],
		];
	}

	public static function render( array $tile, string $desktopDirection = 'horizontal', string $mobileDirection = 'horizontal' ): ?bool {
		return get_template_part(
			'template-parts/tiles/' . $tile['field_tiles_tile_type'],
			null,
			array_merge(
				match ( $tile['field_tiles_tile_type'] ) {
					'news' => [ 'articleId' => get_sub_field( 'tiles_news_article' ) ?? null ],
					default => [
						'title'    => get_sub_field( 'tiles_tile_title' ) ?? null,
						'link'     => $tile['field_tiles_tile_link']['url'] ?? null,
						'target'   => $tile['field_tiles_tile_link']['target'] ?? null,
						'image'    => $tile['field_tiles_tile_inner_image'] ?? null,
						'gradient' => $tile['field_tiles_tile_gradient'] ?? null,
						'color'    => $tile['field_tiles_tile_color'] ?? null,
						'text'     => $tile['field_tiles_tile_text'] ?? null,
					],
				},
				[ 'desktopWidth' => $tile['field_tiles_tile_width_desktop'] ?? null ],
				[ 'mobileWidth' => $tile['field_tiles_tile_width_mobile'] ?? null ],
				[ 'desktopHeight' => $tile['field_tiles_tile_height_desktop'] ?? null ],
				[ 'mobileHeight' => $tile['field_tiles_tile_height_mobile'] ?? null ],
				[ 'desktopDirection' => $desktopDirection ],
				[ 'mobileDirection' => $mobileDirection ],
				[ 'hideOnMobile' => $tile['field_tiles_hide_mobile'] ?? false ],
				[ 'hideOnTablet' => $tile['field_tiles_hide_tablet'] ?? false ],
			)
		);
	}

	public static function getWidthClasses(
		string $desktopWidth,
		string $mobileWidth, string $startOfDesktop = 'lg'
	): array {

		return array_merge( match ( $mobileWidth ) {
			'1/5' => [ 'tw-w-1/5' ],
			'1/3' => [ 'tw-w-1/3' ],
			'2/5' => [ 'tw-w-2/5' ],
			'1/2' => [ 'tw-w-1/2' ],
			'3/5' => [ 'tw-w-3/5' ],
			'2/3' => [ 'tw-w-2/3' ],
			default => [ 'tw-w-full' ],
		}, match ( $desktopWidth ) {
			'1/5' => [ $startOfDesktop . ':tw-w-1/5' ],
			'1/3' => [ $startOfDesktop . ':tw-w-1/3' ],
			'2/5' => [ $startOfDesktop . ':tw-w-2/5' ],
			'1/2' => [ $startOfDesktop . ':tw-w-1/2' ],
			'3/5' => [ $startOfDesktop . ':tw-w-3/5' ],
			'2/3' => [ $startOfDesktop . ':tw-w-2/3' ],
			default => [ $startOfDesktop . ':tw-w-full' ],
		} );
	}
}