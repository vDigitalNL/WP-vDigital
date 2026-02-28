<?php
$post            = $args['post'] ?? false;
$postType        = $args['postType'] ?? null;
$isReview        = $postType === 'ww_customer_reviews';
$highlightedPost = $args['highlightedPost'] ?? null;
$index           = $args['index'] ?? 0;
$labels 		 = $args['labels'] ?? null;
$itemClass      = $args['itemClass'] ?? 'overview__container__item overview__filter__item';

$link   = get_permalink($post->ID);
$target = '_self';

if ($isReview) {
	$reviewSettings = get_field('ww_customer_review', $post->ID);
	$reviewType     = $reviewSettings['type'] ?? null;

	if ($reviewType === 'external' && ! empty($reviewSettings['link']['url'] ?? null)) {
		$link   = $reviewSettings['link']['url'];
		$target = '_blank';
	}
}

$heights = [
	'base'        => 'lg:tw-h-[280px]',
	'highlighted' => 'lg:tw-h-[600px]',
	'container'   => 'tw-min-h-[176px] sm:tw-min-h-[130px] md:tw-min-h-[176px]',
];

if ($postType === 'ww_customer_reviews') {
	$heights = [
		'base'        => 'lg:tw-h-[280px]',
		'highlighted' => 'lg:tw-h-[600px]',
		'container'   => 'tw-min-h-[251px] sm:tw-min-h-[205px] md:tw-min-h-[251px]',
	];
}

$categoriesClassList = '';
$categories          = match ($postType) {
	'ww_customer_reviews' => get_the_terms($post->ID, 'ww_customer_reviews_categories'),
	'post' => get_the_category($post->ID),
	default => []
};

$imageUrl = get_the_post_thumbnail_url($post);
$labelStyle = 'dark';
if(! $imageUrl) {
	$imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
	$labelStyle = 'light';
}

if (! empty($categories)) {
	$categoriesClassList = implode(" ", array_map(fn($category) => 'category-' . $category->term_id, $categories));
}
?>
<a href="<?php echo esc_url($link) ?>" target="<?php echo esc_attr($target); ?>"
	class="<?php echo $itemClass; ?>  <?php echo esc_html($categoriesClassList); ?> <?php echo esc_html($categoriesClassList) ?? ''; ?>  tw-overflow-hidden tw-flex tw-flex-col 
   <?php echo $heights['base']; ?>"
	data-index="<?php echo esc_attr($index); ?>">

	<div class=" image gradient--default-overlay-images dark tw-object-cover tw-bg-center tw-bg-cover tw-bg-no-repeat tw-h-full tw-w-full tw-flex tw-flex-col md:tw-justify-end">
		<img src="<?php echo $imageUrl  ?>" onerror="this.src='data:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='" alt=""
			class="tw-inset-0 tw-absolute tw-w-full tw-h-full tw-object-cover tw-rounded-t-[20px] tw-rounded-b-[23px] tw-z-10 tw-bg-core">
		<div class="content tw-z-30 tw-p-10 tw-min-h-[176px] sm:tw-min-h-[130px] md:tw-min-h-[176px] tw-h-full tw-w-full tw-flex tw-gap-[18px] tw-flex-col tw-justify-end tw-items-end tw-text-right">
			<?php
			echo get_template_part('template-parts/overview-labels', null, [
				'post'     => $post,
				'postType' => $postType,
				'class'    => 'tw-justify-end',
				'labels'   => $labels,
				'labelStyle' => $labelStyle,
			]); ?>
			<h3 class="md:tw-text-white"><?php echo $post->post_title; ?></h3>
		</div>
	</div>
</a>