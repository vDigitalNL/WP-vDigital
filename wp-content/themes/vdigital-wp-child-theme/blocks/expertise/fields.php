<?php

$fieldKey = 'expertise_';

acf_add_local_field_group( [
	'key'                   => 'group_expertise',
	'title'                 => baseTheme()->__( 'Expertise block' ),
	'fields'                => [
		[
			'key'   => 'field_' . $fieldKey . 'content_tab',
			'label' => baseTheme()->__( 'Content' ),
			'name'  => $fieldKey . 'content_tab',
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
			'key'     => 'field_' . $fieldKey . 'description',
			'label'   => baseTheme()->__( 'Description' ),
			'name'    => $fieldKey . 'description',
			'type'    => 'wysiwyg',
			'toolbar' => 'basic',
		],
		[
			'key'          => 'field_' . $fieldKey . 'features',
			'label'        => baseTheme()->__( 'Feature List' ),
			'name'         => $fieldKey . 'features',
			'button_label' => baseTheme()->__( 'Add feature' ),
			'type'         => 'repeater',
			'max'          => 10,
			'layout'       => 'table',
			'sub_fields'   => [
				[
					'key'      => 'field_' . $fieldKey . 'feature_text',
					'label'    => baseTheme()->__( 'Feature' ),
					'name'     => $fieldKey . 'feature_text',
					'type'     => 'text',
					'required' => 1,
				],
			],
		],
		[
			'key'   => 'field_' . $fieldKey . 'image_tab',
			'label' => baseTheme()->__( 'Image' ),
			'name'  => $fieldKey . 'image_tab',
			'type'  => 'accordion',
		],
		[
			'key'           => 'field_' . $fieldKey . 'image',
			'label'         => baseTheme()->__( 'Image' ),
			'name'          => $fieldKey . 'image',
			'type'          => 'image',
			'return_format' => 'array',
			'preview_size'  => 'medium',
			'instructions'  => baseTheme()->__( 'Recommended size: 800x600px' ),
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/expertise',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
