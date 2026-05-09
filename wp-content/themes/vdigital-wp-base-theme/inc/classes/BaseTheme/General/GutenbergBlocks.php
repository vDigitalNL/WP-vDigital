<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class GutenbergBlocks
	 *
	 * @package Theme\BaseTheme\General
	 */
	class GutenbergBlocks extends AbstractClass {

		use ThemeFlexClassTrait;

		/**
		 * Init new Gutenberg blocks with classes within a folder "GutenbergBlocks"
		 */
		public function init() {
			if ( function_exists( 'acf_register_block' ) ) {
				add_action( 'acf/init', function () {
					//$this->[ClassName]->init();
				} );
			}
		}
	}