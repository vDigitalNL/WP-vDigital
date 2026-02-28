<?php

$fieldKey = 'infocard_';

acf_add_local_field_group(
    [
        'key'                   => 'group_infocard',
        'title'                 => baseTheme()->__('Infocard block'),
        'fields'                => [


            [
                'key'   => 'field_' . $fieldKey . 'icon',
                'label' => baseTheme()->__('Icon'),
                'name'  => $fieldKey . 'icon',
                'type'  => 'image',
                'return_format' => 'ID',
                'preview_size' => 'small',
                'library' => 'all',
                'required'      => 0,
                'instructions' => baseTheme()->__('Recommended size: 40x40px. For SVG, height should be at least 40px.'),

            ],
            [
                'key'   => 'field_' . $fieldKey . 'title',
                'label' => baseTheme()->__('Title'),
                'name'  => $fieldKey . 'title',
                'type'  => 'text',
                'required'      => 1,
            ],
            [
                'key'   => 'field_' . $fieldKey . 'description',
                'label' => baseTheme()->__('Description'),
                'name'  => $fieldKey . 'description',
                'type'  => 'textarea',
                'required'      => 1,
            ]
        ],
        'location'              => [
            [
                [
                    'param'    => 'block',
                    'operator' => '==',
                    'value'    => 'acf/infocard',
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
