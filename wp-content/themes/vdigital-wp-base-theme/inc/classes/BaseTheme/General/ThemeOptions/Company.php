<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Company
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class Company extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__company';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/company/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Company Details' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			$fields[] = [
				'key'               => 'phone-number',
				'label'             => 'Phone number',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '50',
				],
				'placeholder'       => '+31612345678'
			];
			$fields[] = [
				'key'               => 'email',
				'label'             => 'E-mail address',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '50',
				],
			];
			$fields[] = [
				'key'               => 'coc',
				'label'             => 'Chamber of Commerce number',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
				],
			];
			$fields[] = [
				'key'               => 'vat',
				'label'             => 'VAT Number',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
				],
			];
			$fields[] = [
				'key'               => 'account-num',
				'label'             => 'Bank account number',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
				],
			];
			$fields[] = [
				'key'               => 'address',
				'label'             => 'Address and House Number',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
				],
			];
			$fields[] = [
				'key'               => 'postcode',
				'label'             => 'Postal Code',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
				],
			];
			$fields[] = [
				'key'               => 'city',
				'label'             => 'City',
				'type'              => 'text',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '33',
				],
			];
			$fields[] = [
				'key'               => 'parking',
				'label'             => 'Travel directions',
				'type'              => 'textarea',
				'required'          => 0,
				'conditional_logic' => 0,
				'rows'              => 2,
				'wrapper'           => [
					'width' => '100',
				],
			];
			$fields[] = [
				'key'               => 'route-link',
				'label'             => '(Google Maps) Route Link',
				'type'              => 'link',
				'required'          => 0,
				'conditional_logic' => 0,
				'return_format'     => 'url',
				'wrapper'           => [
					'width' => '50',
				],
			];
			$fields[] = [
				'key'               => 'transportation-link',
				'label'             => '(92ov) Transportation Link',
				'type'              => 'link',
				'required'          => 0,
				'conditional_logic' => 0,
				'return_format'     => 'url',
				'wrapper'           => [
					'width' => '50',
				],
			];
			$fields[] = [
				'key'               => 'facebook',
				'label'             => 'Facebook URL',
				'type'              => 'link',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '50',
				],
			];
			$fields[] = [
				'key'               => 'linkedin',
				'label'             => 'LinkedIn URL',
				'type'              => 'link',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '50',
				],
			];
			$fields[] = [
				'key'               => 'instagram',
				'label'             => 'Instagram URL',
				'type'              => 'link',
				'wrapper'           => [
					'width' => '50',
				],
			];
			$fields[] = [
				'key'               => 'twitter',
				'label'             => 'Twitter URL',
				'type'              => 'link',
				'wrapper'           => [
					'width' => '50',
				],
			];


			return $fields;
		}
	}
