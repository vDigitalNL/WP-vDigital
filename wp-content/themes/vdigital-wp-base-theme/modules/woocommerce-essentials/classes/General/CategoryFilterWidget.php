<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use WC_Product_Cat_List_Walker;
	use WC_Widget;
	use WP_Term;

	/**
	 * Class CategoryFilterWidget
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class CategoryFilterWidget extends WC_Widget {

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
			$this->widget_id          = 'woocommerce_category_filter';
			$this->widget_name        = baseTheme()->__( 'Filter Products by Category' );
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

				'show_children_only' => [
					'type'  => 'checkbox',
					'std'   => 0,
					'label' => baseTheme()->__( 'Only show children of the current category' ),
				],

				'hide_empty' => [
					'type'  => 'checkbox',
					'std'   => 0,
					'label' => baseTheme()->__( 'Hide empty categories' ),
				],
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
			$showChildrenOnly    = isset( $instance['show_children_only'] ) ? $instance['show_children_only'] : $this->settings['show_children_only']['std'];
			$showHierarchical    = isset( $instance['hierarchical'] ) ? $instance['hierarchical'] : false;
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

			// @ToDo: Maybe apply max depth.
			if ( $showChildrenOnly && $this->currentCat ) {
				if ( $showHierarchical ) {
					$include = array_merge(
						$this->catAncestors,
						array( $this->currentCat->term_id ),
						get_terms(
							'product_cat',
							array(
								'fields'       => 'ids',
								'parent'       => 0,
								'hierarchical' => true,
								'hide_empty'   => false,
							)
						),
						get_terms(
							'product_cat',
							array(
								'fields'       => 'ids',
								'parent'       => $this->currentCat->term_id,
								'hierarchical' => true,
								'hide_empty'   => false,
							)
						)
					);

					// Gather siblings of ancestors.
					if ( $this->catAncestors ) {
						foreach ( $this->catAncestors as $ancestor ) {
							$include = array_merge(
								$include,
								get_terms(
									'product_cat',
									array(
										'fields'       => 'ids',
										'parent'       => $ancestor,
										'hierarchical' => false,
										'hide_empty'   => false,
									)
								)
							);
						}
					}
				} else {
					$include = get_terms(
						'product_cat',
						array(
							'fields'       => 'ids',
							'parent'       => $this->currentCat->term_id,
							'hierarchical' => true,
							'hide_empty'   => false,
						)
					);
				}

				$listArgs['include']     = implode( ',', $include );
				$dropdownArgs['include'] = $listArgs['include'];

				if ( empty( $include ) ) {
					return;
				}
			} else if ( $showChildrenOnly ) {
				$dropdownArgs['depth']        = 1;
				$dropdownArgs['child_of']     = 0;
				$dropdownArgs['hierarchical'] = 1;
				$listArgs['depth']            = 1;
				$listArgs['child_of']         = 0;
				$listArgs['hierarchical']     = 1;
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
				?>

				<ul class="woocommerce_essentials__archive_filters__categories__items">
					<?php foreach ( $categories as $category ) :
						/**
						 * @var WP_Term $category
						 */
						$currentFilters = isset( $_GET[ $filterName ] ) ? explode( ',', wc_clean( wp_unslash( $_GET[ $filterName ] ) ) ) : array(); // WPCS: input var ok, CSRF ok.
						$currentFilters = array_map( 'sanitize_title', $currentFilters );
						$liClasses = [ 'option' ];

						$base_link = $this->get_current_page_url();
						$link      = remove_query_arg( 'category', $base_link );

						if ( in_array( $category->term_id, $currentFilters ) !== false ) {
							unset( $currentFilters[ array_search( $category->term_id, $currentFilters ) ] );
							$liClasses[] = 'active';
						} else {
							$currentFilters[] = $category->term_id;
						}

						$link = add_query_arg( $filterName, ( count( $currentFilters ) > 1 ? implode( ',', $currentFilters ) : $currentFilters[ key( $currentFilters ) ] ), $link );
						?>
						<li class="<?php echo implode( ' ', $liClasses ); ?>" data-term-id="<?php echo $category->term_id; ?>"><a href="<?php echo $link; ?>"><span
									class="name"><?php echo $category->name; ?></span><?php if ( $showProductCount ) : ?><span class="count">
									(<?php echo absint( $category->count ); ?>)</span><?php endif; ?></a></li>
					<?php endforeach; ?>
				</ul>

				<?php
					$this->widget_end( $args );
				?>
			</div>
			<?php
		}
	}