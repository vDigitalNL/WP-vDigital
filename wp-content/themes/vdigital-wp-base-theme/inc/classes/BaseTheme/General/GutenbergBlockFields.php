<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class GutenbergBlockFields
	 *
	 * @package Theme\BaseTheme\General
	 */
	class GutenbergBlockFields extends AbstractClass {

		use ThemeFlexClassTrait;

		/**
		 * Init ACF admin fields for this module on post edit pages / option pages
		 */
		public function init() {
			if ( function_exists( 'acf_register_block' ) ) {
				add_action( 'acf/init', function () {
					//$this->[ClassName]->init();
				}, 15 );
			}
		}
	}