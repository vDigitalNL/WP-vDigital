<?php

use ChildTheme\ChildTheme\Helpers\Image;

$categories    = $args['categories'] ?? [];
$filterClasses = [
	'marketplace__filters__category md:tw-pb-2 tw-cursor-pointer'
];

// Get "Show all" content from options page
$showAllTitle = get_field('marketplace_show_all_title', 'option') ?: '';
$showAllDescription = get_field('marketplace_show_all_description', 'option') ?: '';
$showAllImage = Image::getImageUrl( get_field('marketplace_show_all_image', 'option') );
?>

<div class="tw-pb-[80px] md:tw-pb-[170px]">
    <!-- Mobile Dropdown -->
    <div class="md:tw-hidden tw-mb-5 tw-relative tw-z-50">
        <div class="input__select marketplace__filters__select">
            <select class="marketplace__filters__select-input">
                <option value="all" 
                        data-category-title="<?php echo esc_attr($showAllTitle); ?>"
                        data-category-description="<?php echo esc_attr($showAllDescription); ?>"
                        data-category-image="<?php echo esc_attr($showAllImage); ?>">
                    <?php echo baseTheme()->__('Show all') ?>
                </option>
                <?php foreach ( $categories as $index => $category ):
                    $categoryTitle = get_field('marketplace_category_title', 'ww_api_connections_categories_' . $category->term_id) ?: '';
                    $categoryImage = Image::getImageUrl( get_field('marketplace_category_image', 'ww_api_connections_categories_' . $category->term_id) );
                ?>
                    <option value="<?php echo $category->term_id; ?>"
                            data-category-title="<?php echo esc_attr($categoryTitle); ?>"
                            data-category-description="<?php echo esc_attr($category->description); ?>"
                            data-category-image="<?php echo esc_attr($categoryImage); ?>">
                        <?php echo esc_html($category->name); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>

    <!-- Desktop Buttons -->
    <div class="tw-hidden md:tw-flex tw-flex-wrap tw-gap-5">
        <a class="btn button--blue <?php echo implode( ' ', $filterClasses ) ?>"
           data-category="all"
           data-category-title="<?php echo esc_attr($showAllTitle); ?>"
           data-category-description="<?php echo esc_attr($showAllDescription); ?>"
           data-category-image="<?php echo esc_attr($showAllImage); ?>"><?php echo baseTheme()->__('Show all') ?></a>
        <?php foreach ( $categories as $index => $category ):
            $categoryTitle = get_field('marketplace_category_title', 'ww_api_connections_categories_' . $category->term_id) ?: '';
            $categoryImage = get_field('marketplace_category_image', 'ww_api_connections_categories_' . $category->term_id);
            
            // Handle both array and ID return formats
            if (is_array($categoryImage)) {
                $categoryImageUrl = $categoryImage['url'] ?? '';
            } elseif (is_numeric($categoryImage)) {
                $categoryImageUrl = wp_get_attachment_image_url($categoryImage, 'full') ?: '';
            } else {
                $categoryImageUrl = '';
            }
        ?>
            <a class="btn button--outline <?php echo implode( ' ', $filterClasses ) ?>"
               data-category="<?php echo $category->term_id; ?>"
               data-category-title="<?php echo esc_attr($categoryTitle); ?>"
               data-category-description="<?php echo esc_attr($category->description); ?>"
               data-category-image="<?php echo esc_attr($categoryImageUrl); ?>"><?php echo esc_html($category->name); ?></a>
        <?php endforeach; ?>
    </div>
</div>
