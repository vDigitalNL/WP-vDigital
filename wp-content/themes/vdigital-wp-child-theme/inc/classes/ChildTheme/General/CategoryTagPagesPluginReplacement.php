<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;
use WP_Query;

class CategoryTagPagesPluginReplacement extends AbstractClass
{
	public function init(): void
	{
		add_action( 'init', [ $this, 'registerPageTaxonomies' ] );
		add_action( 'pre_get_posts', [ $this, 'includePagesInArchives' ] );
	}

	public function includePagesInArchives( WP_Query $query): void {
		if ( is_admin() || ! $query->is_main_query() ) {
			return;
		}

		if ( $query->is_tag() || $query->is_category() ) {
			$query->set( 'post_type', [ 'post', 'page' ] );
		}
	}

	public function registerPageTaxonomies(): void {
		register_taxonomy_for_object_type( 'post_tag', 'page' );
		register_taxonomy_for_object_type( 'category', 'page' );
	}
}