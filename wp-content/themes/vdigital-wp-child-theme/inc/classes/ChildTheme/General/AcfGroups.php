<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General\AcfGroups\BodyClass;
use ChildTheme\ChildTheme\General\AcfGroups\UserNotifications;
use Theme\BaseTheme\ThemeFlexClassTrait;

/**
 * Class AcfGroups
 *
 * @package ChildTheme\ChildTheme\General
 * @property-read UserNotifications $UserNotifications
 * @property-read BodyClass $BodyClass
 */
final class AcfGroups extends AbstractClass {

	use ThemeFlexClassTrait;

	public function init(): void {
		$this->UserNotifications->init();
		$this->BodyClass->init();

		$this->addActions();
		$this->addFilters();
	}

	private function addActions(): void {
		add_action( 'init', [ $this, 'disableFlexibleContentEditorACFGroup' ], 11 );
	}

	private function addFilters(): void {
		add_filter( 'acf/format_value/type=image', [ $this, 'fixACFImageProblem' ], 10000, 3 );
	}

	public function fixACFImageProblem( $value, $post_id, array $field ) {
		// This is a fix for a bug caused by the 'Network Media Library' plugin
		// which broke the image functionality within repeaters (copied over from the old theme)
		return acf_get_value( $post_id, $field );
	}

	public function disableFlexibleContentEditorACFGroup(): void {
		acf_remove_local_field_group( 'group__flexible_content_box' );
	}
}
