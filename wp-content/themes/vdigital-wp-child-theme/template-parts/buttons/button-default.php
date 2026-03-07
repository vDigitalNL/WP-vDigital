<?php
$url           = $args['url'] ?? '#';
$target        = $args['target'] ?? '_self';
$title         = $args['title'] ?? '';
$classes       = $args['classes'] ?? [];
$openFormPopup = $args['openFormPopup'] ?? false;
$formId        = $args['formId'] ?? '';
$popupTitle    = $args['popupTitle'] ?? '';
$attributes    = $args['attributes'] ?? [];
$attributes    = implode(' ', array_map(function ($key, $value) {
    return $key . '="' . esc_attr( $value ) . '"';
}, array_keys($attributes), $attributes));

?>

<a <?php if ( $openFormPopup && ! empty( $formId ) ): ?>
   data-form-popup="true"
   data-form-id="<?php echo esc_attr( $formId ); ?>"
   data-popup-title="<?php echo esc_attr( $popupTitle ); ?>"
   href="#"
   <?php else: ?>
   href="<?php echo esc_url( $url ); ?>" target="<?php echo esc_attr( $target ); ?>"
   <?php endif; ?>
   class="btn <?php echo implode(' ', $classes); ?>"
   <?php echo $attributes; ?>
>
   <?php echo esc_html( $title ); ?>
</a>