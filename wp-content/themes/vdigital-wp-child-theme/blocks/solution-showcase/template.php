<?php
/**
 * Solution Showcase Block Template
 */

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
use ChildTheme\ChildTheme\Helpers\Acf\Heading;
use ChildTheme\ChildTheme\Helpers\Image;

// Get field values
$headingType       = get_field( 'solution_showcase_heading_type' ) ?: 'h2';
$title             = get_field( 'solution_showcase_title' );
$description       = get_field( 'solution_showcase_description' );
$titleButtonType   = get_field( 'solution_showcase_title_button_type' );
$sectorTiles       = get_field( 'solution_showcase_sector_tiles' ) ?: [];
$roleTiles         = get_field( 'solution_showcase_role_tiles' ) ?: [];

// Build heading tag and classes using Heading helper
$headingTag   = Heading::getTag( $headingType );
$headingClass = Heading::getClass( $headingType );

/**
 * Render a single tile
 *
 * @param array $tile Tile data containing image, title, and link
 */
$renderTile = function( array $tile ) {
	// Extract and process image data with responsive sizes
	// Use tiles_mobile (550px) for mobile/tablet, tiles_large (380px) for desktop
	$imageId = is_array( $tile['image'] ) ? $tile['image']['ID'] : $tile['image'];
	$imageMobileUrl = Image::getImageUrl( $tile['image'], 'tiles_showcase_mobile' );
	$imageDesktopUrl = Image::getImageUrl( $tile['image'], 'tiles_large' );
	$imageAlt = match ( true ) {
		is_array( $tile['image'] ) && ! empty( $tile['image']['alt'] ) => $tile['image']['alt'],
		is_numeric( $tile['image'] ) => get_post_meta( $tile['image'], '_wp_attachment_image_alt', true ) ?: '',
		default => ''
	};

	// Extract tile data
	$tileTitle  = $tile['title'] ?? '';
	$link       = $tile['link'] ?? [];
	$hasLink    = ! empty( $link['url'] );
	$linkUrl    = $hasLink ? $link['url'] : '#';
	$linkTarget = $hasLink && ! empty( $link['target'] ) ? $link['target'] : '_self';

	// Tile wrapper classes (height handled in SCSS for responsive behavior)
	$tileClasses = 'solution-showcase__tile tw-block tw-rounded-[20px] tw-overflow-hidden tw-relative tw-group';
	$wrapperTag  = $hasLink ? 'a' : 'div';
	$wrapperAttrs = $hasLink ? sprintf( 'href="%s" target="%s"', esc_url( $linkUrl ), esc_attr( $linkTarget ) ) : '';
	?>

	<<?php echo $wrapperTag; ?> <?php echo $wrapperAttrs; ?> class="<?php echo esc_attr( $tileClasses ); ?>">
		<?php if ( ! empty( $imageMobileUrl ) ): ?>
			<div class="solution-showcase__tile-image tw-relative tw-h-full tw-w-full tw-flex tw-flex-col tw-justify-end tw-rounded-[20px]">
				<img src="<?php echo esc_url( $imageMobileUrl ); ?>"
				     srcset="<?php echo esc_url( $imageMobileUrl ); ?> 550w, <?php echo esc_url( $imageDesktopUrl ); ?> 380w"
				     sizes="(min-width: 1280px) 380px, 550px"
				     alt="<?php echo esc_attr( $imageAlt ?: $tileTitle ); ?>"
				     class="tw-inset-0 tw-absolute tw-w-full tw-h-full tw-object-cover tw-rounded-t-[20px] tw-rounded-b-[23px] tw-z-[1]">

				<div class="solution-showcase__tile-content tw-z-[3] tw-pt-6 tw-px-6 tw-pb-10 tw-w-full">
					<?php if ( ! empty( $tileTitle ) ): ?>
						<h3 class="solution-showcase__tile-title tw-font-bold tw-text-lg tw-text-white">
							<?php echo nl2br(esc_html( $tileTitle )); ?>
						</h3>
					<?php endif; ?>
				</div>
			</div>
		<?php endif; ?>
	</<?php echo $wrapperTag; ?>>
	<?php
};

