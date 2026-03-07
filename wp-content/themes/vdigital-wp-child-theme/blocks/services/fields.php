<?php

$fieldKey = 'services_';

acf_add_local_field_group( [
	'key'                   => 'group_services',
	'title'                 => baseTheme()->__( 'Services block' ),
	'fields'                => [
		[
			'key'   => 'field_' . $fieldKey . 'header_tab',
			'label' => baseTheme()->__( 'Header' ),
			'name'  => $fieldKey . 'header_tab',
			'type'  => 'accordion',
			'open'  => 1,
		],
		[
			'key'   => 'field_' . $fieldKey . 'label',
			'label' => baseTheme()->__( 'Section Label' ),
			'name'  => $fieldKey . 'label',
			'type'  => 'text',
			'instructions' => baseTheme()->__( 'Small label above the title (e.g. "What We Do")' ),
		],
		[
			'key'   => 'field_' . $fieldKey . 'title',
			'label' => baseTheme()->__( 'Title' ),
			'name'  => $fieldKey . 'title',
			'type'  => 'text',
		],
		[
			'key'   => 'field_' . $fieldKey . 'description',
			'label' => baseTheme()->__( 'Description' ),
			'name'  => $fieldKey . 'description',
			'type'  => 'textarea',
			'rows'  => 3,
		],
		[
			'key'   => 'field_' . $fieldKey . 'items_tab',
			'label' => baseTheme()->__( 'Service Items' ),
			'name'  => $fieldKey . 'items_tab',
			'type'  => 'accordion',
		],
		[
			'key'          => 'field_' . $fieldKey . 'items',
			'label'        => baseTheme()->__( 'Services' ),
			'name'         => $fieldKey . 'items',
			'button_label' => baseTheme()->__( 'Add service' ),
			'type'         => 'repeater',
			'max'          => 12,
			'layout'       => 'block',
			'sub_fields'   => [
				[
					'key'   => 'field_' . $fieldKey . 'icon',
					'label' => baseTheme()->__( 'Icon (emoji or text)' ),
					'name'  => $fieldKey . 'icon',
					'type'  => 'text',
					'instructions' => baseTheme()->__( 'Use an emoji like 🌐 or ⚡' ),
				],
				[
					'key'      => 'field_' . $fieldKey . 'item_title',
					'label'    => baseTheme()->__( 'Title' ),
					'name'     => $fieldKey . 'item_title',
					'type'     => 'text',
					'required' => 1,
				],
				[
					'key'   => 'field_' . $fieldKey . 'item_description',
					'label' => baseTheme()->__( 'Description' ),
					'name'  => $fieldKey . 'item_description',
					'type'  => 'textarea',
					'rows'  => 3,
				],
			],
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/services',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
