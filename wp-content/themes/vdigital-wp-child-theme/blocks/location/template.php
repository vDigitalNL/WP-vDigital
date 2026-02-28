<?php
/**
 * Location Block Template.
 */

use ChildTheme\ChildTheme\Helpers\Image;

$image = Image::getImageUrl(get_field('location_image'));
$label = get_field('location_label');
$details = get_field('location_details') ?: [];
$routeTitle = get_field('location_route_title');
$routeContent = get_field('location_route_content');
$mapUrl = get_field('location_map_url');

if (is_admin()): ?>
    <h3><?php echo baseTheme()->__('Location block'); ?></h3>
<?php endif; ?>

<div class="location tw-overflow-hidden tw-rounded-[20px]">
    <?php if (!empty($image)): ?>
        <div class="location__image-container tw-relative">
            <img
                    src="<?php echo $image; ?>"
                    class="location__image tw-w-full tw-max-h-[194px] tw-object-cover"
            />
            <?php if (!empty($label)): ?>
                <div class="location__label tw-absolute tw-bottom-10 tw-right-10">
                    <?php
                    get_template_part(
                            'template-parts/labels/label',
                            'default',
                            [
                                'text' => $label,
                                'type' => 'dark',
                            ]
                    );
                    ?>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <div class="location__content tw-bg-white tw-p-8 lg:tw-px-[80px] lg:tw-pt-[40px] lg:tw-pb-[45px]">
        <?php if (!empty($details)): ?>
            <div class="location__details tw-grid tw-grid-cols-1 min-[500px]:tw-grid-cols-2 md:tw-grid-cols-1 min-[921px]:tw-grid-cols-2 tw-gap-6 lg:tw-gap-x-[45px] lg:tw-gap-y-[50px] tw-mb-[52px]">
                <?php foreach ($details as $detail): ?>
                    <div class="location__detail">
                        <?php if (!empty($detail['location_detail_title'])): ?>
                            <h3 class="small tw-mb-5 tw-block">
                                <?php echo esc_html($detail['location_detail_title']); ?>
                            </h3>
                        <?php endif; ?>
                        <?php if (!empty($detail['location_detail_content'])): ?>
                            <div class="location__detail-content !tw-text-core">
                                <?php echo wp_kses_post($detail['location_detail_content']); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($routeTitle) && !empty($routeContent)): ?>
            <div class="location__route tw-border-b-2 tw-border-mist">
                <div class="location__route-header tw-cursor-pointer tw-flex tw-justify-between tw-items-center tw-pb-10">
                    <span class="location__route-title tw-text-xl tw-font-bold !tw-text-core tw-uppercase">
                        <?php echo esc_html($routeTitle); ?>
                    </span>
                    <button class="location__route-toggle tw-w-10 tw-h-10 tw-rounded-full tw-bg-core tw-border-2 tw-border-sky tw-text-white tw-flex tw-items-center tw-justify-center tw-text-xl tw-font-bold">
                        <span class="location__route-icon-plus tw-leading-none tw-mt-[-4px]">+</span>
                        <span class="location__route-icon-minus tw-hidden tw-leading-none tw-mt-[-4px]">−</span>
                    </button>
                </div>
                <div class="location__route-content tw-hidden tw-pb-10 !tw-text-core">
                    <?php echo wp_kses_post($routeContent); ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
    <?php if (!empty($mapUrl)): ?>
        <div class="location__map tw-rounded-b-[19px] tw-overflow-hidden">
            <iframe
                    src="<?php echo esc_url($mapUrl); ?>"
                    width="100%"
                    height="452"
                    style="border:0;"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    class="tw-w-full"
            ></iframe>
        </div>
    <?php endif; ?>
</div>