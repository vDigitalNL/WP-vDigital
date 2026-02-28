<?php

use Blocks\Marketplace\Marketplace;

$title = get_field('marketplace_title');

if ( is_admin() ): ?>
	<h3><?php echo baseTheme()->__( 'Marketplace block' ) ?></h3>
<?php endif;

Marketplace::getInstance()->render(
    $title ?: false
);
