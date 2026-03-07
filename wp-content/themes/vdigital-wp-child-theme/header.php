<?php use ChildTheme\ChildTheme\General\Multisite; ?>
<?php $is404Class = is_404() ? 'error404' : ''; ?>

<!doctype html>
<html data-lang="<?php echo Multisite::getInstance()->getPrefix() ?>" <?php language_attributes(); ?> class="<?php echo esc_attr($is404Class); ?>">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta http-equiv="Content-Type"
	      content="<?php esc_attr_e( get_option( 'html_type' ) ) ?>; charset=<?php esc_attr_e( get_bloginfo( 'charset' ) ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<title><?php wp_title( '|', true, 'right' ); ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <?php if ( ! defined( 'WW_DEV_SITE' ) || ! WW_DEV_SITE ) : ?>
        <?php get_template_part( 'template-parts/snippets/header-scripts' ); ?>
    <?php endif; ?>

    <?php wp_head(); ?>
</head>

<?php
    $hyphenOption =  baseTheme()->getOption('general.field_break_word') ?? true;
    $hyphenClass = !$hyphenOption ? 'disable-hyphens' : '';
?>
<body <?php body_class($hyphenClass ); ?>>
<?php if(!empty($_POST['serialized_salesforce_form'])): ?>
    <input type="hidden" name="serialized_salesforce_form" value="<?php echo $_POST['serialized_salesforce_form'];
    ?>"/>
<?php endif; ?>


<?php if(is_front_page()): ?>
    <?php echo get_template_part( 'template-parts/home-hero/hero');  ?>
<?php else: ?>
    <?php get_template_part('template-parts/home-hero/navbar'); ?>
    <div class="tw-pt-[108px]"></div>
<?php endif; ?>
