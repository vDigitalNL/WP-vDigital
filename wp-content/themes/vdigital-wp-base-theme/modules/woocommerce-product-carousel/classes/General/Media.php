<?php

namespace Theme\Modules\WoocommerceProductCarousel\General;

use Theme\BaseTheme\General\Images;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class Media
 *
 * @package Theme\Modules\WoocommerceProductCarousel\General
 */
class Media extends ThemeModuleAbstractClass {
	public function init() {
		Images::getInstance()->addImage( 'product-carousel' )
			->addSize( 'xs-lg', 220, 180, true, '(max-width:4096px)' );
	}
}