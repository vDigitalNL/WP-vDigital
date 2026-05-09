<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'CTA block' ) ?></h3>
<?php endif; ?>

<?php
/**
 * CTA Block Template.
 * Displays a call-to-action section with gradient background.
 * Two-column layout: Expert (left) + Content/Buttons (right)
 */

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
use ChildTheme\ChildTheme\Helpers\Image;

$expertImage    = get_field( 'cta_expert_image' );
$expertName     = get_field( 'cta_expert_name' );
$expertRole     = get_field( 'cta_expert_role' );
$expertEmail    = get_field( 'cta_expert_email' );
$expertWhatsapp = get_field( 'cta_expert_whatsapp' );

$title       = get_field( 'cta_title' );
$description = get_field( 'cta_description' );
$buttons     = get_field( 'cta_buttons' ) ?? [];

$hasExpert = ! empty( $expertImage ) || ! empty( $expertName );

?>

<section class="cta-block font--jakarta tw-py-24 tw-bg-core">
    <div class="tw-mx-auto tw-max-w-[1200px]">
        <div class="tw-rounded-3xl tw-p-8 md:tw-p-12 lg:tw-p-16" style="background: linear-gradient(135deg, rgba(0, 76, 168, 0.15) 0%, rgba(1, 143, 220, 0.1) 100%); border: 1px solid rgba(1, 143, 220, 0.2);">
            <div class="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-gap-8 lg:tw-gap-12">

                <?php if ( $hasExpert ) : ?>
                <div class="tw-flex tw-flex-col tw-items-center tw-text-center lg:tw-w-1/3 tw-shrink-0">
                    <?php if ( ! empty( $expertImage ) ) :
                        $expertImageUrl = Image::getImageUrl( $expertImage );
                    ?>
                        <div class="tw-w-32 tw-h-32 md:tw-w-40 md:tw-h-40 tw-rounded-full tw-overflow-hidden tw-mb-4 tw-border-4 tw-border-white/20">
                            <img src="<?php echo esc_url( $expertImageUrl ); ?>"
                                 alt="<?php echo esc_attr( $expertImage['alt'] ?? $expertName ); ?>"
                                 class="tw-w-full tw-h-full tw-object-cover">
                        </div>
                    <?php endif; ?>

                    <?php if ( ! empty( $expertName ) ) : ?>
                        <h3 class="tw-text-focus tw-text-xl tw-font-bold tw-mb-1 tw-normal-case tw-tracking-normal">
                            <?php echo esc_html( $expertName ); ?>
                        </h3>
                    <?php endif; ?>

                    <?php if ( ! empty( $expertRole ) ) : ?>
                        <p class="tw-text-focus-70 tw-text-sm tw-mb-4">
                            <?php echo esc_html( $expertRole ); ?>
                        </p>
                    <?php endif; ?>

                    <?php if ( ! empty( $expertEmail ) || ! empty( $expertWhatsapp ) ) : ?>
                        <div class="tw-flex tw-gap-2 tw-justify-center tw-flex-wrap">
                            <?php if ( ! empty( $expertEmail ) ) : ?>
                                <a href="mailto:<?php echo esc_attr( $expertEmail ); ?>"
                                   class="tw-group tw-inline-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 tw-rounded-full tw-bg-white/10 tw-border tw-border-white/20 hover:tw-bg-edge hover:tw-border-edge tw-transition-all tw-duration-200">
                                    <svg class="tw-w-4 tw-h-4 tw-text-focus group-hover:tw-text-white tw-transition-colors tw-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    <span class="tw-text-focus group-hover:tw-text-white tw-text-sm tw-transition-colors"><?php echo esc_html( $expertEmail ); ?></span>
                                </a>
                            <?php endif; ?>

                            <?php if ( ! empty( $expertWhatsapp ) ) : ?>
                                <?php
                                $whatsappNumber = preg_replace( '/[^0-9]/', '', $expertWhatsapp );
                                ?>
                                <a href="https://wa.me/<?php echo esc_attr( $whatsappNumber ); ?>"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   class="tw-group tw-inline-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 tw-rounded-full tw-bg-white/10 tw-border tw-border-white/20 hover:tw-bg-[#25D366] hover:tw-border-[#25D366] tw-transition-all tw-duration-200">
                                    <svg class="tw-w-4 tw-h-4 tw-text-focus group-hover:tw-text-white tw-transition-colors tw-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    <span class="tw-text-focus group-hover:tw-text-white tw-text-sm tw-transition-colors"><?php echo esc_html( $expertWhatsapp ); ?></span>
                                </a>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
                <?php endif; ?>

                <div class="<?php echo $hasExpert ? 'lg:tw-w-2/3' : 'tw-w-full'; ?> tw-text-center <?php echo $hasExpert ? 'lg:tw-text-left' : ''; ?>">
                    <?php if ( ! empty( $title ) ) : ?>
                        <h2 class="tw-text-focus tw-text-3xl md:tw-text-4xl tw-font-extrabold tw-mb-4 tw-normal-case tw-tracking-normal">
                            <?php echo esc_html( $title ); ?>
                        </h2>
                    <?php endif; ?>

                    <?php if ( ! empty( $description ) ) : ?>
                        <p class="tw-text-focus-70 tw-text-lg tw-mb-8 <?php echo $hasExpert ? '' : 'tw-max-w-[600px] tw-mx-auto'; ?>">
                            <?php echo esc_html( $description ); ?>
                        </p>
                    <?php endif; ?>

                    <?php if ( ! empty( $buttons ) ) : ?>
                        <div class="tw-flex tw-flex-wrap <?php echo $hasExpert ? 'tw-justify-center lg:tw-justify-start' : 'tw-justify-center'; ?> tw-gap-4">
                            <?php foreach ( $buttons as $button ) : ?>
                                <?php Buttons::render( $button, 'cta_buttons_' ); ?>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

            </div>
        </div>
    </div>
</section>
