<?php

$fieldKey = 'location_';

acf_add_local_field_group([
    'key'                   => 'group_location',
    'title'                 => 'Location',
    'fields'                => [
        [
            'key'           => 'field_' . $fieldKey . 'image',
            'label'         => baseTheme()->__('Image'),
            'name'          => $fieldKey . 'image',
            'type'          => 'image',
            'required'      => 1,
            'return_format' => 'array',
            'preview_size'  => 'medium',
        ],
        [
            'key'      => 'field_' . $fieldKey . 'label',
            'label'    => baseTheme()->__('Label'),
            'name'     => $fieldKey . 'label',
            'type'     => 'text',
            'required' => 1,
        ],
        [
            'key'          => 'field_' . $fieldKey . 'details',
            'label'        => baseTheme()->__('Details'),
            'name'         => $fieldKey . 'details',
            'type'         => 'repeater',
            'instructions' => baseTheme()->__('Items will be added from left to right on the page. Blank items can be used to skip a position.'),
            'layout'       => 'row',
            'button_label' => baseTheme()->__('Add Detail'),
            'sub_fields'   => [
                [
                    'key'      => 'field_' . $fieldKey . 'detail_title',
                    'label'    => baseTheme()->__('Title'),
                    'name'     => $fieldKey . 'detail_title',
                    'type'     => 'text',
                    'required' => 1,
                ],
                [
                    'key'      => 'field_' . $fieldKey . 'detail_content',
                    'label'    => baseTheme()->__('Content'),
                    'name'     => $fieldKey . 'detail_content',
                    'type'     => 'wysiwyg',
                    'required' => 1,
                    'tabs'     => 'all',
                    'toolbar'  => 'basic',
                    'media_upload' => 0,
                ],
            ],
        ],
        [
            'key'   => 'field_' . $fieldKey . 'route_title',
            'label' => baseTheme()->__('Route information title'),
            'name'  => $fieldKey . 'route_title',
            'type'  => 'text',
            'required' => 1,
        ],
        [
            'key'   => 'field_' . $fieldKey . 'route_content',
            'label' => baseTheme()->__('Route information content'),
            'name'  => $fieldKey . 'route_content',
            'type'  => 'wysiwyg',
            'tabs'     => 'all',
            'toolbar'  => 'full',
            'media_upload' => 0,
        ],
        [
            'key'          => 'field_' . $fieldKey . 'map_url',
            'label'        => baseTheme()->__('Google Maps embed URL'),
            'name'         => $fieldKey . 'map_url',
            'type'         => 'url',
            'required'     => 0,
            'instructions' => baseTheme()->__('Plak hier de Google Maps embed-URL in het formaat <code>https://www.google.com/maps/embed/v1/place?key=JOUW_API_KEY&q=LOCATIE.</code> Zoek eerst in Google Maps naar de gewenste locatie en kopieer uit de URL het gedeelte na place/ tot aan de volgende / (bijvoorbeeld Dyflexis+B.V.). Deze waarde kan je gebruiken voor de LOCATIE uit het voorbeeld. Tot slot voeg je jullie API-key toe waar "JOUW_API_KEY" gebruikt wordt.'),
        ],
    ],
    'location'              => [
        [
            [
                'param'    => 'block',
                'operator' => '==',
                'value'    => 'acf/location',
            ],
        ],
    ],
    'position'              => 'normal',
    'style'                 => 'default',
    'label_placement'       => 'top',
    'instruction_placement' => 'label',
    'active'                => true,
]);