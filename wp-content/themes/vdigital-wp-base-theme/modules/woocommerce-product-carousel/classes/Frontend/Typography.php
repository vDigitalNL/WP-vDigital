<?php

namespace Theme\Modules\WoocommerceProductCarousel\Frontend;

use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class Typography
 *
 * @package Theme\Modules\WoocommerceProductCarousel\Frontend
 */
class Typography extends ThemeModuleAbstractClass {
	public function init() {
	}

	public function returnTitleByFormat( $title, $format = 'span' ) {
		switch ( $format ) {
			case 'span':
				return "<span>$title</span>";

				break;

			case 'p':
				return "<p>$title</p>";

				break;

			case 'h2':
				return "<h2>$title</h2>";

				break;

			case 'h3':
				return "<h3>$title</h3>";

				break;

			case 'h4':
				return "<h4>$title</h4>";

				break;
		}

		return "<span>$title</span>";
	}
}