<button class="navbar-toggler navbar-toggler-style" type="button" data-toggle="collapse" data-target="#site-navbar"
        aria-controls="site-navbar" aria-expanded="false" aria-label="Toggle navigation">
	<span class="navbar-toggler-style__line"></span>
	<span class="navbar-toggler-style__line navbar-toggler-style__line--middle"></span>
	<span class="navbar-toggler-style__line navbar-toggler-style__line--last"></span>
</button>

<div id="site-navbar" class="header-top-row__menu collapse navbar-collapse main-menu-custom-walker">
	<?php baseTheme()->Frontend->Html->loadTemplatePart( 'navbar-before-menu' ); ?>

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
	?>

	<?php baseTheme()->Frontend->Html->loadTemplatePart( 'navbar-after-menu' ); ?>
</div>
