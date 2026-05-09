<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class General
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class General extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__general';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/general/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'General' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			$fields[] = [
				'key'           => 'emojis',
				'label'         => $this->baseTheme->__( 'Emojis' ),
				'message'       => $this->baseTheme->__( 'Enable Wordpress emoji support' ),
				'type'          => 'true_false',
				'required'      => false,
				'default_value' => false,
				'ui'            => true,
				'ui_on_text'    => 'Yes',
				'ui_off_text'   => 'No',
			];
			$fields[] = [
				'key'           => 'header_scripts',
				'label'         => $this->baseTheme->__( 'Header scripts' ),
				'message'       => $this->baseTheme->__( 'Add scripts to the site header' ),
				'type'          => 'acf_code_field',
				'required'      => 0,
				'placeholder'   => 'Add scripts here EXCLUDING the script tags',
				'rows'          => '6',
				'new_lines'     => '',
				'mode'          => 'javascript',
				'theme'         => 'monokai',
				'default_value' => '',
			];
			$fields[] = [
				'key'           => 'footer_scripts',
				'label'         => $this->baseTheme->__( 'Footer scripts' ),
				'message'       => $this->baseTheme->__( 'Add scripts to the site footer' ),
				'type'          => 'acf_code_field',
				'required'      => 0,
				'placeholder'   => 'Add scripts here EXCLUDING the script tags',
				'rows'          => '6',
				'new_lines'     => '',
				'mode'          => 'javascript',
				'theme'         => 'monokai',
				'default_value' => '',
			];

			return $fields;
		}
	}