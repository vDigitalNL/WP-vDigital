<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

class ImageSizes extends AbstractClass {
	public function init(): void {
		$this->createImageSizes();
		$this->addFilters();
	}

	private function createImageSizes(): void {
		// Sizes used in the theme.
		add_image_size( 'submenu', 630, 516, true );
		add_image_size( 'banner_image_desktop', 1920 );
		add_image_size( 'banner_image_desktop-small', 1350 );
		add_image_size( 'banner_image_tablet', 1024 );
		add_image_size( 'banner_image_mobile', 640 );
		add_image_size( 'news_tile_small', false , 109);

		// Sizes for the redesign of the theme.
		add_image_size('two_column_image_desktop_1', 746, false);
		add_image_size('two_column_image_desktop_2', 950, false);
		add_image_size('two_column_image_desktop_3', 1016, false);
		add_image_size('tiles', 250, false);
		add_image_size('tiles_large', 380, false);
		add_image_size('tiles_showcase_mobile', 450, 550, false);
		add_image_size('post_highlighted', 894, 600, true);
		add_image_size('post_normal', 437, 280, true);

	}

	private function addFilters(): void {
		add_filter( 'big_image_size_threshold', '__return_false' );
		add_filter( 'intermediate_image_sizes_advanced', [$this, 'disableGifImageSizes'], 11, 2);
	}

	public function disableGifImageSizes( $sizes, $metaData ): array {
		$file      = $metaData['file'];
		$fileType  = wp_check_filetype( $file );

		if ( $fileType['type'] === 'image/gif' ) {
			return [];
		}

		return $sizes;
	}
}