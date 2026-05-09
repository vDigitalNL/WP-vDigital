<?php
/**
 * Template part for displaying a message that posts cannot be found
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Web_Whales_Base_Theme
 */

?>

<section class="no-results not-found">
	<header class="page-header">
		<h1 class="page-title"><?php echo baseTheme()->esc_html__( 'Nothing Found' ); ?></h1>
	</header>

	<div class="page-content">
		<?php
			if ( is_home() && current_user_can( 'publish_posts' ) ) :
				printf(
					'<p>' . wp_kses(
						/* translators: 1: link to WP admin new post page. */
						baseTheme()->__( 'Ready to publish your first post? <a href="%1$s">Get started here</a>.' ),
						[
							'a' => [
								'href' => [],
							],
						]
					) . '</p>',
					esc_url( admin_url( 'post-new.php' ) )
				);

			elseif ( is_search() ) : ?>
				<p><?php echo baseTheme()->esc_html__( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.' ); ?></p>

				<?php get_search_form(); ?>

			<?php else : ?>
				<p><?php echo baseTheme()->esc_html__( 'It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.' ); ?></p>

				<?php get_search_form(); ?>

			<?php endif;
		?>
	</div><!-- .page-content -->
</section><!-- .no-results -->
