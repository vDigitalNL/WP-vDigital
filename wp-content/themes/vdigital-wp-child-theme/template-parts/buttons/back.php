<?php

$url    = $args['url'] ?? '#';
$target = $args['target'] ?? '_self';
$title  = $args['title'] ?? baseTheme()->__('Back');
$class = $args['class'] ?? '';

?>

<a href="<?php echo esc_url( $url ); ?>" target="<?php echo esc_attr( $target ); ?>" class="back <?php echo esc_attr($class) ?>"><?php echo esc_html( $title ) ?></a>
