<?php
$postType = $args['postType'] ?? false;
global $post;

$query = new WP_Query( $args = [
	'post_type'      => $postType,
	'post__not_in'   => [ $post->ID ],
	'posts_per_page' => 3,
	'offset'         => match ( $postType ) {
		'post' => 3,
		default => 0,
	},
] );
?>

<div class="tw-flex tw-flex-col lg:tw-flex-row tw-gap-6">
	<?php if ( $query->have_posts() ) : ?>
		<?php while ( $query->have_posts() ) : $query->the_post(); ?>
            <div class="tw-flex-1">
				<?php
				$post = get_post();

				echo get_template_part( 'template-parts/post-card', null, [
					'post'     => $post,
					'postType' => $postType,
				] ); ?>
            </div>
		<?php
		endwhile;
		wp_reset_postdata(); ?>
	<?php endif; ?>
</div>