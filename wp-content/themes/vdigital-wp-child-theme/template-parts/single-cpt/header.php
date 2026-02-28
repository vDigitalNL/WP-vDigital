<?php

$overviewUrl = $args['overviewUrl'] ?? false;
$overviewText = $args['overviewText'] ?? baseTheme()->__( 'All stories' );

$featuredImageId = get_post_thumbnail_id();
$backgroundImage = wp_get_attachment_image_src($featuredImageId, 'full'); // todo get featured image
$imageOverlayClass = '';
$outerBackgroundClass = '';


$imageStyle = ! empty($backgroundImage) && is_array($backgroundImage) ? 'background-image: url(' . esc_url($backgroundImage[0]) . ')' : '';

$labelStyle = $imageStyle ? 'dark' : 'light';
?>

<div class="single_banner break-container-padding  tw-relative tw-mx-auto tw-max-w-[1512px] tw-bg-cover tw-bg-no-repeat sm:tw-min-h-[400px] lg:tw-min-h-[600px] tw-py-[80px] md:tw-py-[125px] tw-bg-cover tw-bg-center" style="<?php echo $imageStyle; ?>">
    <div class="tw-absolute tw-inset-0 tw-z-0 tw-bg-core tw-opacity-80"></div>
    <div class="tw-block 3xl:tw-hidden tw-absolute tw-w-full tw-bottom-0 <?php echo $imageOverlayClass ?> tw-h-full tw-z-10"></div>
    
    <div class="tw-mx-auto tw-max-w-[1352px] tw-px-4 tw-z-20 tw-relative">
        <div class="tw-mx-auto tw-max-w-[1124px] tw-flex tw-items-start tw-gap-4 sm:tw-gap-[80px] lg:tw-gap-[85px] tw-flex-col">
            <div class="row tw-flex tw-flex-col tw-gap-12 sm:tw-gap-2 sm:tw-flex-row tw-justify-between tw-w-full">
                <div class="">
                    <?php get_template_part( 'template-parts/buttons/back', '', [
                        'url'     => $overviewUrl,
                        'title'   => $overviewText,
                        'class'   => '!tw-text-[1.25rem]',
                    ] ); ?>
                </div>
                <div class="tw-text-gray-black tw-font-bold">
                    <?php get_template_part('template-parts/overview', 'labels', [
                        'post'     => get_post(),
                        'postType' => get_post_type(),
                        'labelStyle' => $labelStyle,
                    ]); ?>
                
                </div>
            </div>
            <div class="row">
                <h1 class="small"><?php the_title(); ?></h1>
            </div>
        </div>
    </div>
</div>