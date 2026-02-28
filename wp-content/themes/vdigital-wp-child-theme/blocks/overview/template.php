<?php

use Blocks\Overview\Overview;

$postType        = get_field('field_post_type') ?: 'post';
$highlightedPost = match ($postType) {
    'post' => get_field('field_highlighted_post'),
    'ww_customer_reviews' => get_field('field_highlighted_review'),
};

if ( is_admin() ): ?>
	<h3><?php echo baseTheme()->__( 'Post overview block' ) ?></h3>
<?php endif;

Overview::getInstance()->render(
    get_field('field_title') ?? false,
    $postType,
    'all',
    $highlightedPost ?: null,
    true
);
