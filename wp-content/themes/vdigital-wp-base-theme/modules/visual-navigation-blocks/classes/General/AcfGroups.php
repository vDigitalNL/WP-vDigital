<?php

namespace Theme\Modules\VisualNavigationBlocks\General;

use Theme\BaseTheme\ThemeModuleAbstractClass;
use Theme\Modules\VisualNavigationBlocks;

/**
 * Class AcfGroups
 *
 * @package Theme\Modules\VisualNavigationBlocks\General
 *
 * @property-read VisualNavigationBlocks $themeModule
 */
class AcfGroups extends ThemeModuleAbstractClass {

	public function init() {
		$this->registerVisualNavigationBlocksFlexible();
	}

	private function registerVisualNavigationBlocksFlexible() {
		$visualNavigationBlocksFlexibleFields = baseTheme()->applyFilters(
			'group__visual_navigation_blocks__flexible_fields', [
			[
				'key'               => 'field__visual_navigation_blocks__flexible_title_format',
				'label'             => baseTheme()->__( 'Title SEO' ),
				'name'              => 'field__visual_navigation_blocks__flexible_title_format',
				'type'              => 'select',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '100',
					'class' => '',
					'id'    => '',
				],
				'choices'           => [
					'h1'   => baseTheme()->__( 'Heading 1' ),
					'h2'   => baseTheme()->__( 'Heading 2' ),
					'h3'   => baseTheme()->__( 'Heading 3' ),
					'h4'   => baseTheme()->__( 'Heading 4' ),
					'span' => baseTheme()->__( 'Plain text' ),
					'p'    => baseTheme()->__( 'Paragraph' ),
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
				'key'               => 'field__visual_navigation_blocks__big_block',
				'label'             => baseTheme()->__('Big block'),
				'name'              => 'field__visual_navigation_blocks__big_block',
				'type'              => 'group',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '50',
					'class' => '',
					'id'    => '',
				],
				'layout'            => 'block',
				'sub_fields'        => [
					[
						'key'               => 'field__visual_navigation_blocks__big_block_position',
						'label'             => baseTheme()->__('Position'),
						'name'              => 'field__visual_navigation_blocks__big_block_position',
						'type'              => 'select',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '',
							'class' => '',
							'id'    => '',
						],
						'choices'           => [
							'left'  => 'Left',
							'right' => 'Right',
						],
						'default_value'     => [],
						'allow_null'        => 0,
						'multiple'          => 0,
						'ui'                => 0,
						'return_format'     => 'value',
						'ajax'              => 0,
						'placeholder'       => '',
					],
					[
						'key'               => 'field__visual_navigation_blocks__big_block_title',
						'label'             => baseTheme()->__('Title'),
						'name'              => 'field__visual_navigation_blocks__big_block_title',
						'type'              => 'text',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '50',
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
						'key'               => 'field__visual_navigation_blocks__big_block_link',
						'label'             => baseTheme()->__('Link'),
						'name'              => 'field__visual_navigation_blocks__big_block_link',
						'type'              => 'link',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '50',
							'class' => '',
							'id'    => '',
						],
						'return_format'     => 'array',
					],
					[
						'key'               => 'field__visual_navigation_blocks__big_block_image',
						'label'             => baseTheme()->__('Image'),
						'name'              => 'field__visual_navigation_blocks__big_block_image',
						'type'              => 'image',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '',
							'class' => '',
							'id'    => '',
						],
						'return_format'     => 'array',
						'preview_size'      => 'thumbnail',
						'library'           => 'all',
					],
				],
			],
			[
				'key'               => 'field__visual_navigation_blocks__small_blocks',
				'label'             => baseTheme()->__('Small blocks'),
				'name'              => 'field__visual_navigation_blocks__small_blocks',
				'type'              => 'repeater',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '50',
					'class' => '',
					'id'    => '',
				],
				'collapsed'         => '',
				'min'               => 0,
				'max'               => 0,
				'layout'            => 'table',
				'button_label'      => 'New block',
				'sub_fields'        => [
					[
						'key'               => 'field__visual_navigation_blocks__small_blocks_title',
						'label'             => baseTheme()->__('Title'),
						'name'              => 'field__visual_navigation_blocks__small_blocks_title',
						'type'              => 'text',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '50',
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
						'key'               => 'field__visual_navigation_blocks__small_blocks_link',
						'label'             => baseTheme()->__('Link'),
						'name'              => 'field__visual_navigation_blocks__small_blocks_link',
						'type'              => 'link',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '50',
							'class' => '',
							'id'    => '',
						],
						'return_format'     => 'array',
					],
					[
						'key'               => 'field__visual_navigation_blocks__small_blocks_image',
						'label'             => baseTheme()->__('Image'),
						'name'              => 'field__visual_navigation_blocks__small_blocks_image',
						'type'              => 'image',
						'instructions'      => '',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '',
							'class' => '',
							'id'    => '',
						],
						'return_format'     => 'array',
						'preview_size'      => 'thumbnail',
						'library'           => 'all',
					],
				],
			],
		] );

		$visualNavigationBlocksFlexibleLocation = baseTheme()->applyFilters(
			'group__visual_navigation_blocks__flexible_location', [] );

		acf_add_local_field_group(
			[
				'key'                   => 'group__visual_navigation_blocks__flexible',
				'title'                 => baseTheme()->__( 'Visual navigation blocks' ),
				'fields'                => (array) $visualNavigationBlocksFlexibleFields,
				'location'              => (array) $visualNavigationBlocksFlexibleLocation,
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
				'key'        => 'layout__visual_navigation_blocks__flexible_content',
				'name'       => 'layout__visual_navigation_blocks__flexible_content',
				'label'      => baseTheme()->__( 'Visual navigation blocks' ),
				'display'    => 'block',
				'sub_fields' => [
					[
						'key'               => 'field__visual_navigation_blocks__flexible_content__visual_navigation_blocks',
						'label'             => baseTheme()->__( 'Visual navigation blocks' ),
						'name'              => 'field__visual_navigation_blocks__flexible_content__visual_navigation_blocks',
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
							0 => 'group__visual_navigation_blocks__flexible',
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
			$templates[ 'layout__visual_navigation_blocks__flexible_content' ] = function () {
				$this->themeModule->loadTemplateFile( 'visual-navigation-blocks' );
			};

			return $templates;
		}, 10, 1 );
	}

}