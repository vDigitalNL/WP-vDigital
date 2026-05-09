<?php

namespace Theme\Modules\VisualNavigationBlocks\Frontend;

use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class Typography
 *
 * @package Theme\Modules\VisualNavigationBlocks\Frontend
 */
class Typography extends ThemeModuleAbstractClass {
	public function init() {
	}

	public function returnTitleByFormat( $title, $format = 'span', $class = '', $prefix = '' ) {
		switch ( $format ) {
			case 'span':
				return "<span class='$class'>$prefix $title</span>";

				break;

			case 'p':
				return "<p class='$class'>$prefix $title</p>";

				break;


			case 'h1':
				return "<h1 class='$class'>$prefix $title</h1>";

				break;

			case 'h2':
				return "<h2 class='$class'>$prefix $title</h2>";

				break;

			case 'h3':
				return "<h3 class='$class'>$prefix $title</h3>";

				break;

			case 'h4':
				return "<h4 class='$class'>$prefix $title</h4>";

				break;
		}

		return "<span class='$class'>$prefix $title</span>";
	}
}