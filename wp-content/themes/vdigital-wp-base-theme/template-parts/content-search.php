<?php
/**
 * Template part for displaying results in search pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Web_Whales_Base_Theme
 */

	use Theme\WP\PostHtml;

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
		<?php the_title( sprintf( '<h2 class="entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>

		<?php if ( get_post_type() === 'post' ) : ?>
			<div class="entry-meta">
				<?php
					print PostHtml::postedOn();
					print PostHtml::postedBy();
				?>
			</div>
		<?php endif; ?>
	</header>

	<?php print PostHtml::thumbnail(); ?>

	<div class="entry-summary">
		<?php the_excerpt(); ?>
	</div>

	<footer class="entry-footer">
		<?php print PostHtml::entryFooter(); ?>
	</footer>
</article><!-- #post-<?php the_ID(); ?> -->
