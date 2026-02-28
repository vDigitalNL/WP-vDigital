<?php

namespace ChildTheme\ChildTheme\Helpers;

/**
 * Image Helper Class
 * 
 * Provides utility methods for handling responsive images, preload links,
 * and image URL extraction across the theme.
 */
class Image {
	
	/**
	 * Generate a preload link tag for responsive background images.
	 * @param string|null $backgroundImage Desktop background image from getImageUrl()
	 * @param string|null $backgroundImageTablet Tablet background image from getImageUrl()
	 * @param string|null $backgroundImageMobile Mobile background image from getImageUrl()
	 * @param string|null $backgroundImageMobileBlurred Optional blurred mobile image for progressive loading
	 * @return string HTML link tag or empty string if no images provided
	 */
	public static function generatePreloadLink(
		?string $desktopUrl,
		?string $tabletUrl = null,
		?string $mobileUrl = null,
		?string $backgroundImageMobileBlurred = null
	): string {
		if ( empty( $backgroundImage ) || empty( $backgroundImage[0] ) ) {
			return '';
		}

		$tabletUrl  =  !empty($tabletUrl) ? $tabletUrl : $desktopUrl;
		$mobileUrl  = !empty($backgroundImageMobileBlurred) 
		? $backgroundImageMobileBlurred 
		: (!empty($mobileUrl) ? $mobileUrl : $tabletUrl);

		$preload = '';

		if ( $mobileUrl ) {
			$preload .= sprintf(
				'<link rel="preload" as="image" href="%s" media="(max-width: 767px)" fetchpriority="high">',
				esc_url( $mobileUrl )
			);
		}

		if ( $tabletUrl && $tabletUrl !== $mobileUrl ) {
			$preload .= sprintf(
				'<link rel="preload" as="image" href="%s" media="(min-width: 768px) and (max-width: 1023px)" fetchpriority="high">',
				esc_url( $tabletUrl )
			);
		}

		if ( $desktopUrl !== $tabletUrl && $desktopUrl !== $mobileUrl ) {
			$preload .= sprintf(
				'<link rel="preload" as="image" href="%s" media="(min-width: 1024px)" fetchpriority="high">',
				esc_url( $desktopUrl )
			);
		}

		return $preload;
	}
	
	/**
	 * Extract image URL from WordPress attachment image source array.
	 *
	 * @param array|null $image Image array from wp_get_attachment_image_src()
	 * @param string $size WordPress image size (default: 'full')
	 * @return string|null Image URL or null if not available
	 */
	public static function getImageUrl( $image, string $size = 'full' ): ?string {

		// If it's a numeric attachment ID, get the URL
		if ( ! empty( $image ) && is_numeric( $image ) ) {
			return wp_get_attachment_image_url( $image, $size ) ?: null;
		}

		// If it's an array with URL key (ACF format)
		// For ACF arrays, we need to get the ID and regenerate with the correct size
		if ( ! empty( $image ) && is_array( $image ) ) {
			// If we have an ID in the ACF array and a specific size is requested
			if ( ! empty( $image['ID'] ) && $size !== 'full' ) {
				return wp_get_attachment_image_url( $image['ID'], $size ) ?: null;
			}
			// Otherwise use the URL from the array (which is typically 'full' size)
			if ( ! empty( $image['url'] ) ) {
				return esc_url( $image['url'] );
			}
			// If it's an array from wp_get_attachment_image_src()
			if ( ! empty( $image[0] ) ) {
				return esc_url( $image[0] );
			}
		}

		return null;
	}

	/**
	 * Build CSS custom properties for responsive background images
	 * @param string|null $bg Desktop background image URL
	 * @param string|null $bgTablet Tablet background image URL (falls back to desktop)
	 * @param string|null $bgMobile Mobile background image URL (falls back to tablet)
	 * @param string|null $bgMobileBlur Optional blurred mobile image URL
	 * @return array Array with 'style', 'preloadBlurAttr', 'sharpImageUrl', and 'blurredImageUrl'
	 */
	public static function buildBackgroundImageStyles(
		?string $bg,
		?string $bgTablet = null,
		?string $bgMobile = null,
		?string $bgMobileBlur = null
	): array {
		$bgTablet = $bgTablet ?: $bg;
		$bgMobile = $bgMobile ?: $bgTablet;

		// Base image style only set if we have a main background image
		$imageStyle      = $bg ? "--bg-image: url({$bg})" : '';
		$preloadBlurAttr = '';

		if ( $imageStyle && $bgTablet ) {
			$imageStyle .= "; --bg-image-tablet: url({$bgTablet})";
		}

		// For progressive loading: if blurred image exists, ONLY set the blurred variable
		// This prevents the browser from downloading the sharp image prematurely
		// JavaScript will add --bg-image-mobile later when the sharp image is ready
		if ( $imageStyle && $bgMobileBlur ) {
			// Only set the blurred image variable - do NOT set --bg-image-mobile yet
			$preloadBlurAttr = ' preload-blur';
			$imageStyle     .= "; --bg-image-mobile-blurred: url({$bgMobileBlur})";
		} elseif ( $imageStyle && $bgMobile ) {
			// No progressive loading - just set the mobile image directly
			$imageStyle .= "; --bg-image-mobile: url({$bgMobile})";
		}

		return [
			'style'           => $imageStyle,
			'preloadBlurAttr' => $preloadBlurAttr,
			'sharpImageUrl'   => $bgMobile,
			'blurredImageUrl' => $bgMobileBlur,
		];
	}
}

