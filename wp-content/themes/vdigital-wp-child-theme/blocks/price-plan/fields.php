<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

class Fields {
	const BLOCK_FIELDS_KEY = 'price-plan';
	const BASE_KEY = 'price-plan_post';

	public function initialize(): void {
		$this->blockFields();
		$this->postTypeFields();
		add_filter( 'acf/validate_value/name=' . self::BLOCK_FIELDS_KEY . '_plan', [
			$this,
			'validateConnectedPostTypes'
		], 10, 4 );
	}

	public function validateConnectedPostTypes( $valid, $value, $field, $input ) {
		if ( ! $valid ) {
			return baseTheme()->__( 'Selecting a price plan is required.' );
		}

		return $valid;
	}

	public function blockFields(): void {
		acf_add_local_field_group( [
			'key'                   => self::BLOCK_FIELDS_KEY,
			'title'                 => baseTheme()->__( 'Price plan' ),
			'fields'                => [
				[
					'key'   => 'field_' . self::BLOCK_FIELDS_KEY . '_title',
					'label' => baseTheme()->__( 'Title' ),
					'name'  => self::BLOCK_FIELDS_KEY . '_title',
					'type'  => 'text',
				],
				[
					'key'        => 'field_' . self::BLOCK_FIELDS_KEY . '_items',
					'label'      => baseTheme()->__( 'Price plans' ),
					'name'       => self::BLOCK_FIELDS_KEY . '_items',
					'type'       => 'repeater',
					'max'        => 4,
					'sub_fields' => [
						[
							'key'           => 'field_' . self::BLOCK_FIELDS_KEY . '_plan',
							'label'         => baseTheme()->__( 'Plan' ),
							'name'          => self::BLOCK_FIELDS_KEY . '_plan',
							'type'          => 'post_object',
							'post_type'     => [ 'price-plan' ],
							'allow_null'    => 0,
							'required'      => 1,
							'multiple'      => 0,
							'return_format' => 'id'
						]
					],
				],
			],
			'location'              => [
				[
					[
						'param'    => 'block',
						'operator' => '==',
						'value'    => 'acf/price-plan',
					],
				],
			],
			'position'              => 'normal',
			'style'                 => 'default',
			'label_placement'       => 'top',
			'instruction_placement' => 'label',
			'active'                => true,
		] );
	}

	public function postTypeFields(): void {

		$btnField = Buttons::getFields(
			self::BASE_KEY . '_buttons_',
			true,
			[ '', 'outline', 'white_outline', 'blue', 'dark_outline' ],
			false
		);

		$btnField = array_filter( $btnField, function ( $field ) {
			return $field['key'] !== 'field_' . self::BASE_KEY . '_buttons_' . 'button_type';
		} );

		acf_add_local_field_group( [
			'key'      => self::BASE_KEY,
			'title'    => baseTheme()->__( 'Price plan' ),
			'fields'   => [
				[
					'key'   => 'field_' . self::BASE_KEY . '_description',
					'label' => baseTheme()->__( 'Description' ),
					'name'  => self::BASE_KEY . '_description',
					'type'  => 'wysiwyg',
				],
				[
					'key'     => 'field_' . self::BASE_KEY . '_color',
					'label'   => baseTheme()->__( 'Plan color' ),
					'name'    => self::BASE_KEY . '_color',
					'type'    => 'select',
					'choices' => [
						'green'         => baseTheme()->__( 'Green' ),
						'dark_green'    => baseTheme()->__( 'Dark green' ),
						'teal'          => baseTheme()->__( 'Teal' ),
						'cobalt'        => baseTheme()->__( 'Cobalt' ),
					],
					'wrapper' => [
						'width' => '50%',
					],
				],
				[
					'key'     => 'field_' . self::BASE_KEY . '_popular',
					'label'   => baseTheme()->__( 'Star label' ),
					'name'    => self::BASE_KEY . '_popular',
					'type'    => 'true_false',
					'ui'      => 1,
					'wrapper' => [
						'width' => '50%',
					],
				],
				
				[
					'key'        => 'field_' . self::BASE_KEY . '_buttons',
					'name'       => self::BASE_KEY . '_buttons',
					'type'       => 'repeater',
					'min'        => 1,
					'max'        => 1,
					'layout'     => 'row',
					'sub_fields' => [
						...$btnField
					]
				],

				[
					'key'   => 'field_' . self::BASE_KEY . '_enable_price',
					'label' => baseTheme()->__( 'Show price' ),
					'name'  => self::BASE_KEY . '_enable_price',
					'ui'    => 1,
					'type'  => 'true_false',
				],
				...array_map( function ( $currency ) {
					return [
						'key'               => 'field_' . self::BASE_KEY . '_price_month_' . strtolower( $currency ),
						'label'             => baseTheme()->__( 'Price per month (' . $currency . ')' ),
						'name'              => self::BASE_KEY . '_price_month_' . strtolower( $currency ),
						'type'              => 'number',
						'required'          => 1,
						'wrapper'           => [
							'width' => '33%',
						],
						'conditional_logic' => [
							[
								[
									'field'    => 'field_' . self::BASE_KEY . '_enable_price',
									'operator' => '==',
									'value'    => '1',
								]
							]
						]
					];
				}, [ 'USD', 'EUR', 'GBP' ] ),
				[
					'key'          => 'field_' . self::BASE_KEY . '_all_from_text',
					'label'        => baseTheme()->__( 'Features introduction text' ),
					'name'         => self::BASE_KEY . '_all_from_text',
					'type'         => 'text',
					'instructions' => baseTheme()->__( 'For example: "Everything from PRO"' ),
					'required'     => 1,
				],
				[
					'key'   => 'field_' . self::BASE_KEY . '_all_from_explanation',
					'label' => baseTheme()->__( 'Information on hover' ),
					'name'  => self::BASE_KEY . '_all_from_explanation',
					'type'  => 'textarea',
				],
				[
					'key'          => 'field_' . self::BASE_KEY . '_usps',
					'label'        => baseTheme()->__( 'Features' ),
					'name'         => self::BASE_KEY . '_usps',
					'type'         => 'repeater',
					'layout'       => 'block',
					'button_label' => baseTheme()->__( 'New Feature' ),
					'sub_fields'   => [
						[
							'key'      => 'field_usps-text',
							'label'    => baseTheme()->__( 'Text' ),
							'name'     => 'usps-text',
							'type'     => 'text',
							'required' => 1,
							'wrapper'  => [
								'width' => '75%',
							],
						],
						[
							'key'   => 'field_usps-explanation',
							'label' => baseTheme()->__( 'Explanation' ),
							'name'  => 'usps-explanation',
							'type'  => 'textarea',
						],
					],
				],
			],
			'location' => [
				[
					[
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'price-plan',
					],
				],
			],
			'active'   => true,
		] );
	}
}

( new Fields() )->initialize();
