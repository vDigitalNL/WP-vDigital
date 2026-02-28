<?php

namespace ChildTheme\ChildTheme\General\ThemeOptions;

use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class Company extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		$this->addFilters();
	}

	private function addFilters(): void {
		$this->baseTheme->addFilter( 'theme_options/company/sub_fields', [ $this, 'addFields' ], 5 );
	}

	public function addFields($fields): array {
		$fields[] = [
			'key'               => 'youtube',
			'label'             => 'Youtube URL',
			'type'              => 'link',
			'wrapper'           => [
				'width' => '50',
			],
		];

		return $fields;
	}
}