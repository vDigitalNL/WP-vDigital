<?php

namespace ChildTheme\ChildTheme\Backend;

use ChildTheme\ChildTheme\AbstractClass;

/**
 * Class BulkActions
 *
 * @package Theme\ChildTheme\ChildTheme\Backend
 */
final class BulkActions extends AbstractClass {
	public function init(): void {
		$this->addFilters();
		$this->addActions();
	}

	public function addActions(): void {
		add_action( 'admin_notices', function () {
			if ( ! empty( $_REQUEST['ww_posts_moved'] ) ) {
				// because I want to add blog names to notices
				$blog = get_blog_details( $_REQUEST['ww_blogid'] );
				switch ( $blog->blog_id ) {
					case 4:
						$affix = 'DE';
						break;
					case 5:
						$affix = 'NL';
						break;
					case 1:
					default:
						$affix = 'EN';
				}

				// depending on how much posts were changed, make the message different
				printf( '<div id="message" class="updated notice is-dismissible"><p>' .
				        _n( '%d post has been copied to "%s".', '%d posts have been copied to "%s".', intval( $_REQUEST['ww_posts_moved'] )
				        ) . '</p></div>', intval( $_REQUEST['ww_posts_moved'] ), $blog->blogname . ' ' . $affix );

			}
		} );
	}

	private function addFilters(): void {
        add_filter( 'bulk_actions-edit-ww_customer_reviews', [ $this, 'ww_bulk_multisite_actions' ] );
        add_filter( 'bulk_actions-edit-ww_api_connections', [ $this, 'ww_bulk_multisite_actions' ] );

        add_filter( 'handle_bulk_actions-edit-ww_customer_reviews', [ $this, 'ww_bulk_action_multisite_handler' ], 10, 3 );
        add_filter( 'handle_bulk_actions-edit-ww_api_connections', [ $this, 'ww_bulk_action_multisite_handler' ], 10, 3 );
    }
	public function ww_bulk_multisite_actions( $bulk_array ) {
        if ( $sites = get_sites( [
            // 'site__in' => array( 1,2,3 )
            'site__not_in' => get_current_blog_id(), // excluding current blog
            'number'       => 50,
        ] ) ) {
            foreach ( $sites as $site ) {
                switch ( $site->blog_id ) {
                    case 4:
                        $affix = 'DE';
                        break;
                    case 5:
                        $affix = 'NL';
                        break;
                    case 1:
                    default:
                        $affix = 'EN';
                }
                $bulk_array[ 'move_to_' . $site->blog_id ] = 'Copy to "' . $site->blogname . ' ' . $affix . '"';
            }
        }

        return $bulk_array;
    }

    public function ww_bulk_action_multisite_handler( $redirect, $doaction, $object_ids ) {
        return $this->ww_bulk_action_multisite_function( $redirect, $doaction, $object_ids, 'ww_customer_reviews_categories' );
    }

    private function ww_bulk_action_multisite_function( $redirect, $doaction, $object_ids, $category ) {
        // we need query args to display correct admin notices
        $redirect = remove_query_arg( array( 'ww_posts_moved', 'ww_blogid' ), $redirect );
        // our actions begin with "move_to_", so let's check if it is a target action
        if ( strpos( $doaction, "move_to_" ) === 0 ) {
            $blog_id = str_replace( "move_to_", "", $doaction );
            foreach ( $object_ids as $post_id ) {
                // get the original post object as an array
                $post = get_post( $post_id, ARRAY_A );
                // if you need to apply terms
                $post_terms = wp_get_object_terms( $post_id, $category, [ 'fields' => 'slugs' ] );
                // get all the post meta
                $data = get_post_custom( $post_id );
                // empty ID field, to tell WordPress to create a new post, not update an existing one
                $post['ID'] = '';
                switch_to_blog( $blog_id );
                // insert the post
                $inserted_post_id = wp_insert_post( $post ); // insert the post
                // update post terms
                wp_set_object_terms( $inserted_post_id, $post_terms, $category, false );
                // add post meta
                foreach ( $data as $key => $values ) {
                    // if you do not want weird redirects
                    if ( $key == '_wp_old_slug' ) {
                        continue;
                    }
                    foreach ( $values as $value ) {
                        add_post_meta( $inserted_post_id, $key, $value );
                    }
                }
                restore_current_blog();
                // if you want to copy posts, comment this line
                //wp_delete_post( $post_id );
            }
            $redirect = add_query_arg( [
                'ww_posts_moved' => count( $object_ids ),
                'ww_blogid'      => $blog_id
            ], $redirect );

        }

        return $redirect;
    }
}