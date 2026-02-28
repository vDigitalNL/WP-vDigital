<?php
$image = get_field( 'offset_image_image' ) ?? null;
$outside = get_field( 'offset_image_outside' ) ?? 'right';
$roundedCorners = (bool) ( get_field( 'offset_image_rounded_corners' ) ?? false );

$imageId = null;
if ( ! empty( $image ) ) {
    $imageId = ( is_array( $image ) && isset( $image['id'] ) ) ? $image['id'] : ( $image['ID'] ?? $image );
}

$outsideClass = match ( $outside ) {
    'left' => 'offset-image--left',
    default => 'offset-image--right',
};

$containerClasses = implode( ' ', [
        'offset-image',
        $outsideClass,
        $roundedCorners ? 'offset-image--rounded' : '',
] );

$imageClass = match ( $outside ) {
    'left' => 'md:tw-left-auto md:tw-right-0',
    default => 'md:tw-left-0 md:tw-right-auto',
};
?>

<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Offset image' ) ?></h3>
<?php endif; ?>

<div class="<?php echo esc_attr( $containerClasses ); ?> tw-w-full tw-h-[465px] md:tw-h-[360px] lg:tw-h-auto tw-overflow-hidden lg:tw-overflow-visible container-margin-mobile--negative md:tw-mx-0">
    <?php if ( ! empty( $imageId ) ): ?>
        <!-- The width is wider on purpose to make the image extend beyond the container -->
        <!-- By default this is the largest format, so the image shrinks instead of empty space gets filled up. -->
        <?php echo wp_get_attachment_image(
                $imageId,
                'full',
                false,
                [ 'class' => 'offset-image__img 
                    tw-w-full lg:tw-w-auto tw-h-full lg:tw-h-auto tw-object-fit
                    tw-max-w-none tw-min-h-full lg:tw-min-h-0 lg:tw-max-h-none  
                    tw-inset-x-1/2 lg:tw-inset-x-0 tw-translate-x-[-50%] md:tw-translate-x-0 tw-absolute lg:tw-relative ' . $imageClass ]
        ); ?>
    <?php endif; ?>
</div>