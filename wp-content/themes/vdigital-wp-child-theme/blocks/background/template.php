<?php
/**
 * Container Block Template.
 */

use classes\Glow;

$backgroundType = get_field( 'field_container_background_type' ) ?: 'default';
$glowType       = get_field( 'field_container_background_glow' ) ?: 'none';
$glowSide       = get_field( 'field_container_background_glow_side' ) ?: 'left';

$contentLayout = get_field( 'field_container_content_layout' ) ?: 'default';
$paddingTop    = get_field( 'field_container_padding_top' ) ?: 'default';
$paddingBottom = get_field( 'field_container_padding_bottom' ) ?: 'default';
$gap           = get_field( 'field_container_gap' ) ?: 'default';

$backgroundImage = get_field( 'field_container_background_image' );
if ( ! empty( $backgroundImage ) && is_numeric( $backgroundImage ) ) {
	$backgroundImage = wp_get_attachment_image_url( $backgroundImage, 'full' );
} elseif(!empty($backgroundImage) && is_array($backgroundImage)) {
    $backgroundImage = $backgroundImage['url'];
}
$imageOverlay = get_field( 'field_container_image_overlay' ) ?: null;

$outerBackgroundClass = match ( $backgroundType ) {
	'light' => 'tw-bg-horizon block__background--light',
	'image' => 'tw-bg-center',
	default => 'tw-bg-transparent',
};

$paddingTopClass = match ( $paddingTop ) {
	'none' => 'tw-pt-0',
    'half' => 'tw-pt-[40px]',
	default => 'tw-pt-[80px]',
};

$paddingBottomClass = match ( $paddingBottom ) {
	'none' => 'tw-pb-0',
    'half' => 'tw-pb-[40px]',
	default => 'tw-pb-[80px]',
};

$gapClass = match ( $gap ) {
	'half' => 'tw-flex tw-flex-col tw-gap-[40px] lg:tw-gap-[80px]',
	default => 'tw-flex tw-flex-col tw-gap-[80px] lg:tw-gap-[160px]',
};

$widthClass = match ( $contentLayout ) {
	'narrow' => 'tw-max-w-[1124px]',
	default => 'tw-max-w-[1352px]',
};

$glowSrc = Glow::getGradient($glowType);
$glowClass = Glow::getCssClasses($glowType, $glowSide);

$containerClasses = implode( ' ', [
	'tw-relative',
	$outerBackgroundClass,
	$paddingTopClass,
	$paddingBottomClass,
] );

$innerContainerClasses = implode( ' ', [
	'tw-w-full',
	'tw-mx-auto',
	$widthClass,
] );

$imageOverlayClass = match ( $imageOverlay ) {
	'overlay-0'  => '',
	'overlay-50'  => 'tw-bg-core tw-opacity-40',
	'overlay-100' => 'tw-bg-core tw-opacity-80',
};

$imageStyle = ! empty( $backgroundImage ) && is_string( $backgroundImage ) ? 'background-image: url(' . esc_url( $backgroundImage ) . ')' : '';
?>

<div class="block__background <?php echo $backgroundType !== 'default' ? 'tw-z-10' : '' ?> container-padding-mobile lg:container-padding-desktop break-container-padding <?php echo esc_attr( $containerClasses ); ?> tw-bg-cover tw-bg-no-repeat 3xl:!tw-bg-none" style="<?php echo $imageStyle; ?>">
	<?php if ( is_admin() ): ?>
		<h3 class="tw-mx-auto tw-max-w-[1352px] tw-mb-3"><?php echo esc_html( baseTheme()->__( 'Background block' ) ); ?></h3>
	<?php endif; ?>

	<?php if ( $backgroundType === 'default' && $glowType !== 'none' && ! empty( $glowSrc ) ): ?>
        <div class="tw-absolute <?php echo esc_attr($glowClass); ?>">
            <img src="<?php echo esc_url($glowSrc); ?>" class="tw-max-w-none"/>
        </div>
	<?php endif; ?>

	<div class="block__background__content <?php echo esc_attr( $innerContainerClasses ); ?> tw-relative tw-z-10">
		<InnerBlocks class="tw-flex tw-flex-col <?php echo esc_attr($gapClass); ?>"/>
	</div>

    <?php if ( !empty($imageOverlay) && $backgroundType === 'image' ): ?>
        <div class="block__background__image tw-hidden 3xl:tw-block tw-overflow-hidden tw-absolute tw-top-0 tw-left-0 tw-rounded-[20px] tw-h-full tw-w-full">
            <img class="tw-h-full tw-w-full tw-object-cover tw-rounded-[21px]" src="<?php echo esc_url($backgroundImage) ?>"/>
            <div class="block__background__image__overlay tw-hidden 3xl:tw-block tw-absolute tw-w-full tw-bottom-0 <?php echo $imageOverlayClass ?> tw-h-full"></div>
        </div>

        <div class="block__background__overlay tw-block 3xl:tw-hidden tw-absolute tw-w-full tw-bottom-0 <?php echo $imageOverlayClass ?> tw-h-full tw-left-0"></div>
    <?php endif; ?>
</div>
