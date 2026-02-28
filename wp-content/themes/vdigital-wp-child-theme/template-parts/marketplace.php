<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
use classes\Glow;

$title        = $args['title'] ?? false;
$posts        = $args['posts'] ?? [];
$categories   = $args['categories'] ?? [];
$more         = $args['more'] ?? false;
$category     = $args['category'] ?? 'all';
$postsPerPage = $args['postsPerPage'] ?? 11;
$totalPosts   = $args['totalPosts'] ?? 0;

$glowType = 'middle-blue-green';
$glowSrc = Glow::getGradient($glowType);
$glowClass = Glow::getCssClasses($glowType, 'left');
?>

<div class="marketplace tw-relative tw-pb-[60px] md:tw-pb-[98px] tw-z-10">
    <div class="tw-absolute lg:tw-ml-[-35px] !tw-top-[370px] tw-left-0 lg:tw-left-[unset] <?php echo esc_attr($glowClass); ?>">
        <img src="<?php echo esc_url($glowSrc); ?>" class="tw-max-w-none"/>
    </div>
    <div class="lg:tw-pl-[114px]">
        <div class="md:tw-min-h-[600px] tw-pt-[60px] md:tw-pt-[200px] tw-relative">

            <div class="tw-relative tw-z-20">
                <?php if ( $title ): ?>
                    <h1 class="small tw-mb-4 md:tw-mb-[25px]"><?php echo esc_html( $title ); ?></h1>
                <?php endif;

                echo get_template_part( 'template-parts/marketplace', 'filters', [
                    'categories' => $categories,
                    'category'   => $category,
                ] ); ?>
            </div>
        </div>

		<?php echo get_template_part( 'template-parts/marketplace', 'category-info' ); ?>
    </div>

    <div class="marketplace__container tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-6">
		<?php echo get_template_part( 'template-parts/marketplace-cards', null, [
			'posts' => $posts,
		] ); ?>
    </div>

	<?php if ( $more ): ?>
        <div class="marketplace__show-more-wrapper tw-flex tw-mt-[46px] tw-justify-center <?php echo Buttons::DEFAULT_WRAPPER_CLASSES ?>">
            <button class="marketplace__show-more btn button--blue md:tw-w-[438px] tw-max-w-full"
                    data-category="<?php echo esc_attr( $category ); ?>">
				<?php echo baseTheme()->__( 'Show more' ); ?>
            </button>
        </div>
	<?php endif; ?>
</div>
