<?php

namespace ChildTheme\ChildTheme\General\PostTypes;

use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class Review extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		// This code is needed to add the custom columns to the admin overview of the review post type, this can take place in the new theme now
		// since we have hidden the overview for the old theme
		add_action( 'manage_ww_customer_reviews_posts_custom_column', [
			$this,
			'fillCustomReviewAdminColumns'
		], 10, 2 );
		add_filter( 'manage_ww_customer_reviews_posts_columns', [ $this, 'addCustomReviewAdminColumns' ] );
	}

	public function addCustomReviewAdminColumns(): array {
		return [
			'cb'                                      => 'cb',
			'title'                                   => $this->baseTheme->__( 'Title' ),
			'review_client'                           => $this->baseTheme->__( 'Klant' ),
			'review_type'                             => $this->baseTheme->__( 'Type' ),
			'taxonomy-ww_customer_reviews_categories' => $this->baseTheme->__( 'Categories' ),
			'date'                                    => $this->baseTheme->__( 'Date' ),
		];
	}

	public function fillCustomReviewAdminColumns( $column, $postId ): void {
		$type = get_post_meta( $postId, 'ww_customer_review_type', true );

		switch ( $column ) {
			case 'review_client':
				echo get_post_meta( $postId, 'ww_customer_review_client', true );
				break;
			case 'review_type':
				$review_type = '';
				$review_type .= match ( $type ) {
					'external' => $this->baseTheme->__( 'Trustpilot review' ),
					'story' => $this->baseTheme->__( 'Client case' ),
					'video' => $this->baseTheme->__( 'Client case with video' ),
					default => $type,
				};
				if ( get_post_meta( $postId, 'ww_customer_review_featured', true ) ) {
					$review_type .= ' <strong class="wp-ui-text-notification">(' . $this->baseTheme->__( 'Highlighted' ) . ')</strong>';
				}
				echo $review_type;
				break;
		}
	}
}