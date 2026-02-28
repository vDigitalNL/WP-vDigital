<?php

// ini_set( 'display_errors', 1 );
// ini_set( 'display_startup_errors', 1 );

$imageId = get_field( 'servicecard_image' );
$image = $imageId ? wp_get_attachment_image_src($imageId, 'post_normal') : null;

$title = get_field( 'servicecard_title' );
$description = get_field( 'servicecard_description' );
$link = get_field( 'servicecard_link' );

if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Service card' ) ?></h3>
<?php endif; ?>

<div class="servicecard tw-flex tw-flex-col tw-items-start font--dm-sans tw-text-white">
    <?php if ( $imageId && is_array($image) ) : ?>
        <div class="servicecard__image">
            <img src="<?php echo esc_url( $image[0] ); ?>" alt="<?php echo esc_attr( $title ); ?>">
        </div>
    <?php endif; ?>

    <div class="servicecard__content tw-flex tw-flex-col tw-gap-5 tw-mt-5">
        <?php if ( $title ) : ?>
            <div class="servicecard__content__title tw-text-xl tw-uppercase text-current tw-font-bold"><?php echo esc_html( $title ); ?></div>
        <?php endif; ?>

        <?php if ( $description ) : ?>
            <div class="servicecard__content__description tw-text-xl text-current tw-font-light"><?php echo esc_html( $description ); ?></div>
        <?php endif; ?>

        <?php if ( $link ) : 
            $link_url = $link['url'];
            $link_title = $link['title'];
            $link_target = $link['target'] ? $link['target'] : '_self';
        ?>
            <div class="btn-wrap">
                <a class="servicecard__content__btn btn button--blue " href="<?php echo esc_url( $link_url ); ?>" target="<?php echo esc_attr( $link_target ); ?>">
                    <?php echo esc_html( $link_title ); ?>
                </a>
            </div>
        <?php endif; ?>
    </div>
</div>