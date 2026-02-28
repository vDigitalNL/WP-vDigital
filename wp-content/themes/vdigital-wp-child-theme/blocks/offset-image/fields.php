<?php

$fieldKey = 'offset_image_';

acf_add_local_field_group( [
	'key'                   => 'group_offset_image',
	'title'                 => 'Offset image',
	'fields'                => [
		[
			'key'      => 'field_' . $fieldKey . 'image',
			'label'    => baseTheme()->__( 'Image' ),
			'name'     => $fieldKey . 'image',
			'type'     => 'image',
			'required' => 1,
		],
		[
			'key'           => 'field_' . $fieldKey . 'outside',
			'label'         => baseTheme()->__( 'Image position' ),
			'instructions'  => baseTheme()->__( 'The image is moved outside of the container to the direction that is chosen.' ),
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
			'key'           => 'field_' . $fieldKey . 'rounded_corners',
			'label'         => baseTheme()->__( 'Rounded corners' ),
			'name'          => $fieldKey . 'rounded_corners',
			'type'          => 'true_false',
			'ui'            => 1,
			'default_value' => true
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/offset-image',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
