<?php if ( have_posts() ) : ?>
	<header class="page-header">
		<h1 class="page-title">
			<?php
				/* translators: %s: search query. */
				printf( baseTheme()->esc_html__( 'Search Results for: %s' ), '<span>' . get_search_query() . '</span>' );
			?>
		</h1>
	</header>

	<?php
	/* Start the Loop */
	while ( have_posts() ) {
		the_post();

		/**
		 * Run the loop for the search to output the results.
		 * If you want to overload this in a child theme then include a file
		 * called content-search.php and that will be used instead.
		 */
		baseTheme()->Frontend->Html->loadTemplatePart( 'content-search' );
	}

	the_posts_navigation();
	?>

<?php else : ?>
	<?php baseTheme()->Frontend->Html->loadTemplatePart( 'content-none' ); ?>
<?php endif; ?>