<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

class Popup extends AbstractClass {
	public function init(): void {
		add_action('wp_vdigital_ajax_vdigital_render_popup', [$this, 'render']);
		add_action('wp_vdigital_ajax_nopriv_vdigital_render_popup', [$this, 'render']);
	}

	public function render(): void {
		FormTemplates::getInstance()->render();
	}
}
