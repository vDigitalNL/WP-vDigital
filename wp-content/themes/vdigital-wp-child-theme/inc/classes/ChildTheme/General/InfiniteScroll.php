<?php

namespace ChildTheme\ChildTheme\General;

	use Blocks\Overview\Overview;
	use ChildTheme\ChildTheme\AbstractClass;

	final class InfiniteScroll extends AbstractClass {

	const PAGINATION_PARAM = 'index';
	public bool $enabled = false;
	private string $postType;
	private \WP_Post|null $highlightedPost;

	public function init(): void {
		$this->addActions();
		$this->addFilters();
	}

	private function addActions(): void {
		add_action( 'wp', [ $this, 'setClassProperties' ], 1 );
		add_action( 'wp', [ $this, 'force404InCaseOfInvalidPageNumber' ] );
		add_action( 'wp_head', [ $this, 'addNextAndPrevTags' ] );
	}

	public function setClassProperties(): void {
		global $post;
		if(empty($post)) {
			return;
		}

		$this->postType       = get_field( 'infinite_scroll_pagination_post_type', $post->ID ) ?: get_post_type( $post->ID );

		if ($this->postType === 'posts') {
			$this->postType = 'post';
		}

		$this->highlightedPost = match ($this->postType) {
			'post' => get_post( get_field( 'highlighted_post' ) ?: null ),
			'ww_customer_reviews' => get_post( get_field( 'highlighted_review' ) ?: null ),
			default => null
		};

		$this->enabled = get_field( 'infinite_scroll_pagination_enabled', $post->ID ) ?: false;
	}

	public function addFilters(): void {
		add_filter( 'ww_overview_show_more_button_visible', [ $this, 'showPostTypePageAttributes' ] );
		add_filter( 'ww_overview_filters_visible', [ $this, 'showPostTypePageAttributes' ] );
	}

	public function showPostTypePageAttributes(): bool {
		return empty( filter_input( INPUT_GET, self::PAGINATION_PARAM, FILTER_VALIDATE_INT ) );
	}

	public function addNextAndPrevTags(): void {
		if ( ! $this->enabled || empty( $this->postType ) ) {
			return;
		}

		global $wp;
		if ( empty ( $pageNumber = filter_input( INPUT_GET, self::PAGINATION_PARAM, FILTER_VALIDATE_INT ) ) ) {
			$pageNumber = 1;
		}

		if ( count( $this->getPosts( $pageNumber - 1 ) ) > 0 && ( $pageNumber - 1 ) > 0 ) {
			$prevPageUrl = home_url( $wp->request ) . '?' . self::PAGINATION_PARAM . '=' . ( $pageNumber - 1 );

			if ($pageNumber === 2) {
				$prevPageUrl = home_url( $wp->request );
			}

			echo '<link rel="prev" href="' . $prevPageUrl . '">';
		}

		if ( count( $this->getPosts( $pageNumber + 1 ) ) > 0 && ( $pageNumber + 1 ) > 0 ) {
			$nextPageUrl = home_url( $wp->request ) . '?' . self::PAGINATION_PARAM . '=' . ( $pageNumber + 1 );
			echo '<link rel="next" href="' . $nextPageUrl . '">';
		}
	}

	public function force404InCaseOfInvalidPageNumber(): void {
		$pageNumber = filter_input( INPUT_GET, self::PAGINATION_PARAM, FILTER_VALIDATE_INT );
		if ( $pageNumber === false ) {
			$this->throw404();

			return;
		}

		if ( empty ( $pageNumber ) ) {
			return;
		}

		$posts = $this->getPosts( $pageNumber );

		if ( ( ! count( $posts ) > 0 ) && $this->enabled && ! empty( $this->postType ) ) {
			$this->throw404();
		}
	}

	private function getPosts( $pageNumber ): array {
		$posts      = [];
		$pageNumber = intval( $pageNumber );

		if ( ! $this->enabled || empty( $this->postType ) ) {
			return $posts;
		}

		$offset = Overview::POSTS_PER_PAGE * ( max($pageNumber - 2,0) );

		if (! empty($highlightedPost) && $pageNumber > 1) {
			$offset = $offset + Overview::POSTS_PER_PAGE_WITH_HIGHLIGHTED;
		} elseif ($pageNumber > 1) {
			$offset = $offset + Overview::POSTS_PER_PAGE;
		}

		return Overview::getInstance()
		               ->fetchPosts( $this->postType, $offset, 'all', $this->highlightedPost?->ID ?? null )
			->posts;
	}

	private function throw404(): void {
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
	}
}