?>

<?php if ( is_admin() ): ?>
	<h3><?php echo baseTheme()->__( 'Solution showcase' ) ?></h3>
<?php endif; ?>

<div class="solution-showcase tw-w-full">
    <div class="solution-showcase__content-wrapper tw-mb-16">
        <div class="solution-showcase__title-wrapper tw-flex tw-flex-wrap tw-items-center <?php echo ! empty( $title ) ? 'tw-justify-between' : 'tw-justify-end'; ?> tw-gap-4">
            <?php if ( ! empty( $title ) ): ?>
                <<?php echo esc_attr( $headingTag ); ?> class="solution-showcase__title <?php echo esc_attr( $headingClass ); ?> tw-m-0 tw-order-1">
                <?php echo nl2br( esc_html( $title ) ); ?>
            </<?php echo esc_attr( $headingTag ); ?>>
            <?php endif; ?>

            <?php if ( ! empty( $description ) ): ?>
                <div class="solution-showcase__description tw-w-full tw-order-2 md:tw-order-3 tw-mt-4 md:tw-mt-0">
                    <?php echo wp_kses_post( $description ); ?>
                </div>
            <?php endif; ?>

            <!-- Toggle Button with a custom style -->
            <div class="solution-showcase__toggle tw-w-full md:tw-w-auto tw-flex-shrink-0 tw-order-3 md:tw-order-2">
                <?php
                $buttonClass = Buttons::getButtonClass( $titleButtonType ?? '' );
                ?>
                <button class="btn solution-showcase__toggle-btn tw-w-full sm:tw-w-auto <?php echo esc_attr( $buttonClass ); ?>" data-showcase="sector">
                    <?php echo baseTheme()->__( 'Show by role' ); ?>
                </button>
            </div>
        </div>
    </div>

	<!-- Sector Showcase -->
	<div class="solution-showcase__showcase solution-showcase__showcase--sector tw-mt-[15px] sm:tw-mt-[25px]" data-showcase-type="sector">
		<div class="solution-showcase__tiles">
			<?php foreach ( $sectorTiles as $tile ): ?>
				<div class="wrapper">
					<?php $renderTile( $tile ); ?>
				</div>
			<?php endforeach; ?>
		</div>

		<!-- Navigation Dots for Sector -->
		<div class="solution-showcase__navigation tw-flex tw-flex-col tw-items-center tw-justify-between tw-mt-6">
			<div class="dots tw-flex tw-flex-row tw-gap-[10px] tw-items-center">
				<?php for ( $i = 0; $i < count( $sectorTiles ); $i++ ): ?>
					<div class="dot tw-w-[10px] tw-h-[10px] tw-rounded-full tw-bg-horizon"></div>
				<?php endfor; ?>
			</div>
		</div>
	</div>

	<!-- Role Showcase -->
	<div class="solution-showcase__showcase solution-showcase__showcase--role tw-hidden tw-mt-[15px] sm:tw-mt-[25px]" data-showcase-type="role">
		<div class="solution-showcase__tiles">
			<?php foreach ( $roleTiles as $tile ): ?>
				<div class="wrapper">
					<?php $renderTile( $tile ); ?>
				</div>
			<?php endforeach; ?>
		</div>

		<!-- Navigation Dots for Role -->
		<div class="solution-showcase__navigation tw-flex tw-flex-col tw-items-center tw-justify-between tw-mt-6">
			<div class="dots tw-flex tw-flex-row tw-gap-[10px] tw-items-center">
				<?php for ( $i = 0; $i < count( $roleTiles ); $i++ ): ?>
					<div class="dot tw-w-[10px] tw-h-[10px] tw-rounded-full tw-bg-horizon"></div>
				<?php endfor; ?>
			</div>
		</div>
	</div>
</div>