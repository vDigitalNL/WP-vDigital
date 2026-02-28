<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

class Title
{
    public static function getFields(string $baseKey): array {
        $fields = [
            [
                'key'     => $baseKey. 'title_heading_type',
                'label'   => baseTheme()->__( 'Title heading type' ),
                'name'    => $baseKey. 'title_heading_type',
                'type'    => 'select',
                'choices' => [
                    'h1' => baseTheme()->__( 'H1' ),
                    'h2' => baseTheme()->__( 'H2' ),
                ],
            ],
            [
                'key'        => $baseKey. 'title_rows',
                'label'      => baseTheme()->__( 'Title rows' ),
                'name'       => $baseKey. 'title_rows',
                'type'       => 'repeater',
                'layout'     => 'block',
                'sub_fields' => [
                    [
                        'key'         => $baseKey. 'title_type',
                        'label'       => baseTheme()->__( 'Title type' ),
                        'name'        => $baseKey. 'title_type',
                        'type'        => 'true_false',
                        'ui'          => 1,
                        'ui_on_text'  => baseTheme()->__( 'Section title' ),
                        'ui_off_text' => baseTheme()->__( 'Regular title' ),
                    ],
                    [
                        'key'               => $baseKey. 'title_text',
                        'label'             => baseTheme()->__( 'Title text' ),
                        'name'              => $baseKey. 'title_text',
                        'type'              => 'text',
                        'conditional_logic' => [
                            [
                                [
                                    'field'    => $baseKey. 'title_type',
                                    'operator' => '==',
                                    'value'    => '0',
                                ],
                            ],
                        ],
                    ],
                    [
                        'key'               => $baseKey. 'title_sections',
                        'label'             => baseTheme()->__( 'Title sections' ),
                        'name'              => $baseKey. 'title_sections',
                        'type'              => 'repeater',
	                    'layout'            => 'row',
                        'conditional_logic' => [
                            [
                                [
                                    'field'    => $baseKey. 'title_type',
                                    'operator' => '==',
                                    'value'    => '1',
                                ],
                            ],
                        ],
                        'sub_fields'        => [
                            [
                                'key'   => $baseKey. 'title_sections_text',
                                'label' => baseTheme()->__( 'Title section text' ),
                                'name'  => $baseKey. 'title_sections_text',
                                'type'  => 'text',
                            ],
                            [
                                'key'   => $baseKey. 'title_sections_swapping',
                                'label' => baseTheme()->__( 'Title section swapping' ),
                                'name'  => $baseKey. 'title_sections_swapping',
                                'type'  => 'true_false',
                                'ui'    => 1,
                            ],
                            [
                                'key'        => $baseKey. 'title_sections_swap_texts',
                                'label'      => baseTheme()->__( 'Title section swap texts' ),
                                'name'       => $baseKey. 'title_sections_swap_texts',
                                'type'       => 'repeater',
                                'sub_fields' => [
                                    [
                                        'key'   => $baseKey. 'title_sections_swap_texts_text',
                                        'label' => baseTheme()->__( 'Title section swap text' ),
                                        'name'  => $baseKey. 'title_sections_swap_texts_text',
                                        'type'  => 'text',
                                    ],
                                ],
                                'conditional_logic' => [
                                    [
                                        [
                                            'field'    => $baseKey. 'title_sections_swapping',
                                            'operator' => '==',
                                            'value'    => '1',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        return $fields;
    }

    public static function render(string $baseKey) {
        $file = 'template-parts/title';

        $rows = get_field( $baseKey . 'title_rows' ) ?: [];
        $rows = array_map(function($row) use($baseKey) {
            $sections = $row[$baseKey . 'title_sections'];
            if(is_array($sections)) {
                $sections = array_map(function($section) use($baseKey) {
                    $swapText = $section[$baseKey . 'title_sections_swap_texts'];
                    if(is_array($swapText)) {
                        $swapText = array_map(function($text) use($baseKey) {
                            return $text[$baseKey . 'title_sections_swap_texts_text'];
                        }, $swapText);
                    }

                    return [
                        'text' => $section[$baseKey . 'title_sections_text'],
                        'swapping' => $section[$baseKey . 'title_sections_swapping'],
                        'swap_texts' => $swapText,
                    ];
                }, $sections);
            }

            return [
                'type' => $row[$baseKey . 'title_type'],
                'text' => $row[$baseKey . 'title_text'],
                'sections' => $sections,
            ];
        }, $rows);

        $args = [
            'heading_type' => get_field($baseKey . 'title_heading_type') ?? 'h1',
            'rows' => $rows,
        ];

        return get_template_part($file, null, $args);
    }

    public static function getCssClasses(string $headingType) {
        return match ( $headingType ) {
            'h1' => 'tw-font-size-h1-banner tw-mb-4 sm:tw-mt-0 sm:tw-mb-8',
            'h2' => 'tw-font-size-h2-banner tw-mb-6 sm:tw-mb-7',
            default => '',
        };
    }
}