<?php
/**
 * The template for displaying search results pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#search-result
 *
 * @package Web_Whales_Base_Theme
 */

get_header();
?>

<div id="primary" class="content-area">
	<main id="main" class="site-main container">
		<div class="row">
			<div class="col">
				<?php baseTheme()->Frontend->Html->loadTemplatePart( 'search' ); ?>
			</div>
		</div>
	</main><!-- #main -->
</div><!-- #primary -->

<?php
get_sidebar();
get_footer();