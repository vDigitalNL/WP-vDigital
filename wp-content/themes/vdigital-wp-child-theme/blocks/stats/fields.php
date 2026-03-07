<?php

$fieldKey = 'stats_';

acf_add_local_field_group( [
	'key'                   => 'group_stats',
	'title'                 => baseTheme()->__( 'Stats block' ),
	'fields'                => [
		[
			'key'          => 'field_' . $fieldKey . 'items',
			'label'        => baseTheme()->__( 'Stat Items' ),
			'name'         => $fieldKey . 'items',
			'button_label' => baseTheme()->__( 'Add stat' ),
			'type'         => 'repeater',
			'max'          => 6,
			'layout'       => 'block',
			'sub_fields'   => [
				[
					'key'      => 'field_' . $fieldKey . 'number',
					'label'    => baseTheme()->__( 'Number/Value' ),
					'name'     => $fieldKey . 'number',
					'type'     => 'text',
					'required' => 1,
					'instructions' => baseTheme()->__( 'e.g. 10+, 50+, 100%, 24/7' ),
				],
				[
					'key'      => 'field_' . $fieldKey . 'label',
					'label'    => baseTheme()->__( 'Label' ),
					'name'     => $fieldKey . 'label',
					'type'     => 'text',
					'required' => 1,
					'instructions' => baseTheme()->__( 'e.g. Years of Experience, Projects Delivered' ),
				],
			],
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/stats',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
