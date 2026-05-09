			</div><!-- #site-content -->

			<footer id="site-footer">
			    <?php
				    if ( baseTheme()->getOption( 'footer.default_footer', true ) ) {
				        baseTheme()->Frontend->Html->loadTemplatePart( 'default-footer' );
				    } else {
				        baseTheme()->Frontend->Html->loadTemplatePart( 'custom-footer' );
				    }
			    ?>
			</footer>
		</div><!-- #page -->

		<?php wp_footer(); ?>
	</body>
</html>