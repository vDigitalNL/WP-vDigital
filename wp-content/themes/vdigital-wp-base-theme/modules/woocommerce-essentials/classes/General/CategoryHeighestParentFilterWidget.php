<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use WC_Product_Cat_List_Walker;
	use WC_Widget;
	use WP_Term;

	/**
	 * Class CategoryHeighestParentFilterWidget
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class CategoryHeighestParentFilterWidget extends WC_Widget {

		/**
		 * Category ancestors.
		 *
		 * @var array
		 */
		public $catAncestors;

		/**
		 * Current Category.
		 *
		 * @var bool
		 */
		public $currentCat;

		public function __construct() {
			$this->widget_cssclass    = 'woocommerce widget_category_filter';
			$this->widget_description = baseTheme()->__( 'Display a list of categories to filter the currently displayed products, this will add an argument to the post loop query.' );
			$this->widget_id          = 'woocommerce_category_filter_by_heighest_parent';
			$this->widget_name        = baseTheme()->__( 'Filter Products by Heighest Parent Category' );
			$this->settings           = [
				'title' => [
					'type'  => 'text',
					'std'   => baseTheme()->__( 'Product categories' ),
					'label' => baseTheme()->__( 'Title' ),
				],

				'count' => [
					'type'  => 'checkbox',
					'std'   => 0,
					'label' => baseTheme()->__( 'Show product counts' ),
				],

				'hierarchical' => [
					'type'  => 'checkbox',
					'std'   => 1,
					'label' => baseTheme()->__( 'Show hierarchy' ),
				],

				'hide_empty' => [
					'type'  => 'checkbox',
					'std'   => 0,
					'label' => baseTheme()->__( 'Hide empty categories' ),
				],

				'link_other_children' => [
					'type'  => 'checkbox',
					'std'   => false,
					'label' => baseTheme()->__( 'Link to other children' )
				]
			];

			parent::__construct();
		}

		public function widget( $args, $instance ) {
			if ( ! is_shop() && ! is_product_taxonomy() ) {
				return;
			}

			if ( ! WC()->query->get_main_query()->post_count ) {
				return;
			}

			global $wp_query, $post;

			$showProductCount    = isset( $instance['count'] ) ? $instance['count'] : $this->settings['count']['std'];
			$showHierarchical    = isset( $instance['hierarchical'] ) ? $instance['hierarchical'] : false;
			$linkOtherChildren   = isset( $instance['link_other_children'] ) ? $instance['link_other_children'] : false;
			$hideEmptyCategories = isset( $instance['hide_empty'] ) ? $instance['hide_empty'] : false;

			$this->currentCat   = $wp_query->queried_object;
			$this->catAncestors = get_ancestors( $this->currentCat->term_id, 'product_cat' );

			$dropdownArgs = [
				'hide_empty' => $hideEmptyCategories
			];

			$listArgs = [
				'show_count'   => $showProductCount,
				'hierarchical' => $showHierarchical,
				'taxonomy'     => 'product_cat',
				'hide_empty'   => $hideEmptyCategories,
				'menu_order'   => false
			];

			$include                = [];
			$heighestParentChildren = [];

			if ( ! empty ( $heighestParent = end( $this->catAncestors ) ) ) {
				$heighestParentChildren = get_terms(
					[
						'taxonomy'     => 'product_cat',
						'fields'       => 'ids',
						'parent'       => $heighestParent,
						'hierarchical' => $showHierarchical,
						'hide_empty'   => $hideEmptyCategories
					]
				);

				$include = array_merge( $heighestParentChildren, $include );

				$listArgs['include']      = implode( ',', $include );
				$dropdownArgs['include']  = $listArgs['include'];
				$listArgs['hierarchical'] = 1;

				if ( empty( $include ) ) {
					return;
				}
			}

			?>
			<div class="woocommerce_essentials__archive_filters__categories">
				<?php
					$args['before_title'] = '<div class="woocommerce_essentials__archive_filters__categories__title height-expandable"><span>';
					$args['after_title']  = '</span></div>';

					$this->widget_start( $args, $instance );

					include_once WC()->plugin_path() . '/includes/walkers/class-wc-product-cat-list-walker.php';

					$listArgs['walker']                     = new WC_Product_Cat_List_Walker();
					$listArgs['title_li']                   = '';
					$listArgs['pad_counts']                 = 1;
					$listArgs['show_option_none']           = __( 'No product categories exist.', 'woocommerce' );
					$listArgs['current_category']           = ( $this->currentCat ) ? $this->currentCat->term_id : '';
					$listArgs['current_category_ancestors'] = $this->catAncestors;

					$filterName = 'filter_' . wc_attribute_taxonomy_slug( 'product_cat' );
					$categories = get_categories( $listArgs );

					/*	dd( $categories );*/
				?>

				<ul class="woocommerce_essentials__archive_filters__categories__items">
					<?php foreach ( $categories as $category ) :
						/**
						 * @var WP_Term $category
						 */
						$currentFilters = isset( $_GET[ $filterName ] ) ? explode( ',', wc_clean( wp_unslash( $_GET[ $filterName ] ) ) ) : array(); // WPCS: input var ok, CSRF ok.
						$currentFilters = array_map( 'sanitize_title', $currentFilters );
						$liClasses = [ 'option' ];
						$thisParentTerms = [];

						if ( $showHierarchical ) {
							$thisParentTerms = get_terms(
								[
									'taxonomy'     => 'product_cat',
									'parent'       => $category->term_id,
									'hierarchical' => $showHierarchical,
									'hide_empty'   => $hideEmptyCategories,
								]
							);

							if ( $thisParentTerms ) {
								$liClasses[] = 'is-parent';
								$liClasses[] = 'height-expandable';
								$liClasses[] = 'initialize-closed';
							}
						}

						$base_link = $this->get_current_page_url();
						$link      = remove_query_arg( 'category', $base_link );

						$thisParentOpen = false;

						if (
							$category->term_id == $wp_query->get_queried_object()->term_id ||
							! empty ( array_filter( $thisParentTerms, function ( $term ) {
								global $wp_query;

								if ( $term->term_id == $wp_query->get_queried_object()->term_id ) {
									return true;
								}

								return false;
							} ) ) ||
							in_array( $category->term_id, $currentFilters ) !== false
						) {
							$thisParentOpen = true;

							$liClasses[] = 'open';
						}

						if ( ! $linkOtherChildren ) {
							$link = add_query_arg( $filterName, ( count( $currentFilters ) > 1 ? implode( ',', $currentFilters )
								: $currentFilters[ key( $currentFilters ) ] ), $link );
						} else {
							$link = get_term_link( $category );
						}

						?>

						<li class="<?php echo implode( ' ', $liClasses ); ?>" data-term-id="<?php echo $category->term_id; ?>">
							<?php if ( ! empty( $thisParentTerms ) ) : ?>
								<a href="#" class="prevent-default">
									<span class="name"><?php echo $category->name; ?></span>
								</a>
							<?php else: ?>
								<a href="<?php echo $link; ?>">
									<span class="name"><?php echo $category->name; ?></span>

									<?php if ( $showProductCount ) : ?>
										<span class="count">(<?php echo absint( $category->count ); ?>)</span>
									<?php endif; ?>
								</a>
							<?php endif; ?>

							<?php
								if ( ! empty ( $thisParentTerms ) ) {
									$liClasses = [];
									$ulClasses = [ 'initialize-closed' ];

									if ( $thisParentOpen ) {
										$ulClasses[] = 'open';
									}

									print '<ul class="' . implode( ' ', $ulClasses ) . '">';
									print '<li class="option" data-term-id="' . $category->term_id . '">';
									print '<a href="' . $link . '">';
									print '<span class="name">' . baseTheme()->__( 'All products' ) . '</span>';

									if ( $showProductCount ) {
										print '<span class="count">(' . absint( $category->count ) . ')</span>';
									}
									print '</a>';
									print '</li>';

									foreach ( $thisParentTerms as $term ) {
										$liClasses = [ 'option' ];

										if ( $term->term_id == $wp_query->get_queried_object()->term_id ) {
											$liClasses[] = 'active';
										}

										$currentFilters = isset( $_GET[ $filterName ] ) ? explode( ',', wc_clean( wp_unslash( $_GET[ $filterName ] ) ) )
											: array(); // WPCS: input var ok, CSRF ok.
										$currentFilters = array_map( 'sanitize_title', $currentFilters );

										if ( in_array( $term->term_id, $currentFilters ) !== false ) {
											unset( $currentFilters[ array_search( $term->term_id, $currentFilters ) ] );
											$liClasses[] = 'active';
										} else {
											$currentFilters[] = $term->term_id;
										}

										if ( ! $linkOtherChildren ) {
											$link = add_query_arg(
												$filterName,
												( count( $currentFilters ) > 1 ?
													implode( ',', $currentFilters )
													: ( ! empty ( $currentFilters[ key( $currentFilters ) ] ) ) ? $currentFilters[ key( $currentFilters ) ] : [] ), $link
											);
										} else {
											$link = get_term_link( $term );
										}

										print '<li class="' . implode( ' ', $liClasses ) . '" data-term-id="' . $term->term_id . '">';
										print '<a href="' . $link . '">';
										print '<span class="name">' . $term->name . '</span>';

										if ( $showProductCount ) {
											print '<span class="count">(' . absint( $term->count ) . ')</span>';
										}
										print '</a>';
										print '</li>';
									}
									print '</ul>';
								}
							?>
						</li>
					<?php endforeach; ?>
				</ul>

				<?php
					$this->widget_end( $args );
				?>
			</div>
			<?php
		}
	}