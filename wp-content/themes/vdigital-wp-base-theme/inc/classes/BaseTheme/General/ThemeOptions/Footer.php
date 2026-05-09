<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Footer
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class Footer extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__footer';

			$fields = $this->getFields( $optionFieldKey );
			$fields = baseTheme()->applyFilters( 'theme_options/footer/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Footer' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @param string $optionFieldKey
		 *
		 * @return array[]
		 */
		private function getFields( string $optionFieldKey ): array {
			$fields = [];

			$fields[] = [
				'key'               => 'default_footer',
				'label'             => 'Footer type',
				'type'              => 'true_false',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => 0,
				'wrapper'           => [
					'width' => '',
					'class' => '',
					'id'    => '',
				],
				'message'           => '',
				'default_value'     => 1,
				'ui'                => 1,
				'ui_on_text'        => 'Default',
				'ui_off_text'       => 'Custom',
			];

			$fields[] = [
				'key'               => 'footer_column',
				'label'             => 'Column',
				'type'              => 'repeater',
				'instructions'      => '',
				'required'          => 0,
				'conditional_logic' => [
					[
						[
							'field'    => "{$optionFieldKey}__default_footer",
							'operator' => '==',
							'value'    => '1',
						],
					],
				],
				'wrapper'           => [
					'width' => '',
					'class' => '',
					'id'    => '',
				],
				'layout'            => 'block',
				'button_label'      => 'New column',
				'sub_fields'        => [
					[
						'key'               => 'footer_column_content',
						'label'             => 'Column content',
						'type' => 'repeater',
						'wrapper' => [
							'width' => '',
							'class' => '',
							'id' => '',
						],
						'collapsed' => 'footer_content_type',
						'min' => 0,
						'max' => 0,
						'layout' => 'block',
						'button_label' => '',
						'sub_fields' => [
							[
								'key' => 'footer_content_type',
								'label' => 'Content type',
								'name' => 'footer_content_type',
								'type' => 'select',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => 0,
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'choices' => [
									'img' => 'Logo',
									'social' => 'Social widget',
									'location' => 'Location',
									'menu' => 'Menu',
								],
								'default_value' => [
								],
								'allow_null' => 0,
								'multiple' => 0,
								'ui' => 0,
								'return_format' => 'value',
								'ajax' => 0,
								'placeholder' => '',
							],
							[
								'key' => 'footer_logo',
								'label' => 'Logo',
								'name' => 'footer_logo',
								'type' => 'image',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'img',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'return_format' => 'array',
								'preview_size' => 'medium',
								'library' => 'all',
								'min_width' => '',
								'min_height' => '',
								'min_size' => '',
								'max_width' => '',
								'max_height' => '',
								'max_size' => '',
								'mime_types' => '',
							],
							[
								'key' => 'footer_location_title',
								'label' => 'Title',
								'name' => 'footer_location_title',
								'type' => 'text',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'location',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'default_value' => '',
								'placeholder' => '',
								'prepend' => '',
								'append' => '',
								'maxlength' => '',
							],
							[
								'key' => 'footer_location_line_1',
								'label' => 'Address line 1',
								'name' => 'footer_location_line_1',
								'type' => 'text',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'location',
										],
									],
								],
								'wrapper' => array(
									'width' => '',
									'class' => '',
									'id' => '',
								),
								'default_value' => '',
								'placeholder' => '',
								'prepend' => '',
								'append' => '',
								'maxlength' => '',
							],
							[
								'key' => 'footer_location_line_2',
								'label' => 'Address line 2',
								'name' => 'footer_location_line_2',
								'type' => 'text',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'location',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'default_value' => '',
								'placeholder' => '',
								'prepend' => '',
								'append' => '',
								'maxlength' => '',
							],
							[
								'key' => 'footer_location_phone',
								'label' => 'Phone number',
								'name' => 'footer_location_phone',
								'type' => 'text',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'location',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'default_value' => '',
								'placeholder' => '+31612345678',
								'prepend' => '',
								'append' => '',
								'maxlength' => '',
							],
							[
								'key' => 'footer_location_whatsapp',
								'label' => 'WhatsApp number',
								'name' => 'footer_location_whatsapp',
								'type' => 'text',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'location',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'default_value' => '',
								'placeholder' => '+31612345678',
								'prepend' => '',
								'append' => '',
								'maxlength' => '',
							],
							[
								'key' => 'footer_location_email',
								'label' => 'Email address',
								'name' => 'footer_location_email',
								'type' => 'email',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'location',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'default_value' => '',
								'placeholder' => '',
								'prepend' => '',
								'append' => '',
							],
							[
								'key' => 'footer_location_hours',
								'label' => 'Opening hours',
								'name' => 'footer_location_hours',
								'type' => 'repeater',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'location',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'collapsed' => '',
								'min' => 0,
								'max' => 0,
								'layout' => 'row',
								'button_label' => '',
								'sub_fields' => [
									[
										'key' => 'footer_location_hours_line',
										'label' => 'Opening hours line',
										'name' => 'footer_location_hours_line',
										'type' => 'text',
										'instructions' => '',
										'required' => 0,
										'conditional_logic' => 0,
										'wrapper' => [
											'width' => '',
											'class' => '',
											'id' => '',
										],
										'default_value' => '',
										'placeholder' => '',
										'prepend' => '',
										'append' => '',
										'maxlength' => '',
									],
								],
							],
							[
								'key' => 'footer_menu_title',
								'label' => 'Menu titel',
								'name' => 'footer_menu_title',
								'type' => 'text',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'menu',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'default_value' => '',
								'placeholder' => '',
								'prepend' => '',
								'append' => '',
								'maxlength' => '',
							],
							[
								'key' => 'footer_menu',
								'label' => 'Menu',
								'name' => 'footer_menu',
								'type' => 'repeater',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'menu',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'collapsed' => '',
								'min' => 0,
								'max' => 0,
								'layout' => 'row',
								'button_label' => 'New menu item',
								'sub_fields' => [
									[
										'key' => 'footer_menu_item',
										'label' => 'Menu item',
										'name' => 'footer_menu_item',
										'type' => 'link',
										'instructions' => '',
										'required' => 0,
										'conditional_logic' => 0,
										'wrapper' => [
											'width' => '',
											'class' => '',
											'id' => '',
										],
										'return_format' => 'array',
									],
								],
							],
							[
								'key' => 'footer_social_title',
								'label' => 'Social title',
								'name' => 'footer_social_title',
								'type' => 'text',
								'instructions' => '',
								'required' => 0,
								'conditional_logic' => [
									[
										[
											'field' => "{$optionFieldKey}__footer_column__footer_column_content__footer_content_type",
											'operator' => '==',
											'value' => 'social',
										],
									],
								],
								'wrapper' => [
									'width' => '',
									'class' => '',
									'id' => '',
								],
								'default_value' => 'Follow us',
								'placeholder' => '',
								'prepend' => '',
								'append' => '',
								'maxlength' => '',
							],
						],
					],
				],
			];

			return $fields;
		}
	}
