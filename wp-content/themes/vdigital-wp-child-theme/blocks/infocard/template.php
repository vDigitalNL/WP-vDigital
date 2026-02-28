<?php

$imageId = get_field('infocard_icon');
$icon = $imageId ? wp_get_attachment_image_src($imageId, 'full') : null; // full, to allow svg without issues

$title = get_field('infocard_title');
$description = get_field('infocard_description');
$link = get_field('infocard_link');

if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Info card' ) ?></h3>
<?php endif; ?>

<div class="infocard tw-flex tw-flex-col tw-items-start tw-gap-10 font--dm-sans tw-text-white">
    <div class="infocard__top tw-flex tw-flex-row tw-gap-5 tw-items-center">
        <?php if ($imageId && is_array($icon)) : ?>
                <img class="tw-aspect-square tw-object-contain tw-object-center tw-max-w-[40px] tw-h-[40px]" src="<?php echo esc_url($icon[0]); ?>" alt="<?php echo esc_attr($title); ?>">
        <?php endif; ?>

        <?php if ($title) : ?>
            <div class="infocard__top__title tw-text-xl tw-uppercase text-current tw-font-bold"><?php echo esc_html($title); ?></div>
        <?php endif; ?>
    </div>
    <?php if ($description) : ?>
        <div class="infocard__description tw-text-xl text-current tw-font-light"><?php echo esc_html($description); ?></div>
    <?php endif; ?>

</div>