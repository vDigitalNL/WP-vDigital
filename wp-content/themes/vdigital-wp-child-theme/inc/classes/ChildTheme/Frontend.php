<?php

	namespace ChildTheme\ChildTheme;

	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class Frontend
	 *
	 * @package ChildTheme\ChildTheme
	 *
	 * @property-read Frontend\Assets $Assets
	 * @property-read Frontend\WordPress $WordPress
	 * @property-read Frontend\Html $Html
	 * @property-read Frontend\Login $Login
	 * @property-read Frontend\Markup $Markup
	 */
	final class Frontend extends AbstractClass {

		use ThemeFlexClassTrait;

		public function init(): void {
			$this->Assets->init();
			$this->WordPress->init();
            $this->Html->init();
			$this->Login->init();
			$this->Markup->init();
		}
	}