<?php

	namespace Theme\Modules\WoocommerceEssentials\General;

	use Theme\BaseTheme\General\Images;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class Media
	 *
	 * @package Theme\Modules\WoocommerceEssentials\General
	 */
	class Media extends ThemeModuleAbstractClass {

		public function changeWooCommerceGalleryImageSize() {
			return 'single-product-gallery-xs-lg';
		}

		public function init() {
			$this->addImageSizes();

			$this->addFilters();
		}

		private function addFilters() {
			add_filter( 'woocommerce_gallery_image_size', [ $this, 'changeWooCommerceGalleryImageSize' ] );
		}

		private function addImageSizes() {
			// @ToDo: Change this when its clear how big this one should be.
			Images::getInstance()->addImage( 'single-product-gallery' )
			      ->addSize( 'xs-lg', 520, 520, false, '(max-width: 1920px)' );
		}
	}