<?php

	namespace Theme\BaseTheme;

	/**
	 * Class Frontend
	 *
	 * @package Theme\BaseTheme
	 *
	 * @property-read Frontend\Assets      $Assets
	 * @property-read Frontend\Html        $Html
	 * @property-read Frontend\Media       $Media
	 * @property-read Frontend\WooCommerce $WooCommerce
	 */
	final class Frontend extends AbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->Assets->init();
			$this->Html->init();
			$this->Media->init();

			if ( class_exists( 'WooCommerce' ) ) {
				$this->WooCommerce->init();
			}
		}
	}