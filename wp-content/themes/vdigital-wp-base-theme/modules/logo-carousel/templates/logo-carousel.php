<?php
global $themeModule;

use Theme\Modules\LogoCarousel;

/**
 * @property-read LogoCarousel $themeModule
 */
$logoCarouselId = get_sub_field( 'field__logo_carousel__flexible_object' );

if ( !empty ( $logoCarouselId ) ) :
	$logoCarouselFields = get_field( 'field__logo_carousel__post', $logoCarouselId );
	$logoCarouselAmountDesktop = !empty ( get_sub_field( 'field__logo_carousel__flexible_amount_desktop' ) )
		? get_sub_field( 'field__logo_carousel__flexible_amount_desktop' ) : 4;
	$logoCarouselAmountTablet = !empty ( get_sub_field( 'field__logo_carousel__flexible_amount_tablet' ) )
		? get_sub_field( 'field__logo_carousel__flexible_amount_tablet' ) : 3;
	$logoCarouselAmountMobile = !empty ( get_sub_field( 'field__logo_carousel__flexible_amount_mobile' ) )
		? get_sub_field( 'field__logo_carousel__flexible_amount_mobile' ) : 2;
	$logoCarouselTitle = !empty ( get_sub_field( 'field__logo_carousel__flexible_title' ) )
		? get_sub_field( 'field__logo_carousel__flexible_title' ) : '';
	$logoCarouselTitleFormat = !empty ( get_sub_field( 'field__logo_carousel__flexible_title_format' ) )
		? get_sub_field( 'field__logo_carousel__flexible_title_format' ) : '';

	if ( !empty ( $logoCarouselFields ) ) : ?>
        <div class="logo-carousel container" data-amount-desktop="<?php echo $logoCarouselAmountDesktop; ?>"
             data-amount-tablet="<?php echo $logoCarouselAmountTablet; ?>"
             data-amount-mobile="<?php echo $logoCarouselAmountMobile; ?>">
			<?php if ( $logoCarouselTitle ) : ?>
                <div class="row">
                    <div class="col-md-12 title mb-5 text-center">
						<?php print $themeModule->Frontend->Typography->returnTitleByFormat( $logoCarouselTitle, $logoCarouselTitleFormat ); ?>
                    </div>
                </div>
			<?php endif; ?>
            <div class="row slick-slider">
				<?php foreach ( $logoCarouselFields as $logoCarouselField ) :
					$logoTitle = !empty ( $logoCarouselField[ 'field__logo_carousel__post_title' ] ) ?
						$logoCarouselField[ 'field__logo_carousel__post_title' ] : '';

					$logoImageId = !empty ( $logoCarouselField[ 'field__logo_carousel__post_image' ] ) ?
						$logoCarouselField[ 'field__logo_carousel__post_image' ] : '';

					?>
                    <div class="logo">
						<?php if ( !empty ( $logoImageId ) ) : ?>
                            <div class="logo-image">
								<?php print BaseTheme()->General->Images->getPictureByImageId( $logoImageId, 'logo-carousel' ); ?>
                            </div>
						<?php endif; ?>

						<?php if ( !empty ( $logoTitle ) ) : ?>
                            <div class="logo-title">
                                <span><?php echo $logoTitle; ?></span>
                            </div>
						<?php endif; ?>
                    </div>
				<?php endforeach; ?>
            </div>
        </div>
	<?php endif; ?>
<?php endif; ?>