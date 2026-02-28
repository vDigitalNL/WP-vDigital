<?php

$fieldKey = 'field_banner_';

acf_add_local_field_group([
    'key'                   => 'group_banner',
    'title'                 => baseTheme()->__('Banner'),
    'layout'                => 'table',
    'fields'                => [
        [
            'key'           => $fieldKey . 'background_type',
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
            'key'               => $fieldKey . 'background_glow',
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
                        'field'    => $fieldKey . 'background_type',
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
            'key'               => $fieldKey . 'background_glow_side',
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
                        'field'    => $fieldKey . 'background_type',
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
            'key'               => $fieldKey . 'background_image',
            'label'             => baseTheme()->__( 'Background image' ),
            'name'              => $fieldKey . 'background_image',
            'type'              => 'image',
            'return_format'     => 'array',
            'preview_size'      => 'medium',
            'library'           => 'all',
            'conditional_logic' => [
                [
                    [
                        'field'    => $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'image',
                    ],
                ],
            ],
            'wrapper'           => [
	            'width' => '50%',
            ],
        ],
        // tablet image (for responsiveness)
        [
            'key'               => $fieldKey . 'tablet_background_image',
            'label'             => baseTheme()->__( 'Alternative background tablet (optional)' ),
            'name'              => $fieldKey . 'tablet_background_image',
            'type'              => 'image',
            'return_format'     => 'array',
            'preview_size'      => 'medium',
            'library'           => 'all',
            'conditional_logic' => [
                [
                    [
                        'field'    => $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'image',
                    ],
                ],
            ],
            'wrapper'           => [
	            'width' => '50%',
            ],
        ],
        // phone image
        [
            'key'               => $fieldKey . 'mobile_background_image',
            'label'             => baseTheme()->__( 'Alternative background mobile (optional)' ),
            'name'              => $fieldKey . 'mobile_background_image',
            'type'              => 'image',
            'return_format'     => 'array',
            'preview_size'      => 'medium',
            'library'           => 'all',
            'conditional_logic' => [
                [
                    [
                        'field'    => $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'image',
                    ],
                ],
            ],
            'wrapper'           => [
                'width' => '50%',
            ],
        ],
        // blurred image for mob (preload)
        [
            'key'               => $fieldKey . 'mobile_background_image_blurred',
            'name'              => $fieldKey . 'mobile_background_image_blurred',
            'label'             => baseTheme()->__('Background mobile blurred image'),
            'instructions'      => baseTheme()->__('This helps improve loading speed by temporarily loading an alternate (blurred) image.'),
            'type'              => 'image',
            'return_format'     => 'array',
            'preview_size'      => 'medium',
            'library'           => 'all',
            'conditional_logic' => [
                [
                    [
                        'field'    => $fieldKey . 'background_type',
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
            'key'               => $fieldKey . 'image_overlay',
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
                        'field'    => $fieldKey . 'background_type',
                        'operator' => '==',
                        'value'    => 'image',
                    ],
                ],
            ],
            'wrapper'           => [
	            'width' => '50%',
            ],
        ],
    ],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/banner',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
