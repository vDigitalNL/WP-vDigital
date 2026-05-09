<?php

	namespace Theme\Modules\WoocommerceB2b\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Helpers\Arr;
	use Theme\Modules\WoocommerceB2b;

	use WP_Post;
	use function array_intersect;

	/**
	 * Class CustomUserRoleDiscounts
	 *
	 * @package Theme\Modules\WoocommerceB2b\General
	 *
	 * @property-read WoocommerceB2b $themeModule
	 */
	class CustomUserRoleDiscounts extends ThemeModuleAbstractClass {

		public function init() {
			add_action( 'woocommerce_cart_calculate_fees', [ $this, 'addUserRoleDiscounts' ], 20, 1 );

			//add_filter( 'woocommerce_cart_contents_total', [ $this, 'applyDiscountInCartTotals' ], 10, 1 );
		}

		/**
		 * @ToDo: When the price in the cart within the menu is an issue regarding not taking the fees into account. This should be the filter to make that right although $cart->get_fees() does not contain anything within this filter. I'm not sure whether the negative fee value is to blame or the location of requesting the fee information.
		 */
		public function applyDiscountInCartTotals( $cartTotalPrice ) {
			$cart = new \WC_Cart();
			dd( $cart );
			dump( $cartTotalPrice );
			return $cartTotalPrice;
		}

		public function addUserRoleDiscounts( \WC_Cart $cart ) {

			if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
				return;
			}

			$categoryDiscounts  = [];
			$user               = wp_get_current_user();
			$roles              = $this->themeModule->General->getRoles();

			/*$maybeHasZeroRateTax = WoocommerceB2b::getInstance()->General->WooCommerce->maybeShouldDisableTax();
			$taxRate = $maybeHasZeroRateTax == false ? $maybeHasZeroRateTax : '';*/


			// Getting the roles that are within the current user and are B2B roles.
			$userBusinessRoles = array_intersect( (array) $user->roles,
				array_map( function ( WP_Post $role ) {
					return WoocommerceB2b::B2B_ROLE_PREFIX . $role->post_name;
				}, $roles )
			);

			// Early return if none of the B2B roles are within the current user.
			if ( empty( $userBusinessRoles ) ) {
				return;
			}

			// Early return when the cart is empty.
			if ( empty ( WC()->cart->get_cart_contents() ) ) {
				return;
			}

			// Looping over all the cart items.
			foreach ( WC()->cart->get_cart_contents() as $cartItem ) {
				$itemTerms          = wc_get_product( $cartItem['product_id'] )->get_category_ids();
				$productDiscounts    = [];

				if ( empty ( $itemTerms ) ) {
					continue;
				}

				foreach( $itemTerms as $itemTerm ) {
					$category                   = get_term( $itemTerm );
					$categoryAncestors          = get_ancestors( $category->term_id, 'product_cat' );
					$categoryDiscountPercentage = '';

					if ( ! $category ) {
						continue;
					}

					// Looping over the available discount roles.
					foreach( $roles as $role ) {

						// Getting the discount value for the current category in combination
						// with the current looped role.
						$categoryRoleDiscount = get_field( 'field__b2b_role__discount_' . $role->ID, 'product_cat_' . $category->term_id );

						// Checking whether the category discount percentage option is empty OR
						// whether the looped role does not occur in the current user his/her roles.
						if ( ! $categoryRoleDiscount || ! in_array( WoocommerceB2b::B2B_ROLE_PREFIX . $role->post_name, $user->roles ) ) {
							continue;
						}

						$categoryDiscountPercentage = $categoryRoleDiscount;
					}

					if ( ! $categoryDiscountPercentage ) {
						continue;
					}

					$productDiscounts[] = [
						'category_id'       => $category->term_id,
						'category_name'     => $category->name,
						'category_discount' => (int) $categoryDiscountPercentage,
						'category_parent'   => $category->parent,
						'category_ancestors' => count( $categoryAncestors )
					];
				}

				$productDiscounts = ! empty ( $productDiscounts ) ? Arr::sortMultidimensional( $productDiscounts, 'category_ancestors', true  ) : [];
				$productDiscount = reset( $productDiscounts );

				if (
					! empty ( $productDiscount ) &&
					is_array( $productDiscount ) &&
					! empty ( $productDiscount['category_discount'] ) &&
					! empty ( $productDiscount['category_name'] ) &&
					! empty ( $productDiscount['category_id'] ) &&
					$productDiscount['category_discount'] > 0
				) {
					if ( ! isset( $categoryDiscounts[$productDiscount['category_id'] ] ) ) {
						$categoryDiscounts[$productDiscount['category_id']] = [
							'category_name'     => $productDiscount['category_name'],
							'category_discount' => $productDiscount['category_discount'],
							'category_amount'   => $cartItem['line_subtotal']
						];
					} else {
						$categoryDiscounts[$productDiscount['category_id']]['category_amount'] = isset( $categoryDiscounts[$productDiscount['category_id'] ] ) ?
							$categoryDiscounts[$productDiscount['category_id'] ]['category_amount'] + $cartItem['line_subtotal'] : $cartItem['line_subtotal'];
					}
				}
			}

			if ( ! empty ( $categoryDiscounts ) ) {
				foreach( $categoryDiscounts as $categoryDiscount ) {
					if (
						empty( $categoryDiscount['category_name'] ) ||
						empty( $categoryDiscount['category_discount'] ) ||
						empty( $categoryDiscount['category_amount'] )
					) {
						continue;
					}

					$cart->add_fee( $categoryDiscount['category_name'] . ' ' .  $categoryDiscount['category_discount'] . '%', - ( $categoryDiscount['category_amount'] * ( $categoryDiscount['category_discount'] / 100 ) ), true );
				}
			}
		}
	}