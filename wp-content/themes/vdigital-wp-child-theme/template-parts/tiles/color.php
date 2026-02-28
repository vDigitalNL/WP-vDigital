<?php

use ChildTheme\ChildTheme\Helpers\Acf\Color;
use ChildTheme\ChildTheme\Helpers\Acf\Tiles;

$desktopWidth     = $args['desktopWidth'] ?? '';
$mobileWidth      = $args['mobileWidth'] ?? '';
$desktopHeight    = $args['desktopHeight'] ?? '';
$mobileHeight     = $args['mobileHeight'] ?? '';
$desktopDirection = $args['desktopDirection'] ?? 'horizontal';
$mobileDirection  = $args['mobileDirection'] ?? 'horizontal';

$cssClass     = [];
$cssClass[]   = Color::getCssClass( $args['color'] );
$tag          = ! empty( $args['link'] ) ? 'a' : 'div';
$hideOnMobile = $args['hideOnMobile'] ?? false;
$hideOnTablet = $args['hideOnTablet'] ?? false;
$hideClasses  = [
	$hideOnMobile && ( ! $hideOnTablet ) ? 'tw-hidden sm:tw-flex ' : '',
	$hideOnMobile && $hideOnTablet ? 'tw-hidden md:tw-flex ' : '',
	( ! $hideOnMobile ) && $hideOnTablet ? 'tw-flex sm:tw-hidden md:tw-flex ' : '',
];

?>

<<?php echo $tag ?> <?php echo $args['target'] ? 'target="'. $args['target'] .'"' : '' ?> <?php echo $args['link'] ? 'href="'. $args['link'] .'"' : '' ?> class="tile--color lg:hover:tw-scale-[1.05] tw-transition-transform tw-duration-300 tile--color--<?php echo $args['color'] ?> tile tw-overflow-hidden tw-flex tw-flex-col tw-justify-between tw-bg-red-600 tw-rounded-3xl tw-pt-8 <?php echo implode( ' ', $hideClasses ); echo implode(' ', $cssClass); ?>  <?php echo implode( ' ', Tiles::getWidthClasses( $desktopWidth, $mobileWidth ) ); ?> tile--h-desktop-<?php echo $desktopHeight ?> tile--h-mobile-<?php echo $mobileHeight ?>">
    <div>
        <?php if(!empty($args['title'])): ?>
            <?php if (! empty($args['link'])): ?>
                <div>
            <?php endif; ?>
            <div class="tw-mx-8 tw-flex tw-justify-between">
                <p class="tw-text-xl tw-font-bold"><?php echo $args['title']; ?></p>
                <?php if (! empty($args['link'])): ?>
                    <div class="tile--link-arrow tw-p-0.5 tw-w-6 tw-h-6 tw-rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>
                <?php endif; ?>
            </div>
            <?php if (! empty($args['link'])): ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>

        <?php if(!empty($args['text'])): ?>
            <p class="tw-mt-4 tw-mx-8 tw-text-base"><?php echo $args['text']; ?></p>
        <?php endif; ?>
    </div>

    <?php if(!empty($args['image'])): ?>
        <div class="tw-hidden sm:tw-block">
            <img src="<?php echo wp_get_attachment_image_url($args['image']['id'] ?? $args['image'], 'full'); ?>" alt="Tile image"/>
        </div>
    <?php endif; ?>
</<?php echo $tag ?>>