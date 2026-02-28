<?php

namespace ChildTheme\ChildTheme;

use Theme\BaseTheme\ThemeFlexClassTrait;

/**
 * Class Backend
 *
 * @package ChildTheme\ChildTheme
 *
 * @property-read Backend\Assets $Assets
 * @property-read Backend\BulkActions $BulkActions
 */
final class Backend extends AbstractClass {

	use ThemeFlexClassTrait;

	public function init() {
		$this->Assets->init();
		$this->BulkActions->init();
	}
}