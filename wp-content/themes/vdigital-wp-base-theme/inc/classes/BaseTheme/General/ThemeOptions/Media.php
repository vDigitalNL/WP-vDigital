<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Media
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class Media extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__media';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/media/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Media Settings' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			$fields[] = [
				'key'        => 'images',
				'label'      => $this->baseTheme->__( 'Images' ),
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'          => 'enable_svg',
						'label'        => $this->baseTheme->__( 'Enable SVG' ),
						'type'         => 'true_false',
						'instructions' => $this->baseTheme->__( 'By default WordPress does not allow files with the extension .svg.' ),
						'ui'           => true
					]
				]
			];

			return $fields;
		}
	}