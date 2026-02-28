<?php

namespace ChildTheme\ChildTheme\General\ThemeOptions;

use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;
use \Theme\BaseTheme\General\ThemeOptions\ThemeOptionFieldsTrait;


final class Page404 extends AbstractClass
{
	use ThemeFlexClassTrait;
	use ThemeOptionFieldsTrait;


	public function init(): void
	{
		$this->addFilters();
	}

	private function addFilters(): void
	{
		$this->baseTheme->addFilter('theme_options/page404/sub_fields', [$this, 'addFields'], 5);
	}
	/**
	 * @param string $optionGroupKey
	 */
	public function registerTab(string $optionGroupKey): void
	{
		$optionFieldKey = $optionGroupKey . '__page404';

		$fields = $this->getFields();
		$fields = baseTheme()->applyFilters('theme_options/page404/sub_fields', $fields, $optionFieldKey);

		$this->addTab($this->baseTheme->__('404 page'), $optionGroupKey, $optionFieldKey)
			->addFields($fields, $optionGroupKey, $optionFieldKey)
			->registerFields();
	}
	public function getFields(): array
	{
		$fields = [
			[
				'key'   => 'field_title',
				'label' => $this->baseTheme->__('Title'),
				'default_value' => $this->baseTheme->__("404<br/>Browser says no"),
				'type'  => 'textarea',
				'rows' => '3',
			],
			[
				'key'   => 'field_description',
				'name'  => 'description',
				'label' => $this->baseTheme->__('Description'),
				'default_value' => $this->baseTheme->__("We can't find the page that you're looking for :("),
				'type'  => 'textarea',
				'rows' => '3',
			],
			[
				'key'   => 'field_first_btn',
				'label' => $this->baseTheme->__('First button'),
				'name'  => 'first_btn',
				'type'  => 'link',
				'return_format' => 'array',
			],
			[
				'key'   => 'field_second_btn',
				'label' => $this->baseTheme->__('Second button'),
				'name'  => 'second_btn',
				'type'  => 'link',
				'return_format' => 'array',
			],
		];

		return $fields;
	}
}
