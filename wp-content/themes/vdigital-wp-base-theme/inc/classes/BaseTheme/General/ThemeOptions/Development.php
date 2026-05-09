<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Development
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class Development extends AbstractClass {
		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__development';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/development/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Development' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			$fields[] = [
				'key'           => 'xmlrpc',
				'label'         => $this->baseTheme->__( 'XML-RPC' ),
				'message'       => $this->baseTheme->__( 'XML-RPC is disabled by default, when enabling this option the filter to disable XML-RPC will not be applied. ' ),
				'type'          => 'true_false',
				'required'      => false,
				'default_value' => false,
				'ui'            => true,
				'ui_on_text'    => $this->baseTheme->__( 'Enable' ),
				'ui_off_text'   => $this->baseTheme->__( 'Disable' ),
			];

			return $fields;
		}
	}