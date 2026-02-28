<?php

namespace ChildTheme\ChildTheme\Frontend;

use ChildTheme\ChildTheme\General\Multisite;
use Walker_Nav_Menu;

class LanguageSwitchNavWalker extends Walker_Nav_Menu {

	function start_lvl( &$output, $depth = 0, $args = null ): void {
		$classes    = [ 'lg:tw-hidden tw-cursor-default group-hover/menu:tw-block tw-w-full lg:tw-w-[216px] tw-mw-full lg:tw-shadow-lg lg:tw-absolute tw-top-full tw-right-0 lg:tw-bg-white lg:tw-rounded-b-[20px] lg:tw-py-5 lg:!tw-pl-0 tw-mt-[-1px]' ];
		$classNames = implode( ' ', apply_filters( 'nav_menu_submenu_css_class', $classes, $args, $depth ) );
		$classNames = $classNames ? ' class="' . esc_attr( $classNames ) . '"' : '';

		$translationUrls = Html::getInstance()->getTranslationUrls();

		// Prevent the actual menu from being displayed if there is only one language
		if ( count( $translationUrls ) <= 1 ) {
			return;
		}

		$output .= "<ul$classNames>";
		$output .= '<h4 class="tw-hidden lg:tw-block tw-mb-5 tw-px-[25px] tw-text-white lg:!tw-text-core">' . baseTheme()->__( 'Choose a language' ) . '</h4>';
	}

