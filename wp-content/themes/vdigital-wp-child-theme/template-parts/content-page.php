<?php
/**
 * Template part for displaying page content in page.php
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Web_Whales_Base_Theme
 */

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<?php print \Theme\WP\PostHtml::thumbnail(); ?>

    <div class="entry-content">
		<?php
		the_content();

		wp_link_pages( array(
			'before' => '<div class="page-links">' . baseTheme()->esc_html__( 'Pages:' ),
			'after'  => '</div>',
		) );
		?>
    </div>

</article><!-- #post-<?php the_ID(); ?> -->
