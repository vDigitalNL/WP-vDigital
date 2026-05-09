<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class Svg
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class Svg extends AbstractClass {

		public function allowMimeTypeSvg( $mimeTypes ) {
			if ( ! isset( $mimeTypes['svg'] ) ) {
				$mimeTypes['svg'] = 'image/svg+xml';
			}

			if ( ! isset( $mimeTypes['svgz'] ) ) {
				$mimeTypes['svgz'] = 'image/svg+xml';
			}

			return $mimeTypes;
		}

		public function fixMimeTypeSvg( $data = null, $file = null, $filename = null, $mimes = null ) {
			$ext = isset( $data['ext'] ) ? $data['ext'] : '';

			if ( strlen( $ext ) < 1 ) {
				$exploded = explode( '.', $filename );
				$ext      = strtolower( end( $exploded ) );
			}
			if ( $ext === 'svg' ) {
				$data['type'] = 'image/svg+xml';
				$data['ext']  = 'svg';
			} elseif ( $ext === 'svgz' ) {
				$data['type'] = 'image/svg+xml';
				$data['ext']  = 'svgz';
			}

			return $data;
		}

		public function fixAdminPreview( $response, $attachment, $meta ) {
			if ( $response['mime'] == 'image/svg+xml' ) {
				$possible_sizes = apply_filters( 'image_size_names_choose', array(
					'full'      => __( 'Full Size' ),
					'thumbnail' => __( 'Thumbnail' ),
					'medium'    => __( 'Medium' ),
					'large'     => __( 'Large' ),
				) );

				$sizes = array();

				foreach ( $possible_sizes as $size => $label ) {
					$default_height = 2000;
					$default_width  = 2000;

					$sizes[ $size ] = array(
						'height'      => get_option( "{$size}_size_w", $default_height ),
						'width'       => get_option( "{$size}_size_h", $default_width ),
						'url'         => $response['url'],
						'orientation' => 'portrait',
					);
				}

				$response['sizes'] = $sizes;
				$response['icon']  = $response['url'];
			}

			return $response;
		}

		public function init() {

			if ( $this->baseTheme->getOption( 'media.images.enable_svg' ) === true ) {
				add_filter( 'upload_mimes', [ $this, 'allowMimeTypeSvg' ] );

				/**
				 * Fixes:
				 */
				add_filter( 'wp_check_filetype_and_ext', [ $this, 'fixMimeTypeSvg' ], 75, 4 );

				add_filter( 'wp_prepare_attachment_for_js', [ $this, 'fixAdminPreview' ], 10, 3 );
			}
		}
	}