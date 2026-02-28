<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$fieldKey = 'text_panel_';

acf_add_local_field_group( [
	'key'                   => 'group_text_panel',
	'title'                 => baseTheme()->__( 'Text panel' ),
	'fields'                => [
		[
			'key'      => 'field_' . $fieldKey . 'title',
			'label'    => baseTheme()->__( 'Title' ),
			'name'     => $fieldKey . 'title',
			'type'     => 'textarea',
			'new_lines'=> 'wpautop',
		],
		[
			'key'   => 'field_' . $fieldKey . 'description',
			'label' => baseTheme()->__( 'Description' ),
			'name'  => $fieldKey . 'description',
			'type'  => 'wysiwyg',
		],
		[
			'key'           => 'field_' . $fieldKey . 'outside',
			'label'         => baseTheme()->__( 'Background position' ),
			'instructions'  => baseTheme()->__( 'The background is moved outside of the container to the direction that is chosen.' ),
			'name'          => $fieldKey . 'outside',
			'type'          => 'select',
			'ui'            => 1,
			'choices'       => [
				'left'  => baseTheme()->__( 'Left' ),
				'right' => baseTheme()->__( 'Right' ),
			],
			'default_value' => 'right',
		],
		[
			'key'        => 'field_' . $fieldKey . 'buttons',
			'label'      => baseTheme()->__( 'Buttons' ),
			'name'       => $fieldKey . 'buttons',
			'type'       => 'repeater',
			'max'        => 2,
			'layout'     => 'block',
			'sub_fields' => [
				...Buttons::getFields(
					$fieldKey . 'buttons_',
					true,
					[ '', 'outline', 'white_outline', 'green', 'dark_green', 'teal', 'cobalt' ]
				),
			]
		]
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/text-panel',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
