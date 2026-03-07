<?php
$customLogo   = get_field( 'footer_custom_logo', 'option' );
$tagline      = get_field( 'footer_tagline', 'option' );
$columns      = get_field( 'footer_columns', 'option' ) ?? [];
$linkedinUrl  = get_field( 'footer_linkedin', 'option' );
$copyright    = get_field( 'footer_copyright', 'option' );

$logoUrl = '';
if (!empty($customLogo)) {
    $logoUrl = is_numeric($customLogo) ? wp_get_attachment_image_src($customLogo, 'full')[0] ?? '' : ($customLogo['url'] ?? '');
}

$copyrightText = $copyright ?: '© {year} vDigital. All rights reserved.';
$copyrightText = str_replace('{year}', date('Y'), $copyrightText);

$taglineText = $tagline ?: 'Building custom software solutions for ambitious companies. 10+ years of experience turning ideas into reality.';
?>

<div class="footer-new font--jakarta tw-bg-core tw-border-t tw-border-shade tw-py-16 tw-px-8">
    <div class="tw-max-w-[1200px] tw-mx-auto">
        <!-- Footer Top -->
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-5 tw-gap-10 tw-mb-10">
            <!-- Brand Column -->
            <div class="md:tw-col-span-2">
                <?php if ( ! empty( $logoUrl ) ): ?>
                    <a href="<?php echo get_home_url(); ?>" class="tw-inline-block tw-mb-4">
                        <img src="<?php echo esc_url($logoUrl); ?>" alt="vDigital" class="tw-h-11" />
                    </a>
                <?php endif; ?>
                <p class="tw-text-gray-03 tw-leading-relaxed tw-max-w-[280px] tw-text-[0.95rem] tw-pr-8">
                    <?php echo esc_html($taglineText); ?>
                </p>
            </div>

            <!-- Dynamic Columns from ACF -->
            <?php foreach ( $columns as $column ) : ?>
                <div>
                    <?php if ( ! empty( $column['footer_column_title'] ) ) : ?>
                        <h4 class="tw-text-[0.9rem] tw-font-bold tw-mb-5 tw-text-focus tw-uppercase tw-tracking-wide">
                            <?php echo esc_html( $column['footer_column_title'] ); ?>
                        </h4>
                    <?php endif; ?>
                    <?php if ( ! empty( $column['footer_column_links'] ) ) : ?>
                        <ul class="!tw-list-none !tw-pl-0 tw-m-0 tw-p-0 tw-space-y-3">
                            <?php foreach ( $column['footer_column_links'] as $linkItem ) :
                                $link = $linkItem['footer_column_link'] ?? [];
                                if ( empty( $link ) || empty( $link['url'] ) ) continue;
                            ?>
                                <li>
                                    <a href="<?php echo esc_url( $link['url'] ); ?>"
                                       target="<?php echo esc_attr( $link['target'] ?? '_self' ); ?>"
                                       class="tw-text-gray-03 tw-no-underline tw-text-[0.95rem] hover:tw-text-edge tw-transition-colors">
                                        <?php echo esc_html( $link['title'] ); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Footer Bottom -->
        <div class="tw-pt-8 tw-border-t tw-border-shade tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-gap-4">
            <p class="tw-text-mist !tw-text-sm tw-m-0">
                <?php echo esc_html($copyrightText); ?>
            </p>
            <div class="tw-flex tw-gap-4">
                <?php if ( ! empty( $linkedinUrl ) ): ?>
                    <a href="<?php echo esc_url($linkedinUrl); ?>" target="_blank" rel="noopener noreferrer"
                       class="tw-w-10 tw-h-10 tw-bg-shade tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-gray-03 hover:tw-bg-primary hover:tw-text-white tw-transition-all tw-no-underline">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
