<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

class Taxonomy extends AbstractClass {
	public function init(): void {
        // Adjust taxonomy labels
        add_filter('taxonomy_labels_ww_customer_reviews_categories', [ $this, 'customizePostOverviewTaxonomyLabels' ], 10, 1 );
        add_filter('taxonomy_labels_category', [ $this, 'customizePostOverviewTaxonomyLabels' ], 10, 1 );
        add_filter('taxonomy_labels_ww_api_connections_categories', [$this, 'customizeMarketPlaceTaxonomyLabels'], 10, 1);

        // Register individual taxonomies
		$this->parterPortalPostCategories();
		$this->customerReviewsCategories();
		$this->apiConnections();
	}

	private function parterPortalPostCategories(): void {
		register_taxonomy( 'partner_portal_posts_categories', [ 'partner_portal_posts' ], [
			'hierarchical' => true,
			'labels' => [
				'name' => $this->baseTheme->__( 'Categories' ),
				'singular_name' => $this->baseTheme->__( 'Category' ),
				'search_items' => $this->baseTheme->__( 'Search for category' ),
				'all_items' => $this->baseTheme->__( 'All Categories' ),
				'edit_item' => $this->baseTheme->__( 'Edit Categorie' ),
				'update_item' => $this->baseTheme->__( 'Update Categorie' ),
				'add_new_item' => $this->baseTheme->__( 'New Category' ),
				'new_item_name' => $this->baseTheme->__( 'New Category' ),
			],
			'public' => true,
			'publicly_queryable' => false,
			'show_in_rest' => true,
			'show_ui' => true,
			'show_admin_column' => true,
			'query_var' => true,
		] );
	}

	private function customerReviewsCategories(): void {
		register_taxonomy( 'ww_customer_reviews_categories', [ 'ww_customer_reviews' ], [
			'hierarchical'      => true,
			'labels'            => [
				'name'          => $this->baseTheme->__( 'Review categories' ),
				'singular_name' => $this->baseTheme->__( 'Review category' ),
				'search_items'  => $this->baseTheme->__( 'Search review category' ),
				'all_items'     => $this->baseTheme->__( 'All review categories' ),
				'edit_item'     => $this->baseTheme->__( 'Edit review category' ),
				'update_item'   => $this->baseTheme->__( 'Update review category' ),
				'add_new_item'  => $this->baseTheme->__( 'New review category' ),
				'new_item_name' => $this->baseTheme->__( 'New review category' ),
			],
			'public'            => false,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'query_var'         => true,
		] );
	}

    private function apiConnections(): void
    {
        register_taxonomy( 'ww_api_connections_categories', [ 'ww_api_connections' ], [
            'hierarchical'      => true,
            'labels'            => [
                'name'          => $this->baseTheme->__( 'Categories'),
                'singular_name' => $this->baseTheme->__( 'Marketplace category'),
                'search_items'  => $this->baseTheme->__( 'Search category'),
                'all_items'     => $this->baseTheme->__( 'All categories'),
                'edit_item'     => $this->baseTheme->__( 'Edit Marketplace category'),
                'update_item'   => $this->baseTheme->__( 'Update Marketplace category'),
                'add_new_item'  => $this->baseTheme->__( 'New category'),
                'new_item_name' => $this->baseTheme->__( 'New category'),
            ],
            'public'            => false,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
        ] );
    }

    public function customizePostOverviewTaxonomyLabels( $labels ) {
        $labels->name_field_description = $this->baseTheme->__('The name is shown as a filter option above the post overview.');
        return $labels;
    }

	public function customizeMarketPlaceTaxonomyLabels($labels)
	{
		$labels->desc_field_description = $this->baseTheme->__('This description is shown on the marketplace overview when the category filter is selected.');
		$labels->name_field_description = $this->baseTheme->__('The name is shown as a filter option above the marketplace.');

		return $labels;
	}
}