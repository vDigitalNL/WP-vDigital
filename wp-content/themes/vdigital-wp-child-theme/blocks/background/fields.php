<?php

$fieldKey = 'field_container_';

acf_add_local_field_group([
    'key'                   => 'group_container',
    'title'                 => 'Container',
    'layout'                => 'table',
    'fields'                => [
        [
            'key'           => 'field_' . $fieldKey . 'background_type',
            'label'         => baseTheme()->__( 'Background type' ),
            'name'          => $fieldKey . 'background_type',
            'type'          => 'select',
            'default_value' => 'default',
            'choices'       => [
                'default' => baseTheme()->__( 'Default' ),
                'light'   => baseTheme()->__( 'Light' ),
                'image'   => baseTheme()->__( 'Image' ),
            ],
            'wrapper'           => [
	            'width' => '50%',
            ],
        ],
	    [
		    'key'           => 'field_' . $fieldKey . 'content_layout',
		    'label'         => baseTheme()->__( 'Content layout' ),
		    'name'          => $fieldKey . 'content_layout',
		    'type'          => 'select',
		    'default_value' => 'default',
		    'choices'       => [
			    'default' => baseTheme()->__( 'Default (1352px)' ),
			    'narrow'  => baseTheme()->__( 'Narrow (1124px)' ),
		    ],
		    'wrapper'           => [
			    'width' => '50%',
		    ],
	    ],
        [
            'key'               => 'field_' . $fieldKey . 'background_glow',
            'label'             => baseTheme()->__( 'Background glow' ),
            'name'              => $fieldKey . 'background_glow',
            'type'              => 'select',
            'default_value'     => 'none',
            'choices'           => [
                'none'              => baseTheme()->__( 'None' ),
                'corner'            => baseTheme()->__( 'Corner' ),
                'middle-blue-green' => baseTheme()->__( 'Middle blue & green' ),
                'middle-blue-black' => baseTheme()->__( 'Middle blue & black' ),
                'middle-green-blue' => baseTheme()->__( 'Middle green & blue' ),
            ],
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_' . $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'default',
                    ],
                ],
            ],
            'wrapper'           => [
                'width' => '50%',
            ],
        ],
        [
            'key'               => 'field_' . $fieldKey . 'background_glow_side',
            'label'             => baseTheme()->__( 'Side' ),
            'name'              => $fieldKey . 'background_glow_side',
            'type'              => 'select',
            'default_value'     => 'left',
            'choices'           => [
                'left'  => baseTheme()->__( 'Left' ),
                'right' => baseTheme()->__( 'Right' ),
            ],
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_' . $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'default',
                    ],
                ],
            ],
            'wrapper'           => [
                'width' => '50%',
            ],
        ],
        [
            'key'               => 'field_' . $fieldKey . 'background_image',
            'label'             => baseTheme()->__( 'Background image' ),
            'name'              => $fieldKey . 'background_image',
            'type'              => 'image',
            'return_format'     => 'array',
            'preview_size'      => 'medium',
            'library'           => 'all',
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_' . $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'image',
                    ],
                ],
            ],
            'wrapper'           => [
	            'width' => '50%',
            ],
        ],
        [
            'key'               => 'field_' . $fieldKey . 'image_overlay',
            'label'             => baseTheme()->__( 'Add overlay' ),
            'name'              => $fieldKey . 'image_overlay',
            'type'              => 'select',
            'default_value'     => 'overlay-50',
            'choices'           => [
	            'overlay-0'  => baseTheme()->__( 'No overlay' ),
	            'overlay-50'  => baseTheme()->__( 'Overlay - default' ),
                'overlay-100' => baseTheme()->__( 'Overlay - dark' ),
            ],
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_' . $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'image',
                    ],
                ],
            ],
            'wrapper'           => [
	            'width' => '50%',
            ],
        ],
        [
            'key'           => 'field_' . $fieldKey . 'padding_top',
            'label'         => baseTheme()->__( 'Top padding' ),
            'name'          => $fieldKey . 'padding_top',
            'type'          => 'select',
            'default_value' => 'default',
            'choices' => [
                'default' => baseTheme()->__('Default (80px)'),
                'half' => baseTheme()->__('Half (40px)'),
                'none' => baseTheme()->__('None (0px)'),
            ],
            'wrapper'           => [
	            'width' => '33%',
            ],
        ],
        [
            'key'           => 'field_' . $fieldKey . 'gap',
            'label'         => baseTheme()->__( 'Gap' ),
            'name'          => $fieldKey . 'gap',
            'type'          => 'select',
            'default_value' => 'default',
            'choices'       => [
                'default' => baseTheme()->__( 'Default' ),
                'half'    => baseTheme()->__( 'Half' ),
            ],
            'wrapper'           => [
				    'width' => '33%',
            ],
        ],
        [
            'key'           => 'field_' . $fieldKey . 'padding_bottom',
            'label'         => baseTheme()->__( 'Bottom padding' ),
            'name'          => $fieldKey . 'padding_bottom',
            'type'          => 'select',
            'default_value' => 'default',
            'choices' => [
                'default' => baseTheme()->__('Default (80px)'),
                'half' => baseTheme()->__('Half (40px)'),
                'none' => baseTheme()->__('None (0px)'),
            ],
            'wrapper'           => [
					'width' => '33%',
            ],
        ],
    ],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/background',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
