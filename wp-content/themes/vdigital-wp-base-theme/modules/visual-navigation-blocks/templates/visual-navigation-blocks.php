<?php
global $themeModule;

use Theme\Modules\VisualNavigationBlocks;

/**
 * @property-read VisualNavigationBlocks $themeModule
 */

if ( get_sub_field( 'field__visual_navigation_blocks__big_block' ) && !empty( get_sub_field( 'field__visual_navigation_blocks__small_blocks' ) ) ) :
	$icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none"><path d="M10.4 14.3L9.4 13.3 15.2 7.5 9.4 1.6 10.4 0.6 17.2 7.5 10.4 14.3Z" style="fill:white;stroke-width:0.8;stroke:white"/><path d="M14.5 7.4H2" style="stroke-width:2;stroke:white"/></svg>';
	$bigBlockPosition = get_sub_field( 'field__visual_navigation_blocks__big_block' )[ 'field__visual_navigation_blocks__big_block_position' ];
	$rowClass = $bigBlockPosition === 'right' ? 'flex-lg-row-reverse' : '';
	?>
    <div class="visual-navigation-blocks">
        <div class="row <?php echo $rowClass ?>">
            <div class="col-lg-6">
				<?php $bigBlock = get_sub_field( 'field__visual_navigation_blocks__big_block' ); ?>
                <a href="<?php echo $bigBlock[ 'field__visual_navigation_blocks__big_block_link' ][ 'url' ] ? $bigBlock[ 'field__visual_navigation_blocks__big_block_link' ][ 'url' ] : '' ?>"
                   class="visual-navigation-blocks__block visual-navigation-blocks__block--big"
                   style="background:url(<?php echo $bigBlock[ 'field__visual_navigation_blocks__big_block_image' ][ 'url' ] ? $bigBlock[ 'field__visual_navigation_blocks__big_block_image' ][ 'url' ] : '' ?>)">
					<?php print $themeModule->Frontend->Typography->returnTitleByFormat(
						$bigBlock[ 'field__visual_navigation_blocks__big_block_title' ] ? $bigBlock[ 'field__visual_navigation_blocks__big_block_title' ] : '',
						get_sub_field( 'field__visual_navigation_blocks__flexible_title_format' ),
						'visual-navigation-blocks__block__title'
					); ?>
                </a>
                <!-- /.visual-navigation-blocks__block -->
            </div>
            <div class="col-lg-6">
                <div class="visual-navigation-blocks__flexible">
					<?php foreach ( get_sub_field( 'field__visual_navigation_blocks__small_blocks' ) as $smallBlock ) : ?>
                        <a href="<?php echo $smallBlock[ 'field__visual_navigation_blocks__small_blocks_link' ][ 'url' ] ? $smallBlock[ 'field__visual_navigation_blocks__small_blocks_link' ][ 'url' ] : '' ?>"
                           class="visual-navigation-blocks__block visual-navigation-blocks__block--flexible"
                           style="background:url(<?php echo $smallBlock[ 'field__visual_navigation_blocks__small_blocks_image' ][ 'url' ] ? $smallBlock[ 'field__visual_navigation_blocks__small_blocks_image' ][ 'url' ] : '' ?>)">
							<?php print $themeModule->Frontend->Typography->returnTitleByFormat(
								$smallBlock[ 'field__visual_navigation_blocks__small_blocks_title' ] ? $smallBlock[ 'field__visual_navigation_blocks__small_blocks_title' ] : '',
								get_sub_field( 'field__visual_navigation_blocks__flexible_title_format' ),
								'visual-navigation-blocks__block__title',
								$icon
							); ?>
                        </a>
                        <!-- /.visual-navigation-blocks__block -->
					<?php endforeach ?>
                </div>
                <!-- /.visual-navigation-blocks__flexible -->
            </div>
        </div>
        <!-- /.row -->
    </div>
    <!-- /.visual-navigation-blocks -->
<?php endif;