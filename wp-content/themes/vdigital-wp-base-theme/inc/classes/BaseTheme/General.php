<?php

	namespace Theme\BaseTheme;

	/**
	 * Class General
	 *
	 * @package Theme\BaseTheme
	 *
	 * @property-read General\AcfFields    $AcfFields
	 * @property-read General\AcfGroups    $AcfGroups
	 * @property-read General\Html         $Html
	 * @property-read General\Mail         $Mail
	 * @property-read General\Plugins      $Plugins
	 * @property-read General\Text         $Text
	 * @property-read General\ThemeModules $ThemeModules
	 * @property-read General\ThemeOptions $ThemeOptions
	 * @property-read General\WordPress    $WordPress
	 * @property-read General\Svg          $Svg
	 * @property-read General\WooCommerce  $WooCommerce
	 * @property-read General\Images       $Images
	 */
	final class General extends AbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->Text->init();
			$this->Html->init();
			$this->AcfFields->init();
			$this->AcfGroups->init();
			$this->ThemeOptions->init();
			$this->Mail->init();
			$this->Plugins->init();
			$this->Images->init();
			$this->WordPress->init();
			$this->Svg->init();

			if ( class_exists( 'WooCommerce' ) ) {
				$this->WooCommerce->init();
			}

			$this->ThemeModules->init();
		}
	}