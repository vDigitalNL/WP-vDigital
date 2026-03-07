<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Services block' ) ?></h3>
<?php endif; ?>

<?php
/**
 * Services Block Template.
 * Displays services in a white card with grid layout.
 */

$label       = get_field( 'services_label' );
$title       = get_field( 'services_title' );
$description = get_field( 'services_description' );
$items       = get_field( 'services_items' ) ?? [];

?>

<section id="services" class="services-block font--jakarta tw-py-24 tw-bg-core">
    <div class="tw-mx-auto tw-max-w-[1200px]">
        <div class="tw-bg-focus tw-rounded-3xl tw-p-8 md:tw-p-16">
            <!-- Section Header -->
            <div class="tw-text-left tw-mb-12">
                <?php if ( ! empty( $label ) ) : ?>
                    <span class="tw-inline-block tw-bg-primary tw-text-focus tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-px-4 tw-py-2 tw-rounded-full tw-mb-4">
                        <?php echo esc_html( $label ); ?>
                    </span>
                <?php endif; ?>

                <?php if ( ! empty( $title ) ) : ?>
                    <h2 class="!tw-text-core tw-text-3xl md:tw-text-4xl tw-font-extrabold tw-mb-4 tw-normal-case tw-tracking-normal">
                        <?php echo esc_html( $title ); ?>
                    </h2>
                <?php endif; ?>

                <?php if ( ! empty( $description ) ) : ?>
                    <p class="!tw-text-core tw-text-lg tw-max-w-[600px] tw-m-0">
                        <?php echo esc_html( $description ); ?>
                    </p>
                <?php endif; ?>
            </div>

            <!-- Services Grid -->
            <?php if ( ! empty( $items ) ) : ?>
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
                    <?php foreach ( $items as $item ) : ?>
                        <div class="service-card tw-bg-gray-01 tw-rounded-2xl tw-p-6 tw-transition-all tw-duration-300 hover:tw-shadow-lg hover:tw--translate-y-1">
                            <?php if ( ! empty( $item['services_icon'] ) ) : ?>
                                <div class="tw-text-4xl tw-mb-4">
                                    <?php echo $item['services_icon']; ?>
                                </div>
                            <?php endif; ?>

                            <?php if ( ! empty( $item['services_item_title'] ) ) : ?>
                                <h3 class="!tw-text-core tw-text-xl tw-font-bold tw-mb-3 tw-normal-case tw-tracking-normal">
                                    <?php echo esc_html( $item['services_item_title'] ); ?>
                                </h3>
                            <?php endif; ?>

                            <?php if ( ! empty( $item['services_item_description'] ) ) : ?>
                                <p class="!tw-text-core tw-text-base tw-leading-relaxed tw-m-0">
                                    <?php echo esc_html( $item['services_item_description'] ); ?>
                                </p>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>
