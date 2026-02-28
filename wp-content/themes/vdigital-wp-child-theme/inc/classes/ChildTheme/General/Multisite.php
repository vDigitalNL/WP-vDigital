<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

class Multisite extends AbstractClass {
	public function getPrefix( $blogId = null ): string {
		$blogId = $blogId ?? get_current_blog_id();

		return match ( $blogId ) {
			4 => 'de',
			5 => 'nl',
			default => 'en',
		};
	}

	public function getLabel( $blogId = null ): string {
		$blogId = $blogId ?? get_current_blog_id();

		return match ( $blogId ) {
			4 => $this->baseTheme->__( 'German' ),
			5 => $this->baseTheme->__( 'Dutch' ),
			default => $this->baseTheme->__( 'English' ),
		};
	}
}