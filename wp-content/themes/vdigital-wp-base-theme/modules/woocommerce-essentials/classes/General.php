<?php

	namespace Theme\Modules\WoocommerceEssentials;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class General
	 *
	 * @package Theme\Modules\WoocommerceEssentials
	 *
	 * @property-read General\AcfGroups               $AcfGroups
	 * @property-read General\ModuleSettings          $ModuleSettings
	 * @property-read General\Sidebar                 $Sidebar
	 * @property-read General\Media                   $Media
	 * @property-read General\ProductQuery            $ProductQuery
	 * @property-read General\RegisterWidgets         $RegisterWidgets
	 * @property-read General\ModifyWidgets           $ModifyWidgets
	 * @property-read General\WooCommerceThemeSupport $WooCommerceThemeSupport
	 * @property-read General\WooCommercePermalink    $WooCommercePermalink
	 */
	class General extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->AcfGroups->init();

			$this->ModuleSettings->init();

			$this->Sidebar->init();

			$this->Media->init();

			$this->RegisterWidgets->init();

			$this->ModifyWidgets->init();

			$this->ProductQuery->init();

			$this->WooCommerceThemeSupport->init();

			$this->WooCommercePermalink->init();
		}
	}