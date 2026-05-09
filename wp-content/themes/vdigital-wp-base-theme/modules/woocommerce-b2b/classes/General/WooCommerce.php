<?php

	namespace Theme\Modules\WoocommerceB2b\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Modules\WoocommerceB2b;

	/**
	 * Class WooCommerce
	 *
	 * @package Theme\Modules\WoocommerceB2b\General
	 *
	 * @property-read WoocommerceB2b $themeModule
	 */
	class WooCommerce extends ThemeModuleAbstractClass {

		public function changeVariableProductPrice( $price, $productInstance ) {
			if ( ! $this->maybeShouldDisableTax() ) {
				return $price;
			}

			$prices = $productInstance->get_variation_prices( true );

			$tax_rates      = \WC_Tax::get_rates( $productInstance->get_tax_class() );
			$base_tax_rates = \WC_Tax::get_base_tax_rates( $productInstance->get_tax_class( 'unfiltered' ) );

			if ( empty( $prices['price'] ) ) {
				$price = apply_filters( 'woocommerce_variable_empty_price_html', '', $productInstance );
			} else {
				$min_price = current( $prices['price'] ) - array_sum( apply_filters( 'woocommerce_adjust_non_base_location_prices', true ) ?
						\WC_Tax::calc_tax( current( $prices['price'] ), $base_tax_rates, true ) : \WC_Tax::calc_tax( current( $prices['price'] ), $tax_rates, true ) );

				$max_price = end( $prices['price'] ) - array_sum( apply_filters( 'woocommerce_adjust_non_base_location_prices', true ) ?
						\WC_Tax::calc_tax( end( $prices['price'] ), $base_tax_rates, true ) : \WC_Tax::calc_tax( end( $prices['price'] ), $tax_rates, true ) );

				$min_reg_price = current( $prices['regular_price'] ) - array_sum( apply_filters( 'woocommerce_adjust_non_base_location_prices', true ) ?
						\WC_Tax::calc_tax( current( $prices['regular_price'] ), $base_tax_rates, true )
						: \WC_Tax::calc_tax( current( $prices['regular_price'] ), $tax_rates, true ) );

				$max_reg_price = end( $prices['regular_price'] ) - array_sum( apply_filters( 'woocommerce_adjust_non_base_location_prices', true ) ?
						\WC_Tax::calc_tax( end( $prices['regular_price'] ), $base_tax_rates, true ) : \WC_Tax::calc_tax( end( $prices['regular_price'] ), $tax_rates, true ) );

				if ( $min_price !== $max_price ) {
					$price = wc_format_price_range( $min_price, $max_price );
				} elseif ( $productInstance->is_on_sale() && $min_reg_price === $max_reg_price ) {
					$price = wc_format_sale_price( wc_price( $max_reg_price ), wc_price( $min_price ) );
				} else {
					$price = wc_price( $min_price, [ 'ex_tax_label' => true ] );
				}

				$price = $price . $productInstance->get_price_suffix();
			}

			return apply_filters( 'woocommerce_get_price_html', $price, $productInstance );
		}

		public function disableTaxByUserRole( $taxClass ) {
			$zeroTaxRate = $this->maybeShouldDisableTax();

			if ( $zeroTaxRate ) {
				return $zeroTaxRate;
			}

			return $taxClass;
		}

		public function displayTaxFreeLabelToProductRange( $price, $from, $to ) {
			if ( ! $this->maybeShouldDisableTax() ) {
				return $price;
			}

			return sprintf( _x( '%1$s &ndash; %2$s', 'Price range: from-to', 'woocommerce' ), is_numeric( $from ) ? wc_price( $from, [ 'ex_tax_label' => true ] )
				: $from, is_numeric( $to ) ? wc_price( $to, [ 'ex_tax_label' => true ] ) : $to );
		}

		public function displayTaxFreeProductPriceInCart( $productPrice, $cartItem ) {
			if ( ! $this->maybeShouldDisableTax() ) {
				return $productPrice;
			}

			return ! empty ( $cartItem['data'] ) ? wc_price( wc_get_price_excluding_tax( $cartItem['data'] ), [ 'ex_tax_label' => true ] ) : $productPrice;
		}

		public function displayTaxFreeSimpleProductPrice( $price, $productInstance ) {
			if ( ( $productInstance->get_type() != 'simple' && ! is_product() ) || ! $this->maybeShouldDisableTax() ) {
				return $price;
			}

			return wc_price(
				wc_get_price_excluding_tax(
					$productInstance
				),
				[ 'ex_tax_label' => true ]
			);
		}

		public function disableTaxInCart( $returnValue ) {
			if ( ! $this->maybeShouldDisableTax() ) {
				return $returnValue;
			}

			return false;
		}

		public function alwaysApplyTaxOnFee( $cart_totals_fee_html, $fee ) {
			return $cart_totals_fee_html = wc_price( $fee->total + $fee->tax );
		}

		public function init() {
			add_filter( 'woocommerce_get_price_html', [ $this, 'displayTaxFreeSimpleProductPrice' ], 10, 2 );

			add_filter( 'woocommerce_variable_price_html', [ $this, 'changeVariableProductPrice' ], 10, 2 );

			add_filter( 'woocommerce_format_price_range', [ $this, 'displayTaxFreeLabelToProductRange' ], 10, 3 );

			//add_filter( 'woocommerce_cart_item_price', [ $this, 'displayTaxFreeProductPriceInCart' ], 10, 2 );

			add_filter( 'woocommerce_cart_totals_fee_html', [ $this, 'alwaysApplyTaxOnFee' ], 10, 2 );

			add_filter( 'woocommerce_cart_display_prices_including_tax', [ $this, 'disableTaxInCart' ], 10, 1 );

			//add_filter( 'woocommerce_product_get_tax_class', [ $this, 'disableTaxByUserRole' ], 10, 1 );

			//add_filter( 'woocommerce_product_variation_get_tax_class', [ $this, 'disableTaxByUserRole' ], 10, 1 );
		}

		public function maybeShouldDisableTax() {
			if ( is_user_logged_in() ) {
				$user  = wp_get_current_user();
				$roles = $this->themeModule->General->getRoles();

				$userRoles = array_intersect( (array) $user->roles,
					array_map( function ( \WP_Post $role ) {
						return WoocommerceB2b::B2B_ROLE_PREFIX . $role->post_name;
					}, $roles )
				);

				if ( ! empty ( $userRoles[0] ) ) {
					$userRolePost = get_posts(
						[
							'name'      => str_replace( WoocommerceB2b::B2B_ROLE_PREFIX, '', $userRoles[0] ),
							'post_type' => WoocommerceB2b::B2B_ROLE_POST_TYPE
						]
					);

					if ( ! empty ( $userRolePost[0] ) ) {
						$disableTaxes = get_field( 'field__b2b__user_role__disable_taxes', $userRolePost[0]->ID );

						if ( $disableTaxes ) {
							return true;
						}
					}
				}
			}

			return false;
		}
	}