<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

/**
 * Class Widgets
 *
 * @package ChildTheme\ChildTheme\General
 */
final class Widgets extends AbstractClass {

	public function init(): void {
		$this->addActions();
	}

	private function addActions(): void {
		add_action( 'after_setup_theme', [ $this, 'useOldWidgetEditor' ] );
	}

	public function useOldWidgetEditor(): void {
		remove_theme_support( 'widgets-block-editor' );
	}
}