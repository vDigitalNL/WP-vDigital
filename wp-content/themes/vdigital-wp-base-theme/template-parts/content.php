<?php
/**
 * Template part for displaying posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Web_Whales_Base_Theme
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
		<?php
			if ( is_singular() ) :
				the_title( '<h1 class="entry-title">', '</h1>' );
			else :
				the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' );
			endif;
		?>

		<?php if ( get_post_type() === 'post' ) : ?>
			<div class="entry-meta">
				<?php
					print \Theme\WP\PostHtml::postedOn();
					print \Theme\WP\PostHtml::postedBy();
				?>
			</div>
		<?php endif; ?>
	</header>

	<?php print \Theme\WP\PostHtml::thumbnail(); ?>

	<div class="entry-content">
		<?php
			the_content( sprintf(
				wp_kses(
					/* translators: %s: Name of current post. Only visible to screen readers */
					baseTheme()->__( 'Continue reading<span class="screen-reader-text"> "%s"</span>' ),
					[
						'span' => [
							'class' => [],
						],
					]
				),
				get_the_title()
			) );

			wp_link_pages( [
				'before' => '<div class="page-links">' . baseTheme()->esc_html__( 'Pages:' ),
				'after'  => '</div>',
			] );
		?>
	</div><!-- .entry-content -->

	<footer class="entry-footer">
		<?php print \Theme\WP\PostHtml::entryFooter(); ?>
	</footer><!-- .entry-footer -->
</article><!-- #post-<?php the_ID(); ?> -->