<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Email
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class Email extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__email';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/email/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Email Settings' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			$fields[] = [
				'key'           => 'from_name',
				'label'         => $this->baseTheme->__( 'From Name' ),
				'type'          => 'text',
				'default_value' => '',
				'required'      => false,
				'placeholder'   => 'John Doe',
			];
			$fields[] = [
				'key'           => 'from_address',
				'label'         => $this->baseTheme->__( 'From Address' ),
				'type'          => 'email',
				'default_value' => '',
				'required'      => false,
				'placeholder'   => 'johndoe@website.com'
			];

			return $fields;
		}
	}