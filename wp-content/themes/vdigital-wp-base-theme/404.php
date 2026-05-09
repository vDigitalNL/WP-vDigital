<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package Web_Whales_Base_Theme
 */

get_header();
?>

<div id="primary" class="content-area">
	<main id="main" class="site-main container">
		<div class="row">
			<div class="col">
				<header class="page-header">
					<h1 class="page-title"><?php echo baseTheme()->esc_html__( 'Oops! That page can\'t be found.' ); ?></h1>
				</header>
			</div>
		</div>

		<div class="row">
			<div class="col">
				<main class="page-content">
					<p><?php echo baseTheme()->esc_html__( 'It looks like nothing was found at this location. Maybe try one of the links below or a search?' ); ?></p>

					<?php
						get_search_form();

						the_widget( 'WP_Widget_Recent_Posts' );
					?>

					<div class="widget widget_categories">
						<h2 class="widget-title"><?php echo baseTheme()->esc_html__( 'Most Used Categories' ); ?></h2>
						<ul>
							<?php
								wp_list_categories( [
									'orderby'    => 'count',
									'order'      => 'DESC',
									'show_count' => 1,
									'title_li'   => '',
									'number'     => 10,
								] );
							?>
						</ul>
					</div><!-- .widget -->

					<?php
						/* translators: %1$s: smiley */
						$base_theme_archive_content = '<p>' . sprintf( baseTheme()->esc_html__( 'Try looking in the monthly archives. %1$s' ), convert_smilies( ':)' ) ) . '</p>';
						the_widget( 'WP_Widget_Archives', 'dropdown=1', "after_title=</h2>$base_theme_archive_content" );
						the_widget( 'WP_Widget_Tag_Cloud' );
					?>

				</main>
			</div>
	</main><!-- #main -->
</div><!-- #primary -->

<?php
	get_sidebar();
	get_footer();