<?php
$posts = $args['posts'] ?? [];
$includeMissingConnection = $args['includeMissingConnection'] ?? true;
$missingConnectionText = get_field('marketplace_missing_connection_text', 'option');

// Get form template settings from options
$formTemplateId = get_field('marketplace_missing_connection_form_template', 'option');
$formTemplate = null;
$forms = null;
$tab = null;

if ($formTemplateId) {
    $templatePost = get_post($formTemplateId);
    if ($templatePost) {
        $template = get_field(\ChildTheme\ChildTheme\General\FormTemplates::BASE_KEY . 'template', $templatePost->ID);
        $forms = get_field('marketplace_missing_connection_form_template_' . $template . '_forms', 'option');
        $tab = get_field('marketplace_missing_connection_form_template_' . $template . '_tab', 'option') ?? "";
        $formTemplate = $formTemplateId;
    }
}

foreach ($posts as $index => $post):
    $thumbnail = get_the_post_thumbnail_url($post->ID, 'full');
    $categories = get_the_terms($post->ID, 'ww_api_connections_categories');
    $categoriesClassList = '';
    $isPrivate = $post->post_status === 'private';

    if (!empty($categories)) {
        $categoriesClassList = implode(" ", array_map(fn($category) => 'category-' . $category->term_id, $categories));
    }
    
    $baseClasses = "marketplace__card {$categoriesClassList} tw-relative tw-h-[200px] md:tw-h-[238px] md:tw-py-[82px] tw-px-[30px] sm:tw-px-[60px] tw-bg-white tw-rounded-[20px] tw-overflow-hidden tw-flex tw-flex-col tw-items-center tw-justify-center";
    $interactiveClasses = $isPrivate ? '' : ' tw-transition-shadow hover:tw-shadow-lg';
    ?>
    <?php if ($isPrivate): ?>
        <div class="<?php echo $baseClasses . $interactiveClasses; ?>">
            <?php if ($thumbnail): ?>
                <img src="<?php echo esc_url($thumbnail); ?>"
                     alt="<?php echo esc_attr($post->post_title); ?>"
                     class="tw-h-auto !tw-max-w-[140px]">
            <?php endif; ?>
        </div>
    <?php else: ?>
        <a href="<?php echo get_permalink($post->ID) ?>"
           class="<?php echo $baseClasses . $interactiveClasses; ?>">
            <?php if ($thumbnail): ?>
                <img src="<?php echo esc_url($thumbnail); ?>"
                     alt="<?php echo esc_attr($post->post_title); ?>"
                     class="tw-h-auto !tw-max-w-[140px]">
            <?php endif; ?>
        </a>
    <?php endif; ?>
<?php endforeach; ?>

<?php
$hasFormPopup = !empty($formTemplate) && !empty($forms) && !empty($forms[0]['marketplace_missing_connection_form_template_forms_form']);

if ($includeMissingConnection && $hasFormPopup && !empty($missingConnectionText)): ?>
    <a data-dyflexis-popup-btn="true"
       data-dyflexis-popup-tab="<?php echo esc_attr($tab); ?>"
       data-dyflexis-popup-id="<?php echo esc_attr($formTemplate); ?>"
       data-dyflexis-popup-settings='<?php echo esc_attr(json_encode(["forms" => $forms])); ?>'
       class="marketplace__missing-connection tw-bg-core tw-border tw-border-sky tw-text-focus tw-rounded-[20px] tw-px-[40px] tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-left tw-transition-colors tw-cursor-pointer tw-h-[200px] md:tw-h-[238px]">
        <span class="title--h2"><?php echo esc_html($missingConnectionText); ?></span>
    </a>
<?php endif; ?>
