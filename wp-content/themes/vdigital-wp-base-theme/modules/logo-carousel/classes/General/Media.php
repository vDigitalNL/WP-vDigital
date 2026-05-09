<?php

namespace Theme\Modules\LogoCarousel\General;

use Theme\BaseTheme\General\Images;
use Theme\BaseTheme\ThemeModuleAbstractClass;

/**
 * Class Media
 *
 * @package Theme\Modules\LogoCarousel\General
 */
class Media extends ThemeModuleAbstractClass {
	public function init() {
		Images::getInstance()->addImage( 'logo-carousel' )
			->addSize( 'xs-lg', 240, 240, false, '(max-width: 1920px)' );
	}
}