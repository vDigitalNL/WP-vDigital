<?php
use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$fieldKey = 'servicecard_';

acf_add_local_field_group( [
	'key'                   => 'group_servicecard',
	'title'                 => baseTheme()->__( 'Servicecard block' ),
	'fields'                => [
	

            [
                'key'   => 'field_' . $fieldKey . 'image',
                'label' => baseTheme()->__( 'Image' ),
                'name'  => $fieldKey . 'image',
                'type'  => 'image',
                'return_format' => 'ID',
                'preview_size' => 'medium',
                'library' => 'all',
                'required'      => 0,
            ],
            [
                'key'   => 'field_' . $fieldKey . 'title',
                'label' => baseTheme()->__( 'Title' ),
                'name'  => $fieldKey . 'title',
                'type'  => 'text',
                'required'      => 1,
            ],
            [
                'key'   => 'field_' . $fieldKey . 'description',
                'label' => baseTheme()->__( 'Description' ),
                'name'  => $fieldKey . 'description',
                'type'  => 'textarea',
                'required'      => 1,
            ],
            [
                'key'   => 'field_' . $fieldKey . 'link',
                'label' => baseTheme()->__( 'Link' ),
                'name'  => $fieldKey . 'link',
                'type'  => 'link',
                'required'      => 0,
            ],
        ],
        'location'              => [
            [
                [
                    'param'    => 'block',
                    'operator' => '==',
                    'value'    => 'acf/servicecard',
                ],
            ],
        ],
        'position'              => 'normal',
        'style'                 => 'default',
        'label_placement'       => 'top',
        'instruction_placement' => 'label',
        'active'                => true,
    ] 
);

