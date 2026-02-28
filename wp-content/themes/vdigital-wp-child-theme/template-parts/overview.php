<?php

use classes\Glow;

$title           = $args['title'] ?? false;
$highlightedPost = $args['highlightedPost'] ?? null;
$posts           = $args['posts'] ?? [];
$categories      = $args['categories'] ?? [];
$more            = $args['more'] ?? true;
$postType        = $args['postType'] ?? 'post';
$category        = $args['category'] ?? 'all';
$postsPerPage    = $args['postsPerPage'] ?? 9;

$glowType = 'middle-blue-green';
$glowSrc = Glow::getGradient($glowType);
$glowClass = Glow::getCssClasses($glowType, 'right');
?>

<div class="overview tw-max-w-[1352px] tw-mx-auto w-pb-[69px] md:tw-pb-[98px] tw-px-[15px] lg:tw-px-0 tw-mb-[80px] md:tw-mb-[20px] tw-relative"
	data-show-all="<?php echo $args['showAll'] ?? 0 ?>"
	data-post-type="<?php echo $postType; ?>" data-highlighted-post="<?php echo $highlightedPost->ID ?? false ?>">

	<div class="tw-max-w-[1124px] tw-mx-auto tw-flex tw-flex-col tw-justify-center tw-gap-[25px] tw-min-h-[380px] lg:tw-min-h-[600px] tw-relative tw-py-[80px] md:tw-py-[170px]">
		<div class="tw-absolute <?php echo esc_attr($glowClass); ?> md:tw-translate-x-[22%]">
			<img src="<?php echo esc_url($glowSrc); ?>" class="tw-max-w-none" />
		</div> <?php if ($title): ?>
			<div class="tw-text-left tw-relative tw-z-10">
				<h1 class="small"><?php echo $title; ?></h1>
			</div>
		<?php endif;
				if (apply_filters('ww_overview_filters_visible', true)):
					echo get_template_part('template-parts/overview', 'filters', [
						'categories' => $categories,
						'category'   => $category,
					]);
				endif; ?>
	</div>
	<div class="overview__container container tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-y-10 tw-gap-x-5 tw-relative tw-z-10 tw-mt-0 md:tw-mt-[80px]">
		<?php echo get_template_part('template-parts/overview', 'cards', [
			'highlightedPost' => $highlightedPost,
			'posts'           => $posts,
			'postType'        => $postType
		]); ?>
	</div>
	<div class="tw-flex tw-mt-12 tw-justify-center">

	</div>
	<?php if (apply_filters('ww_overview_show_more_button_visible', true)): ?>
		<div class="tw-flex tw-mt-12 tw-justify-center <?php echo $more ? '' : 'tw-hidden' ?>">
			<button class="btn button--blue overview__load-more "
				data-post-type="<?php echo $postType; ?>"
				data-offset="<?php echo $postsPerPage; ?>"
				data-category="<?php echo $category; ?>">
				<?php echo baseTheme()->__('Load more'); ?>
			</button>
		</div>
	<?php endif; ?>
</div>