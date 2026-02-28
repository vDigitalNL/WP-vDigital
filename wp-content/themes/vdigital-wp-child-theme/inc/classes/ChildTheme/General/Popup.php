<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

class Popup extends AbstractClass {
	public function init(): void {
		add_action('wp_dyflexis_ajax_dyflexis_render_popup', [$this, 'render']);
		add_action('wp_dyflexis_ajax_nopriv_dyflexis_render_popup', [$this, 'render']);
	}

	public function render(): void {
		FormTemplates::getInstance()->render();
	}
}