<?php

namespace ChildTheme\ChildTheme\General\AcfFields;

use ChildTheme\ChildTheme\AbstractClass;

final class Styling extends AbstractClass {

	public function init(): void {
		add_filter( 'acf/format_value/type=wysiwyg', [ $this, 'addWysiwygWrapper' ] );
	}

	public function addWysiwygWrapper( $value ) {
		if ( ! $value ) {
			return $value;
		}

		return '<div class="wysiwyg__content">' . $value . '</div>';
	}
}