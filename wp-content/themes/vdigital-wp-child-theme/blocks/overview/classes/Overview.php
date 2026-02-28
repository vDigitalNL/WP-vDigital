<?php

namespace Blocks\Overview;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General\InfiniteScroll;
use ChildTheme\ChildTheme\Helpers\TermLabels;
use WP_Query;

final class Overview extends AbstractClass
{
    const POSTS_PER_PAGE = 18;

    const POSTS_PER_PAGE_WITH_HIGHLIGHTED = 16;

    public function init(): void
    {
        $this->addActions();
    }

    public function addActions(): void
    {
        add_action('wp_dyflexis_ajax_fetch_more_posts', [$this, 'ajaxFetchMorePosts']);
        add_action('wp_dyflexis_ajax_nopriv_fetch_more_posts', [$this, 'ajaxFetchMorePosts']);

        add_action('wp_dyflexis_ajax_fetch_posts', [$this, 'ajaxFetchPosts']);
        add_action('wp_dyflexis_ajax_nopriv_fetch_posts', [$this, 'ajaxFetchPosts']);
    }

    public function render(
        string|false  $title,
        string        $postType,
        string        $category,
        \WP_Post|null $highlighted = null,
        bool          $showAll = false
    ): void {
        if ($showAll) {
            $posts = $this->fetchPosts($postType, 0, $category, $highlighted->ID ?? null, showAll: $showAll);

            echo get_template_part('template-parts/overview', null, [
                'title'           => $title,
                'highlightedPost' => $highlighted,
                'categories'      => $this->fetchCategories($postType),
                'posts'           => $posts->posts,
                'more'            => false,
                'postType'        => $postType,
                'category'        => $category,
                'postsPerPage'    => -1,
                'showAll'         => $showAll,
            ]);

            return;
        }

        $infiniteScrollPageNumber = filter_input(INPUT_GET, InfiniteScroll::PAGINATION_PARAM, FILTER_VALIDATE_INT);

        if (empty($infiniteScrollPageNumber) || ! InfiniteScroll::getInstance()->enabled) {
            $posts = $this->fetchPosts($postType, 0, $category, $highlighted->ID ?? null);

            echo get_template_part('template-parts/overview', null, [
                'title'           => $title,
                'highlightedPost' => $highlighted,
                'categories'      => $this->fetchCategories($postType),
                'posts'           => $posts->posts,
                'more'            => $posts->found_posts > self::POSTS_PER_PAGE,
                'postType'        => $postType,
                'category'        => $category,
                'postsPerPage'    => $highlighted ? self::POSTS_PER_PAGE_WITH_HIGHLIGHTED : self::POSTS_PER_PAGE,
            ]);

            return;
        }

        $offset = self::POSTS_PER_PAGE * (max($infiniteScrollPageNumber - 2, 0));
        if ($infiniteScrollPageNumber > 1) {
            $offset = $offset + ($highlighted ? self::POSTS_PER_PAGE_WITH_HIGHLIGHTED : self::POSTS_PER_PAGE);
        }

        $posts = $this->fetchPosts($postType, $offset, 'all', $highlighted?->ID, $infiniteScrollPageNumber !== 1);

        echo get_template_part('template-parts/overview', null, [
            'title'           => $title,
            'highlightedPost' => $infiniteScrollPageNumber === 1 ? $highlighted : null,
            'posts'           => $posts->posts,
            'more'            => $posts->found_posts > self::POSTS_PER_PAGE,
            'postType'        => $postType,
            'category'        => $category,
            'postsPerPage'    => $highlighted ? self::POSTS_PER_PAGE_WITH_HIGHLIGHTED : self::POSTS_PER_PAGE,
        ]);
    }

    public function fetchCategories(string $postType): array
    {
        $taxonomy = $this->getTaxonomy($postType);

        return self::filterUnwantedCategories(get_terms([
            'taxonomy'   => $taxonomy,
            'hide_empty' => true,
            'parent'     => 0,
        ]));
    }

