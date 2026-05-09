<?php
	$contentDividerMarginY = get_sub_field( 'field__content_divider__margin_vertical' );

	if ( ! empty ( $contentDividerMarginY ) ) : $classes = [ 'content-divider-container', 'container', $contentDividerMarginY ]; ?>
		<div class="<?php echo implode( ' ', $classes ); ?>"></div>
	<?php endif;