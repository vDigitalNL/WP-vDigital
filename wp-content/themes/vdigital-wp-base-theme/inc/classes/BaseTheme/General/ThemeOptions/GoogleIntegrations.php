<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class GoogleIntegrations
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class GoogleIntegrations extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__google';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/google/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Google Integrations' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			$fields[] = [
				'key'           => 'browser_api_key',
				'label'         => $this->baseTheme->__( 'Google analytics API key' ),
				'type'          => 'text',
				'default_value' => '',
				'ui'            => true,
			];

			$fields[] = [
				'key'           => 'tag_manager',
				'label'         => $this->baseTheme->__( 'Google tag manager API key' ),
				'type'          => 'text',
				'default_value' => '',
				'ui'            => true
			];

			$fields[] = [
				'key'           => 'maps',
				'label'         => $this->baseTheme->__( 'Google maps API key' ),
				'type'          => 'text',
				'default_value' => '',
				'ui'            => true
			];

			return $fields;
		}
	}