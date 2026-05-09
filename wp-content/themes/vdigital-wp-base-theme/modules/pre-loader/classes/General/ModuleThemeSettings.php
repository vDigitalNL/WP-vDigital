<?php

	namespace Theme\Modules\PreLoader\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class ModuleThemeSettings
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class ModuleThemeSettings extends ThemeModuleAbstractClass {
		public function init() {
			$this->addFilters();
		}

		private function addFilters() {
			baseTheme()->addFilter( 'theme_options/general/sub_fields', [ $this, 'addAdditionalFields' ], 10, 2 );
		}

		public function addAdditionalFields( $fields ) {
			$fields[] = [
				'key'           => 'pre_loader',
				'label'         => $this->baseTheme->__( 'Pre-loader' ),
				'message'       => $this->baseTheme->__( 'Use a pre-loader on this website' ),
				'type'          => 'true_false',
				'ui'            => true,
				'ui_on_text'    => 'Yes',
				'ui_off_text'   => 'No',
			];

			return $fields;
		}
	}
