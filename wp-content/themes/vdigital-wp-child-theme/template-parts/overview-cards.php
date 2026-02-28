<?php

$posts           = $args['posts'] ?? [];
$highlightedPost = $args['highlightedPost'] ?? null;
$postType        = $args['postType'] ?? null;
$isReview        = $postType === 'ww_customer_reviews';

if ($highlightedPost) : ?>
    <?php
	$categories = match ( $postType ) {
		'ww_customer_reviews' => get_the_terms( $highlightedPost->ID, 'ww_customer_reviews_categories' ),
		'post' => get_the_category( $highlightedPost->ID ),
		default => []
	};

	if(!empty($categories)) {
		$categoriesClassList = implode(" ", array_map(fn($category) => 'category-' . $category->term_id, $categories));
	}

	$imageUrl = get_the_post_thumbnail_url($highlightedPost);
	$labelStyle = 'dark';
	if(! $imageUrl) {
		$imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
		$labelStyle = 'light';
	}

	?>
    <a href="<?php echo get_permalink($highlightedPost->ID) ?>"
       class="overview__container__highlighted-item overview__filter__item <?php echo $categoriesClassList ?? ''; ?> <?php echo $categoriesClassList ?? ''; ?> tw-relative tw-h-full tw-w-full tw-flex tw-flex-col tw-justify-end md:tw-col-span-2 md:tw-row-span-2 tw-overflow-hidden  gradient--default-overlay-images">

	   <img src="<?php echo $imageUrl ?>" onerror="this.src='data:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='" alt=""
			class="tw-inset-0 tw-absolute tw-w-full tw-h-full tw-object-cover tw-rounded-t-[20px] tw-rounded-b-[23px] tw-z-10 tw-bg-core">

        <div class="content tw-z-30 tw-p-10 lg:tw-p-20 tw-min-h-[176px] sm:tw-min-h-[130px] md:tw-min-h-[176px] tw-h-full tw-w-full tw-flex tw-gap-[18px] tw-flex-col tw-justify-end tw-items-end tw-text-right">
            <?php
            echo get_template_part('template-parts/overview-labels', null, [
                'post'     => $highlightedPost,
                'postType' => $postType,
				'labelStyle' => $labelStyle,
            ]); ?>
            <h2 class="md:tw-text-white"><?php echo $highlightedPost->post_title; ?></h2>
        </div>
    </a>
<?php endif; ?>

<?php foreach ($posts as $index => $post):
	echo get_template_part( 'template-parts/post-card', null, [
		'post'            => $post,
		'isReview'        => $isReview,
		'postType'        => $postType,
		'highlightedPost' => $highlightedPost,
        'index'           => $index,
	] ); ?>
<?php endforeach; ?>

<p class="overview__no-results tw-text-base tw-text-center tw-w-full tw-hidden tw-col-span-3 md:tw-text-gray-02"><?php echo baseTheme()->__('No results found.'); ?></p>