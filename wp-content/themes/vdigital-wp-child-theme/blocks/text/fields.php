<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
use ChildTheme\ChildTheme\Helpers\Acf\Heading;

$fieldKey = 'text_';
$excludedButtons = [ 'green', 'dark_green', 'teal', 'cobalt' ];

acf_add_local_field_group( [
	'key'                   => 'group_text',
	'title'                 => 'Text block',
	'fields'                => [
		[
			'key'   => 'field_' . $fieldKey . 'title_tab',
			'label' => baseTheme()->__( 'Title' ),
			'name'  => $fieldKey . 'title_tab',
			'type'  => 'accordion',
			'open'  => 1,
		],
		Heading::getField( $fieldKey ),
		[
			'key'       => 'field_' . $fieldKey . 'title',
			'label'     => baseTheme()->__( 'Title text' ),
			'name'      => $fieldKey . 'title',
			'type'      => 'textarea',
			'new_lines' => 'br'
		],
		[
			'key'               => 'field_' . $fieldKey . 'title_icon',
			'label'             => baseTheme()->__( 'Title icon' ),
			'name'              => $fieldKey . 'title_icon',
			'type'              => 'image',
			'return_format'     => 'array',
			'preview_size'      => 'thumbnail',
			'library'           => 'all',
			'required'          => 1,
			'conditional_logic' => [
				[
					[
						'field'    => 'field_' . $fieldKey . 'heading_type',
						'operator' => '==',
						'value'    => 'h3-small-with-icon',
					],
				],
			],
		],
		[
			'key'               => 'field_' . $fieldKey . 'title_button',
			'label'             => baseTheme()->__( 'Title button' ),
			'instructions'      => baseTheme()->__( 'This button appears right-aligned at the height of the title.' ),
			'name'              => $fieldKey . 'title_button',
			'type'              => 'repeater',
			'max'               => 1,
			'layout'            => 'block',
			'button_label'      => baseTheme()->__( 'Add button' ),
			'conditional_logic' => [
				[
					[
						'field'    => 'field_' . $fieldKey . 'heading_type',
						'operator' => '==',
						'value'    => 'h2',
					],
				],
			],
			'sub_fields'        => [
				...Buttons::getFields( $fieldKey . 'title_button_',
					true,
					$excludedButtons
				),
			],
		],
		[
			'key'   => 'field_' . $fieldKey . 'text_tab',
			'label' => baseTheme()->__( 'Text' ),
			'name'  => $fieldKey . 'text_tab',
			'type'  => 'accordion',
		],
		[
			'key'     => 'field_' . $fieldKey . 'description',
			'label'   => baseTheme()->__( 'Text content' ),
			'name'    => $fieldKey . 'description',
			'type'    => 'wysiwyg',
			'toolbar' => 'text_block',
		],
		[
			'key'          => 'field_' . $fieldKey . 'buttons',
			'label'        => baseTheme()->__( 'Button(s) under text' ),
			'name'         => $fieldKey . 'buttons',
			'type'         => 'repeater',
			'max'          => 2,
			'layout'       => 'block',
			'button_label' => baseTheme()->__( 'Add button' ),
			'sub_fields'   => [
				...Buttons::getFields(
					$fieldKey . 'buttons_',
					true,
					$excludedButtons
				),
			],
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/text',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
