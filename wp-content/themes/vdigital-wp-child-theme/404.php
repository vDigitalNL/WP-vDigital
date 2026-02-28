<?php

use ChildTheme\ChildTheme\General\GutenbergBlocks;
use ChildTheme\ChildTheme\Helpers;

$btnMarkup = Helpers\Page404::getBtnMarkup([
    baseTheme()->getOption('page404.field_first_btn'),
    baseTheme()->getOption('page404.field_second_btn'),
]);
$test = null;
// prepare title and description for use in gutenberg blocks
$title = Helpers\Page404::cleanHtml(baseTheme()->getOption('page404.field_title') ?? '');
$description = Helpers\Page404::cleanHtml(baseTheme()->getOption('page404.field_description') ?? '');


get_header();
?>

<div class="outer-container template404">
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <?php print \Theme\WP\PostHtml::thumbnail(); ?>

        <div class="entry-content">
            <?php ob_start(); ?>
            <!-- wp:acf/banner {"name":"acf/banner","data":{"field_banner_background_type":"default","field_banner_background_glow":"middle-green-blue","field_banner_background_glow_side":"right"},"mode":"preview"} -->
            <!-- wp:acf/text {"name":"acf/text","data":{"field_text_heading_type":"h1-small","field_text_title":"%s","field_text_description":"%s",%s},"mode":"preview"} /-->
            <!-- /wp:acf/banner -->
            <?php
            $content = sprintf(
                ob_get_clean(),
                $title,
                $description,
                $btnMarkup
            );

            echo GutenbergBlocks::render_blocks($content);
            ?>
        </div>

    </article>

</div>

<?php
get_sidebar();
get_footer();
