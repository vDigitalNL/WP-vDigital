<?php

class LogoShowcaseFields
{
    const BASE_KEY = 'logo-showcase_post';

    public function initialize(): void
    {
        $this->postTypeFields();
        $this->showcaseBlockFields();
    }

    /**
     * Note: This function defines an ACF repeater field instead of a gallery field
     * because the gallery field does not handle multisite correctly when 
     * retrieving images.
     * Tested on ACF version 6.6.1
     */
    public function postTypeFields(): void
    {
        if (!function_exists('acf_add_local_field_group')) {
            return;
        }
        acf_add_local_field_group([
            'key'      => self::BASE_KEY,
            'title'    => baseTheme()->__('Logo showcase'),
            'fields'   => [
                [
                    'key'           => 'field_' . self::BASE_KEY . '_logo_repeater',
                    'label'         => baseTheme()->__('Logo Gallery'),
                    'name'          => self::BASE_KEY . '_logo_repeater',
                    'type'          => 'repeater',
                    'required'      => 0,
                    'layout'        => 'table',
                    'button_label'  => baseTheme()->__('Add Logo'),
                    'sub_fields'    => [
                        [
                            'key'               => 'field_' . self::BASE_KEY . '_logo_image',
                            'label'             => baseTheme()->__('Logo Image'),
                            'name'              => 'logo_image',
                            'type'              => 'image',
                            'return_format'     => 'array',
                            'preview_size'      => 'medium',
                            'library'           => 'all',
                        ]
                    ],
                    'instructions' => baseTheme()->__('For best results, upload logos with transparent backgrounds. Logos will be displayed with a maximum resolution of 112px x 40px so landscape orientation is recommended. When possible, use SVG format for optimal clarity.'),
                ]
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => 'logo-showcase',
                    ],
                ],
            ],
            'active'   => true,
        ]);
    }

    public function showcaseBlockFields()
    {
        if (!function_exists('acf_add_local_field_group')) {
            return;
        }
        $first_showcase = get_posts([
            'post_type'      => 'logo-showcase',
            'posts_per_page' => 1,
            'orderby'        => 'date',
            'order'          => 'ASC',
            'fields'         => 'ids',
        ]);

        acf_add_local_field_group([
            'key'      => 'logo-showcase_block_fields',
            'title'    => baseTheme()->__('Logo Showcase Block Fields'),
            'fields'   => [
                [
                    'key'           => 'field_logo_showcase',
                    'label'         => baseTheme()->__('Select Logo Showcase'),
                    'name'          => 'field_logo_showcase',
                    'type'          => 'post_object',
                    'post_type'     => ['logo-showcase'],
                    'return_format' => 'id',
                    'ui'            => 1,
                    'default_value' => !empty($first_showcase) ? $first_showcase[0] : null,

                ]
            ],
            'location' => [
                [
                    [
                        'param'    => 'block',
                        'operator' => '==',
                        'value'    => 'acf/logo-showcase',
                    ],
                ],
            ],
            'active'   => true,
        ]);
    }
}

(new LogoShowcaseFields())->initialize();
