<?php
/**
 * Steps Block Template.
 */

$steps = get_field( 'steps_steps' ) ?: [];

/** @var $block */
$uniqueId = ! empty( $block['id'] ) ? str_replace( 'block_', '', $block['id'] ) : uniqid();

if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Steps block' ) ?></h3>
<?php endif;

if ( empty( $steps ) ) {
    return;
}
?>

<div class="steps-block" data-steps-id="<?php echo esc_attr( $uniqueId ); ?>">
    <div class="tw-flex tw-flex-col lg:tw-flex-row tw-gap-10">
        <div class="steps-block__nav tw-w-full lg:tw-w-5/12 lg:tw-pl-[54px]">
            <div class="steps-block__nav-desktop tw-hidden lg:tw-block">
                <?php foreach ( $steps as $index => $step ) :
                    $title = $step['steps_step_title'] ?? '';
                    $text  = $step['steps_step_text'] ?? '';
                    ?>
                    <button type="button" class="steps-block__nav-item tw-flex tw-text-left tw-w-full tw-relative tw-pl-14 tw-py-3" data-step-index="<?php echo esc_attr( $index ); ?>">
                        <span class="steps-block__bullet" aria-hidden="true"></span>
                        <?php if ( $index > 0 ) : ?>
                            <span class="steps-block__nav-item-line-progress" aria-hidden="true"></span>
                        <?php endif; ?>
                        <div>
                            <h4 class="steps-block__nav-title tw-block hyphenated"><?php echo esc_html( $title ); ?></h4>
                            <?php if ( ! empty( $text ) ) : ?>
                                <p class="steps-block__nav-text small--18 tw-block tw-mt-2"><?php echo esc_html( $text ); ?></p>
                            <?php endif; ?>
                        </div>
                    </button>
                <?php endforeach; ?>
            </div>

            <div class="steps-block__nav-mobile tw-block lg:tw-hidden">
                <div class="steps-block__nav-scroll tw-overflow-x-auto tw-whitespace-nowrap">
                    <div class="steps-block__nav-mobile-inner tw-inline-flex tw-items-start tw-gap-8 tw-pb-5 lg:tw-pb-3">
                        <?php foreach ( $steps as $index => $step ) :
                            $title = $step['steps_step_title'] ?? '';
                            $text  = $step['steps_step_text'] ?? '';
                            ?>
                            <button type="button" class="steps-block__nav-item steps-block__nav-item--mobile tw-text-left tw-relative <?php if($index == 0): ?>tw-ml-[40px]<?php endif; ?> tw-pr-2 <?php if(!empty($text)): ?>has-text<?php endif; ?>" data-step-index="<?php echo esc_attr( $index ); ?>">
                                <span class="steps-block__bullet steps-block__bullet--mobile" aria-hidden="true"></span>
                                <?php if ( $index < count( $steps ) - 1 ) : ?>
                                    <span class="steps-block__line-segment steps-block__line-segment--mobile" data-segment-index="<?php echo esc_attr( $index ); ?>" aria-hidden="true"></span>
                                    <span class="steps-block__line-segment-progress steps-block__line-segment-progress--mobile" data-segment-index="<?php echo esc_attr( $index ); ?>" aria-hidden="true"></span>
                                <?php endif; ?>
                                <div class="steps-block__text-container-mobile">
                                    <h4 class="steps-block__nav-title tw-block hyphenated"><?php echo esc_html( $title ); ?></h4>
                                    <?php if ( ! empty( $text ) ) : ?>
                                        <p class="steps-block__nav-text small--18 tw-block tw-mt-2"><?php echo esc_html( $text ); ?></p>
                                    <?php endif; ?>
                                </div>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="steps-block__pagination" aria-hidden="true">
                    <?php foreach ( $steps as $index => $step ) : ?>
                        <button type="button" class="steps-block__pagination-item" data-step-index="<?php echo esc_attr( $index ); ?>" tabindex="-1"></button>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <div class="steps-block__panels tw-mx-[40px] lg:tw-mx-0tw-w-full lg:tw-w-7/12 tw-relative tw-overflow-hidden">
            <?php foreach ( $steps as $index => $step ) :
                $tiles = $step['steps_step_tiles'] ?? [];
                $tilesCount = is_array( $tiles ) ? count( $tiles ) : 0;
                $gridClass = $tilesCount === 1 ? 'tw-grid-cols-1' : 'tw-grid-cols-1 md:tw-grid-cols-2';
                ?>

                <div class="steps-block__panel tw-w-full tw-hidden" data-step-panel="<?php echo esc_attr( $index ); ?>">
                    <div class="steps-block__tiles tw-grid <?php echo esc_attr( $gridClass ); ?> tw-gap-6">
                        <?php foreach ( $tiles as $tileIndex => $tile ) :
                            $tileTitle = $tile['steps_tile_title'] ?? '';
                            $tileText = $tile['steps_tile_text'] ?? '';
                            $tileLink = $tile['steps_tile_link'] ?? '';

                            $image = $tile['steps_tile_image'] ?? null;
                            if(!empty($image) && is_numeric($image)) {
                                $image = wp_get_attachment_image_url($image, 'full');
                            } elseif(!empty($image) && is_array($image)) {
                                $image = $image['url'];
                            }

                            $tileColSpan = ($tilesCount === 1) ? 'sm:tw-col-span-2' : '';
                            ?>

                            <div class="steps-block__tile tw-overflow-hidden tw-relative tw-min-h-[160px] md:tw-w-auto md:tw-min-h-[455px] <?php echo esc_attr( $tileColSpan ); ?> <?php if(!empty($tileLink)): ?>has-link<?php endif; ?>">
                                <?php if(!empty($tileLink)): ?><a href="<?php echo esc_url($tileLink['url']); ?>"><?php endif; ?>

                                <?php if ( ! empty( $image ) ) : ?>
                                    <img class="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-cover tw-rounded-[20px]" src="<?php echo esc_url( $image ); ?>" loading="eager" />
                                <?php endif; ?>

                                <?php if ( ! empty( $tileLink ) && ! empty( $tileLink['url'] ) ) : ?>
                                <div class="steps-block__tile__gradient tw-absolute tw-w-full tw-rounded-[20px] tw-h-[79%] tw-z-[20] tw-bottom-[-1px]"></div>
                                <?php endif; ?>

                                <div class="steps-block__tile-content tw-relative tw-z-30 tw-h-full tw-flex tw-flex-col tw-justify-end tw-px-10 tw-py-[16px] md:tw-py-[19px]">
                                    <?php if ( ! empty( $tileTitle ) ) : ?>
                                        <h2 class="tw-text-white tw-font-bold tw-text-2xl tw-leading-tight hyphenated"><?php echo esc_html( $tileTitle ); ?></h2>
                                    <?php endif; ?>

                                    <?php if ( ! empty( $tileText ) ) : ?>
                                        <p class="tw-text-white tw-mt-3 tw-text-sm tw-leading-relaxed small--18"><?php echo esc_html( $tileText ); ?></p>
                                    <?php endif; ?>
                                </div>

                                <?php if(!empty($tileLink)): ?></a><?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
