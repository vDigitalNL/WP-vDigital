<?php

namespace ChildTheme\ChildTheme\General\PostTypes;

use Theme\BaseTheme\AbstractClass;

class PortalPosts extends AbstractClass
{
    public function init(): void
    {
        $this->addActions();

        $this->addFilters();
    }

    private function addActions(): void
    {
        add_action( 'manage_partner_portal_posts_posts_custom_column', function ( $columnName, $postId ) {
            echo get_field('klantportaal_order', $postId );
        }, 10, 2);

        add_action( 'manage_partner_portal_posts_categories_custom_column', function ( $string, $columnName, $termId ) {
            echo get_field('klantportaal_category_order', 'partner_portal_posts_categories' . "_" . $termId );
        }, 10, 3);

        /*
         * Add filter for categories to partner portal posts
         */
        add_action('restrict_manage_posts', function() {
            global $typenow;
            $post_type = 'partner_portal_posts';
            $taxonomy  = 'partner_portal_posts_categories';
            if ($typenow == $post_type) {
                $selected      = isset($_GET[$taxonomy]) ? $_GET[$taxonomy] : '';
                $taxonomyInfo  = get_taxonomy($taxonomy);

                wp_dropdown_categories( [
                    'show_option_all' => sprintf( __( 'Show all %s', 'textdomain' ), $taxonomyInfo->label ),
                    'taxonomy'        => $taxonomy,
                    'name'            => $taxonomy,
                    'orderby'         => 'name',
                    'selected'        => $selected,
                    'show_count'      => true,
                    'hide_empty'      => true,
                ] );
            };
        });

        add_action( 'parse_query', function ( $query ) {
            global $pagenow;
            $postType  = 'partner_portal_posts';
            $taxonomy  = 'partner_portal_posts_categories';
            $queryVars = &$query->query_vars;

            if ( $pagenow == 'edit.php' && isset( $queryVars['post_type'])
                && $queryVars['post_type'] == $postType
                && isset( $queryVars[$taxonomy] )
                && is_numeric( $queryVars[$taxonomy] )
                && $queryVars[$taxonomy] != 0 ) {
                $term = get_term_by( 'id', $queryVars[$taxonomy], $taxonomy );
                $queryVars[$taxonomy] = $term->slug;
            }
        });

        add_action( 'pre_get_posts', function ( $query ) {
            if( ! is_admin() ) {
                return;
            }

            $orderby = $query->get( 'orderby');

            if( $orderby == 'order' ) {
                $query->set('meta_key', 'klantportaal_order');
                $query->set('orderby', 'meta_value_num');
            }
        });

        add_action( 'pre_get_posts', function ( $query ) {
            if( ! is_admin() ) {
                return;
            }

            $orderby = $query->get( 'orderby');

            if( $orderby == 'order' ) {
                $query->set('meta_key', 'klantportaal_category_order');
                $query->set('orderby', 'meta_value_num');
            }
        });


    }

    private function addFilters(): void
    {
        /*
         * Add sortable columns to partner portal posts
         */
        add_filter( 'manage_edit-partner_portal_posts_columns', function ( $columns ) {
            $dateColumn = $columns['date'];
            unset( $columns['date'] );

            $columns['order'] = __('Order', 'ww_simple_devs_theme');
            $columns['date']  = $dateColumn;

            return $columns;
        });

        add_filter( 'manage_edit-partner_portal_posts_sortable_columns', function ( $columns ) {
            $columns['order'] = 'order';

            return $columns;
        });

        /*
         * Add sortable columns to partner portal categories
         */
        add_filter( 'manage_edit-partner_portal_posts_categories_columns', function ( $columns ) {
            $columns['order'] = __( 'Order', 'ww_simple_devs_theme' );

            return $columns;
        });

        add_filter( 'manage_edit-partner_portal_posts_categories_sortable_columns', function ( $columns ) {
            $columns['order'] = 'order';

            return $columns;
        });
    }
}