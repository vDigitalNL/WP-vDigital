<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceCheckout
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceCheckout extends ThemeModuleAbstractClass {

		public function addActions() {
			add_action( 'woocommerce_before_checkout_billing_form', [ $this, 'beforeCheckoutBillingForm' ] );
			add_action( 'woocommerce_checkout_update_order_meta', [ $this, 'checkoutUpdateOrderMeta' ] );
		}

		public function addFilters() {
			add_filter( 'woocommerce_form_field_heading', [ $this, 'formFieldHeading' ], 10, 4 );
			add_filter( 'woocommerce_checkout_fields', [ $this, 'checkoutFields' ], 20, 1 );
			add_filter( 'woocommerce_default_address_fields', [ $this, 'defaultAddressFields' ], 20, 1 );
		}

		/**
		 * @param $checkout
		 */
		public function beforeCheckoutBillingForm( $checkout ) {
			woocommerce_form_field( 'order-as-company', [
				'type'  => 'checkbox',
				'class' => [ 'form-row-wide' ],
				'label' => ' ' . $this->baseTheme->__( 'Order as company' ),
			], $checkout->get_value( 'order-as-company' ) ); ?>

			<h4><?php echo $this->baseTheme->__( 'Contact information' ); ?></h4><?php
		}

		/**
		 * Customize checkout fields
		 *
		 * @param $fields
		 *
		 * @return mixed
		 */
		public function checkoutFields( $fields ) {
			$fields['billing']['billing_vat-number']          = [
				'label'    => $this->baseTheme->__( 'VAT-number' ),
				'class'    => [
					'form-row-wide hide'
				],
				'priority' => 30,
			];
			$fields['billing']['billing_heading_name']        = [
				'type'     => 'heading',
				'label'    => $this->baseTheme->__( 'Address information' ),
				'priority' => 35,
			];
			$fields['billing']['billing_company']['class'][0] = 'form-row-wide hide';
			$fields['billing']['billing_email']['priority']   = 20;
			$fields['billing']['billing_phone']['priority']   = 20;

			return $fields;
		}

		/**
		 * Save custom fields
		 *
		 * @param $order_id
		 */
		public function checkoutUpdateOrderMeta( $order_id ) {
			if ( ! empty( $_POST['billing_vat-number'] ) ) {
				update_post_meta( $order_id, 'billing_vat-number', sanitize_text_field( $_POST['billing_vat-number'] ) );
			}
		}

		/**
		 * Customize checkout fields
		 * Some fields can be only overwritten within this filter
		 *
		 * @param $fields
		 */
		public function defaultAddressFields( $fields ) {

			$fields['address_2'] = [
				'label'       => $this->baseTheme->__( 'Address addition' ),
				'placeholder' => $this->baseTheme->__( 'Address addition' ),
			];

			return $fields;
		}

		/**
		 * Adds a 'heading' field type
		 * Used for checkout fields  @param $key
		 *
		 * @param $args
		 * @param $value
		 * @param $field
		 *
		 * @see checkoutFields
		 *
		 */
		public function formFieldHeading( $field, $key, $args, $value ) {
			$output = '<h4 class="form-row form-row-wide form-row-heading">' . __( $args['label'], 'woocommerce' ) . '</h4>';
			echo $output;
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}
	}