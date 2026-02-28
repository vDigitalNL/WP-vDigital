<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

acf_add_local_field_group( [
	'key'                   => 'group_timeline',
	'title'                 => 'timeline',
	'fields'                => [
		[
			'key'        => 'group_timeline_line_start',
			'label'      => baseTheme()->__( 'Startpoint settings' ),
			'name'       => 'timeline_line_start',
			'type'       => 'group',
			'sub_fields' => [
				[
					'key'        => 'field_line_start_enabled',
					'label'      => baseTheme()->__( 'Add startpoint in previous element' ),
					'name'       => 'enabled',
					'type'       => 'true_false',
					'ui'         => 1,
				],
				[
					'key'        => 'field_color',
					'label'      => baseTheme()->__( 'Color' ),
					'name'       => 'color',
					'type'       => 'select',
					'choices'    => [
						'white' => baseTheme()->__( 'White' ),
						'black' => baseTheme()->__( 'Black' ),
						'blue'  => baseTheme()->__( 'Blue' ),
					],
				],
			]
		],
		[
			'key'        => 'field_timeline_items',
			'label'      => baseTheme()->__( 'Timeline items' ),
			'name'       => 'timeline_items',
			'type'       => 'repeater',
			'layout'     => 'block',
			'sub_fields' => [
				[
					'key'   => 'field_timeline_year',
					'name'  => 'field_timeline_year',
					'label' => baseTheme()->__( 'Year' ),
					'type'  => 'text',
				],
				[
					'key'   => 'field_timeline_title',
					'name'  => 'field_timeline_title',
					'label' => baseTheme()->__( 'Title' ),
					'type'  => 'text',
				],
				[
					'key'   => 'field_timeline_description',
					'name'  => 'field_timeline_description',
					'label' => baseTheme()->__( 'Description' ),
					'type'  => 'wysiwyg',
				],
				[
					'key'        => 'field_timeline_buttons',
					'label'      => baseTheme()->__( 'Buttons' ),
					'name'       => 'field_timeline_buttons',
					'type'       => 'repeater',
					'max'        => 3,
					'layout'     => 'row',
					'sub_fields' => [
						...Buttons::getFields( 'field_timeline' ),
					]
				],
				[
					'key'   => 'field_timeline_image',
					'name'  => 'field_timeline_image',
					'label' => baseTheme()->__( 'Image' ),
					'type'  => 'image',
				],
				[
					'key'        => 'field_timeline_image_right',
					'label'      => baseTheme()->__( 'Show image on the right' ),
					'name'       => 'field_timeline_image_right',
					'type'       => 'true_false',
					'ui'         => 1,
				]
			],
		],
		[
			'key'        => 'field_timeline_line_end',
			'label'      => baseTheme()->__( 'Endpoint settings' ),
			'name'       => 'timeline_line_end',
			'type'       => 'group',
			'sub_fields' => [
				[
					'key'        => 'field_line_end_enabled',
					'label'      => baseTheme()->__( 'Add endpoint in next element' ),
					'name'       => 'enabled',
					'type'       => 'true_false',
					'ui'         => 1,
				],
				[
					'key'        => 'field_color',
					'label'      => baseTheme()->__( 'Color' ),
					'name'       => 'color',
					'type'       => 'select',
					'choices'    => [
						'white' => baseTheme()->__('White'),
						'black' => baseTheme()->__('Black'),
						'blue'  => baseTheme()->__('Blue'),
					],
				],
			]
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/timeline',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );

