<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Header
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 */
	final class Header extends AbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__header';

			$fields = $this->getFields();
			$fields = baseTheme()->applyFilters( 'theme_options/header/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'Header' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		/**
		 * @return array[]
		 */
		private function getFields(): array {
			$fields = [];

			$fields[] = [
				'key'           => 'template_variant',
				'label'         => $this->baseTheme->__( 'Template variant' ),
				'type'          => 'select',
				'required'      => true,
				'choices'       => [
					'default' => $this->baseTheme->__( 'Default' ),
				],
				'default_value' => [ 'default' ],
				'allow_null'    => false,
				'multiple'      => false,
				'return_format' => 'value',
				'ajax'          => false,
			];
			$fields[] = [
				'key'        => 'navbar',
				'label'      => $this->baseTheme->__( 'Menu bar' ),
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'           => 'template_variant',
						'label'         => $this->baseTheme->__( 'Template variant' ),
						'type'          => 'select',
						'required'      => true,
						'choices'       => [
							'default' => $this->baseTheme->__( 'Default' ),
						],
						'default_value' => [ 'default' ],
						'allow_null'    => false,
						'multiple'      => false,
						'return_format' => 'value',
						'ajax'          => false,
					],
					[
						'key'           => 'logo',
						'label'         => $this->baseTheme->__( 'Logo' ),
						'message'       => $this->baseTheme->__( 'Set the logo for the website' ),
						'type'          => 'image',
						'required'      => false,
						'return_format' => 'array',
						'preview_size'  => 'thumbnail',
						'library'       => 'all',
					],
					[
						'key'           => 'sticky',
						'label'         => $this->baseTheme->__( 'Sticky header' ),
						'message'       => $this->baseTheme->__( 'Use a sticky header when scrolling down' ),
						'type'          => 'true_false',
						'required'      => false,
						'default_value' => true,
						'ui'            => true,
						'ui_on_text'    => 'Yes',
						'ui_off_text'   => 'No',

					],
					[
						'key'           => 'color_scheme',
						'label'         => $this->baseTheme->__( 'Color scheme' ),
						'type'          => 'select',
						'required'      => true,
						'choices'       => $this->baseTheme->applyFilters( 'theme_options/header/sub_fields/navbar/color_scheme', [
							'dark'  => __( 'Dark' ),
							'light' => __( 'Light' ),
						] ),
						'default_value' => [ 'light' ],
						'allow_null'    => false,
						'multiple'      => false,
						'return_format' => 'value',
						'ajax'          => false,
					],
					[
						'key'           => 'expand_breakpoint',
						'label'         => $this->baseTheme->__( 'Show mobile menu up to screen size' ),
						'message'       => $this->baseTheme->__( 'The navbar will be shown collapsed below the selected breakpoint' ),
						'type'          => 'select',
						'required'      => true,
						'choices'       => [
							'off' => $this->baseTheme->__( 'Always show mobile menu' ),
							'xs'  => 'xs',
							'sm'  => 'sm',
							'md'  => 'md',
							'lg'  => 'lg',
							'xl'  => 'xl',
						],
						'default_value' => [ 'sm' ],
						'allow_null'    => false,
						'multiple'      => false,
						'return_format' => 'value',
						'ajax'          => false,
					],
					[
						'key'           => 'full_width',
						'label'         => $this->baseTheme->__( 'Full width navbar' ),
						'message'       => $this->baseTheme->__( 'Use a full width navbar on this website' ),
						'type'          => 'true_false',
						'required'      => false,
						'default_value' => false,
						'ui'            => true,
						'ui_on_text'    => 'Yes',
						'ui_off_text'   => 'No',

					],
					[
						'key'           => 'menu_alignment',
						'label'         => $this->baseTheme->__( 'Menu Alignment' ),
						'type'          => 'select',
						'required'      => true,
						'choices'       => [
							'left'   => $this->baseTheme->__( 'Left' ),
							'center' => $this->baseTheme->__( 'Center' ),
							'right'  => $this->baseTheme->__( 'Right' ),
						],
						'default_value' => [ 'left' ],
						'allow_null'    => false,
						'multiple'      => false,
						'return_format' => 'value',
						'ajax'          => false,
					],
					[
						'key'           => 'logo_h1_tag_on_home',
						'label'         => $this->baseTheme->__( 'H1 tag around logo' ),
						'message'       => $this->baseTheme->__( 'Put an H1 tag around the logo on the home page' ),
						'type'          => 'true_false',
						'required'      => false,
						'default_value' => true,
						'ui'            => true,
						'ui_on_text'    => 'Yes',
						'ui_off_text'   => 'No',
					],
				],
			];

			return $fields;
		}
	}
