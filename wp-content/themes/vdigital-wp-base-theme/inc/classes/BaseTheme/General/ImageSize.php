<?php

	namespace Theme\BaseTheme\General;

	use InvalidArgumentException;

	/**
	 * Class ImageSize
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class ImageSize {

		private $sizes = [];

		/**
		 * @param string     $breakpoint
		 * @param int        $width
		 * @param int        $height
		 * @param bool|array $crop
		 * @param string     $media
		 *
		 * @return ImageSize $this
		 */
		public function addSize( string $breakpoint, int $width, int $height, $crop, string $media = '' ) : ImageSize {
			if ( ! is_bool( $crop ) && ! is_array( $crop ) ) {
				throw new InvalidArgumentException( '$crop should either be bool or array. Type: ' . gettype( $crop ) . ' given.' );
			}

			$this->sizes[ $breakpoint ] = [
				'width'  => $width,
				'height' => $height,
				'crop'   => $crop,
				'media'  => $media
			];

			return $this;
		}

		/**
		 * @param string $size
		 *
		 * @return array|null
		 */
		public function getSize( string $size ): ?array {
			return ! empty ( $this->sizes[ $size ] ) ? $this->sizes[ $size ] : null;
		}

		/**
		 * @return array
		 */
		public function getSizes(): array {
			return $this->sizes;
		}
	}