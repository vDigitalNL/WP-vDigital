<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Modules\WoocommerceEssentials;

	/**
	 * Class WooCommerceSearchResults
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 *
	 * @property-read WoocommerceEssentials $themeModule
	 */
	class WooCommerceSearchResults extends ThemeModuleAbstractClass {

		public function amountProductColumns( $columns ) {
			if ( ! is_search() ) {
				return $columns;
			}

			$searchOptions = $this->getSearchResultsOptions();

			return $searchOptions && $searchOptions['results_per_row'] ? (int) $searchOptions['results_per_row'] : $columns;
		}

		/**
		 * @param           $foundPosts
		 * @param \WP_Query $postsQuery
		 *
		 * @return mixed
		 */
		public function applyWooCommercePaginationGlobals( $foundPosts, $postsQuery ) {

			if ( is_search() && $foundPosts > 1 ) {
				$searchOptions = $this->getSearchResultsOptions();
				$productAmount = $searchOptions['amount_of_rows'] * $searchOptions['results_per_row'];

				$GLOBALS['woocommerce_loop']['loop']         = $productAmount;
				$GLOBALS['woocommerce_loop']['per_page']     = $productAmount;
				$GLOBALS['woocommerce_loop']['total']        = (int) $foundPosts;
				$GLOBALS['woocommerce_loop']['total_pages']  = ceil( (int) $foundPosts / $productAmount );
				$GLOBALS['woocommerce_loop']['current_page'] = ! empty ( $postsQuery->query ) && ! empty ( $postsQuery->query['paged'] ) ?
					$postsQuery->query['paged'] : 1;
			}

			return $foundPosts;
		}

		public function changeMetaRelation( $args ) {
			if ( empty ( $args ) || empty( $args['where'] ) ) {
				return $args;
			}

			if ( strpos( $args['where'], '_sku' ) !== false ) {
				$args['where'] = str_replace( 'AND (', 'OR (', $args['where'] );
			}

			return $args;
		}

		public function changeSearchQuery( $query ) {
			if ( $query->is_search && ! is_admin() ) {

				$searchOptions = $this->getSearchResultsOptions();

				// Limit the search results to just products.
				if ( $searchOptions['only_products'] ) {
					$query->set( 'post_type', [ 'product' ] );
				}

				if ( $searchOptions['additional_search_parameters'] ) {
					$metaQuery = ! empty ( $query->get( 'meta_query' ) ) ? $query->get( 'meta_query' ) : [ 'relation' => 'AND' ];

					foreach ( json_decode( $searchOptions['additional_search_parameters'], true ) as $searchOption ) {
						switch ( $searchOption['value'] ) {
							case '_sku':
								if ( empty ( $query->query['s'] ) ) {
									continue;
								}

								$metaQuery[] = [
									'key'     => '_sku',
									'value'   => $query->query['s'],
									'compare' => '='
								];

								break;
						}
					}

					$query->set( 'meta_query', $metaQuery );
				}

				$query->set(
					'posts_per_page',
					$searchOptions['amount_of_rows'] * $searchOptions['results_per_row']
				);
			}

			return $query;
		}

		public function changeSearchTemplates() {
			$this->themeModule->registerTemplatePath( 'content-search' );

			$this->themeModule->registerTemplatePath( 'search' );
		}

		public function getSearchResultsOptions() {

			// Getting the options related to the search page.
			$searchResultOptions = $this->baseTheme->getOption( 'woocommerce' )['search_results'];

			return [
				'only_products'                => $searchResultOptions && ! empty ( $searchResultOptions['only_products'] ),
				'amount_of_rows'               => $searchResultOptions && ! empty ( $searchResultOptions['amount_of_rows'] ) ?
					$searchResultOptions['amount_of_rows'] : 4,
				'results_per_row'              => $searchResultOptions && ! empty ( $searchResultOptions['results_per_row'] ) ?
					$searchResultOptions['results_per_row'] : 3,
				'additional_search_parameters' => $searchResultOptions && ! empty ( $searchResultOptions['additional_search_parameters'] )
					? $searchResultOptions['additional_search_parameters'] : false
			];
		}

		public function init() {
			$this->addActions();

			$this->addFilters();

			$this->removeActions();

			$this->changeSearchTemplates();
		}

		public function maybeDisableRelatedProducts() {
			$relatedProductOptions = $this->baseTheme->getOption( 'woocommerce' )['related_products'];

			if ( $relatedProductOptions && isset( $relatedProductOptions['disable'] ) && $relatedProductOptions['disable'] !== false ) {
				remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
			}
		}

		private function addActions() {
		}

		private function addFilters() {
			add_filter( 'pre_get_posts', [ $this, 'changeSearchQuery' ], 10, 1 );

			add_filter( 'get_meta_sql', [ $this, 'changeMetaRelation' ] );

			add_filter( 'found_posts', [ $this, 'applyWooCommercePaginationGlobals' ], 10, 2 );

			add_filter( 'loop_shop_columns', [ $this, 'amountProductColumns' ], 11, 1 );
		}

		private function removeActions() {

			// Removing actions straight away.
			remove_action( 'woocommerce_cart_collaterals', 'woocommerce_cross_sell_display' );

			/**
			 * Calling functions that require additional conditional logic,
			 * before removing an action.
			 */

			// Maybe not displaying related products at all.
			$this->maybeDisableRelatedProducts();
		}
	}