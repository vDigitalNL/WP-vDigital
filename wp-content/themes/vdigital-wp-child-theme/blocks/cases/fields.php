<?php

$fieldKey = 'cases_';

acf_add_local_field_group( [
	'key'                   => 'group_cases',
	'title'                 => baseTheme()->__( 'Cases block' ),
	'fields'                => [
		[
			'key'   => 'field_' . $fieldKey . 'header_tab',
			'label' => baseTheme()->__( 'Header' ),
			'name'  => $fieldKey . 'header_tab',
			'type'  => 'accordion',
			'open'  => 1,
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
			'key'   => 'field_' . $fieldKey . 'cases_tab',
			'label' => baseTheme()->__( 'Select Cases' ),
			'name'  => $fieldKey . 'cases_tab',
			'type'  => 'accordion',
		],
		[
			'key'           => 'field_' . $fieldKey . 'selected_cases',
			'label'         => baseTheme()->__( 'Cases' ),
			'name'          => $fieldKey . 'selected_cases',
			'type'          => 'post_object',
			'post_type'     => [ 'cases' ],
			'multiple'      => 1,
			'return_format' => 'object',
			'ui'            => 1,
			'max'           => 3,
			'instructions'  => baseTheme()->__( 'Select up to 3 cases to display' ),
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/cases',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
