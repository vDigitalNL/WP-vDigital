<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$fieldKey = 'blog_slider_';

acf_add_local_field_group([
    'key'                   => 'group_blog_slider',
    'title'                 => 'Blog slider',
    'position' => 'acf_after_title',
    'fields'                => [
        [
            'key'          => 'field_items',
            'label'        => baseTheme()->__('Items'),
            'name'         => 'items',
            'type'         => 'repeater',
            'layout'       => 'block',
            'button_label' => baseTheme()->__('Add item'),
            'sub_fields'   => [
                [
                    'key'        => 'field_item_label',
                    'label'      => baseTheme()->__('Label'),
                    'name'       => 'label',
                    'type'       => 'group',
                    'layout'     => 'block',
                    'sub_fields' => [
                        [
                            'key'   => 'field_item_label_text',
                            'label' => baseTheme()->__('Label text'),
                            'name'  => 'text',
                            'type'  => 'text',
                        ],
                        [
                            'key'     => 'field_item_label_color',
                            'label'   => baseTheme()->__('Label color'),
                            'name'    => 'color',
                            'type'    => 'select',
                            'ui'      => 1,
                            'choices' => [
                                'label--dark'  => baseTheme()->__('Dark - default'),
                                'label label--white' => baseTheme()->__('White'),
                                'label' => baseTheme()->__('Outlined white'),
                            ],
                            'default_value' => 'label--dark',
                        ],
                    ],
                ],
                [
                    'key'   => 'field_item_title',
                    'label' => baseTheme()->__('Title'),
                    'name'  => 'content_title',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_item_description',
                    'label' => baseTheme()->__('Description'),
                    'name'  => 'content_description',
                    'type'  => 'textarea',
                    'rows'  => 3,
                ],
                [
                    'key'        => 'field_item_btn',
                    'label'      => baseTheme()->__('Button'),
                    'name'       => 'btn',
                    'type'       => 'group',
                    'layout'     => 'block',
                    'sub_fields' => [
	                    ...Buttons::getFields( $fieldKey . 'title_button_',
		                    false,
		                    [ '', 'outline', 'white_outline', 'green', 'dark_green', 'teal', 'cobalt' ]
	                    ),
                    ],
                ],
            ],
        ],
    ],
    'location'              => [
        [
            [
                'param'    => 'block',
                'operator' => '==',
                'value'    => 'acf/blog-slider',
            ],
        ],
    ],
    'position'              => 'normal',
    'style'                 => 'default',
    'label_placement'       => 'top',
    'instruction_placement' => 'label',
    'active'                => true,
]);
