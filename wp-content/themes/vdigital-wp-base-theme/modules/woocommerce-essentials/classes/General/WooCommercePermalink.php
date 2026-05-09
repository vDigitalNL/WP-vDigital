<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommercePermalink
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class WooCommercePermalink extends ThemeModuleAbstractClass {

		public $permaLinkRewritesSettings = [];

		public function getModulePermaLinkSettings() {
			return $this->permaLinkRewritesSettings;
		}

		public function init() {

			// Load needed settings.
			$this->retrieveModulePermalinkSettings();

			$this->addFilters();

			$this->addActions();
		}

		/**
		 * @param $link
		 * @param $term
		 * @param $taxonomy
		 *
		 * @return string|void
		 *
		 * This function will actually remove the base from the URL.
		 */
		public function productCategoryRewriteLink( $link, $term, $taxonomy ) {

			// Early exit.
			if ( ! $taxonomy || $taxonomy !== 'product_cat' ) {
				return $link;
			}

			// Url decode used here to fix copied url by ctrl+c.
			$slug = urldecode( $term->slug );

			if ( $term->parent ) {
				$ancestors = get_ancestors( $term->term_id, 'product_cat' );

				foreach ( $ancestors as $ancestor ) {
					$ancestor_object = get_term( $ancestor, 'product_cat' );
					$slug            = urldecode( $ancestor_object->slug ) . '/' . $slug;
				}
			}

			return home_url( $slug );
		}

		/**
		 * @param $permalink
		 * @param $product
		 *
		 * @return string
		 *
		 * Inspiration for this function cam from the plugin: woo-permalink-manager.
		 *
		 * This function will actually remove the base from the URL.
		 */
		public function productRewriteLink( $permalink, $product ) {
			// Early exit.
			if ( ! $product || ! $product->post_type || $product->post_type !== 'product' ) {
				return $permalink;
			}

			// Getting the product slug.
			$productBase = $this->wooCommercePermalinkStructure( 'product_rewrite_slug' );

			// This should contain a single value.
			if ( is_array( $productBase ) ) {
				return $permalink;
			}

			// Trimming the base and adding slashes.
			$productBase = '/' . trim( $productBase, '/' ) . '/';

			// Removing the base within the permalink.
			$permalink = str_replace( $productBase, '/', $permalink );

			return $permalink;
		}

		/**
		 * @param $request
		 *
		 * @return array|void
		 *
		 * Inspiration for this function cam from the plugin: woo-permalink-manager.
		 *
		 * This function basically makes it possible to search for product & product category
		 * when the base is not within the URL anymore. It executes certain queries to determine
		 * whether the search query is a product or a product category.
		 *
		 * The function will be stopped early when none of the remove base settings are being
		 * used within the theme settings.
		 */
		public function replaceProductRequest( $request ) {
			global $wp, $wpdb;

			if ( empty ( $wp->request ) ) {
				return;
			}

			$newProductRequest = [];
			$numProducts       = 0;
			$url               = explode( '/', $wp->request );
			$permaLinkSettings = $this->getModulePermaLinkSettings();

			// Getting the last item from the array.
			// This item will be the product || product category slug.
			$slug = ( $urlHasPage = array_search( 'page', $url, true ) ) ? $url[ ( (int) $urlHasPage - 1 ) ] : array_pop( $url );

			// First checking whether the product base should be deleted or not.
			if ( ! empty ( $permaLinkSettings['product_remove_base'] ) ) {

				// I'm running the product query first since this one is less intense
				// compared to the join that is needed to detect whether the current
				// query is regarding a product category.
				$productSql   = "SELECT COUNT(ID) as count_id FROM {$wpdb->posts} WHERE post_name = %s AND post_type = %s";
				$productQuery = $wpdb->prepare( $productSql, [ $slug, 'product' ] );
				$numProducts  = intval( $wpdb->get_var( $productQuery ) );
			}

			if ( $numProducts ) {
				// Checking whether any prefix is still used.
				// When it is used, redirect to the slug.
				if ( ! empty ( $url ) ) {
					wp_redirect( '/' . $slug );

					die();
				}

				$newProductRequest['page']      = '';
				$newProductRequest['post_type'] = 'product';
				$newProductRequest['product']   = $slug;
				$newProductRequest['name']      = $slug;

				return $newProductRequest;
				// First checking whether the product category base should be deleted or not.
			} elseif ( ! empty ( $permaLinkSettings['product_category_remove_base'] ) ) {

				// Since the current queried element is not a product.
				// try to see if it is a product category instead.
				$categorySql = "
					SELECT COUNT(t.term_id) as count_id 
					FROM $wpdb->terms t LEFT JOIN $wpdb->term_taxonomy tt ON tt.term_id = t.term_id 
					WHERE tt.taxonomy = 'product_cat' AND t.slug = %s
				";

				$categoryQuery = $wpdb->prepare( $categorySql, [ $slug ] );
				$numCategories = intval( $wpdb->get_var( $categoryQuery ) );

				if ( $numCategories ) {
					$categorySlug = explode( '/page/', $wp->request );

					$newCategoryRequest = [
						'product_cat' => ! empty ( $categorySlug[0] ) ? $categorySlug[0] : $wp->request,
					];

					if ( count( $categorySlug ) > 1 ) {
						if ( ! empty ( $url[ $urlHasPage + 1 ] ) ) {
							$newCategoryRequest['page']  = $url[ (int) $urlHasPage + 1 ];
							$newCategoryRequest['paged'] = $url[ (int) $urlHasPage + 1 ];
						}
					}

					if ( isset( $request['page'] ) ) {
						$newCategoryRequest['page'] = ! empty ( $request['page'] ) ? $request['page'] : false;
					}

					if ( isset( $request['paged'] ) ) {
						$newCategoryRequest['paged'] = ! empty ( $request['paged'] ) ? $request['paged'] : false;
					}

					if ( ! empty ( $request['orderby'] ) ) {
						$newCategoryRequest['orderby'] = $request['orderby'];
					}

					if ( ! empty ( $request['order'] ) ) {
						$newCategoryRequest['order'] = $request['order'];
					}

					return $newCategoryRequest;
				}
			}

			return $request;
		}

		public function retrieveModulePermalinkSettings() {
			$this->permaLinkRewritesSettings = $this->baseTheme->getOption( 'woocommerce.permalink_rewrites', [] );
		}

		private function addActions() {
			if ( empty( $_GET['s'] ) ) {
				$permaLinkSettings = $this->getModulePermaLinkSettings();

				// First checking whether either the product or product
				// category base should be deleted or not.
				if (
					! empty ( $permaLinkSettings['product_remove_base'] ) ||
					! empty ( $permaLinkSettings['product_category_remove_base'] )
				) {
					add_filter( 'request', [ $this, 'replaceProductRequest' ], 11 );
				}
			}
		}

		private function addFilters() {
			if ( empty( $_GET['s'] ) ) {
				$permaLinkSettings = $this->getModulePermaLinkSettings();

				// First checking whether the product base should be deleted or not.
				if ( ! empty ( $permaLinkSettings['product_remove_base'] ) ) {
					add_filter( 'post_type_link', [ $this, 'productRewriteLink' ], 1, 2 );
				}

				// First checking whether the product category base should be deleted or not.
				if ( ! empty ( $permaLinkSettings['product_category_remove_base'] ) ) {
					add_filter( 'term_link', [ $this, 'productCategoryRewriteLink' ], 1, 3 );
				}
			}
		}

		private function wooCommercePermalinkStructure( $name ) {
			$permalinkStructure = wc_get_permalink_structure();

			return empty ( $name ) ? $permalinkStructure : ( isset( $permalinkStructure[ $name ] ) ? $permalinkStructure[ $name ] : $permalinkStructure );
		}
	}