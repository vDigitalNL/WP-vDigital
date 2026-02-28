<?php
/**
 * The template for displaying all pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Web_Whales_Base_Theme
 */

get_header();
?>

<div class="outer-container">
<?php
    while ( have_posts() ) {
        the_post();
        get_template_part( 'template-parts/content', 'page' );
    }
?>
</div>

<?php
get_sidebar();
get_footer();