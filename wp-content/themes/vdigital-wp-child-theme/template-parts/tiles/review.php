<?php

use ChildTheme\ChildTheme\Helpers\Acf\Tiles;
use ChildTheme\ChildTheme\Helpers\News;

$id      = $args['reviewId'] ?? null;
$article = get_post($id);
$image   = get_the_post_thumbnail_url($id, 'full');

$label   = get_field('blog_post_type', $id);
$style   = [];
if (! empty($image)) {
    $style[] =
        'background-image: url(' . $image . ');';
}

$desktopWidth     = $args['desktopWidth'] ?? '';
$mobileWidth      = $args['mobileWidth'] ?? '';
$desktopHeight    = $args['desktopHeight'] ?? '';
$mobileHeight     = $args['mobileHeight'] ?? '';
$desktopDirection = $args['desktopDirection'] ?? 'horizontal';
$mobileDirection  = $args['mobileDirection'] ?? 'horizontal';
$reviewType       = get_field( 'ww_customer_review', $article->ID )['type'] ?? 'story';
$hideOnMobile     = $args['hideOnMobile'] ?? false;
$hideOnTablet     = $args['hideOnTablet'] ?? false;
$hideClasses      = [
	$hideOnMobile && ( ! $hideOnTablet ) ? 'tw-hidden sm:tw-flex ' : '',
	$hideOnMobile && $hideOnTablet ? 'tw-hidden md:tw-flex ' : '',
	( ! $hideOnMobile ) && $hideOnTablet ? 'tw-flex sm:tw-hidden md:tw-flex ' : '',
];
$link = $reviewType != 'external' ? get_permalink($id) : ( esc_attr(get_field('ww_customer_review', $article->ID)['link']['url'] ?? '#'));
$linkTarget = $reviewType == 'external' ? '_blank' : '_self';
?>

<?php if (! empty($article)) : ?>
    <div style="<?php echo implode(' ', $style); ?>"
         class="tile--review tile tw-bg-gray-01 tw-flex sm:tw-flex-col tw-justify-end tw-bg-red-600 tw-rounded-3xl tw-relative tw-overflow-hidden <?php echo implode( ' ', $hideClasses ); echo implode(' ',
             Tiles::getWidthClasses($desktopWidth,
                 $mobileWidth)); ?> tile--h-desktop-<?php echo $desktopHeight ?> tile--h-mobile-<?php echo $mobileHeight ?> lg:hover:tw-scale-[1.05]">
        <div class="tile--review__background tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-3/4 tw-z-10"></div>
        <?php if (! empty($link)): ?>
        <a href="<?php echo $link; ?>" target="<?php echo $linkTarget; ?>"
           class="tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-end tw-relative tw-z-10 tw-px-7 tw-py-7">
            <?php endif; ?>

            <?php if ($reviewType === 'video') : ?>
                <div class="tw-py-1.5 tw-px-2.5 tw-mb-2 tw-rounded-2xl tw-mr-auto tw-text-[10px] tw-leading-[11px] tw-uppercase tw-bg-gray-lighter tw-text-gray-02 tw-font-bold tw-flex tw-items-center   ">
                    <svg class="tw-w-2 tw-mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path fill="#5A6872"
                              d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
                    </svg>
                    <?php echo $reviewType ?>
                </div>
            <?php endif; ?>
            <div class="tw-flex tw-items-end">
                <p class="tw-w-full tw-text-lg sm:tw-text-xl tw-text-white tw-font-bold">
                    <?php echo $article->post_title; ?>
                </p>

                <?php if (! empty($link)): ?>
                <div class="tw-block tw-mt-2 tw-p-0.5 tw-w-6 tw-h-6 tw-bg-white tw-rounded-full tw-flex-grow-0 tw-flex-shrink-0">
                    <img src="/wp-content/themes/vdigital-wp-child-theme/assets/images/arrow-black.svg" alt="" />
                </div>
            </div>
        </a>
    <?php endif; ?>
    </div>
<?php endif; ?>
