<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class ProductQuery
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class ProductQuery extends ThemeModuleAbstractClass {

		public function filterQueryBySubCategory( $tax_query ) {
			if ( is_admin() || ! is_product_category() ) {
				return $tax_query;
			}

			$taxonomy = wc_attribute_taxonomy_slug( 'product_cat' );

			if ( ! empty( $_GET[ 'filter_' . $taxonomy ] ) ) {
				$terms = strpos( $_GET[ 'filter_' . $taxonomy ], ',' ) !== false ?
					explode( ',', $_GET[ 'filter_' . $taxonomy ] ) : [ (string) $_GET[ 'filter_' . $taxonomy ] ];

				if ( is_array( $terms ) ) {
					$tax_query[] = [
						'taxonomy' => $taxonomy,
						'field'    => 'term_id',
						'terms'    => $terms,
						'operator' => 'IN'
					];
				}
			}

			return $tax_query;
		}

		public function filterQueryWhenUsingPrice( $query ) {
			/**
			 * Testing bug: https://webwhales.teamwork.com/#/tasks/28985737
			 * Ticket: https://github.com/woocommerce/woocommerce/issues/24349
			 */

			global $wpdb;

			$query['join'] .= "
				INNER JOIN {$wpdb->postmeta} AS product_post_meta ON {$wpdb->posts}.ID = product_post_meta.post_id";

			$query['where'] .= "
				AND product_post_meta.meta_key = '_price'
				AND product_post_meta.meta_value < 18";

			return $query;
		}

		public function init() {
			$this->addFilters();
		}

		private function addFilters() {
			add_filter( 'woocommerce_product_query_tax_query', [ $this, 'filterQueryBySubCategory' ], 10, 1 );

			// @ToDo: Make sure counting term matches works correctly.
			/**
			 * Testing bug: https://webwhales.teamwork.com/#/tasks/28985737
			 * Ticket: https://github.com/woocommerce/woocommerce/issues/24349
			 */
			//add_filter( 'woocommerce_get_filtered_term_product_counts_query', [ $this, 'filterQueryWhenUsingPrice'], 10, 1 );

			/*add_filter( 'woocommerce_price_filter_sql', function ( $sql, $metaQuery ) {
				var_dump( $sql );
				var_dump(  $metaQuery );

				return $sql;
			}, 10, 2 );*/
		}
	}