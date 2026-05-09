<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\General\ThemeOptions;
	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use \Theme\BaseTheme\ThemeFlexClassTrait;
	use \Theme\BaseTheme\General\ThemeOptions\ThemeOptionFieldsTrait;

	/**
	 * Class ModuleSettings
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class ModuleSettings extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;
		use ThemeOptionFieldsTrait;

		public function init() {
			add_action( 'acf/init', [ $this, 'registerTabs' ] );
		}

		/**
		 * @param string $optionGroupKey
		 */
		public function registerTab( string $optionGroupKey ): void {
			$optionFieldKey = $optionGroupKey . '__woocommerce';

			$fields = $this->getFields( $optionFieldKey );
			$fields = $this->baseTheme->applyFilters( 'theme_options/woocommerce/sub_fields', $fields, $optionFieldKey );

			$this->addTab( $this->baseTheme->__( 'WooCommerce' ), $optionGroupKey, $optionFieldKey )
			     ->addFields( $fields, $optionGroupKey, $optionFieldKey )
			     ->registerFields();
		}

		public function registerTabs() {
			$this->registerTab( ThemeOptions::THEME_OPTIONS_KEY );
		}

		/**
		 * @param string $optionFieldKey
		 *
		 * @return array[]
		 */
		private function getFields( string $optionFieldKey ): array {
			$fields = [];

			$fields[] = [
				'key'               => 'archive-columns',
				'label'             => 'Archive columns',
				'type'              => 'number',
				'min'               => 1,
				'max'               => 5,
				'wrapper'           => [
					'width' => '100',
				],
				'placeholder'       => $this->baseTheme->__( 'Enter amount of products next to each other' )
			];

			$fields[] = [
				'key'               => 'woocommerce-shop-link',
				'label'             => 'Shop link for "return to shop" buttons',
				'name'              => 'woocommerce-shop-link',
				'type'              => 'link',
				'return_format'     => 'array',
			];

			$fields[] = [
				'key'               => 'woocommerce-checkout-steppers-mobile',
				'label'             => 'Checkout in steps on mobile',
				'name'              => 'woocommerce-checkout-steppers-mobile',
				'type'              => 'true_false',
				'ui'                => 1,
				'ui_on_text'        => 'Yes',
				'ui_off_text'       => 'No',
			];

			$fields[] = [
				'key'               => 'woocommerce-checkout-steppers-desktop',
				'label'             => 'Checkout in steps on desktop',
				'name'              => 'woocommerce-checkout-steppers-desktop',
				'type'              => 'true_false',
				'ui'                => 1,
				'ui_on_text'        => 'Yes',
				'ui_off_text'       => 'No',
			];

			$fields[] = [
				'key'               => 'woocommerce-thank-you-text',
				'label'             => 'Thank you page text',
				'name'              => 'woocommerce-thank-you-text',
				'type'              => 'wysiwyg',
				'tabs'              => 'all',
				'toolbar'           => 'full',
				'media_upload'      => 1,
				'delay'             => 0,
			];

			$fields[] = [
				'key'        => "{$optionFieldKey}__product_prices",
				'label'      => $this->baseTheme->__( 'Product Prices' ),
				'name'       => "{$optionFieldKey}__product_prices",
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'           => "{$optionFieldKey}__product_prices__from_prefix",
						'label'         => $this->baseTheme->__( 'From prefix' ),
						'name'          => "{$optionFieldKey}__product_prices__from_prefix",
						'type'          => 'text',
					]
				]
			];

			$fields[] = [
				'key'        => "{$optionFieldKey}__product_usps",
				'label'      => $this->baseTheme->__( 'Product USPS' ),
				'name'       => "{$optionFieldKey}__product_usps",
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'               => "{$optionFieldKey}__product_usps__items",
						'label'             => $this->baseTheme->__( 'USP items' ),
						'name'              => "{$optionFieldKey}__product_usps__items",
						'type'              => 'repeater',
						'layout'            => 'block',
						'sub_fields'        => [
							[
								'key'           => "{$optionFieldKey}__product_usps__items__text",
								'label'         => $this->baseTheme->__( 'Text' ),
								'name'          => "{$optionFieldKey}__product_usps__items__text",
								'type'          => 'text',
							]
						]
					]
				]
			];

			$fields[] = [
				'key'        => "{$optionFieldKey}__estimated_shipping",
				'label'      => $this->baseTheme->__( 'Product Estimated shipping' ),
				'name'       => "{$optionFieldKey}__estimated_shipping",
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'               => "{$optionFieldKey}__estimated_shipping__usage",
						'label'             => $this->baseTheme->__( 'Estimated shipping usage' ),
						'name'              => "{$optionFieldKey}__estimated_shipping__usage",
						'type'              => 'true_false',
						'ui'                => 1,
						'ui_on_text'        => 'Yes',
						'ui_off_text'       => 'No',
					],
					[
						'key'               => "{$optionFieldKey}__estimated_shipping__in_stock",
						'label'             => $this->baseTheme->__( 'In stock' ),
						'name'              => "{$optionFieldKey}__estimated_shipping__in_stock",
						'type'              => 'text',
						'conditional_logic' => [
							[
								[
									'field'    => "{$optionFieldKey}__estimated_shipping__usage",
									'operator' => '==',
									'value'    => '1',
								],
							],
						],
					],
					[
						'key'               => "{$optionFieldKey}__estimated_shipping__out_of_stock",
						'label'             => $this->baseTheme->__( 'Out of stock' ),
						'name'              => "{$optionFieldKey}__estimated_shipping__out_of_stock",
						'type'              => 'text',
						'conditional_logic' => [
							[
								[
									'field'    => "{$optionFieldKey}__estimated_shipping__usage",
									'operator' => '==',
									'value'    => '1',
								],
							],
						],
					],
					[
						'key'               => "{$optionFieldKey}__estimated_shipping__out_of_stock_but_available",
						'label'             => $this->baseTheme->__( 'Out of stock but available' ),
						'name'              => "{$optionFieldKey}__estimated_shipping__out_of_stock_but_available",
						'type'              => 'text',
						'conditional_logic' => [
							[
								[
									'field'    => "{$optionFieldKey}__estimated_shipping__usage",
									'operator' => '==',
									'value'    => '1',
								],
							],
						],
					]
				],
			];

			$fields[] = [
				'key'        => "{$optionFieldKey}__related_products",
				'label'      => $this->baseTheme->__( 'Related products' ),
				'name'       => "{$optionFieldKey}__related_products",
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'               => "{$optionFieldKey}__related_products__disable",
						'label'             => $this->baseTheme->__( 'Disable related products' ),
						'name'              => "{$optionFieldKey}__related_products__disable",
						'type'              => 'true_false',
						'ui'                => 1,
						'ui_on_text'        => $this->baseTheme->__( 'Yes' ),
						'ui_off_text'       => $this->baseTheme->__( 'No' ),
					],
				]
			];

			$fields[] = [
				'key'        => "{$optionFieldKey}__permalink_rewrites",
				'label'      => $this->baseTheme->__( 'Permalink rewrites' ),
				'name'       => "{$optionFieldKey}__permalink_rewrites",
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'               => "{$optionFieldKey}__permalink_rewrites__product_remove_base",
						'label'             => $this->baseTheme->__( 'Remove product base' ),
						'name'              => "{$optionFieldKey}__permalink_rewrites__product_remove_base",
						'type'              => 'true_false',
						'instructions'      => $this->baseTheme->__( 'By default the product "base" equals "product".' ),
						'ui'                => 1,
						'ui_on_text'        => 'Yes',
						'ui_off_text'       => 'No',
					],
					[
						'key'               => "{$optionFieldKey}__permalink_rewrites__product_category_remove_base",
						'label'             => $this->baseTheme->__( 'Remove product category base' ),
						'name'              => "{$optionFieldKey}__permalink_rewrites__product_category_remove_base",
						'type'              => 'true_false',
						'instructions'      => $this->baseTheme->__( 'By default the product category "base" equals "product-category".' ),
						'ui'                => 1,
						'ui_on_text'        => 'Yes',
						'ui_off_text'       => 'No',
					],
				]
			];

			$fields[] = [
				'key'        => "{$optionFieldKey}__search_results",
				'label'      => $this->baseTheme->__( 'Search results' ),
				'name'       => "{$optionFieldKey}__search_results",
				'type'       => 'group',
				'required'   => false,
				'layout'     => 'block',
				'sub_fields' => [
					[
						'key'               => "{$optionFieldKey}__search_results__only_products",
						'label'             => $this->baseTheme->__( 'Only show products' ),
						'name'              => "{$optionFieldKey}__search_results__only_products",
						'type'              => 'true_false',
						'ui'                => 1,
						'ui_on_text'        => 'Yes',
						'ui_off_text'       => 'No',
					],
					[
						'key'               => "{$optionFieldKey}__search_results__additional_search_parameters",
						'label'             => $this->baseTheme->__( 'Additional search parameters' ),
						'name'              => "{$optionFieldKey}__search_results__additional_search_parameters",
						'type'              => 'checkbox',
						'choices'           => [
							'sku' => $this->baseTheme->__( 'SKU' ),
						],
						'multiple'          => true,
					],
					[
						'key'           => "{$optionFieldKey}__search_results__amount_of_rows",
						'label'         => $this->baseTheme->__( 'Amount of rows' ),
						'name'          => "{$optionFieldKey}__search_results__amount_of_rows",
						'type'          => 'number',
						'default_value' => 4,
					],
					[
						'key'           => "{$optionFieldKey}__search_results__results_per_row",
						'label'         => $this->baseTheme->__( 'Amount of results per row' ),
						'name'          => "{$optionFieldKey}__search_results__results_per_row",
						'type'          => 'number',
						'default_value' => 3,
						'min'           => 1,
						'max'           => 5
					],
				]
			];

			return $fields;
		}
	}