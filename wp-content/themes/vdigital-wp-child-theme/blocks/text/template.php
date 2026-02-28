<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Text block' ) ?></h3>
<?php endif; ?>

<?php
/**
 * Text Block Template.
 */

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
use ChildTheme\ChildTheme\Helpers\Acf\Heading;

$title        = get_field( 'text_title' );
$description  = get_field( 'text_description' );
$buttons      = get_field( 'text_buttons' );
$headingType  = get_field( 'text_heading_type' ) ?: 'h2';
$titleIcon    = get_field( 'text_title_icon' );
$titleButton  = get_field( 'text_title_button' );

// Handle title icon if it's an ID instead of array
if ( ! empty( $titleIcon ) && is_numeric( $titleIcon ) ) {
	$titleIcon = [
		'url' => wp_get_attachment_image_url( $titleIcon, 'full' ),
		'alt' => get_post_meta( $titleIcon, '_wp_attachment_image_alt', true ),
	];
}

// Map heading type to HTML tag and CSS class using Heading helper
$headingData = Heading::getData( $headingType );

$headingTag = $headingData['tag'];
$headingClass = $headingData['class'];

?>

<div class="text-block tw-flex tw-flex-col tw-gap-5 md:tw-gap-10">
	<?php if ( ! empty( $title ) || ! empty( $titleButton ) ) : ?>
		<div class="text-block__title-wrapper tw-flex tw-flex-col tw-items-start md:tw-flex-row tw-flex-wrap md:tw-items-center tw-justify-between tw-gap-4">
			<?php if ( ! empty( $title ) ) : ?>
				<<?php echo $headingTag; ?> class="<?php echo $headingClass; ?> tw-m-0">
					<?php if ( $headingType === 'h3-small-with-icon' && ! empty( $titleIcon ) ) : ?>
						<img src="<?php echo esc_url( $titleIcon['url'] ); ?>" 
						     alt="<?php echo esc_attr( $titleIcon['alt'] ); ?>" 
						     class="tw-w-6 tw-h-6 md:tw-w-8 md:tw-h-8" />
					<?php endif; ?>
					<?php echo $title; ?>
				</<?php echo $headingTag; ?>>
			<?php endif; ?>
			
			<?php if ( ! empty( $titleButton ) && $headingType === 'h2' ) : ?>
				<div class="text-block__title-button tw-flex-shrink-0">
					<?php foreach ( $titleButton as $button ) : ?>
						<?php Buttons::render( $button, 'text_title_button_' ); ?>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	<?php endif; ?>
	
	<?php if ( ! empty( $description ) ) : ?>
		<div class="text-block__content wysiwyg__content">
			<?php echo $description; ?>
		</div>
	<?php endif; ?>
	
	<?php if ( ! empty( $buttons ) ) : ?>
		<div class="text-block__buttons <?php echo Buttons::DEFAULT_WRAPPER_CLASSES ?>">
			<?php foreach ( $buttons as $button ) : ?>
				<?php Buttons::render( $button, 'text_buttons_' ); ?>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</div>