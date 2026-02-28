<?php

acf_add_local_field_group([
    'key'                   => 'group_overview',
    'title'                 => 'Overview',
    'fields'                => [
        [
            'key'     => 'field_post_type',
            'label'   => baseTheme()->__('Post type'),
            'name'    => 'field_post_type',
            'type'    => 'select',
            'ui'      => 1,
            'choices' => [
                'post'                => baseTheme()->__('Blogs & news'),
                'ww_customer_reviews' => baseTheme()->__('Client cases'),
            ],
        ],
        [
            'key'               => 'field_highlighted_post',
            'label'             => baseTheme()->__('Highlighted post'),
            'name'              => 'field_highlighted_post',
            'type'              => 'post_object',
            'post_type'         => 'post',
            'return_format'     => 'object',
            'ui'                => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_post_type',
                        'operator' => '==',
                        'value'    => 'post',
                    ],
                ],
            ],
        ],
        [
            'key'               => 'field_highlighted_review',
            'label'             => baseTheme()->__('Highlighted post'),
            'name'              => 'field_highlighted_review',
            'type'              => 'post_object',
            'post_type'         => 'ww_customer_reviews',
            'return_format'     => 'object',
            'ui'                => 1,
            'conditional_logic' => [
                [
                    [
                        'field'    => 'field_post_type',
                        'operator' => '==',
                        'value'    => 'ww_customer_reviews',
                    ],
                ],
            ],
        ],
        [
            'key'   => 'field_title',
            'label' => baseTheme()->__('Title'),
            'name'  => 'field_title',
            'type'  => 'text',
        ],
    ],
    'location'              => [
        [
            [
                'param'    => 'block',
                'operator' => '==',
                'value'    => 'acf/overview',
            ],
        ],
    ],
]);

acf_add_local_field_group([
    'key'   => 'category_label_fields',
    'title' => '',
    'fields' => [
        [
            'key'               => 'category_label_fields_label',
            'label'             => baseTheme()->__('Label'),
            'name'              => 'label',
            'type'              => 'text',
            'instructions'      => baseTheme()->__('This label is displayed in the banner on the post and in the post overview.'),
        ],
    ],
    'location' => [
        [
            [
                'param'    => 'taxonomy',
                'operator' => '==',
                'value'    => 'category',
            ],
        ],
        [
            [
                'param'    => 'taxonomy',
                'operator' => '==',
                'value'    => 'ww_customer_reviews_categories',
            ],
        ],
    ]
]);
