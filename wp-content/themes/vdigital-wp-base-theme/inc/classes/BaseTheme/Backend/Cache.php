<?php

	namespace Theme\BaseTheme\Backend;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Cache
	 *
	 * @package Theme\BaseTheme\Backend
	 *
	 * @property-read Cache\W3 $W3
	 */
	final class Cache extends AbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			if (class_exists('\W3TC\Dispatcher')) {
				$this->W3->init();
			}
		}
	}