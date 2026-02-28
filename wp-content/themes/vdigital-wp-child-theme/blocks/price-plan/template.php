<?php

use ChildTheme\ChildTheme\Helpers\Acf\Color;
use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
use ChildTheme\ChildTheme\Helpers\Acf\Gradient;

if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Price plan block' ) ?></h3>
<?php endif;
$plans = get_field( 'price-plan_items' ) ?: [];
if ( ! $plans ) {
    $plans = [];
}

$plansWithPrice = array_filter( $plans, function ( $plan ) {
    return get_field( 'price-plan_post_enable_price', $plan['price-plan_plan'] );
} );
?>

<div class="price-plan  tw-flex tw-flex-col">
    <div class="price-plan__top tw-flex tw-flex-wrap tw-gap-4 tw-mb-5">
        <?php if ( ! empty( $title = get_field( 'price-plan_title' ) ) ) : ?>
            <h2 class="tw-text-4xl lg:tw-text-5xl tw-font-bold tw-m-0 md:tw-pb-0 hyphenated">
                <?php echo $title; ?>
            </h2>
        <?php endif; ?>
        <?php if ( count( $plansWithPrice ) > 0 ): ?>
            <div class="tw-ml-auto tw-mt-auto tw-flex tw-gap-[20px]">
                <button data-currency="euro"
                        class="price-plan__currency-btn tw-cursor-pointer btn button--blue">
                    <?php echo baseTheme()->__( 'Euro' ); ?><span class="max-[475px]:tw-hidden"> (€)</span>
                </button>
                <button data-currency="dollar"
                        class="price-plan__currency-btn tw-cursor-pointer btn button--outline">
                    <?php echo baseTheme()->__( 'Dollar' ); ?><span class="max-[475px]:tw-hidden"> ($)</span>
                </button>
                <button data-currency="pound"
                        class="price-plan__currency-btn tw-cursor-pointer btn button--outline">
                    <?php echo baseTheme()->__( 'Pound' ); ?><span class="max-[475px]:tw-hidden"> (£)</span>
                </button>
            </div>
        <?php endif; ?>
    </div>

    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
        <?php foreach ( $plans as $plan ) :
            if ( ! get_post( $plan['price-plan_plan'] ) || get_post_type( $plan['price-plan_plan'] ) !== 'price-plan' ) {
                continue;
            }
            $buttons = get_field( 'price-plan_post_buttons', $plan['price-plan_plan'] );
            if ( empty( $buttons ) ) {
                continue;
            }
            $button     = $buttons[0];
         
            $planColor   =  get_field( 'price-plan_post_color', $plan['price-plan_plan'] ) ?: 'cobalt';
            $button['price-plan_post_buttons_button_type'] = $planColor;
            $color      = Color::convertColorName( $planColor );
            $colorClass = Color::getCssTextClass( $planColor );

            $planPost           = get_post( $plan['price-plan_plan'] );
            $popular            = get_field( 'price-plan_post_popular', $plan['price-plan_plan'] );
            $allFromText        = get_field( 'price-plan_post_all_from_text', $plan['price-plan_plan'] );
            $allFromExplanation = get_field( 'price-plan_post_all_from_explanation', $plan['price-plan_plan'] );

            $priceEnabled = get_field( 'price-plan_post_enable_price', $plan['price-plan_plan'] );
            $euroPrice    = str_replace( '.', ',', sprintf( '%0.2f', get_field( 'price-plan_post_price_month_eur', $plan['price-plan_plan'] ) ) );
            $dollarPrice  = str_replace( '.', ',', sprintf( '%0.2f', get_field( 'price-plan_post_price_month_usd', $plan['price-plan_plan'] ) ) );
            $poundPrice   = str_replace( '.', ',', sprintf( '%0.2f', get_field( 'price-plan_post_price_month_gbp', $plan['price-plan_plan'] ) ) );

            $underlineClass = 'tw-underline tw-underline-offset-4 tw-decoration-'.$color.' tw-decoration-dashed tw-cursor-pointer';

            ?>

            <div class="price-plan__plan tw-bg-focus tw-rounded-[25px] tw-flex tw-flex-col tw-mb-auto tw-flex-1 tw-h-full tw-pb-20px tw-relative"
                 data-title-plan="<?php echo $planPost->post_title; ?>">
                <!-- header -->
                <div class="price-plan__plan__header tw-bg-focus tw-rounded-t-[20px] tw-gap-x-4 tw-flex tw-items-center tw-justify-between tw-px-10 tw-pt-10">
                    <span class=" title--h3 !tw-text-core tw-truncate"><?php echo $planPost->post_title ?></span>
                    <?php if ( $popular ) : ?>
                        <div class="tw-flex tw-items-center">
                            <?php echo get_template_part( 'template-parts/icons/star', null, [
                                    'classes' => [ 'tw-size-[33px]', 'tw-mx-auto' ],
                            ] ) ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- body -->
                <div class="price-plan__body tw-bg-focus tw-flex-grow tw-pt-6 tw-px-10 tw-flex tw-flex-col tw-gap-[28px]">
                    <div class="price-plan__body__wrapper tw-flex tw-flex-col">
                        <?php if ( ! empty( $description =
                                get_field( 'price-plan_post_description', $plan['price-plan_plan'] ) ) ) : ?>
                            <div class="price-plan__description tw-mb-6 ">
                                <?php echo $description; ?>
                            </div>
                        <?php endif; ?>
                        <?php if ( $priceEnabled ): ?>
                        <div class="tw-pb-6 tw-mt-auto font--dm-sans tw-font-light tw-text-core">
                            
                                <div class="flex">
                                    <span class="tw-text-base"><?php echo baseTheme()->__( 'from' ) ?></span>
                                    <span data-currency="euro"
                                          class="price-plan__month-price tw-text-base tw-font-bold <?php echo $colorClass; ?>">€<?php echo $euroPrice; ?></span>
                                    <span data-currency="dollar"
                                          class="price-plan__month-price tw-hidden tw-text-base tw-font-bold <?php echo $colorClass; ?>">$<?php echo $dollarPrice; ?></span>
                                    <span data-currency="pound"
                                          class="price-plan__month-price tw-hidden tw-text-base tw-font-bold <?php echo $colorClass; ?>">£<?php echo $poundPrice; ?></span>
                                    <span class="tw-text-base tw-lowercase"><?php echo baseTheme()->__( 'Per user / per month' ) ?></span>
                                </div>
                        </div>
                        <?php endif; ?>
                        <div class="price-plan__body__cta">
                            <?php

                            $baseKey = Fields::BASE_KEY . '_buttons_';

                            if ( ! empty( $button[ $baseKey . 'button_link' ] ) ) {
                                Buttons::render( $button, $baseKey );
                            }

                            ?>
                        </div>
                    </div>

                    <div class="price-plan__usps tw-mb-auto tw-pb-5 ">
                        <div class="price-plan__usps__header tw-relative tw-flex tw-justify-between  ">
                            <?php $explanationClass = $allFromExplanation ? $underlineClass : ''; ?>

                            <div class="tw-group">
                                <strong class="font--dm-sans tw-text-base tw-text-core tw-leading-[120%] tw-font-bold tw-uppercase <?php echo $explanationClass ?>"><?php echo $allFromText; ?></strong>
                                <?php if ( $allFromExplanation ): ?>
                                    <div class="tw-hidden group-hover:tw-block hover:tw-invisible tw-bg-blue-03 tw-p-5 tw-absolute tw-w-full tw-z-20 tw-top-full tw-rounded-lg tw-text-focus tw-text-sm tw-left-0">
                                        <?php echo $allFromExplanation; ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="price-plan__usps__body tw-pt-4 tw-pb-2 md:tw-pb-0">
                            <?php
                            // Store price plan features globally to combine all features in the schema markup
                            global $globalPricePlanFeatures;

                            if ( ! isset( $globalPricePlanFeatures ) ) {
                                $globalPricePlanFeatures = [];
                            }

                            foreach ( get_field( 'price-plan_post_usps', $plan['price-plan_plan'] ) as $usp ) :
                                $globalPricePlanFeatures[] = $usp['usps-text'];

                                $classes = [
                                        $usp['usps-explanation'] ? $underlineClass : '',
                                ];

                                ?>
                                <div class="tw-text-sm tw-flex tw-py-[2px] tw-relative tw-group">
                                    <div class="tw-flex tw-w-full tw-flex-row tw-items-start tw-justify-start tw-gap-x-[10px]">
                                        <div class="tw-w-[6px] tw-h-[6px] tw-bg-edge tw-mt-[12px]"></div>


                                        <span class="tw-leading-[200%] tw-text-core <?php echo implode(
                                                ' ',
                                                $classes
                                        ); ?>"><?php echo $usp['usps-text']; ?></span>

                                        <?php if ( $usp['usps-explanation'] ): ?>
                                            <div class="tw-hidden group-hover:tw-block hover:tw-invisible tw-bg-blue-03 tw-p-5 tw-absolute tw-w-full tw-z-20 tw-top-full tw-rounded-lg tw-text-focus tw-text-sm tw-left-0">
                                                <?php echo $usp['usps-explanation']; ?>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
                <div class="price-plan__footer simple-gradient-<?php echo $color ?> tw-w-full tw-h-[20px] tw-rounded-b-[20px]">

                </div>
            </div>

        <?php endforeach; ?>
    </div>
</div>