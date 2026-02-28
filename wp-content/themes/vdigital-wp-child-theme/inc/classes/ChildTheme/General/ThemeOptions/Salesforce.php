<?php

namespace ChildTheme\ChildTheme\General\ThemeOptions;

use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\General\ThemeOptions\ThemeOptionFieldsTrait;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class Salesforce extends AbstractClass {

	use ThemeFlexClassTrait;
	use ThemeOptionFieldsTrait;

	public static array $formTypes = [];

	public function init(): void {
		self::$formTypes = [
			[
				'key'   => 'demo',
				'label' => $this->baseTheme->__('Demo'),
			],
			[
				'key'   => 'price-request',
				'label' => $this->baseTheme->__('Price request'),
			]
		];
	}
}