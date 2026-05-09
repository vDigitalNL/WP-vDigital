<?php
	use Theme\BaseTheme\General\AcfGroups\FlexibleContentBox\Columns;
?>
<div class="row fcb__columns">
	<?php while( have_rows( 'field__columns__cols' ) ) : the_row() ?>
		<?php
			$colClasses = [];

			foreach ( Columns::getScreenSizes() as $screenSize ) {
				$screenSize      = $screenSize !== 'xs' ? $screenSize : '';
				$screenSizeAffix = $screenSize ? "_{$screenSize}" : '';

				$colWidth = get_sub_field( 'field__columns__cols__col_width' . $screenSizeAffix ) ?? '';
				$colWidth = is_numeric( $colWidth ) ? (int) $colWidth : $colWidth;

				// An empty string means "inherit from the previous screen size", so we can just omit the col class
				if ( $colWidth !== '' ) {
					$colClasses[] =
						'col' . ( $screenSize ? "-{$screenSize}" : '' ) . ( $colWidth ? "-{$colWidth}" : '' );
				}
			}
		?>
		<div class="<?php echo esc_attr( implode( ' ', $colClasses ) ); ?>">

			<?php
				// Call and print the loopFlexibleContent() function, which loops over the available
				//  "field__flexible_content_box__wrapper" fields automatically
				print baseTheme()->General->AcfGroups->FlexibleContentBox->loopFlexibleContent( '' );
			?>

		</div><!-- .row.fcb__columns .<?php echo esc_attr( implode( '.', $colClasses ) ); ?>-->
	<?php endwhile; ?>
</div><!-- .row.fcb__columns -->