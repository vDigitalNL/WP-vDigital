<div class="container">
	<?php if ( ! empty( $footerColumns = (array) baseTheme()->getOption( 'footer.footer_column', [] ) ) ): ?>
	    <div class="row">
	        <?php foreach ( $footerColumns as $footerColumn ): ?>
	            <div class="col-12 col-md-6 col-lg">
	                <h2>
	                    <?php echo esc_html($footerColumn['column_title']); ?>
	                </h2>

		            <ul class="list-unstyled">
		                <?php foreach( (array) $footerColumn['column_content'] as $footerColumnContent ): ?>
			                <?php
				                switch ( $footerColumnContent['content_type'] ?? 'link' ) {
					                case 'email':
						                $type   = 'mailto:';
						                $text   = $footerColumnContent['content_text'];
						                $link   = 'mailto:' . $footerColumnContent['content_link_mailtel'];
						                $target = '_self';
						                break;

					                case 'tel':
						                $type   = 'tel:';
						                $text   = $footerColumnContent['content_text'];
						                $link   = 'tel:' . $footerColumnContent['content_link_mailtel'];
						                $target = '_self';
						                break;

					                default:
						                $text   = $footerColumnContent['content_text']
							                ?: $footerColumnContent['content_link']['title'];
						                $link   = $footerColumnContent['content_link']['url'];
						                $target = $footerColumnContent['content_link']['target'] ?: '_self';
				                }
		                    ?>
			                <li>
				                <a href="<?php echo esc_url( $link ); ?>" target="<?php echo esc_attr( $target ); ?>">
					                <?php echo esc_html( $text ); ?>
				                </a>
			                </li>
		                <?php endforeach; ?>
		            </ul>
	            </div>
	        <?php endforeach; ?>
	    </div>
	<?php endif; ?>

    <div class="row d-flex flex-column flex-lg-row justify-content-between align-items-center align-items-lg-stretch">
        <div class="mt-1 mt-lg-0 mb-1 mb-lg-0">
			<span class="bt-copyright">
				<?php echo esc_html( baseTheme()->getOption( 'footer.copyright_text' ) ); ?>
			</span>
        </div>

		<?php if ( ! empty( $footerAdditionalMenu = (array) baseTheme()->getOption('footer.additional_footer_menu', [] ) ) ): ?>
            <div>
                <ul class="bt-additional-menu list-unstyled list-inline">
					<?php foreach( $footerAdditionalMenu as $additionalMenuItem ): ?>
						<?php
						$text   = $additionalMenuItem['item_text'] ?: $additionalMenuItem['item_link']['title'];
						$link   = $additionalMenuItem['item_link']['url'];
						$target = $additionalMenuItem['item_link']['target'] ?: '_self';
						?>
                        <li class="list-inline-item">
                            <a href="<?php echo esc_url( $link ); ?>" target="<?php echo esc_attr( $target ); ?>">
								<?php echo esc_html( $text ); ?>
                            </a>
                        </li>
					<?php endforeach; ?>
                </ul>
            </div>
		<?php endif; ?>

		<?php baseTheme()->Frontend->Html->loadTemplatePart( 'footer/branding' ) ?>
    </div>
</div>