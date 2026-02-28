<?php

use ChildTheme\ChildTheme\Helpers\Acf\Padding;

$fieldKey = 'small-usps_';

acf_add_local_field_group( [
	'key'                   => 'group_small-usps',
	'title'                 => baseTheme()->__( 'Small USPs block' ),
	'fields'                => [
		[
			'key'          => 'field_' . $fieldKey . 'items',
			'label'        => baseTheme()->__( 'Items' ),
			'name'         => $fieldKey . 'items',
			'button_label' => baseTheme()->__( 'Add item' ),
			'type'         => 'repeater',
			'sub_fields'   => [
				[
					'key'     => 'field_' . $fieldKey . 'icon',
					'label'   => baseTheme()->__( 'Icon' ),
					'name'    => $fieldKey . 'icon',
					'type'    => 'select',
					'choices' => [
						'checkmark' => baseTheme()->__( 'Checkmark' ),
						'cross'     => baseTheme()->__( 'Cross' ),
					],
				],
				[
					'key'   => 'field_' . $fieldKey . 'text',
					'label' => baseTheme()->__( 'Text' ),
					'name'  => $fieldKey . 'text',
					'type'  => 'text',
				],
			],
		],
		...Padding::tdFields( $fieldKey ),
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/small-usps',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );

