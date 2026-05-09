<?php
/**
 * The template for displaying all single posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package Web_Whales_Base_Theme
 */

get_header();
?>

<div id="primary" class="content-area">
	<main id="main" class="site-main container">
		<div class="row">
			<div class="col">
				<?php
					while ( have_posts() ) {
						the_post();

						get_template_part( 'template-parts/content', get_post_type() );

						the_post_navigation();

						// If comments are open or we have at least one comment, load up the comment template.
						if ( comments_open() || get_comments_number() ) {
							comments_template();
						}
					}
				?>
			</div>
		</div>
	</main><!-- #main -->
</div><!-- #primary -->

<?php
get_sidebar();
get_footer();