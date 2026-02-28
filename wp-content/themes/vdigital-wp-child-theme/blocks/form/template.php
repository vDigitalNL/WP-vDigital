<?php
/**
 * Form Block Template
 */

$headingType = get_field('form_heading_type') ?: 'h2';
$title = get_field('form_title');
$text = get_field('form_text');
$template = get_field('form_template');
$salesforceForm = get_field('form_salesforce_form');
$whiteBackground = get_field('form_white_background');

$containerClasses = implode(' ', [
        'form-block',
        $whiteBackground ? 'container-padding-mobile container-margin-mobile--negative md:tw-mx-0 tw-bg-white md:tw-rounded-[20px] tw-py-8 md:tw-p-8 lg:tw-px-[94px] lg:tw-pt-[80px] lg:tw-pb-[92px] form-block--light' : 'form-block--dark',
]);
?>

<?php if (is_admin()): ?>
    <h3><?php echo baseTheme()->__('Form block') ?></h3>
<?php endif; ?>

<div class="<?php echo esc_attr($containerClasses); ?>">
    <?php if (!empty($title) || !empty($text)): ?>
        <div class="tw-mb-5 tw-flex tw-flex-col tw-gap-5">
            <?php if (!empty($title)): ?>
                <?php if ($headingType === 'h1'): ?>
                    <h1><?php echo esc_html($title); ?></h1>
                <?php else: ?>
                    <h2><?php echo esc_html($title); ?></h2>
                <?php endif; ?>
            <?php endif; ?>

            <?php if (!empty($text)): ?>
                <div class="form-block__text"><?php echo wp_kses_post($text); ?></div>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <?php if (!empty($template) && !empty($salesforceForm)): ?>
        <div class="form-block__salesforce-form" data-dyflexis-popup-id="<?php echo esc_attr($template); ?>"
             data-dyflexis-popup-settings='<?php echo esc_attr(json_encode(['forms' => [['form_1' => $salesforceForm]]])); ?>'>
            <?php echo do_shortcode("[salesforce form='" . esc_attr($salesforceForm) . "']"); ?>
        </div>
    <?php endif; ?>
</div>
