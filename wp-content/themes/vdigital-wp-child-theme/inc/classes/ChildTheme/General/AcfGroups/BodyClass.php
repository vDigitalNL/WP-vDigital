<?php

namespace ChildTheme\ChildTheme\General\AcfGroups;

use ChildTheme\ChildTheme\AbstractClass;

final class BodyClass extends AbstractClass {
	public function init(): void {
		$this->baseTheme->addFilter('custom_body_class_input/active', '__return_false' );
	}
}