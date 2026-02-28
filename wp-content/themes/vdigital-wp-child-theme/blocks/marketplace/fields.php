<?php

$fieldKey = 'marketplace_';

acf_add_local_field_group([
    'key'                   => 'group_marketplace',
    'title'                 => 'Marketplace',
    'fields'                => [
        [
            'key'   => 'field_' . $fieldKey . 'title',
            'label' => baseTheme()->__('Title'),
            'name'  => $fieldKey . 'title',
            'type'  => 'text',
        ],
    ],
    'location'              => [
        [
            [
                'param'    => 'block',
                'operator' => '==',
                'value'    => 'acf/marketplace',
            ],
        ],
    ],
    'position'              => 'normal',
    'style'                 => 'default',
    'label_placement'       => 'top',
    'instruction_placement' => 'label',
    'active'                => true,
]);
