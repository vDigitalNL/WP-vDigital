<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'CTA block' ) ?></h3>
<?php endif; ?>

<?php
/**
 * CTA Block Template.
 * Displays a call-to-action section with gradient background.
 */

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$title       = get_field( 'cta_title' );
$description = get_field( 'cta_description' );
$buttons     = get_field( 'cta_buttons' ) ?? [];
$contactText = get_field( 'cta_contact_text' );
$contactLink = get_field( 'cta_contact_link' );

?>

<section class="cta-block font--jakarta tw-py-24 tw-bg-core">
    <div class="tw-mx-auto tw-max-w-[1200px]">
        <div class="tw-rounded-3xl tw-p-12 md:tw-p-16 tw-text-center" style="background: linear-gradient(135deg, rgba(0, 76, 168, 0.15) 0%, rgba(1, 143, 220, 0.1) 100%); border: 1px solid rgba(1, 143, 220, 0.2);">
            <?php if ( ! empty( $title ) ) : ?>
                <h2 class="tw-text-focus tw-text-3xl md:tw-text-4xl tw-font-extrabold tw-mb-4 tw-normal-case tw-tracking-normal">
                    <?php echo esc_html( $title ); ?>
                </h2>
            <?php endif; ?>

            <?php if ( ! empty( $description ) ) : ?>
                <p class="tw-text-focus-70 tw-text-lg tw-max-w-[600px] tw-mx-auto tw-mb-8">
                    <?php echo esc_html( $description ); ?>
                </p>
            <?php endif; ?>

            <?php if ( ! empty( $buttons ) ) : ?>
                <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-4 tw-mb-6">
                    <?php foreach ( $buttons as $button ) : ?>
                        <?php Buttons::render( $button, 'cta_buttons_' ); ?>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if ( ! empty( $contactText ) || ! empty( $contactLink ) ) : ?>
                <p class="tw-text-focus-70 tw-text-sm tw-m-0">
                    <?php if ( ! empty( $contactText ) ) : ?>
                        <?php echo esc_html( $contactText ); ?>
                    <?php endif; ?>
                    <?php if ( ! empty( $contactLink ) && ! empty( $contactLink['url'] ) ) : ?>
                        <a href="<?php echo esc_url( $contactLink['url'] ); ?>"
                           target="<?php echo esc_attr( $contactLink['target'] ?? '_self' ); ?>"
                           class="tw-text-edge tw-underline tw-underline-offset-2 hover:tw-text-focus tw-transition-colors">
                            <?php echo esc_html( $contactLink['title'] ); ?>
                        </a>
                    <?php endif; ?>
                </p>
            <?php endif; ?>
        </div>
    </div>
</section>
