<?php

$categoryId    = get_field('references_category') ?: 'all';
$title = get_field('references_title') ?: '';
$linkToOverview = get_field('references_link_to') ?: null;

if ($categoryId !== 'all' && !term_exists((int) $categoryId, 'ww_customer_reviews_categories')) {
    $categoryId = 'all';
}

$reviews = get_posts([
    'numberposts'    => 3,
    'post_type'      => 'ww_customer_reviews',
    'post_status'    => 'publish',
    'order'          => 'DESC',
    'tax_query' => $categoryId !== 'all' ? [
        [
            'taxonomy' => 'ww_customer_reviews_categories',
            'field'    => 'term_id',
            'terms'    => (int) $categoryId,
        ],
    ] : [],
]);

$locale = match (get_locale()) {
    'de_DE' => 'de-DE',
    'en_US', 'en_EN' => 'en-US',
    'nl_NL' => 'nl-NL',
    default => 'nl-NL',
};

/**
 * The negative margin and max width for the trustpilot widget differ per locale, because of the different text lengths.
 * The content width within the iframe remains the same per locale (rating 1,1 vs  5,5)
 */
$negativeMargin = match (get_locale()) {
    'de_DE' => 'tw-start-[32px]',
    'en_US', 'en_EN' => 'tw-start-[25px]',
    'nl_NL' => 'tw-start-[18px]',
    default => 'tw-start-[18px]',
};
$trustpilotWidth = match (get_locale()) {
    'de_DE' => 'tw-max-w-[250px]',
    'en_US', 'en_EN' => 'tw-max-w-[240px]',
    'nl_NL' => 'tw-max-w-[240px]',
    default => 'tw-max-w-[240px]'
};

?>

<div class="references tw-w-full tw-flex tw-flex-col tw-gap-[10px] sm:tw-gap-[20px] ">
    <div class="title--h2">
        <?php echo esc_html($title); ?>
    </div>
    <div class="trustpilot tw-w-full tw-flex tw-justify-start tw-min-w-[330px]">
        <div class="trustpilot-widget tw-relative <?php echo $negativeMargin;?> <?php echo $trustpilotWidth;?>" 
        style="transform: scale(1.35);" data-locale="<?php echo esc_attr($locale); ?>" data-template-id="5419b637fa0340045cd0c936" data-businessunit-id="5478378a00006400057bcfbd" data-style-height="20px" data-style-width="100%" data-theme="dark" data-token="1cbd689b-5834-4626-8597-79907e092410"> <a href="https://nl.trustpilot.com/review/www.dyflexis.com" target="_blank" rel="noopener">Trustpilot</a> </div>
    </div>
    <div class="references__cards tw-mt-[15px] sm:tw-mt-[25px]">
        <?php foreach ($reviews as $index => $review):?>
            <div class="wrapper"> 
            <?php 

            $label = (ChildTheme\ChildTheme\Helpers\Reviews::hasVideo($review->ID)) ? [
                'text' => baseTheme()->__('Video')
            ] : null;
            
            echo get_template_part('template-parts/post-card', null, [
                'post'            => $review,
                'isReview'        => 1,
                'postType'        => 'ww_customer_reviews',
                'highlightedPost' => 0,
                'index'           => $index,
                'labels'         => [$label],
                'itemClass'       => 'references__cards__card',
            ]);
            ?>
            </div>
        <?php endforeach; ?>

        <div class="wrapper">
        <a href="<?php echo esc_url($linkToOverview ); ?>" target="_self" class="references__cards__card  
        tw-rounded-[20px] tw-overflow-hidden tw-flex tw-flex-col lg:tw-h-[280px] tw-border tw-border-edge hover:tw-bg-edge hover:tw-text-white tw-transition ">

            <div class="tw-h-full tw-w-full tw-flex tw-flex-col md:tw-justify-end ">
                <div class="content tw-z-10 tw-p-10 tw-min-h-[176px] sm:tw-min-h-[130px] md:tw-min-h-[176px] tw-h-full tw-w-full tw-flex tw-gap-[18px] tw-flex-col tw-justify-center tw-items-center tw-text-left">
                    <h3><?php echo baseTheme()->__('Discover all our customer stories'); ?></h3>
                    <p><?php echo baseTheme()->__('Satisfied customers about our software'); ?></p>
                </div>
            </div>
        </a>

            
        </div>
    </div>
    <div class="references__cards__navigation tw-flex tw-flex-col tw-items-center tw-justify-between">
    <div class="dots tw-flex tw-flex-row tw-gap-[10px] tw-items-center">
            <?php for ($i = 0; $i < count($reviews) + 1; $i++): ?>
                <div class="dot tw-w-[10px] tw-h-[10px] tw-rounded-full tw-bg-horizon"></div>
            <?php endfor; ?>
        </div>
    </div>
</div>


