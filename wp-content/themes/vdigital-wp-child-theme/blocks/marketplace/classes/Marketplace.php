<?php

namespace Blocks\Marketplace;

use ChildTheme\ChildTheme\AbstractClass;
use WP_Query;

final class Marketplace extends AbstractClass
{
    const POSTS_PER_PAGE = 11;
    const LOAD_MORE_COUNT = 12;

    public function init(): void
    {
        $this->addActions();
    }

    public function addActions(): void
    {
        add_action('wp_dyflexis_ajax_fetch_marketplace_posts', [$this, 'ajaxFetchPosts']);
        add_action('wp_dyflexis_ajax_nopriv_fetch_marketplace_posts', [$this, 'ajaxFetchPosts']);
    }

    public function render(string|false $title): void
    {
        $posts = $this->fetchPosts('all', 0, self::POSTS_PER_PAGE);

        echo get_template_part('template-parts/marketplace', null, [
            'title'        => $title,
            'categories'   => $this->fetchCategories(),
            'posts'        => $posts->posts,
            'more'         => $posts->found_posts > self::POSTS_PER_PAGE,
            'category'     => 'all',
            'postsPerPage' => self::POSTS_PER_PAGE,
            'totalPosts'   => $posts->found_posts,
        ]);
    }

    public function fetchCategories(): array
    {
        return get_terms([
            'taxonomy'   => 'ww_api_connections_categories',
            'hide_empty' => false,
            'parent'     => 0,
        ]);
    }

    public function fetchPosts(string $category = 'all', int $offset = 0, int $postsPerPage = -1): WP_Query
    {
        return new WP_Query([
            'post_type'      => 'ww_api_connections',
            'post_status'    => ['publish', 'private'],
            'tax_query'      => $category !== 'all' ? [
                [
                    'taxonomy' => 'ww_api_connections_categories',
                    'field'    => 'term_id',
                    'terms'    => $category,
                ],
            ] : [],
            'offset'         => $offset,
            'posts_per_page' => $postsPerPage,
        ]);
    }

    public function ajaxFetchPosts(): void
    {
        $category = filter_input(INPUT_POST, 'category', FILTER_SANITIZE_STRING) ?: 'all';
        $offset = filter_input(INPUT_POST, 'offset', FILTER_VALIDATE_INT);
        if ($offset === false || $offset === null) {
            $offset = 0;
        }
        
        $postsPerPage = $offset === 0 ? self::POSTS_PER_PAGE : self::LOAD_MORE_COUNT;
        $posts = $this->fetchPosts($category, $offset, $postsPerPage);
        
        $totalLoaded = $offset + count($posts->posts);

        $response = [
            'more'       => $totalLoaded < $posts->found_posts,
            'totalPosts' => $posts->found_posts,
        ];

        ob_start();
        echo get_template_part('template-parts/marketplace-cards', null, [
            'posts' => $posts->posts,
            'includeMissingConnection' => $offset === 0,
        ]);
        $response['html'] = ob_get_contents();
        ob_end_clean();

        wp_send_json($response);
    }

}

Marketplace::getInstance()->init();
