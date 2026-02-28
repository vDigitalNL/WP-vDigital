<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
use ChildTheme\ChildTheme\Helpers\Acf\Heading;

$fieldKey = 'solution_showcase_';

acf_add_local_field_group( [
	'key'                   => 'group_solution_showcase',
	'title'                 => 'Solution showcase',
	'fields'                => [
		[
			'key'   => 'field_' . $fieldKey . 'title_text_tab',
			'label' => baseTheme()->__( 'Title, text & button' ),
			'name'  => $fieldKey . 'title_text_tab',
			'type'  => 'accordion',
			'open'  => 1,
		],
		Heading::getField( $fieldKey ),
		[
			'key'       => 'field_' . $fieldKey . 'title',
			'label'     => baseTheme()->__( 'Title text' ),
			'name'      => $fieldKey . 'title',
			'type'      => 'textarea',
			'new_lines' => 'br',
		],
		[
			'key'     => 'field_' . $fieldKey . 'description',
			'label'   => baseTheme()->__( 'Text content' ),
			'name'    => $fieldKey . 'description',
			'type'    => 'wysiwyg',
			'toolbar' => 'text_block',
		],
		[
			'key'               => 'field_' . $fieldKey . 'title_button_type',
			'label'             => baseTheme()->__( 'Toggle button style' ),
			'instructions'      => baseTheme()->__( 'Select the style for the toggle button that appears right-aligned at the height of the title. This button toggles between sector and role showcase.' ),
			'name'              => $fieldKey . 'title_button_type',
			'type'              => 'select',
			'choices'           => [
				''              => baseTheme()->__( 'White button with dark text' ),
				'outline'       => baseTheme()->__( 'Transparent button with blue outline and white text' ),
				'blue'          => baseTheme()->__( 'Blue button with white text' ),
				'dark_outline'  => baseTheme()->__( 'Transparent button with dark outline and text' ),
				'white_outline' => baseTheme()->__( 'Transparent button with white outline and text' ),
			],
			'conditional_logic' => [
				[
					[
						'field'    => 'field_' . $fieldKey . 'heading_type',
						'operator' => '==',
						'value'    => 'h2',
					],
				],
			],
		],

		// Sector Showcase Tab
		[
			'key'   => 'field_' . $fieldKey . 'sector_tab',
			'label' => baseTheme()->__( 'Sector showcase' ),
			'name'  => $fieldKey . 'sector_tab',
			'type'  => 'accordion',
		],
		[
			'key'          => 'field_' . $fieldKey . 'sector_tiles',
			'label'        => baseTheme()->__( 'Sector tiles' ),
			'instructions' => baseTheme()->__( 'Add exactly 5 tiles for the sector showcase.' ),
			'name'         => $fieldKey . 'sector_tiles',
			'type'         => 'repeater',
			'min'          => 5,
			'max'          => 5,
			'layout'       => 'block',
			'button_label' => baseTheme()->__( 'Add tile' ),
			'sub_fields'   => [
				[
					'key'           => 'field_' . $fieldKey . 'sector_tile_image',
					'label'         => baseTheme()->__( 'Image' ),
					'name'          => 'image',
					'type'          => 'image',
					'return_format' => 'array',
					'preview_size'  => 'medium',
					'library'       => 'all',
					'required'      => 1,
				],
				[
					'key'      => 'field_' . $fieldKey . 'sector_tile_title',
					'label'    => baseTheme()->__( 'Title' ),
					'name'     => 'title',
					'type'     => 'textarea',
					'required' => 1,
				],
				[
					'key'           => 'field_' . $fieldKey . 'sector_tile_link',
					'label'         => baseTheme()->__( 'Link' ),
					'name'          => 'link',
					'type'          => 'link',
					'return_format' => 'array',
					'required'      => 1,
				],
			],
		],
		
		// Role Showcase Tab
		[
			'key'   => 'field_' . $fieldKey . 'role_tab',
			'label' => baseTheme()->__( 'Role showcase' ),
			'name'  => $fieldKey . 'role_tab',
			'type'  => 'accordion',
		],
		[
			'key'          => 'field_' . $fieldKey . 'role_tiles',
			'label'        => baseTheme()->__( 'Role tiles' ),
			'instructions' => baseTheme()->__( 'Add exactly 5 tiles for the role showcase.' ),
			'name'         => $fieldKey . 'role_tiles',
			'type'         => 'repeater',
			'min'          => 5,
			'max'          => 5,
			'layout'       => 'block',
			'button_label' => baseTheme()->__( 'Add tile' ),
			'sub_fields'   => [
				[
					'key'           => 'field_' . $fieldKey . 'role_tile_image',
					'label'         => baseTheme()->__( 'Image' ),
					'name'          => 'image',
					'type'          => 'image',
					'return_format' => 'array',
					'preview_size'  => 'medium',
					'library'       => 'all',
					'required'      => 1,
				],
				[
					'key'      => 'field_' . $fieldKey . 'role_tile_title',
					'label'    => baseTheme()->__( 'Title' ),
					'name'     => 'title',
					'type'     => 'textarea',
					'required' => 1,
				],
				[
					'key'           => 'field_' . $fieldKey . 'role_tile_link',
					'label'         => baseTheme()->__( 'Link' ),
					'name'          => 'link',
					'type'          => 'link',
					'return_format' => 'array',
					'required'      => 1,
				],
			],
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/solution-showcase',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );

