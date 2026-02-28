<?php

namespace ChildTheme\ChildTheme\General\AcfFields;

use ChildTheme\ChildTheme\AbstractClass;

final class MarketplaceCategoryFields extends AbstractClass
{
    public function init(): void
    {
        acf_add_local_field_group([
                'key' => 'group_marketplace_category',
                'title' => '',
                'fields' => [
                        [
                                'key' => 'field_marketplace_category_title',
                                'label' => baseTheme()->__('Title'),
                                'name' => 'marketplace_category_title',
                                'instructions' => baseTheme()->__('This title is shown on the marketplace overview when the category filter is selected.'),
                                'type' => 'text',
                        ],
                        [
                                'key' => 'field_marketplace_category_image',
                                'label' => baseTheme()->__('Image'),
                                'name' => 'marketplace_category_image',
                                'instructions' => baseTheme()->__('This image is shown on the marketplace overview when the category filter is selected.'),
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                        ],
                ],
                'location' => [
                        [
                                [
                                        'param' => 'taxonomy',
                                        'operator' => '==',
                                        'value' => 'ww_api_connections_categories',
                                ],
                        ],
                ],
                'position' => 'normal',
                'active' => true,
        ]);

        add_filter('multilingualpress.taxonomy_metaboxes_order', [$this, 'prioritizeAcfFields']);
    }

    public function prioritizeAcfFields($order): int
    {
        return 11;
    }
}
