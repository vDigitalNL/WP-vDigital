<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;
use function Network_Media_Library\is_media_site;
use function Network_Media_Library\switch_to_media_site;

/**
 * Class MultisiteMediaLibrary
 *
 * @package ChildTheme\ChildTheme\General
 */
class MultisiteMediaLibrary extends AbstractClass {

	use ThemeFlexClassTrait;

	public function init(): void {
		$this->addFilters();
	}

	private function addFilters(): void {
		add_filter( 'network-media-library/site_id', [ $this, 'switchBlogToUseMediaLibraryOfMainSite' ] );
		add_filter( 'rest_request_after_callbacks', [ $this, 'handleFeaturedImageInsertion' ], 10, 3 );
	}

	public function switchBlogToUseMediaLibraryOfMainSite(): int {
		return 1;
	}

	public function handleFeaturedImageInsertion( $response, array $handler, \WP_REST_Request $request ) {
		if ( ! function_exists( 'is_media_site' ) || is_media_site() ) {
			return $response;
		}

		$featured_image = (int) $request['featured_media'] ?? null;

		if ( $featured_image ) {
			switch_to_media_site();
			$attachment = get_post( $featured_image );
			restore_current_blog();

			$post_id = (int) $request['id'] ?? null;

			if ( $attachment ) {
				update_post_meta( $post_id, '_thumbnail_id', $featured_image );
			} else {
				delete_post_meta( $post_id, '_thumbnail_id' );
			}

			$data                   = $response->get_data();
			$data['featured_media'] = $featured_image;
			$response->set_data( $data );
		}

		return $response;
	}

	public function retrieveMimeType( int $postId ): false|string {
		switch_to_blog( 1 );
		$mimeType = get_post_mime_type( $postId );
		restore_current_blog();
		return $mimeType;
	}
}