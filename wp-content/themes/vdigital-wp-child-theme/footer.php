        <footer id="site-footer" class="tw-z-20 tw-relative">
            <?php
            baseTheme()->Frontend->Html->loadTemplatePart( 'custom-footer' );
            ?>
        </footer>

        <?php get_template_part( 'template-parts/form-popup' ); ?>

        <?php include get_stylesheet_directory() . '/template-parts/language-switcher.php'; ?>

		<?php wp_footer(); ?>
    </body>
</html>
