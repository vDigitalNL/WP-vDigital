<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Stats block' ) ?></h3>
<?php endif; ?>

<?php
/**
 * Stats Block Template.
 * Displays statistics/numbers in a grid layout.
 */

$statItems = get_field( 'stats_items' ) ?? [];

if ( empty( $statItems ) ) {
	return;
}

?>

<section class="stats-block font--jakarta tw-py-20 tw-bg-core">
    <div class="tw-mx-auto tw-max-w-[1200px] tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-8 md:tw-gap-12 tw-text-center">
        <?php foreach ( $statItems as $item ) : ?>
            <div class="stat-item">
                <h3 class="tw-text-edge tw-text-4xl md:tw-text-5xl tw-font-extrabold tw-mb-2 tw-normal-case tw-tracking-normal">
                    <?php echo esc_html( $item['stats_number'] ); ?>
                </h3>
                <p class="tw-text-gray-03 tw-text-base tw-font-medium tw-m-0">
                    <?php echo esc_html( $item['stats_label'] ); ?>
                </p>
            </div>
        <?php endforeach; ?>
    </div>
</section>
