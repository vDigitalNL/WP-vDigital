<!doctype html>
<html <?php language_attributes(); ?>>
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>">
		<meta http-equiv="Content-Type"
		      content="<?php esc_attr_e( get_option( 'html_type' ) ) ?>; charset=<?php esc_attr_e( get_bloginfo( 'charset' ) ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

		<title><?php wp_title( '|', true, 'right' ); ?></title>

		<?php wp_head(); ?>
	</head>
    <body <?php body_class(); ?>>
		<div id="page">
			<?php baseTheme()->doAction( 'header/before_main_content' ); ?>

			<?php baseTheme()->Frontend->Html->loadTemplatePart( 'header', baseTheme()->getOption( 'header.template_variant', '' ) ); ?>

			<div id="site-content">