<?php

use ChildTheme\ChildTheme\Helpers\Acf\Tiles;

$desktopWidth     = $args['desktopWidth'] ?? '';
$mobileWidth      = $args['mobileWidth'] ?? '';
$desktopHeight    = $args['desktopHeight'] ?? '';
$mobileHeight     = $args['mobileHeight'] ?? '';
$desktopDirection = $args['desktopDirection'] ?? 'horizontal';
$mobileDirection  = $args['mobileDirection'] ?? 'horizontal';
$hideOnMobile     = $args['hideOnMobile'] ?? false;
$hideOnTablet     = $args['hideOnTablet'] ?? false;
$hideClasses      = [
	$hideOnMobile && (! $hideOnTablet ) ? 'tw-hidden sm:tw-flex ' : '',
	$hideOnMobile && $hideOnTablet ? 'tw-hidden md:tw-flex ' : '',
	(! $hideOnMobile ) && $hideOnTablet ? 'tw-flex sm:tw-hidden md:tw-flex ' : '',
];

if ( empty( $args['image'] ) ) {
    return;
} ?>

<div style="background-image: url('<?php echo wp_get_attachment_image_url($args['image']['id'] ?? $args['image'], 'full') ?>')" class="tile--image tw-bg-no-repeat tw-bg-cover tw-bg-center tile tw-overflow-hidden tw-flex tw-flex-col tw-justify-between tw-bg-red-600 tw-rounded-3xl tw-pt-8 <?php echo implode( ' ', $hideClasses ); echo implode( ' ', Tiles::getWidthClasses( $desktopWidth, $mobileWidth ) ); ?> tile--h-desktop-<?php echo $desktopHeight ?> tile--h-mobile-<?php echo $mobileHeight ?>"></div>