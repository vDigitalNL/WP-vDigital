<?php

	namespace Theme\Modules\MegaMenu;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class Frontend
	 *
	 * @package Theme\Modules\MegaMenu
	 */
	class Frontend extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->baseTheme->addFilter( 'wp_nav_menu/primary', [ $this, 'loadMegaMenu' ] );

			$this->themeModule->registerTemplatePath( 'navbar' );
		}

		public function loadMegaMenu( array $args ): array {
			$args['container_class'] = false;
			$args['depth']           = 3;
			$args['walker']          = new MegaMenuWalkerNavMenu();

			return $args;
		}
	}