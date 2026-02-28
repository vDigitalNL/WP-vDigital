<?php

namespace ChildTheme\ChildTheme\General\ThemeOptions;

use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class General extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		$this->addFilters();
	}

	private function addFilters(): void {
		$this->baseTheme->addFilter( 'theme_options/general/sub_fields', [ $this, 'addFields' ], 5 );
	}

	public function addFields(): array {
		return [
			[
				'key'   => 'field_break_word',
				'label' => $this->baseTheme->__( 'Break word with hyphen, mid word' ),
				'name'  => 'break_word',
				'type'  => 'true_false',
				'ui'    => 1,
			],
			[
				'key'   => 'field_news_page',
				'label' => $this->baseTheme->__( 'Blog & news overview' ),
				'instructions' => $this->baseTheme->__( 'This setting is used for the "All stories" link on the blogs & news items' ),
				'name'  => 'news_page',
				'type'  => 'post_object',
				'post_type' => [ 'page' ],
				'taxonomy'  => '',
				'allow_null' => 0,
				'multiple'   => 0,
			],
			[
				'key'   => 'field_references_page',
				'label' => $this->baseTheme->__( 'Client cases overview' ),
				'instructions' => $this->baseTheme->__('This setting is used for the "All reviews" link on the client cases'),
				'name'  => 'references_page',
				'type'  => 'post_object',
				'post_type' => [ 'page' ],
				'taxonomy'  => '',
				'allow_null' => 0,
				'multiple'   => 0,
			]
		];
	}
}