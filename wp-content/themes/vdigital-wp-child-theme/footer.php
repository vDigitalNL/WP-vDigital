        <footer id="site-footer" class="tw-z-20 tw-relative">
            <?php
            baseTheme()->Frontend->Html->loadTemplatePart( 'custom-footer' );
            ?>
        </footer>

		<?php wp_footer(); ?>

        <?php if (! defined('WW_DEV_SITE') || ! WW_DEV_SITE) : ?>
            <div class="footer-scripts" style="display: none;">
                <!-- web-monitoring-ok -->
                <div style="visibility:hidden">web-monitoring-ok</div>
            </div>

            <?php get_template_part( 'template-parts/snippets/footer-scripts' ); ?>
        <?php endif; ?>
    </body>
</html>