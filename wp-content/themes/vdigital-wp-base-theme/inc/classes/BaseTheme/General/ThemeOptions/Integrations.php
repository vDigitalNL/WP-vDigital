<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Integrations
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class Integrations extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__integrations';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/integrations/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Integrations' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			return $fields;
		}
	}