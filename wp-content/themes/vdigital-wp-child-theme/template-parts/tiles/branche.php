<?php

use ChildTheme\ChildTheme\Helpers\Acf\Tiles;

$desktopWidth     = $args['desktopWidth'] ?? '';
$mobileWidth      = $args['mobileWidth'] ?? '';
$desktopHeight    = $args['desktopHeight'] ?? '';
$mobileHeight     = $args['mobileHeight'] ?? '';
$desktopDirection = $args['desktopDirection'] ?? 'horizontal';
$mobileDirection  = $args['mobileDirection'] ?? 'horizontal';

$style = [];
if (! empty($args['image'])) {
    $style[] =
        'background-image: url(' . wp_get_attachment_image_url($args['image']['id'] ?? $args['image'], 'full') . ');';
}

$hideOnMobile = $args['hideOnMobile'] ?? false;
$hideOnTablet = $args['hideOnTablet'] ?? false;
$hideClasses  = [
	$hideOnMobile && (! $hideOnTablet ) ? 'tw-hidden sm:tw-flex ' : '',
	$hideOnMobile && $hideOnTablet ? 'tw-hidden md:tw-flex ' : '',
	(! $hideOnMobile ) && $hideOnTablet ? 'tw-flex sm:tw-hidden md:tw-flex ' : '',
];

?>

<div style="<?php echo implode(' ', $style); ?>"
     class="<?php echo implode( ' ', $hideClasses ); echo implode(' ', Tiles::getWidthClasses($desktopWidth,
         $mobileWidth)); ?>  tile--branche tile tile--h-desktop-<?php echo $desktopHeight ?> tile--h-mobile-<?php echo $mobileHeight ?> tw-flex tw-flex-col tw-justify-end tw-bg-red-600 tw-rounded-3xl <?php echo(empty($args['link']) ?
         'tw-px-5 tw-py-5' : '') ?> tw-relative tw-overflow-hidden lg:hover:tw-scale-[1.05]">
    <div class="tile--branche__background tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-3/4 tw-z-10"></div>
    <?php if (! empty($args['link'])): ?>
    <a href="<?php echo $args['link']; ?>"
       class="tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-end tw-relative tw-z-20 tw-items-start tw-px-5 tw-py-5">
        <?php endif; ?>

        <p class="tw-w-full tw-text-xs sm:tw-text-xl tw-text-white tw-font-bold tw-hyphens-auto">
            <?php echo $args['title']; ?>
        </p>

        <?php if (! empty($args['link'])): ?>
        <div class="tw-mt-2 tw-p-0.5 tw-w-6 tw-h-6 tw-bg-white tw-rounded-full tw-flex-grow-0 tw-flex-shrink-0">
            <img src="/wp-content/themes/vdigital-wp-child-theme/assets/images/arrow-black.svg" alt="" />
        </div>
    </a>
<?php endif; ?>
</div>
