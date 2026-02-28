<?php

$fieldKey = 'feature_card_';

acf_add_local_field_group(
    [
        'key'                   => 'group_feature_card',
        'title'                 => baseTheme()->__('Feature card block'),
        'fields'                => [
            [
                'key'           => 'field_' . $fieldKey . 'icon',
                'label'         => baseTheme()->__('Icon'),
                'name'          => $fieldKey . 'icon',
                'type'          => 'image',
                'return_format' => 'ID',
                'preview_size'  => 'thumbnail',
                'library'       => 'all',
                'required'      => 0,
            ],
            [
                'key'      => 'field_' . $fieldKey . 'title',
                'label'    => baseTheme()->__('Title'),
                'name'     => $fieldKey . 'title',
                'type'     => 'textarea',
                'required' => 1,
            ],
            [
                'key'      => 'field_' . $fieldKey . 'description',
                'label'    => baseTheme()->__('Text'),
                'name'     => $fieldKey . 'description',
                'type'     => 'textarea',
                'required' => 0,
            ]
        ],
        'location'              => [
            [
                [
                    'param'    => 'block',
                    'operator' => '==',
                    'value'    => 'acf/feature-card',
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
