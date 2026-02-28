<?php

$fieldKey = 'steps_';

acf_add_local_field_group([
    'key'      => 'group_steps_new',
    'title'    => baseTheme()->__( 'Steps' ),
    'fields'   => [
        [
            'key'          => 'field_' . $fieldKey . 'steps',
            'label'        => baseTheme()->__( 'Steps' ),
            'name'         => $fieldKey . 'steps',
            'type'         => 'repeater',
            'min'          => 1,
            'layout'       => 'block',
            'button_label' => baseTheme()->__( 'Add step' ),
            'sub_fields'   => [
                [
                    'key'      => 'field_' . $fieldKey . 'step_title',
                    'label'    => baseTheme()->__( 'Step title' ),
                    'name'     => $fieldKey . 'step_title',
                    'type'     => 'text',
                    'required' => 1,
                ],
                [
                    'key'   => 'field_' . $fieldKey . 'step_text',
                    'label' => baseTheme()->__( 'Step text' ),
                    'name'  => $fieldKey . 'step_text',
                    'type'  => 'textarea',
                ],
                [
                    'key'          => 'field_' . $fieldKey . 'step_tiles',
                    'label'        => baseTheme()->__( 'Tiles' ),
                    'name'         => $fieldKey . 'step_tiles',
                    'type'         => 'repeater',
                    'min'          => 1,
                    'max'          => 2,
                    'layout'       => 'block',
                    'button_label' => baseTheme()->__( 'Add tile' ),
                    'instructions' => baseTheme()->__( 'You can add 1 full width tile or 2 smaller ones.' ),
                    'sub_fields'   => [
                        [
                            'key'           => 'field_' . $fieldKey . 'tile_image',
                            'label'         => baseTheme()->__( 'Image' ),
                            'name'          => $fieldKey . 'tile_image',
                            'type'          => 'image',
                            'return_format' => 'array',
                            'preview_size'  => 'medium',
	                        'required' => 1
                        ],
                        [
                            'key'      => 'field_' . $fieldKey . 'tile_title',
                            'label'    => baseTheme()->__( 'Title' ),
                            'name'     => $fieldKey . 'tile_title',
                            'type'     => 'text',
                        ],
                        [
                            'key'   => 'field_' . $fieldKey . 'tile_text',
                            'label' => baseTheme()->__( 'Text' ),
                            'name'  => $fieldKey . 'tile_text',
                            'type'  => 'textarea',
                        ],
	                    [
		                    'key'   => 'field_' . $fieldKey . 'tile_link',
		                    'label' => baseTheme()->__( 'Link' ),
		                    'name'  => $fieldKey . 'tile_link',
		                    'type'  => 'link',
	                    ],
                    ],
                ],
            ],
        ],
    ],
    'location' => [
        [
            [
                'param'    => 'block',
                'operator' => '==',
                'value'    => 'acf/steps',
            ],
        ],
    ],
    'active'   => true,
]);

// Overwriting error messages
add_filter('acf/validate_value/name=steps_tile_image', function ($valid, $value, $field, $input) {

	if ($valid !== true) {
		return baseTheme()->__('Image is required');
	}

	return $valid;

}, 10, 4);

add_filter('acf/validate_value/name=steps_tile_title', function ($valid, $value, $field, $input) {

	if ($valid !== true) {
		return baseTheme()->__('Title is required');
	}

	return $valid;

}, 10, 4);

add_filter('acf/validate_value/name=steps_step_title', function ($valid, $value, $field, $input) {

	if ($valid !== true) {
		return baseTheme()->__('Title is required');
	}

	return $valid;

}, 10, 4);

add_action('acf/input/admin_enqueue_scripts', function () {
	if (function_exists('acf_localize_text')) {
		acf_localize_text([
			'Maximum rows reached ({max} rows)' => baseTheme()->__('Maximum of 2 tiles per step reached')
		]);
	}
});