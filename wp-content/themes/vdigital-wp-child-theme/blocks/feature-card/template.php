<?php

$imageId = get_field('feature_card_icon');
$icon = $imageId ? wp_get_attachment_image_src($imageId, 'full') : null;

$title = get_field('feature_card_title');
$description = get_field('feature_card_description');

if (is_admin()): ?>
    <h3><?php echo baseTheme()->__('Feature card') ?></h3>
<?php endif; ?>

<div class="feature-card tw-flex tw-flex-col tw-text-white">
    <?php if ($imageId && is_array($icon)) : ?>
        <div class="feature-card__icon tw-h-[33px] tw-flex tw-mr-auto tw-mb-[40px]">
            <img class="tw-w-full tw-h-full tw-object-contain" src="<?php echo esc_url($icon[0]); ?>" alt="<?php echo esc_attr($title); ?>">
        </div>
    <?php endif; ?>

    <?php if ($title) : ?>
        <h3 class="small tw-uppercase tw-mb-[22px] tw-block"><?php echo nl2br(esc_html($title)); ?></h3>
    <?php endif; ?>

    <?php if ($title && $description) : ?>
        <div class="tw-w-[80px] tw-h-[1px] tw-bg-white tw-mb-[28px]"></div>
    <?php endif; ?>

    <?php if ($description) : ?>
        <p><?php echo nl2br(esc_html($description)); ?></p>
    <?php endif; ?>
</div>