<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceFields
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceFields extends ThemeModuleAbstractClass {

		public function addActions() {
		}

		public function addFilters() {
			add_filter( 'woocommerce_form_field_checkbox', [ $this, 'changeCheckboxFormField' ], 10, 4 );
		}

		/**
		 * Input fields are placed in labels by default by WooCommerce.
		 * We want to make sure the label is placed after the input field so :before pseudo class for +checked labels
		 * can be attached to create custom checkboxes in CSS. For this to happen within the filter,
		 * a part of the function from woocommerce_form_field needs to be copied so we can
		 * re-create the Field HTML with the necessary variables and change the order in the $field
		 * variable and pass it to $feld_html
		 *
		 * @param $field
		 * @param $key
		 * @param $args
		 * @param $value
		 *
		 * @return string
		 * @see woocommerce_form_field
		 *
		 */
		public function changeCheckboxFormField( $field, $key, $args, $value ) {
			$custom_attributes         = array();
			$args['custom_attributes'] = array_filter( (array) $args['custom_attributes'], 'strlen' );

			if ( $args['maxlength'] ) {
				$args['custom_attributes']['maxlength'] = absint( $args['maxlength'] );
			}

			if ( ! empty( $args['autocomplete'] ) ) {
				$args['custom_attributes']['autocomplete'] = $args['autocomplete'];
			}

			if ( true === $args['autofocus'] ) {
				$args['custom_attributes']['autofocus'] = 'autofocus';
			}

			if ( $args['description'] ) {
				$args['custom_attributes']['aria-describedby'] = $args['id'] . '-description';
			}

			if ( ! empty( $args['custom_attributes'] ) && is_array( $args['custom_attributes'] ) ) {
				foreach ( $args['custom_attributes'] as $attribute => $attribute_value ) {
					$custom_attributes[] = esc_attr( $attribute ) . '="' . esc_attr( $attribute_value ) . '"';
				}
			}

			if ( $args['required'] ) {
				$args['class'][] = 'validate-required';
				$required        = '&nbsp;<abbr class="required" title="' . esc_attr__( 'required', 'woocommerce' ) . '">*</abbr>';
			} else {
				$required = '&nbsp;<span class="optional">(' . esc_html__( 'optional', 'woocommerce' ) . ')</span>';
			}
			$sort            = $args['priority'] ? $args['priority'] : '';
			$field_container = '<p class="form-row %1$s" id="%2$s" data-priority="' . esc_attr( $sort ) . '">%3$s</p>';
			$label_id        = $args['id'];
			$field_html      = '';

			// BOF custom code
			$field = '<input type="' . esc_attr( $args['type'] ) . '" class="input-checkbox ' . esc_attr( implode( ' ', $args['input_class'] ) ) . '" name="' . esc_attr( $key ) . '" id="' . esc_attr( $args['id'] ) . '" value="1" ' . checked( $value, 1, false ) . ' />' .
			         '<label class="checkbox ' . implode( ' ', $args['label_class'] ) . '" ' . implode( ' ', $custom_attributes ) . ' for="' . esc_attr( $args['id'] ) . '"> ' . $args['label'] . $required . '</label>';
			// EOF custom code

			if ( $args['label'] && 'checkbox' !== $args['type'] ) {
				$field_html .= '<label for="' . esc_attr( $label_id ) . '" class="' . esc_attr( implode( ' ', $args['label_class'] ) ) . '">' . $args['label'] . $required . '</label>';
			}

			$field_html .= '<span class="woocommerce-input-wrapper">' . $field;

			if ( $args['description'] ) {
				$field_html .= '<span class="description" id="' . esc_attr( $args['id'] ) . '-description" aria-hidden="true">' . wp_kses_post( $args['description'] ) . '</span>';
			}

			$field_html .= '</span>';

			$container_class = esc_attr( implode( ' ', $args['class'] ) );
			$container_id    = esc_attr( $args['id'] ) . '_field';
			$field           = sprintf( $field_container, $container_class, $container_id, $field_html );

			return $field;
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}
	}