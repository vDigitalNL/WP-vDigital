<?php
$url    = $args['url'] ?? '#';
$target = $args['target'] ?? '_self';
$isDemoButton = $args['demoButton'] ?? false;
$title  = $isDemoButton ? $args['formButtonTitle'] : $args['title'] ?? '';
$template = $args['formTemplate'] ?? null;
$templateTab = $args['formTemplateTab'] ?? "";
$classes = $args['classes'] ?? [];
$attributes = $args['attributes'] ?? [];
$attributes = implode(' ', array_map(function ($key, $value) {
    return $key . '="' . esc_attr( $value ) . '"';
}, array_keys($attributes), $attributes));

?>

<a data-dyflexis-popup-btn="<?php echo $isDemoButton ? 'true' : 'false'; ?>"
   <?php if ( $isDemoButton && ! empty( $template ) ): ?>
   data-dyflexis-popup-tab="<?php echo esc_attr( $templateTab ); ?>"
   data-dyflexis-popup-id="<?php echo esc_attr( $template ); ?>"
   data-dyflexis-popup-settings='<?php echo json_encode($args['settings'] ?? []); ?>'
   <?php endif; ?>
   href="<?php echo $url; ?>" target="<?php echo $target; ?>"
   class="btn <?php echo implode(' ', $classes); ?>"
   <?php echo $attributes; ?>
>
   <?php echo esc_html( $title ); ?>
</a>