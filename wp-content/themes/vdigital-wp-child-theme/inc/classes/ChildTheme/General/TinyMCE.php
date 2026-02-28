<?php

namespace ChildTheme\ChildTheme\General;

use Theme\BaseTheme;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class TinyMCE extends BaseTheme\AbstractClass {

	use ThemeFlexClassTrait;

	public function init(): void {
		add_action( 'init', [ $this, 'addButtonFilters' ] );
		add_filter( 'acf/fields/wysiwyg/toolbars', [ $this, 'customizeToolbars' ] );
		add_filter( 'tiny_mce_before_init', [ $this, 'customizeFormats' ] );
	}

	public function addButtonFilters(): void {
		add_filter( "mce_external_plugins", [ $this, 'registerPlugins' ] );
		add_filter( 'mce_buttons', [ $this, 'registerButtons' ] );
	}

	public function registerPlugins( $plugins ): array {
		$plugins['wwcheckmarkplugin'] = get_stylesheet_directory_uri() . '/resources/js/tinymce-checklist.js';
		$plugins['wwcustomtitleformats'] = get_stylesheet_directory_uri() . '/resources/js/tinymce-custom-title-formats.js';

		return $plugins;
	}

	public function registerButtons( $buttons ): array {
		$buttons[] = 'checkmark-list';

		return $buttons;
	}

	public function customizeToolbars( $toolbars ): array {
		$defaultToolbar = $toolbars['Full'][1] ?? [];
		$excludedItems   = [
			'wp_more',
			'wp_adv',
			'pre'
		];

		$toolbars['text_block']    = [];
		$toolbars['text_block'][1] = array_values( array_filter( $defaultToolbar, function ( $item ) use ( $excludedItems ) {
			return ! in_array( $item, $excludedItems, true );
		} ) );

		return $toolbars;
	}

	public function customizeFormats( $settings ): array {
		$settings['block_formats'] = 'H1 - Default=h1;H1 - Small=h1-small;H2=h2;H3 - Default=h3;H3 - Small=h3-small;H4 - Default=h4;Paragraph=p';

		return $settings;
	}
}