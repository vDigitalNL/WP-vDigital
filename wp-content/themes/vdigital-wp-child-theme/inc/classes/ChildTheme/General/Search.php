<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

class Search extends AbstractClass {

	public function init(): void {
		add_action( 'template_redirect', [ $this, 'disableSearch' ] );
	}

	public function disableSearch(): void {
		if ( ! is_search() ) {
			return;
		}

		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();
		include get_query_template( '404' );
		exit;
	}
}