<?php

use ChildTheme\ChildTheme\Helpers\Image;

$showAllTitle = get_field('marketplace_show_all_title', 'option') ?: '';
$showAllDescription = get_field('marketplace_show_all_description', 'option') ?: '';
$showAllImage = Image::getImageUrl( get_field('marketplace_show_all_image', 'option') );
$hasContent = $showAllTitle || $showAllDescription || $showAllImage;
$spacingClasses = 'tw-mb-[80px] lg:tw-pr-[94px] md:tw-pt-[80px]';
?>

<div class="marketplace__category-info tw-z-10 tw-relative <?php echo $spacingClasses; ?> <?php echo $hasContent ? '' : 'tw-hidden'; ?>">
    <div class="tw-rounded-lg tw-flex tw-flex-col md:tw-flex-row tw-gap-5">
        <div class="tw-flex-1">
            <h2 class="marketplace__category-info__title tw-text-2xl tw-font-bold tw-mb-4 tw-text-gray-black"><?php echo esc_html($showAllTitle); ?></h2>
            <div class="marketplace__category-info__description tw-text-focus wysiwyg__content"><?php echo wp_kses_post($showAllDescription); ?></div>
        </div>
        <div class="tw-w-full md:tw-w-1/2 <?php echo $showAllImage ? '' : 'tw-hidden'; ?>">
            <img src="<?php echo esc_url($showAllImage); ?>"
                 alt="<?php echo esc_attr($showAllTitle); ?>" 
                 class="marketplace__category-info__image tw-w-full tw-max-h-[400px] md:tw-h-[400px] tw-object-cover tw-h-auto tw-object-cover tw-rounded-[20px]">
        </div>
    </div>
</div>
