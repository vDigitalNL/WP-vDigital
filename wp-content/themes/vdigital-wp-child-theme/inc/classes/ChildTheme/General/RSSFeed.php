<?php
namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

class RSSFeed extends AbstractClass {
	public function init(): void {
		$this->removeActions();
		$this->addActions();
		$this->addFilters();
	}

	private function removeActions(): void {
		/*
		 * Prevent WordPress from showing feed links in the page content
		 * */
		remove_action( 'wp_head', 'feed_links', 2 );
		remove_action( 'wp_head', 'feed_links_extra', 3 );
	}

	private function addActions(): void {
		/*
		 * Redirect to a 404 page in case the current page is a feed page
		 * */
		add_action( 'wp', [ $this, 'disableRSSFeed' ] );
	}

	private function addFilters(): void {
		/*
		 * Prevent WordPress from showing feed links in the page content
		 * */
		add_filter( 'post_comments_feed_link', function () {
			return null;
		} );
	}

	public function disableRSSFeed(): void {
		if ( ! is_feed() ) {
			return;
		}

		wp_safe_redirect( home_url('404') );
		exit;
	}
}