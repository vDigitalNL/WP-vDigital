<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Cases block' ) ?></h3>
<?php endif; ?>

<?php
/**
 * Cases Block Template.
 * Displays selected case study cards from the cases post type.
 */

$title         = get_field( 'cases_title' );
$description   = get_field( 'cases_description' );
$selectedCases = get_field( 'cases_selected_cases' ) ?? [];

if ( ! is_array( $selectedCases ) && $selectedCases ) {
    $selectedCases = [ $selectedCases ];
}

?>

<section id="cases" class="cases-block font--jakarta tw-py-24 tw-bg-core">
    <div class="tw-mx-auto tw-max-w-[1200px]">
        <!-- Section Header -->
        <div class="tw-text-center tw-mb-12">
            <?php if ( ! empty( $title ) ) : ?>
                <h2 class="tw-text-focus tw-text-3xl md:tw-text-4xl tw-font-extrabold tw-mb-4 tw-normal-case tw-tracking-normal">
                    <?php echo esc_html( $title ); ?>
                </h2>
            <?php endif; ?>

            <?php if ( ! empty( $description ) ) : ?>
                <p class="tw-text-focus-70 tw-text-lg tw-max-w-[600px] tw-mx-auto tw-m-0">
                    <?php echo esc_html( $description ); ?>
                </p>
            <?php endif; ?>
        </div>

        <!-- Cases Grid (Desktop) / Slider (Mobile) -->
        <?php if ( ! empty( $selectedCases ) ) : ?>
            <!-- Mobile Slider -->
            <div class="cases-slider md:tw-hidden">
                <div class="cases-slider__items">
                    <?php foreach ( $selectedCases as $case ) :
                        $featuredImage = get_the_post_thumbnail_url( $case->ID, 'large' );
                        $clientName    = get_post_meta( $case->ID, 'case_client_name', true );
                        $industry      = get_post_meta( $case->ID, 'case_industry', true );
                        $excerpt       = get_post_meta( $case->ID, 'case_excerpt', true );
                        $tags          = get_field( 'case_tags', $case->ID ) ?: [];
                        $permalink     = get_permalink( $case->ID );
                    ?>
                        <div class="cases-slider__item">
                            <a href="<?php echo esc_url( $permalink ); ?>" class="case-card tw-group tw-bg-shade tw-rounded-2xl tw-overflow-hidden tw-border tw-border-mist/20 tw-no-underline tw-block">
                                <?php if ( $featuredImage ) : ?>
                                    <div class="tw-aspect-video tw-overflow-hidden">
                                        <img src="<?php echo esc_url( $featuredImage ); ?>"
                                             alt="<?php echo esc_attr( $case->post_title ); ?>"
                                             class="tw-w-full tw-h-full tw-object-cover" />
                                    </div>
                                <?php endif; ?>

                                <div class="tw-p-6">
                                    <?php if ( $clientName || $industry ) : ?>
                                        <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                                            <?php if ( $clientName ) : ?>
                                                <span class="tw-text-edge tw-text-sm tw-font-medium"><?php echo esc_html( $clientName ); ?></span>
                                            <?php endif; ?>
                                            <?php if ( $clientName && $industry ) : ?>
                                                <span class="tw-text-mist">•</span>
                                            <?php endif; ?>
                                            <?php if ( $industry ) : ?>
                                                <span class="tw-text-mist tw-text-sm"><?php echo esc_html( $industry ); ?></span>
                                            <?php endif; ?>
                                        </div>
                                    <?php endif; ?>

                                    <h3 class="tw-text-focus tw-text-xl tw-font-bold tw-mb-2 tw-normal-case tw-tracking-normal">
                                        <?php echo esc_html( $case->post_title ); ?>
                                    </h3>

                                    <?php if ( $excerpt ) : ?>
                                        <p class="tw-text-mist tw-text-sm tw-leading-relaxed tw-mb-4 tw-line-clamp-2">
                                            <?php echo esc_html( $excerpt ); ?>
                                        </p>
                                    <?php endif; ?>

                                    <?php if ( ! empty( $tags ) ) : ?>
                                        <div class="tw-flex tw-flex-wrap tw-gap-2 tw-mb-4">
                                            <?php foreach ( array_slice( $tags, 0, 3 ) as $tag ) : ?>
                                                <span class="tw-bg-core tw-text-focus tw-text-xs tw-font-medium tw-px-3 tw-py-1 tw-rounded-full">
                                                    <?php echo esc_html( $tag['case_tag_name'] ); ?>
                                                </span>
                                            <?php endforeach; ?>
                                        </div>
                                    <?php endif; ?>

                                    <span class="tw-inline-flex tw-items-center tw-gap-2 tw-text-edge tw-text-sm tw-font-medium">
                                        <?php echo baseTheme()->__( 'View Case' ); ?>
                                        <svg class="tw-w-4 tw-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M7 17L17 7M17 7H7M17 7v10"/>
                                        </svg>
                                    </span>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
                <!-- Slider Dots -->
                <div class="cases-slider__dots tw-flex tw-justify-center tw-gap-2 tw-mt-6">
                    <?php foreach ( $selectedCases as $index => $case ) : ?>
                        <button class="tw-w-3 tw-h-3 tw-rounded-full tw-bg-mist/50 tw-border-0 tw-cursor-pointer tw-transition-colors" aria-label="<?php echo sprintf( baseTheme()->__( 'Go to slide %d' ), $index + 1 ); ?>"></button>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Desktop Grid -->
            <div class="tw-hidden md:tw-grid md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
                <?php foreach ( $selectedCases as $case ) :
                    $featuredImage = get_the_post_thumbnail_url( $case->ID, 'large' );
                    $clientName    = get_post_meta( $case->ID, 'case_client_name', true );
                    $industry      = get_post_meta( $case->ID, 'case_industry', true );
                    $excerpt       = get_post_meta( $case->ID, 'case_excerpt', true );
                    $tags          = get_field( 'case_tags', $case->ID ) ?: [];
                    $permalink     = get_permalink( $case->ID );
                ?>
                    <a href="<?php echo esc_url( $permalink ); ?>" class="case-card tw-group tw-bg-shade tw-rounded-2xl tw-overflow-hidden tw-border tw-border-mist/20 tw-transition-all tw-duration-300 hover:tw-border-edge/50 hover:tw--translate-y-1 tw-no-underline tw-block">
                        <?php if ( $featuredImage ) : ?>
                            <div class="tw-aspect-video tw-overflow-hidden">
                                <img src="<?php echo esc_url( $featuredImage ); ?>"
                                     alt="<?php echo esc_attr( $case->post_title ); ?>"
                                     class="tw-w-full tw-h-full tw-object-cover tw-transition-transform tw-duration-300 group-hover:tw-scale-105" />
                            </div>
                        <?php endif; ?>

                        <div class="tw-p-6">
                            <?php if ( $clientName || $industry ) : ?>
                                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                                    <?php if ( $clientName ) : ?>
                                        <span class="tw-text-edge tw-text-sm tw-font-medium"><?php echo esc_html( $clientName ); ?></span>
                                    <?php endif; ?>
                                    <?php if ( $clientName && $industry ) : ?>
                                        <span class="tw-text-mist">•</span>
                                    <?php endif; ?>
                                    <?php if ( $industry ) : ?>
                                        <span class="tw-text-mist tw-text-sm"><?php echo esc_html( $industry ); ?></span>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <h3 class="tw-text-focus tw-text-xl tw-font-bold tw-mb-2 tw-normal-case tw-tracking-normal group-hover:tw-text-edge tw-transition-colors">
                                <?php echo esc_html( $case->post_title ); ?>
                            </h3>

                            <?php if ( $excerpt ) : ?>
                                <p class="tw-text-mist tw-text-sm tw-leading-relaxed tw-mb-4 tw-line-clamp-2">
                                    <?php echo esc_html( $excerpt ); ?>
                                </p>
                            <?php endif; ?>

                            <?php if ( ! empty( $tags ) ) : ?>
                                <div class="tw-flex tw-flex-wrap tw-gap-2 tw-mb-4">
                                    <?php foreach ( array_slice( $tags, 0, 3 ) as $tag ) : ?>
                                        <span class="tw-bg-core tw-text-focus tw-text-xs tw-font-medium tw-px-3 tw-py-1 tw-rounded-full">
                                            <?php echo esc_html( $tag['case_tag_name'] ); ?>
                                        </span>
                                    <?php endforeach; ?>
                                    <?php if ( count( $tags ) > 3 ) : ?>
                                        <span class="tw-text-mist tw-text-xs tw-font-medium tw-px-2 tw-py-1">
                                            +<?php echo count( $tags ) - 3; ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <span class="tw-inline-flex tw-items-center tw-gap-2 tw-text-edge tw-text-sm tw-font-medium group-hover:tw-text-focus tw-transition-colors">
                                <?php echo baseTheme()->__( 'View Case' ); ?>
                                <svg class="tw-w-4 tw-h-4 tw-transition-transform group-hover:tw-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                                </svg>
                            </span>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php else : ?>
            <p class="tw-text-center tw-text-mist"><?php echo baseTheme()->__( 'No cases selected.' ); ?></p>
        <?php endif; ?>
    </div>
</section>