    private function filterUnwantedCategories(array $terms, array $unwantedTexts = []): array
    {
        $defaultUnwantedTexts = TermLabels::getUnwantedLabelTexts();
        $unwantedTexts = array_merge($defaultUnwantedTexts, $unwantedTexts);
    
        return array_filter($terms, function ($term) use ($unwantedTexts) {
            return !in_array($term->name, $unwantedTexts, true);
        });
    }

    public function fetchPosts(
        string   $postType,
        int      $offset = 0,
        string   $category = 'all',
        int|null $highlighted = null,
        bool     $isLoadMore = false,
        bool     $showAll = false
    ): WP_Query {
        $taxonomy = $this->getTaxonomy($postType);
        $ppp      = $showAll ? -1 :
            ($highlighted && ! $isLoadMore ? self::POSTS_PER_PAGE_WITH_HIGHLIGHTED : self::POSTS_PER_PAGE);

        return new WP_Query([
            'post_type'      => $postType,
            'post_status'    => 'publish',
            'tax_query'      => $category !== 'all' ? [
                [
                    'taxonomy' => $taxonomy,
                    'field'    => 'term_id',
                    'terms'    => $category,
                ],
            ] : [],
            'offset'         => $offset,
            'posts_per_page' => $ppp,
            'post__not_in'   => $highlighted ? [$highlighted] : [],
        ]);
    }

    public function ajaxFetchMorePosts(): void
    {
        $this->fetchPostContent(isLoadMore: true);
    }

    public function ajaxFetchPosts(): void
    {
        $this->fetchPostContent(getHighlighted: true);
    }

    private function fetchPostContent(array $params = [], bool $getHighlighted = false, bool $isLoadMore = false): void
    {
        $cardData = $this->getCards($params, $getHighlighted, $isLoadMore);
        $response = [
            'more'   => $cardData['more'],
            'offset' => $cardData['offset'],
        ];

        $response['html'] = $cardData['template'];
        wp_send_json($response);
    }

    private function getCards(array $params, bool $getHighlighted, bool $isLoadMore = false): array
    {
        $postType      = filter_input(INPUT_POST, 'post_type', FILTER_SANITIZE_STRING) ?: 'post';
        $offset        = filter_input(INPUT_POST, 'offset', FILTER_SANITIZE_NUMBER_INT) ?: 0;
        $category      = filter_input(INPUT_POST, 'category', FILTER_SANITIZE_STRING) ?: 'all';
        $highlightedId = filter_input(INPUT_POST, 'highlightedPost', FILTER_SANITIZE_STRING);
        $highlighted   = $highlightedId ? get_post($highlightedId) : null;
        $taxonomy      = $this->getTaxonomy($postType);

        $isHighlightedPost =
            $highlighted instanceof \WP_Post && ($category === 'all' || has_term($category, $taxonomy, $highlighted));
        $posts             =
            $this->fetchPosts($postType, $offset, $category, $isHighlightedPost ? $highlightedId : null, $isLoadMore);
        $params            = [
            ...$params,
            'posts'           => $posts->posts,
            'postType'        => $postType,
            'highlightedPost' => ($getHighlighted && $isHighlightedPost) ? $highlighted : null,
        ];

        $postsPerPage =
            (! $isLoadMore && $isHighlightedPost) ? self::POSTS_PER_PAGE_WITH_HIGHLIGHTED : self::POSTS_PER_PAGE;
        $offsetValue  = intval($offset) + $postsPerPage;

        $response = [
            'more'   => ! ($posts->found_posts <= $offsetValue),
            'offset' => $offsetValue,
        ];

        ob_start();
        echo get_template_part('template-parts/overview', 'cards', $params);
        $response['template'] = ob_get_contents();
        ob_end_clean();

        return $response;
    }

    private function getTaxonomy(string $postType): string
    {
        return match ($postType) {
            'ww_customer_reviews' => 'ww_customer_reviews_categories',
            default => 'category',
        };
    }
}

/* Had to init at this point since doing it in general.php
 made it so that it tried to call init before the file was even loaded */
Overview::getInstance()->init();