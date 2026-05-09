<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class Images
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class Images extends AbstractClass {
		/**
		 * @var ImageSize[]
		 */
		private $images = [];

		public function init() {
			add_action( 'init', [ $this, 'addImageSizesToWp' ] );
		}

		/**
		 * @param string $name
		 *
		 * @return ImageSize
		 */
		public function addImage( string $name ) : ImageSize {
			$this->images[ $name ] = new ImageSize();

			return $this->images[ $name ];
		}

		/**
		 * @param string $name
		 *
		 * @return array|null
		 */
		public function getImages( string $name ) : ?array {
			return isset ( $this->images[ $name ] ) ?
				$this->images[ $name ] : null;
		}

		public function addImageSizesToWp() {
			if ( empty ( $this->images ) ) {
				return;
			}

			foreach ( $this->images as $imageKey => $image ) {
				foreach ( $image->getSizes() as $imageSizeKey => $imageSize ) {
					add_image_size(
						strtolower( str_replace( ' ', '-', $imageKey . '-' . $imageSizeKey ) ),
						$imageSize['width'],
						$imageSize['height'],
						$imageSize['crop']
					);
				}
			}
		}

		/**
		 * @param int    $imageId
		 * @param string $imagePosition
		 *
		 * @return string
		 */
		public function getPictureByImageId( int $imageId, string $imagePosition = '' ) : string {
			if ( ! $imageId || ! $imagePosition || ! isset( $this->images[ $imagePosition ] ) ) {
				return '';
			}

			$sourceElements     = [];
			$imageFullSizeSrc   = wp_get_attachment_image_src( $imageId, 'full' );

			if ( empty( $imageFullSizeSrc ) || ! isset( $imageFullSizeSrc[0] ) ) {
				return '';
			}

			$imageFullSizeSrc = $imageFullSizeSrc[0];

			foreach( $this->images[ $imagePosition ]->getSizes() as $imagePositionSizeKey => $imagePositionSize ) {
				$imagePositionSizeSrc = wp_get_attachment_image_src( $imageId, $imagePosition . '-' . $imagePositionSizeKey );

				if ( empty ( $imagePositionSizeSrc ) || ! isset( $imagePositionSizeSrc[0] ) ) {
					continue;
				}

				$sourceElements[] = '<source media="'.$imagePositionSize['media'].'" srcset="'.$imagePositionSizeSrc[0].'">';
			}

			$sourceElements = implode( PHP_EOL, $sourceElements );

			return <<<HTML
<picture>
	$sourceElements
	<img src="$imageFullSizeSrc"/>
</picture>
HTML;
		}
	}