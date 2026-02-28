<?php

/**
 * new Banner Block Template.
 *
 * @uses classes\Glow
 * @uses ChildTheme\ChildTheme\Helpers\Image
 * @inspired by web/wp-content/themes/vdigital-wp-child-theme/blocks/background/template.php for background structure
 */

use ChildTheme\ChildTheme\Helpers\Image;
use classes\Glow;

$allowedBlocks = [
	'wp:acf/text',
];

$template = [
    [
        'acf/text', 
        [
            'data' => [
                'field_text_heading_type' => 'h1-small',
                'field_text_title' => '',
                'field_text_title_button' => '',
                'field_text_description' => '',
                'field_text_buttons' => ''
            ],
            'mode' => 'preview'
        ]
    ],
];

$backgroundType = get_field('field_banner_background_type') ?: 'default';
$glowType       = get_field('field_banner_background_glow') ?: 'none';
$glowSide       = get_field('field_banner_background_glow_side') ?: 'left';

$backgroundImage = get_field('field_banner_background_image');
$backgroundImageTablet = get_field('field_banner_tablet_background_image');
$backgroundImageMobile = get_field('field_banner_mobile_background_image');
$backgroundImageMobileBlurred = get_field('field_banner_mobile_background_image_blurred');

// Extract image URLs using Image helper
$bg           = Image::getImageUrl( $backgroundImage );
$bgTablet     = Image::getImageUrl( $backgroundImageTablet );
$bgMobile     = Image::getImageUrl( $backgroundImageMobile );
$bgMobileBlur = Image::getImageUrl( $backgroundImageMobileBlurred );

$imageOverlay    = get_field('field_banner_image_overlay') ?: null;

$outerBackgroundClass = match ($backgroundType) {
	'light' => 'tw-bg-horizon block__banner--light',
	'image' => 'tw-bg-center',
	default => 'tw-bg-transparent',
};


$glowSrc = Glow::getGradient($glowType);
$glowClass = Glow::getCssClasses($glowType, $glowSide);

$imageOverlayClass = match ($imageOverlay) {
	'overlay-50'  => 'tw-bg-core tw-opacity-40',
	'overlay-100' => 'tw-bg-core tw-opacity-80',
	default       => '',
};

// Build background image styles using Image helper
$imageStyles     = Image::buildBackgroundImageStyles( $bg, $bgTablet, $bgMobile, $bgMobileBlur );
$imageStyle      = $imageStyles['style'];
$preloadBlurAttr = $imageStyles['preloadBlurAttr'];
$sharpImageUrl   = $imageStyles['sharpImageUrl'];
$blurredImageUrl = $imageStyles['blurredImageUrl'];

// Generate preload link using Image helper
$preloadLink = Image::generatePreloadLink( $bg, $bgTablet, $bgMobile, $bgMobileBlur );
?>

<?php if (is_admin()): ?>
    <h3 class="tw-mx-auto tw-max-w-[1352px] tw-mb-3"><?php echo esc_html(baseTheme()->__('Banner block')); ?></h3>
<?php endif; ?>

<?php // Only output preload links on the frontend - not in admin/editor to avoid performance issues ?>
<?php if ( ! is_admin() ) echo $preloadLink; ?>

<div class="tw-z-10 block__banner break-container-padding <?php echo esc_attr($outerBackgroundClass); ?> tw-py-20 container-padding-mobile lg:tw-px-0 tw-relative tw-bg-cover tw-bg-no-repeat tw-min-h-[500px] lg:tw-min-h-[600px] tw-flex tw-items-center" style="<?php echo $imageStyle; ?>" <?php echo $preloadBlurAttr; ?><?php if ( $sharpImageUrl && $blurredImageUrl ): ?> data-sharp-image="<?php echo esc_attr( $sharpImageUrl ); ?>" data-blurred-image="<?php echo esc_attr( $blurredImageUrl ); ?>"<?php endif; ?>>
    <?php if ($backgroundType === 'default' && $glowType !== 'none' && ! empty($glowSrc)): ?>
        <div class="tw-absolute <?php echo esc_attr($glowClass); ?>">
            <img src="<?php echo esc_url($glowSrc); ?>" class="tw-max-w-none" />
        </div>
    <?php endif; ?>

    <div class="block__banner__content tw-w-full tw-mx-auto tw-max-w-[1124px] tw-relative tw-z-10">
        <InnerBlocks templateLock="all"
            allowedBlocks="<?php echo esc_attr( wp_json_encode( $allowedBlocks ) ); ?>"
            template="<?php echo esc_attr( wp_json_encode( $template ) ); ?>"
            class="tw-flex tw-flex-col tw-flex tw-flex-col tw-gap-[80px] lg:tw-gap-[160px]"
        />
    </div>

    <?php if (!empty($imageOverlay && $imageOverlay !== 'overlay-0') && $backgroundType === 'image'): ?>
        <div class="block__banner__overlay tw-block tw-absolute tw-w-full tw-bottom-0 tw-left-0 md:tw-left-0 tw-h-full <?php echo $imageOverlayClass ?>"></div>
    <?php endif; ?>
</div>
