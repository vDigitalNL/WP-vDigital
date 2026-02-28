<?php

get_header();
$overviewUrl = get_permalink(baseTheme()->getOption('general.field_news_page')['ID']);
?>
<div class="outer-container single-post">
    <?php
    if (have_posts()) {
        the_post();
        echo get_template_part('template-parts/single', 'cpt/header', [
            'overviewUrl' => $overviewUrl
        ]);

    ?>

        <div class="single-post__content tw-mx-auto tw-flex tw-flex-col tw-gap-10 tw-pb-10 tw-text-focus">
            <?php the_content(); ?>
        </div>
    <?php
    } else {
        echo baseTheme()->__('No posts found.');
    }
    ?>
</div>
<?php

get_sidebar();
get_footer();
