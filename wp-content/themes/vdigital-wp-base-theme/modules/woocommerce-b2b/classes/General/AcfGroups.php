<?php

	namespace Theme\Modules\WoocommerceB2b\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Modules\WoocommerceB2b;

	/**
	 * Class AcfGroups
	 *
	 * @package Theme\Modules\WoocommerceB2b\General
	 *
	 * @property-read WoocommerceB2b $themeModule
	 */
	class AcfGroups extends ThemeModuleAbstractClass {

		// @ToDo: When you're not ACF fields this class can be removed(also unlink within General.php).

		public function init() {
			$this->registerB2BProductCategoryFields();

			$this->registerB2BPostFields();
		}

		private function registerB2BPostFields() {
			$b2bPostFields = baseTheme()->applyFilters(
				'group__b2b__user_role_post__fields', [
					[
						'key'               => 'field__b2b__user_role__disable_taxes',
						'label'             => baseTheme()->__( 'Disable taxes' ),
						'name'              => 'field__b2b__user_role__disable_taxes',
						'type'              => 'true_false',
						'instructions'      => baseTheme()->__( 'This option will show products without their additional tax. Within the cart & checkout the tax will be shown.' ),
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => [
							'width' => '',
							'class' => '',
							'id'    => '',
						],
						'collapsed'         => '',
					]
				]
			);

			$b2bPostLocations = baseTheme()->applyFilters(
				'group__b2b__user_role_post__locations', [
					[
						[
							'param'    => 'post_type',
							'operator' => '=',
							'value'    => WoocommerceB2b::B2B_ROLE_POST_TYPE
						]
					]
				]
			);

			acf_add_local_field_group(
				[
					'key'             => 'group__b2b__user_role_post',
					'title'           => baseTheme()->__( 'User role options' ),
					'fields'          => (array) $b2bPostFields,
					'location'        => (array) $b2bPostLocations,
					'menu_order'      => 0,
					'position'        => baseTheme()->applyFilters( 'group__b2b__user_role_post__position', 'side' ),
					'style'           => 'default',
					'label_placement' => 'top',
					'hide_on_screen'  => '',
					'active'          => 1,
					'description'     => ''
				]
			);
		}

		private function registerB2BProductCategoryFields() {
			$b2bFields = [];

			foreach ( $this->themeModule->General->getRoles() as $role ) {
				$b2bFields[] = [
					'key'               => "field__b2b_role__discount_{$role->ID}",
					'label'             => sprintf( $this->baseTheme->__( '%s discount' ), $role->post_title ),
					'name'              => "field__b2b_role__discount_{$role->ID}",
					'type'              => 'number',
					'instructions'      => sprintf( $this->baseTheme->__( 'Percentage discount for the %s user role' ), $role->post_title ),
					'required'          => 0,
					'conditional_logic' => 0,
					'wrapper'           => array(
						'width' => '',
						'class' => '',
						'id'    => '',
					),
					'default_value'     => '',
					'placeholder'       => '',
					'prepend'           => '',
					'append'            => '',
					'min'               => 0,
					'max'               => 100,
					'step'              => '',
				];
			}

			$b2bFields    = baseTheme()->applyFilters( 'woocommerce_b2b/role_discount_settings/fields', $b2bFields );
			$b2bLocations = baseTheme()->applyFilters(
				'woocommerce_b2b/role_discount_settings/locations', [
				[

					[
						'param'    => 'taxonomy',
						'operator' => '==',
						'value'    => 'product_cat',
					]
				]
			] );

			acf_add_local_field_group(
				[
					'key'                   => 'group__b2b_role__discounts',
					'name'                  => 'group__b2b_role__discounts',
					'title'                 => baseTheme()->__( 'B2B module' ),
					'fields'                => (array) $b2bFields,
					'location'              => (array) $b2bLocations,
					'menu_order'            => 0,
					'position'              => 'normal',
					'style'                 => 'default',
					'label_placement'       => 'top',
					'instruction_placement' => 'label',
					'hide_on_screen'        => '',
					'active'                => 1,
					'description'           => '',
				]
			);
		}
	}