	function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ): void {
		$translationUrls = Html::getInstance()->getTranslationUrls();
		$languageCode    = strtolower( $item->post_excerpt );
		$translatedUrl   = $translationUrls[ $languageCode ] ?? null;
		$hasMultipleLanguages = count($translationUrls) > 1;

		// Skip language items that don't have a published translation (e.g., trashed pages)
		if ( in_array( 'mlp-language-nav-item', $item->classes ) && empty( $translatedUrl ) ) {
			return;
		}

		// Current language item
		if ( in_array( 'ww-languageswitcher', $item->classes ) ) {
			$output .= "<li class='" . implode( " ", $item->classes ) . ' ' . ($hasMultipleLanguages ? 'tw-cursor-pointer' : 'tw-cursor-default') . " lg:tw-py-[10px] tw-group/menu tw-flex tw-items-center tw-text-white tw-text-sm lg:tw-px-0 tw-mb-5 last-of-type:tw-mb-0'>";
			$output .= '<svg class="tw-mr-2 tw-hidden lg:tw-block" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                <path id="language_FILL0_wght400_GRAD0_opsz48"
                      d="M90.5,197a10.29,10.29,0,0,1-4.121-.827,10.6,10.6,0,0,1-3.334-2.244,10.386,10.386,0,0,1-2.231-3.347A10.528,10.528,0,0,1,80,186.448a10.338,10.338,0,0,1,.814-4.108,10.462,10.462,0,0,1,2.231-3.321,10.248,10.248,0,0,1,3.334-2.218,11.007,11.007,0,0,1,8.242,0,10.248,10.248,0,0,1,3.334,2.218,10.462,10.462,0,0,1,2.231,3.321,10.338,10.338,0,0,1,.814,4.108,10.528,10.528,0,0,1-.814,4.134,10.386,10.386,0,0,1-2.231,3.347,10.6,10.6,0,0,1-3.334,2.244A10.29,10.29,0,0,1,90.5,197Zm0-1.522a8.737,8.737,0,0,0,1.536-2.166,13.038,13.038,0,0,0,1.011-2.9H87.98a13.312,13.312,0,0,0,.984,2.835A8.946,8.946,0,0,0,90.5,195.478Zm-2.231-.315a12.551,12.551,0,0,1-1.129-2.152,15.726,15.726,0,0,1-.787-2.6H82.415a9.414,9.414,0,0,0,2.31,2.927A11.534,11.534,0,0,0,88.269,195.163Zm4.489-.026a10.51,10.51,0,0,0,3.4-1.811,9.4,9.4,0,0,0,2.428-2.914H94.674a19.015,19.015,0,0,1-.8,2.572A11.915,11.915,0,0,1,92.757,195.136Zm-10.868-6.3h4.174q-.079-.709-.092-1.273t-.013-1.116q0-.656.026-1.168t.105-1.142h-4.2a7.655,7.655,0,0,0-.249,1.129,9.2,9.2,0,0,0-.066,1.181,10.171,10.171,0,0,0,.066,1.221A7.4,7.4,0,0,0,81.89,188.836Zm5.8,0h5.644q.1-.814.131-1.326t.026-1.063q0-.525-.026-1.011t-.131-1.3H87.691q-.1.814-.131,1.3t-.026,1.011q0,.551.026,1.063T87.691,188.836Zm7.219,0h4.2a7.4,7.4,0,0,0,.249-1.168,10.171,10.171,0,0,0,.066-1.221,9.2,9.2,0,0,0-.066-1.181,7.654,7.654,0,0,0-.249-1.129H94.936q.079.919.105,1.4t.026.906q0,.577-.039,1.089T94.91,188.836Zm-.263-6.274h3.938a8.505,8.505,0,0,0-2.376-3.019,9.051,9.051,0,0,0-3.478-1.706,11.441,11.441,0,0,1,1.116,2.1A17.074,17.074,0,0,1,94.647,182.563Zm-6.667,0h5.092a10.238,10.238,0,0,0-.971-2.691,10.738,10.738,0,0,0-1.6-2.3,5.772,5.772,0,0,0-1.417,1.864A16.949,16.949,0,0,0,87.98,182.563Zm-5.565,0h3.964a14.776,14.776,0,0,1,.735-2.533,12.462,12.462,0,0,1,1.129-2.166,8.66,8.66,0,0,0-5.827,4.7Z"
                      transform="translate(-80 -176)" fill="#fff"/>
            </svg>';
		}
		// Actual language switcher items
		elseif ( $hasMultipleLanguages ) {
			$output .= "<li class='" . implode( " ", $item->classes ) . " tw-cursor-pointer tw-flex tw-items-center tw-text-white tw-text-sm lg:tw-px-[25px] tw-mb-5 last-of-type:tw-mb-2.5'>";
		}

		if ( in_array( 'mlp-language-nav-item', $item->classes ) ) {
			if ( ! empty( $translatedUrl ) && $hasMultipleLanguages ) {
				$output .= '<a href="' . $translatedUrl . '">';
				$this->setLanguageSwitchItemHTML( $output, $item );
			}
		} else {
			if ( ! empty( $translatedUrl ) ) {
				$output .= '<a class="' . ( $hasMultipleLanguages ? 'hover:tw-underline' : '' ) . ' tw-hidden lg:tw-inline-block hover:!tw-text-white">';

				if ( in_array( 'ww-languageswitcher', $item->classes ) ) {
					$output .= $item->attr_title;
				} else {
					$output .= $item->title;
				}
			}
		}

		if ( ! empty( $translatedUrl ) ) {
			$output .= '</a>';
		}
	}

	private function setLanguageSwitchItemHTML( &$output, $item ): void {
		$translationUrls = Html::getInstance()->getTranslationUrls();

		if (count($translationUrls) <= 1) {
			return;
		}

		$isCurrentLanguage         = Multisite::getInstance()->getPrefix() === strtolower( $item->attr_title );
		$langPreviewElementClasses = implode( ' ', [
			'tw-rounded-full tw-text-base tw-font-semibold tw-h-[40px] tw-w-[40px] tw-mr-2.5 tw-flex tw-items-center tw-justify-center ',
			$isCurrentLanguage ? 'tw-bg-edge tw-text-white' : 'tw-bg-gray-01 tw-text-black-00'
		] );
		$langTextElementClasses    = implode( ' ', [
			'tw-text-base',
			$isCurrentLanguage ? 'tw-text-edge group-hover/lang-item:tw-underline' : 'tw-text-white lg:tw-text-black-00 group-hover/lang-item:tw-text-edge group-hover/lang-item:tw-underline'
		] );

		$output .= '<div class="tw-flex tw-items-center tw-group/lang-item">';
		$output .= '<div class="' . $langPreviewElementClasses . '">' . $item->attr_title . '</div>';
		$output .= '<div class="tw-flex tw-flex-col">';
		$output .= '<span class="' . $langTextElementClasses . ' tw-font-semibold tw-uppercase">' . $item->title . '</span>';
		$output .= '<span class="' . $langTextElementClasses . '">' . $item->description . '</span>';
		$output .= '</div>';
		$output .= '</div>';
	}
}
