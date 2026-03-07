<?php use ChildTheme\ChildTheme\Helpers\Image;

if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Expertise block' ) ?></h3>
<?php endif; ?>

<?php
/**
 * Expertise Block Template.
 * Displays expertise content with feature list and tech stack card.
 */

$title       = get_field( 'expertise_title' );
$description = get_field( 'expertise_description' );
$features    = get_field( 'expertise_features' ) ?? [];
$cardIcon    = get_field( 'expertise_card_icon' );
$cardTitle   = get_field( 'expertise_card_title' );
$cardSubtitle = get_field( 'expertise_card_subtitle' );
$techTags    = get_field( 'expertise_tech_tags' ) ?? [];

?>

<section id="expertise" class="expertise-block font--jakarta tw-py-24 tw-bg-core">
    <div class="tw-mx-auto tw-max-w-[1200px]">
        <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12 lg:tw-gap-16 tw-items-start">
            <!-- Left: Text Content -->
            <div class="expertise-text">
                <?php if ( ! empty( $title ) ) : ?>
                    <h2 class="tw-text-focus tw-text-3xl md:tw-text-4xl tw-font-extrabold tw-mb-6 tw-normal-case tw-tracking-normal tw-leading-tight">
                        <?php echo esc_html( $title ); ?>
                    </h2>
                <?php endif; ?>

                <?php if ( ! empty( $description ) ) : ?>
                    <div class="tw-text-focus-70 tw-text-lg tw-leading-relaxed tw-mb-8 wysiwyg__content">
                        <?php echo $description; ?>
                    </div>
                <?php endif; ?>

                <?php if ( ! empty( $features ) ) : ?>
                    <ul class="tw-list-none checkmark-list tw-p-0 tw-m-0 tw-space-y-3">
                        <?php foreach ( $features as $feature ) : ?>
                            <li class="tw-flex tw-items-center tw-gap-3 tw-text-focus tw-text-base">
                                <?php echo esc_html( $feature['expertise_feature_text'] ); ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>

            <!-- Right: Image -->
            <?php
            $expertiseImage = get_field( 'expertise_image' );
            $imageUrl = Image::getImageUrl($expertiseImage);
            ?>
            <div class="expertise-image tw-relative">
                <div class="tw-rounded-3xl tw-overflow-hidden tw-shadow-2xl">
                    <img src="<?php echo esc_url( $imageUrl ); ?>"
                         alt="<?php echo ! empty( $expertiseImage['alt'] ) ? esc_attr( $expertiseImage['alt'] ) : esc_attr( $title ); ?>"
                         class="tw-w-full tw-h-auto tw-object-cover tw-aspect-[4/3]" />
                </div>
                <!-- Decorative accent -->
                <div class="tw-absolute tw--bottom-4 tw--left-4 tw-w-24 tw-h-24 tw-bg-edge/20 tw-rounded-2xl tw--z-10"></div>
                <div class="tw-absolute tw--top-4 tw--right-4 tw-w-16 tw-h-16 tw-bg-growth/20 tw-rounded-xl tw--z-10"></div>
            </div>
        </div>
    </div>
</section>
