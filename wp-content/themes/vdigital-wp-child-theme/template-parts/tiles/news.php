<?php

use ChildTheme\ChildTheme\Helpers\Acf\Tiles;
use ChildTheme\ChildTheme\Helpers\News;

$id          = $args['articleId'] ?? null;
$article     = get_post($id);
$image       = get_the_post_thumbnail_url($id, 'full');
$imageMobile = get_the_post_thumbnail_url($id, 'news_tile_small');
$link        = get_permalink($id);
$label       = get_field('blog_post_type', $id);
$labelColor  = News::getLabelBackgroundColorClass($label);
$style       = [];
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

$postTitle = $article->post_title;
if(strlen($postTitle) > 48) {
    $postTitle = substr($postTitle, 0, 48) . '...';
}
$hideOnMobile     = $args['hideOnMobile'] ?? false;
$hideOnTablet     = $args['hideOnTablet'] ?? false;
$hideClasses      = [
    $hideOnMobile && (! $hideOnTablet) ? 'tw-hidden sm:tw-flex ' : '',
    $hideOnMobile && $hideOnTablet ? 'tw-hidden md:tw-flex ' : '',
    (! $hideOnMobile) && $hideOnTablet ? 'tw-flex sm:tw-hidden md:tw-flex ' : '',
];

?>

<?php if (! empty($article)) : ?>
    <div style="<?php echo implode(' ', $style); ?>"
         class="tile--news tile tw-bg-gray-01 tw-flex tw-items-center sm:tw-flex-col tw-justify-end tw-bg-red-600 tw-rounded-3xl tw-relative tw-overflow-hidden tw-pl-2 sm:tw-pl-0 <?php echo implode(' ',
             $hideClasses);
         echo implode(' ',
             Tiles::getWidthClasses($desktopWidth,
                 $mobileWidth)); ?> tile--h-desktop-<?php echo $desktopHeight ?> tile--h-mobile-<?php echo $mobileHeight ?> lg:hover:tw-scale-[1.05]">
        <div class="tile--news__background tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-3/4 tw-z-10 tw-hidden sm:tw-block"></div>
        <?php if (! empty($imageMobile)) : ?>
            <img class="sm:tw-hidden tw-object-cover tw-w-full max-width-24 tw-h-[93px] tw-rounded-2xl tw-mr-4"
                 src="<?php echo $imageMobile ?>" alt="">
        <?php endif; ?>
        <?php if (! empty($link)): ?>
        <a href="<?php echo $link; ?>"
           class="tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center sm:tw-justify-end tw-relative tw-z-10 tw-p-2 sm:tw-px-5 sm:tw-py-5">
            <?php endif; ?>

            <?php if (! empty($label)) : ?>
                <div class="tw-py-1 sm:tw-py-1.5 tw-px-[11px] sm:tw-px-2.5 tw-mb-2 sm:tw-mb-[17px] tw-rounded-2xl tw-mr-auto tw-text-white tw-text-[8px] sm:tw-text-[10px] tw-leading-[9px] sm:tw-leading-[11px] tw-uppercase <?php echo $labelColor ?>">
                    <?php echo $label ?>
                </div>
            <?php endif; ?>
            <div class="tw-flex tw-items-end">
                <p class="tw-w-full tw-text-lg sm:tw-text-xl tw-text-gray-black sm:tw-text-white tw-font-bold tw-hidden sm:tw-block tw-hyphens-auto">
                    <?php echo $article->post_title; ?>
                </p>
                <p class="tw-w-full tw-text-lg sm:tw-text-xl tw-text-gray-black sm:tw-text-white tw-font-bold tw-block sm:tw-hidden tw-hyphens-auto">
                    <?php echo $postTitle; ?>
                </p>

                <?php if (! empty($link)): ?>
                <div class="tw-hidden sm:tw-block tw-mt-2 tw-p-0.5 tw-w-6 tw-h-6 tw-bg-white tw-rounded-full tw-flex-grow-0 tw-flex-shrink-0">
                    <img src="/wp-content/themes/vdigital-wp-child-theme/assets/images/arrow-black.svg" alt=""/>
                </div>
            </div>
        </a>
    <?php endif; ?>
    </div>
<?php endif; ?>
