<?php

	namespace Theme\WP;

	use WP_Post;

	/**
	 * Class Post
	 *
	 * @package Theme\Helpers\WP
	 */
	class Post {

		/**
		 * Function to retrieve the post ID by slug.
		 *
		 * @param string $slug
		 * @param string $post_type Can be empty. Default is 'post'
		 *
		 * @return \WP_Post|null
		 */
		public static function getBySlug( $slug, $post_type = 'post' ): ?WP_Post {
			$posts = get_posts( [
				'name'           => $slug,
				'posts_per_page' => 1,
				'post_type'      => $post_type
			] );

			if ( empty( $posts ) ) {
				return null;
			}

			return $posts[0];
		}

		/**
		 * @param int  $post_id
		 * @param null $more_link_text
		 * @param bool $stripteaser
		 *
		 * @return string
		 */
		public static function getTheContentById( $post_id = 0, $more_link_text = null, $stripteaser = false ): string {
			/*global $post;*/

			$post = &get_post( $post_id );

			setup_postdata( $post );

			$content = has_excerpt( $post ) ? get_the_excerpt( $post ) : get_the_content( $more_link_text, $stripteaser );

			wp_reset_postdata();

			return $content;
		}

		/**
		 * @param int $post_id
		 * @param int $length
		 *
		 * @return string
		 */
		public static function getTheExcerptById( $post_id, $length ): string {
			$excerpt = static::getTheContentById( $post_id );
			$excerpt = preg_replace( "([.*?])", '', $excerpt );
			$excerpt = strip_shortcodes( $excerpt );
			$excerpt = strip_tags( $excerpt );
			$excerpt = substr( $excerpt, 0, $length );
			$excerpt = substr( $excerpt, 0, strripos( $excerpt, " " ) );

			\baseTheme()->addFilter( 'post/excerpt_read_more_link_class', function ( $class ) {
				return implode( ' ', \func_get_args());
			}, 10, 4);

			$readMoreLinkClass = \baseTheme()->applyFilters( 'post/excerpt_read_more_link_class', 'read-more-link', 'another param', 'yet_another_param' );
			$readMoreLinkUrl   = \get_the_permalink( $post_id );
			$readMoreLink      = '<a class="' . \esc_attr( $readMoreLinkClass ) . '" href="' . \esc_url( $readMoreLinkUrl ) . '">' . \baseTheme()->__( 'Read more' ) . ' ></a>';

			$excerpt = $excerpt . '... ' . $readMoreLink;

			return $excerpt;
		}
	}