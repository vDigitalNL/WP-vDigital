<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class AcfFields
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class AcfFields extends AbstractClass {

		/**
		 * Init new ACF fields with classes within a folder "AcfFields".
		 * They should extend the class \Theme\BaseTheme\General\AcfFields\AbstractAcfField.
		 */
		public function init() {
			add_action( 'acf/include_field_types', function () {
				new AcfFields\BootstrapJsModulesField();
				new AcfFields\BootstrapSassModulesField();
				new AcfFields\ThemeModulesField();
				new AcfFields\CodeField();
			} );
		}
	}