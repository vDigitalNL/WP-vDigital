<?php
	// Prepare the header classes
	$headerClasses = ['mb-3'];

	if ( baseTheme()->getOption( 'header.navbar.sticky', true ) ) {
		$headerClasses[] = 'has-fixed-top-navbar';
	}

	$headerClasses = implode( ' ', baseTheme()->applyFilters( 'html/header_classes', $headerClasses ) );


	// Prepare the navbar classes
	$navbarColorScheme = \Theme\Helpers\Arr::filterValidOption( baseTheme()->getOption( 'header.navbar.color_scheme' ),
		['dark', 'light' ], 'light' );
	$navbarClasses = ['navbar', "navbar-{$navbarColorScheme}", 'bg-light'];

	if ( baseTheme()->getOption( 'header.navbar.sticky', true ) ) {
		$navbarClasses[] = 'fixed-top';
	}

	if ( ( $navbarExpandBreakpoint
			= \Theme\Helpers\Arr::filterValidOption( baseTheme()->getOption( 'header.navbar.expand_breakpoint', 'sm' ),
			[ 'off', 'xs', 'sm', 'md', 'lg', 'xl' ], 'sm' ) ) != 'off' ) {
		$navbarClasses[] = 'navbar-expand' . ( $navbarExpandBreakpoint != 'xs' ? '-' . $navbarExpandBreakpoint : '' );
	}

	$navbarClasses   = baseTheme()->applyFilters( 'html/navbar_classes', $navbarClasses );
	$navbarFullWidth = (bool) baseTheme()->getOption( 'header.navbar.full_width', false );
?>
<header id="site-header" role="banner" class="<?php echo esc_attr( $headerClasses ); ?>">
	<nav class="<?php echo \esc_attr( \implode( ' ', $navbarClasses ) ); ?>">
		<?php if ( ! $navbarFullWidth ) : ?><div class="container"><?php endif; ?>

			<a class="navbar-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
				<?php if ( is_front_page() && baseTheme()->getOption( 'header.navbar.logo_h1_tag_on_home', true ) ) : ?>
					<h1><?php echo baseTheme()->Frontend->Html->getSiteLogo(); ?></h1>
				<?php else : ?>
					<?php echo baseTheme()->Frontend->Html->getSiteLogo(); ?>
				<?php endif; ?>
			</a>

			<?php
				baseTheme()->Frontend->Html->loadTemplatePart( 'navbar',
					baseTheme()->getOption( 'header.navbar.template_variant', '' )
				);
			?>

		<?php if ( ! $navbarFullWidth ) : ?></div><?php endif; ?>
	</nav>
</header>