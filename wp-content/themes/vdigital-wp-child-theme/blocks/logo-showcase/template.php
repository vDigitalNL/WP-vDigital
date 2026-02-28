<?php

$galleryPid = get_field('field_logo_showcase') ?: 0;
$logoIds = get_field('logo-showcase_post_logo_gallery', $galleryPid) ?: [];
$logoRepeater = get_field('logo-showcase_post_logo_repeater', $galleryPid) ?: [];
?>
<?php if (is_admin()): ?>
    <h3><?php echo esc_html(baseTheme()->__('Logo showcase')); ?></h3>
<?php endif; ?>

<div class="logo-showcase tw-flex tw-flex-col tw-items-stretch tw-gap-20">
    <div class="logo-showcase__logos tw-grid tw-gap-4 tw-justify-items-center tw-justify-center md:tw-justify-between tw-items-center ">
        <?php foreach ($logoRepeater as $logoItem): ?>
            <?php
            $logoImage = $logoItem['logo_image'] ?? null;
            if ( ! empty( $logoImage ) && is_numeric( $logoImage ) ) {
                $logoImage = [
                    'url' => wp_get_attachment_image_url( $logoImage, 'full' ),
                    'alt' => get_post_meta( $logoImage, '_wp_attachment_image_alt', true ),
                ];
            }
            if (!$logoImage || empty($logoImage['url'])) {
                continue;
            }
            ?>
            <img
                src="<?php echo esc_url($logoImage['url'] ?: ''); ?>"
                class="tw-max-h-10"
                alt="<?php echo esc_attr($logoImage['alt'] ?: ''); ?>"
                loading="lazy"
                decoding="async">
        <?php endforeach; ?>
    </div>
</div>