<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#site-navbar"
        aria-controls="site-navbar" aria-expanded="false" aria-label="Toggle navigation">
	<span class="navbar-toggler-icon"></span>
</button>

<?php
	$menuClasses = [ 'navbar-nav' ];

	switch ( baseTheme()->getOption( 'header.navbar.menu_alignment', 'left' ) ) {
		case 'center':
			$menuClasses[] = 'm-auto';
			break;
		case 'right':
			$menuClasses[] = 'ml-auto';
			break;
		default:
			$menuClasses[] = 'mr-auto';
	}

	baseTheme()->Frontend->Html->loadNavMenu( 'primary', [
		'menu_class' => implode( ' ', $menuClasses ),
	] );