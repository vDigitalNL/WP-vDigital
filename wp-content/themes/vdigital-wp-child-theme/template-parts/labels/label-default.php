<?php
/**
 * @var array{
 *     text: string,
 * 	   type?: string,
 * } $args
 */

$label_type = !empty($args['type']) ? $args['type'] : 'dark';
$label_class = ($label_type === 'light') ? 'label' : 'label--dark';
?>


<div class="<?php echo esc_attr($label_class); ?> tw-border-radius-[10px]">
	<?php echo esc_html($args['text']) ?>
</div>