<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$title = get_field( 'text_panel_title' );
$description = get_field( 'text_panel_description' );
$buttons = get_field( 'text_panel_buttons' ) ?: [];
$outside = get_field( 'text_panel_outside' ) ?: 'right';

$outsideClass = match ( $outside ) {
	'left' => 'text-panel--left',
	default => 'text-panel--right',
};

$containerClasses = implode( ' ', [
	'text-panel',
	$outsideClass,
] );

$paddingClass = match($outside)  {
    'left' => 'tw-px-10 md:tw-pt-[79px] lg:tw-pb-[89px] md:tw-pl-[40px] lg:tw-pl-[80px] md:tw-pr-[30px] lg:tw-pr-[60px]',
    default => 'tw-px-10 md:tw-pt-[79px] lg:tw-pb-[89px] md:tw-pr-[40px] lg:tw-pr-[80px] md:tw-pl-[30px] lg:tw-pl-[60px]',
};
?>

<?php if ( is_admin() ): ?>
	<h3><?php echo baseTheme()->__( 'Text panel' ) ?></h3>
<?php endif; ?>

<div class="<?php echo esc_attr( $containerClasses ); ?> container-margin-mobile--negative md:tw-mx-0">
	<div class="text-panel__inner tw-bg-white tw-py-10 tw-flex tw-flex-col tw-gap-10 <?php echo esc_attr($paddingClass); ?>">
		<?php if ( ! empty( $title ) ) : ?>
			<h2 class="tw-m-0 !tw-text-core"><?php echo esc_html( wp_strip_all_tags( $title ) ); ?></h2>
		<?php endif; ?>

		<?php if ( ! empty( $description ) ) : ?>
			<?php echo wp_kses_post( $description ); ?>
		<?php endif; ?>

		<?php if ( ! empty( $buttons ) ): ?>
			<div class="<?php echo Buttons::DEFAULT_WRAPPER_CLASSES ?> md:tw-pb-[45px]">
				<?php foreach ( $buttons as $button ): ?>
					<?php if ( ! empty( $button['text_panel_buttons_button_link'] ) && ! empty( $button['text_panel_buttons_button_type'] ) ) : ?>
						<?php Buttons::render( $button, 'text_panel_buttons_' ); ?>
					<?php endif; ?>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
</div>
