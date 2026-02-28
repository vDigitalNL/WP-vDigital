<?php

namespace ChildTheme\ChildTheme\General\ThemeOptions;

use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class Footer extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		add_action( 'init', [ $this, 'disableFooterTab' ], 11 );

		$this->baseTheme->addFilter( 'theme_options/footer/sub_fields', [ $this, 'removeFields' ], 5, 2 );
	}

	public function disableFooterTab(): void {
		acf_remove_local_field( 'theme_options__footer' );
	}

	public function removeFields( array $fields, string $optionFieldKey ): array {
		return [];
	}
}
