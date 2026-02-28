<?php

namespace ChildTheme\ChildTheme\General;

use Theme\BaseTheme\ThemeFlexClassTrait;
use Theme\BaseTheme\AbstractClass;

/**
 * Class PostType
 *
 * @package ChildTheme\ChildTheme\General
 *
 * @property-read PostTypes\Review  $Review
 * @property-read PostTypes\PortalPosts  $PortalPosts
 */
final class PostTypes extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		$this->register();
		$this->Review->init();
		$this->PortalPosts->init();
		$this->addAdminHooks();
	}

	private function register(): void {
		$this->portalPosts();
		$this->customerReviews();
		$this->apiConnections();
	}

	private function portalPosts(): void
    {
        register_post_type('partner_portal_posts',
            [
                'labels'             => [
                    'name'          => __('Partner Portal', 'webwhales-multiple-themes'),
                    'all_items'     => __('All Posts', 'webwhales-multiple-themes'),
                    'singular_name' => __('Post', 'webwhales-multiple-themes'),
                    'add_new'       => __('Add New', 'webwhales-multiple-themes'),
                    'add_new_item'  => __('Add New', 'webwhales-multiple-themes'),
                ],
                'public'             => true,
                'publicly_queryable' => false,
                'show_in_rest'       => true,
                'menu_icon'          => 'dashicons-groups',
                'has_archive'        => false,
                'supports'           => ['title', 'editor'],
                'rewrite'            => ['slug' => 'partner-portal-posts', 'with_front' => false],
            ]
        );
    }

	private function customerReviews(): void {
		register_post_type( 'ww_customer_reviews',
			[
				'labels'       => [
					'name'          => $this->baseTheme->__( 'Client cases' ),
					'singular_name' => $this->baseTheme->__( 'Client case' ),
					'add_new'       => $this->baseTheme->__( 'Add New' ),
					'add_new_item'  => $this->baseTheme->__( 'Add New' ),
				],
				'show_in_menu' => true,
				'show_in_rest' => true,
				'public'       => true,
				'menu_icon'    => 'dashicons-star-filled',
				'has_archive'  => false,
				'supports'     => [ 'title', 'editor', 'thumbnail', 'editor' ],
				'rewrite'      => [ 'slug' => 'reviews', 'with_front' => false ],
			]
		);
	}

	private function apiConnections(): void {
		$slug = match ( get_current_blog_id() ) {
			4 => 'marktplatz',
			default => 'marketplace',
		};

		register_post_type( 'ww_api_connections',
			[
				'show_in_menu' => true,
				'show_in_rest' => true,
				'labels'       => [
					'name'          => $this->baseTheme->__( 'Marketplace' ),
					'singular_name' => $this->baseTheme->__( 'Marketplace' ),
					'add_new'       => $this->baseTheme->__( 'Add New' ),
					'add_new_item'  => $this->baseTheme->__( 'Add New' ),
				],
				'public'       => true,
				'menu_icon'    => 'dashicons-plugins-checked',
				'supports'     => [ 'title', 'thumbnail', 'editor' ],
				'rewrite'      => [ 'slug' => $slug, 'with_front' => false ],
			]
		);
	}

	private function addAdminHooks(): void {
		add_action( 'add_meta_boxes', [ $this, 'addMarketplacePrivatePostMetaBox' ] );
	}

	public function addMarketplacePrivatePostMetaBox(): void {
		add_meta_box(
			'marketplace_private_notice',
			$this->baseTheme->__( 'Visibility Information' ),
			[ $this, 'renderMarketplacePrivatePostMetaBox' ],
			'ww_api_connections',
			'side',
			'high'
		);
	}

	public function renderMarketplacePrivatePostMetaBox(): void {
		?>
		<div style="padding: 10px 0;">
			<p style="margin: 0;">
				<span class="dashicons dashicons-info" style="color: #2271b1; vertical-align: middle;"></span>
				<strong><?php echo $this->baseTheme->__( 'Note:' ); ?></strong>
			</p>
			<p style="margin: 10px 0 0 0;">
				<?php echo $this->baseTheme->__( 'Private posts will be visible in the marketplace overview but will not be clickable.' ); ?>
			</p>
		</div>
		<?php
	}
}