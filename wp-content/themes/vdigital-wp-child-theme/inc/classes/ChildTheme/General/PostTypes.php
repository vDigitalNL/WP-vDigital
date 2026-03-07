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
 * @property-read PostTypes\Cases  $Cases
 */
final class PostTypes extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		$this->register();
		$this->Review->init();
		$this->PortalPosts->init();
		$this->Cases->init();
		$this->addAdminHooks();
	}

	private function register(): void {
		$this->cases();
	}

	private function cases(): void {
		register_post_type( 'cases',
			[
				'labels'       => [
					'name'          => $this->baseTheme->__( 'Cases' ),
					'singular_name' => $this->baseTheme->__( 'Case' ),
					'add_new'       => $this->baseTheme->__( 'Add New' ),
					'add_new_item'  => $this->baseTheme->__( 'Add New Case' ),
					'edit_item'     => $this->baseTheme->__( 'Edit Case' ),
					'view_item'     => $this->baseTheme->__( 'View Case' ),
					'all_items'     => $this->baseTheme->__( 'All Cases' ),
				],
				'show_in_menu' => true,
				'show_in_rest' => true,
				'public'       => true,
				'menu_icon'    => 'dashicons-portfolio',
				'has_archive'  => true,
				'supports'     => [ 'title', 'editor', 'thumbnail' ],
				'rewrite'      => [ 'slug' => 'cases', 'with_front' => false ],
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
