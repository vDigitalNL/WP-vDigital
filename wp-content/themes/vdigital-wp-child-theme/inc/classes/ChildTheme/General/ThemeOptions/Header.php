<?php

namespace ChildTheme\ChildTheme\General\ThemeOptions;

use ChildTheme\ChildTheme\General\FormTemplates;
use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class Header extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		add_action( 'init', [ $this, 'disableHeaderTab' ], 11 );

		$this->baseTheme->addFilter( 'theme_options/header/sub_fields', [ $this, 'removeFields' ], 5, 2 );
	}

	public function disableHeaderTab(): void {
		acf_remove_local_field( 'theme_options__header' );
	}

	public function removeFields( array $fields, string $optionFieldKey ): array {
		return [];
	}
}
