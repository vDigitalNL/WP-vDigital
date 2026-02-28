<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$items     = get_field( 'timeline_items' );
$lineStart = get_field( 'timeline_line_start' );
$lineEnd   = get_field( 'timeline_line_end' );

$lineEndColorClass = match ( $lineEnd['color'] ?? 'white' ) {
	'black' => 'tw-bg-black-00',
	'blue' => 'tw-bg-blue-01',
	default => 'tw-bg-white',
};
$lineStartColorClass = match ( $lineStart['color'] ?? 'white' ) {
	'black' => 'tw-bg-black-00',
	'blue' => 'tw-bg-blue-01',
	default => 'tw-bg-white',
};

if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Timeline block' ) ?></h3>
<?php endif; ?>

<div class="timeline container tw-relative tw-pl-12 md:tw-pl-0 md:tw-pl-0">
    <div class="tw-absolute tw-z-10 tw-h-[46px] md:tw-h-24 tw-relative tw-w-full tw-flex md:tw-items-center md:tw-justify-center">
		<?php if ( ! empty( $lineStart ) && $lineStart['enabled'] ): ?>
            <div class="tw-z-20 tw-absolute  tw-left-3 md:tw--left-[80px] md:tw-left-auto tw-h-20 tw--top-20 md:tw-ml-[2px] <?php echo $lineStartColorClass; ?> tw-w-[2px] tw-flex tw-items-center tw-justify-center">
                <div class="tw-w-7 tw-h-7 tw-absolute tw-top-0 tw-rounded-full <?php echo $lineStartColorClass; ?>"></div>
            </div>
		<?php endif; ?>
        <div class="tw-bg-blue-01 tw-h-full tw-w-[2px] tw-absolute md:tw-relative tw-left-3 md:tw--left-[80px] md:tw-left-auto tw-flex tw-items-center tw-justify-center md:tw-ml-[2px]">
        </div>
    </div>
	<?php foreach ($items as $index => $item):
		$buttons = $item['field_timeline_buttons']; ?>
        <div class="timeline__item tw-relative tw-flex tw-flex-col tw-pl-12 tw-pr-6 md:tw-px-6 tw-py-4 md:tw-py-24 <?php echo $item['field_timeline_image_right'] ? 'md:tw-flex-row' : 'md:tw-flex-row-reverse' ?>">
            <div class="tw-flex-1 md:tw-w-0 tw-flex tw-flex-col tw-justify-center <?php echo ($index + 1) === count($items) ? '' : 'tw-mb-8' ?> md:tw-mb-0">
                <h2 class="tw-font-bold tw-font-size-h2-standard tw-mb-4 md:tw-mb-8 tw-pr-6">
					<?php echo $item['field_timeline_title']; ?>
                </h2>
                <div class="tw-pr-6 tw-font-size-body-standard">
					<?php echo $item['field_timeline_description']; ?>
                </div>
				<?php if ( ! empty( $buttons ) ) : ?>
                    <div class="tw-flex tw-gap-4 md:tw-gap-7 tw-z-10 tw-flex-col tw-w-full md:tw-flex-row md:tw-w-auto tw-px-0 tw-mt-6">
						<?php foreach ( $buttons as $button ) :
							if ( empty( $button['field_timelinebutton_link'] ) || empty( $button['field_timelinebutton_type'] ) ) {
								continue;
							}

                            Buttons::render($button, 'field_timeline');
							?>
						<?php endforeach; ?>
                    </div>
				<?php endif; ?>
            </div>
            <div class="timeline__item__line tw-px-24 tw-h-full">
                <div class="tw-h-full tw-absolute tw-top-0 tw-bg-blue-01 tw-w-[2px] tw-left-3 md:tw--left-[80px] md:tw-left-auto tw-flex tw-items-start tw-pt-10 md:tw-pt-0 md:tw-items-center tw-justify-center">
					<?php if ( ! empty( $item['field_timeline_year'] ) ): ?>
                        <div class="tw-bg-white tw-border-2 tw-rounded md:tw-rounded-xl tw-border-blue-01 tw-py-1 md:tw-py-3 tw-px-2 md:tw-px-3 md:tw-px-5 tw--rotate-90 tw-text-blue-01 tw-text-3xl md:tw-text-5xl lg:tw-text-[4rem] tw-leading-none tw-font-bold">
							<?php echo $item['field_timeline_year']; ?>
                        </div>
					<?php endif; ?>
                </div>
            </div>
            <div class="tw-flex-1 md:tw-w-0 tw-flex tw-items-center md:tw-justify-center">
				<?php echo wp_get_attachment_image( $item['field_timeline_image']['id'] ?? $item['field_timeline_image'], 'full' ) ?>
            </div>
        </div>
	<?php endforeach; ?>
    <div class="tw-absolute tw-h-12 md:tw-h-24 tw-relative tw-w-full tw-flex md:tw-items-center md:tw-justify-center">
		<?php if ( ! empty( $lineEnd ) && $lineEnd['enabled'] ): ?>
            <div class="tw-absolute tw-z-20 tw-left-3 md:tw--left-[80px] md:tw-left-auto tw-h-[80px] md:tw-h-24 tw--bottom-20 md:tw--bottom-24 md:tw-ml-[2px] <?php echo $lineEndColorClass; ?> tw-w-[2px] tw-flex tw-items-center tw-justify-center">
                <div class="tw-w-7 tw-h-7 tw-absolute tw-bottom-0 tw-rounded-full <?php echo $lineEndColorClass; ?>"></div>
            </div>
		<?php endif; ?>
        <div class="tw-bg-blue-01 tw-h-full tw-w-[2px] tw-absolute md:tw-relative tw-left-3 md:tw--left-[80px] md:tw-left-auto tw-flex tw-items-center tw-justify-center md:tw-ml-[2px]">
        </div>
    </div>
</div>