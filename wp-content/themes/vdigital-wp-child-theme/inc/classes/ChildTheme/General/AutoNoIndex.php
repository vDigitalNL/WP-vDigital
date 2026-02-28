<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

final class AutoNoIndex extends AbstractClass {

	public function init(): void {
		$this->addActions();
	}

	private function addActions(): void {
		/** These 3 actions are the ones that YoastSEO uses for updating metadata */
		add_action( 'wp_insert_post', [ $this, 'addNoIndexToPost' ] );
		add_action( 'edit_attachment', [ $this, 'addNoIndexToPost' ] );
		add_action( 'add_attachment', [ $this, 'addNoIndexToPost' ] );
	}

	public function addNoIndexToPost( $postId ): void {
		$postType                = get_post_type( $postId );
		$noIndexAutoEnabled      = get_post_meta( $postId, 'noindex_auto_enabled' )[0] ?? 0;
		$noFollowAutoEnabled     = get_post_meta( $postId, 'nofollow_auto_enabled' );

		if ( ! in_array( $postType, [ 'ww_customer_reviews', 'ww_api_connections' ] ) ) {
			return;
		}

		if (
			get_field( 'ww_customer_review_type', $postId ) !== 'external' &&
			! get_field( 'disable_single_post', $postId )
		) {
			if ( $noIndexAutoEnabled === "1" ) {
				$this->setYoastMetaFields($postId, 0, 'noindex');
			}

			if ( $noFollowAutoEnabled === "1" ) {
				$this->setYoastMetaFields($postId, 0, 'nofollow');
			}

			return;
		}

		if ( get_post_meta( $postId, '_yoast_wpseo_meta-robots-noindex' )[0] !== "1" ) {
			$this->setYoastMetaFields($postId, 1, 'noindex');
		}

		if ( get_post_meta( $postId, '_yoast_wpseo_meta-robots-nofollow' )[0] !== "1" ) {
			$this->setYoastMetaFields($postId, 1, 'nofollow');
		}
	}

	private function setYoastMetaFields($postId, int $value, string $key): void {
		update_post_meta( $postId, '_yoast_wpseo_meta-robots-' . $key, $value );
		update_post_meta( $postId, $key . '_auto_enabled', $value );
	}
}