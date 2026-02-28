<?php

$fieldKey = 'accordion';

acf_add_local_field_group( [
	'key'      => 'group_accordion',
	'title'    => baseTheme()->__( 'Accordion' ),
	'fields'   => [
		[
			'key'               => 'field_' . $fieldKey . '_schema_markup',
			'label'             => baseTheme()->__( 'Schema markup' ),
			'name'              => $fieldKey . '_schema_markup',
			'type'              => 'select',
			'choices'           => [
				''         => baseTheme()->__( 'No schema markup' ),
				'itemList' => baseTheme()->__( 'Item list' ),
				'faq'      => baseTheme()->__( 'FAQ' ),
			],
			'default_value'     => '',
			'conditional_logic' => [],
		],
		[
			'key'          => 'field_' . $fieldKey . '_items',
			'label'        => baseTheme()->__( 'Items' ),
			'name'         => $fieldKey . '_items',
			'type'         => 'repeater',
			'button_label' => baseTheme()->__( 'Add item' ),
			'layout'       => 'block',
			'sub_fields'   => [
				[
					'key'      => 'field_' . $fieldKey . '_title',
					'label'    => baseTheme()->__( 'Title' ),
					'name'     => $fieldKey . '_title',
					'type'     => 'text',
					'required' => 1,
				],
				[
					'key'      => 'field_' . $fieldKey . '_content',
					'label'    => baseTheme()->__( 'Description' ),
					'name'     => $fieldKey . '_content',
					'type'     => 'wysiwyg',
					'required' => 1,
				],
			],
		]
	],
	'location' => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/accordion',
			],
		],
	],
	'active'   => true,
] );