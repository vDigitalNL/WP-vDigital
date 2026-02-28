<?php

use ChildTheme\ChildTheme\Helpers\News;
use ChildTheme\ChildTheme\Helpers\Reviews;

$post = $args['post'] ?? null;
$postType = $args['postType'] ?? null;
$extraClass = $args['class'] ?? '';
$labels = $args['labels'] ?? null;
$labelStyle = $args['labelStyle'] ?? 'dark';

if (! $post) {
  return;
}

if (!$labels) {
  $labels = match ($postType) {
    'ww_customer_reviews' => Reviews::getLabels($post->ID),
    'post' => News::getLabels($post->ID),
    default => []
  };
}


if (! empty($labels)): ?>
  <div class="tw-flex  tw-flex-wrap tw-gap-[10px] <?php echo esc_attr($extraClass); ?>">
    <?php foreach ($labels as $label): ?>
      
      <?php 
        if (! empty($label)) : ?>
        <?php
        $text = is_string($label) ? $label : $label['text'] ?? '';
        echo get_template_part(
          'template-parts/labels/label',
          'default',
          ['text' => $text, 'type' => $labelStyle]
        );
        ?>
      <?php endif; ?>
    <?php endforeach; ?>
  </div>
<?php endif; ?>