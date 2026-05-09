<?php
global $themeModule;

use Theme\Modules\WoocommerceProductCarousel;

/**
 * @property-read WoocommerceProductCarousel $themeModule
 */

// Getting variables for the actual carousel.
$productCarouselAmountDesktop = !empty ( get_sub_field( 'field__woocommerce_product_carousel__flexible_amount_desktop' ) )
	? get_sub_field( 'field__woocommerce_product_carousel__flexible_amount_desktop' ) : 4;
$productCarouselAmountTablet = !empty ( get_sub_field( 'field__woocommerce_product_carousel__flexible_amount_tablet' ) )
	? get_sub_field( 'field__woocommerce_product_carousel__flexible_amount_tablet' ) : 3;
$productCarouselAmountMobile = !empty ( get_sub_field( 'field__woocommerce_product_carousel__flexible_amount_mobile' ) )
	? get_sub_field( 'field__woocommerce_product_carousel__flexible_amount_mobile' ) : 2;
$productCarouselTitle = !empty ( get_sub_field( 'field__woocommerce_product_carousel__flexible_title' ) )
	? get_sub_field( 'field__woocommerce_product_carousel__flexible_title' ) : '';
$productCarouselTitleFormat = !empty ( get_sub_field( 'field__woocommerce_product_carousel__flexible_title_format' ) )
	? get_sub_field( 'field__woocommerce_product_carousel__flexible_title_format' ) : '';

// Getting the products for the carousel.
$carouselProducts = [];
$productCarouselDisplayType = get_sub_field( 'field__woocommerce_product_carousel__flexible_display_type' );

switch ( $productCarouselDisplayType ) {
	case 'product_category':
		$productCarouselCategories = get_sub_field( 'field__woocommerce_product_carousel__flexible_product_categories' );
		$carouselProducts = $themeModule->General->TemplateHelpers->retrieveProductByCategories( (array) $productCarouselCategories );

		break;

	case 'product_carousel':
		$productCarouselPostId = get_sub_field( 'field__woocommerce_product_carousel__flexible_product_carousel' );
		$carouselProducts = get_field( 'field__woocommerce_product_carousel__post_products', $productCarouselPostId );

		break;
}

if ( !empty ( $carouselProducts ) ) : ?>
    <div class="woocommerce-product-carousel container"
         data-amount-desktop="<?php echo $productCarouselAmountDesktop; ?>"
         data-amount-tablet="<?php echo $productCarouselAmountTablet; ?>"
         data-amount-mobile="<?php echo $productCarouselAmountMobile; ?>">
		<?php if ( $productCarouselTitle ) : ?>
            <div class="row">
                <div class="col-md-12 title">
					<?php print $themeModule->Frontend->Typography->returnTitleByFormat( $productCarouselTitle, $productCarouselTitleFormat ); ?>
                </div>
            </div>
		<?php endif; ?>
        <div class="row slick-slider products">
			<?php foreach ( $carouselProducts as $carouselProductId ) :
				/**
				 * @var WC_Product $product
				 */
				$product = wc_get_product( $carouselProductId );
				$productTitle = !empty ( $product ) ? $product->get_title() : '';
				$productImageId = !empty ( $product ) ? $product->get_image_id() : '';
				$productClasses = [ 'product' ];

				if ( $product->is_on_sale() ) {
					$productClasses[] = 'on-sale';
				}

				if ( $product->is_type( 'variable' ) ) {
					$productClasses[] = 'variable';
				}

				if ( $product->is_type( 'simple' ) ) {
					$productClasses[] = 'simple';
				}

				?>
                <div class="<?php echo implode( ' ', $productClasses ); ?>">
                    <a class="woocommerce-loop-product__link" href="<?php echo $product->get_permalink(); ?>">
						<?php if ( !empty ( $productImageId ) ) : ?>
                            <div class="product-image">
								<?php print BaseTheme()->General->Images->getPictureByImageId( $productImageId, 'product-carousel' ); ?>
                            </div>
						<?php endif; ?>

						<?php if ( !empty ( $productTitle ) ) : ?>
                            <div class="woocommerce-loop-product__title">
                                <span><?php echo $productTitle; ?></span>
                            </div>
						<?php endif; ?>

                        <span class="price">
								<?php echo $product->get_price_html(); ?>
							</span>
                    </a>

                    <a class="product-cta"
                       href="<?php echo $product->get_permalink(); ?>"><?php echo baseTheme()->__( 'View product' ); ?></a>
                </div>
			<?php endforeach; ?>
        </div>
    </div>
<?php endif; ?>