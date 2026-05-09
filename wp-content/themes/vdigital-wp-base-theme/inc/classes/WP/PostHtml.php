<?php

	namespace Theme\WP;

	/**
	 * Class PostHtml
	 *
	 * @package Theme\Helpers\WP
	 */
	class PostHtml {

		/**
		 * @return string
		 */
		public static function postedBy(): string {
			$postedBy = sprintf(
				baseTheme()->esc_html_x( 'by %s', 'post author' ),
				'<span class="author vcard"><a class="url" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
			);

			return '<span class="posted-by"> ' . $postedBy . '</span>';
		}

		/**
		 * @return string
		 */
		public static function postedOn(): string {
			/* BOF BAS: Removed the changed date since this function is called postedOn not changedOn */
			$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time>';

			$time_string = sprintf( $time_string,
				esc_attr( get_the_date( DATE_W3C ) ),
				esc_html( get_the_date() )
			);

			$postedOn = sprintf(
				baseTheme()->esc_html_x( 'Posted on %s', 'post date' ),
				'<a href="' . esc_url( get_permalink() ) . '" rel="bookmark">' . $time_string . '</a>'
			);

			return '<span class="posted-on">' . $postedOn . '</span>';
		}

		/**
		 * @return string
		 */
		public static function changedOn(): string {
			/* BOF BAS: Added this function since I strapped the functionalities from the already existing function: postedOn(). */

			$time_string = '<time class="entry-date updated" datetime="%1$s">%2$s</time>';

			$time_string = sprintf( $time_string,
				esc_attr( get_the_modified_date( DATE_W3C ) ),
				esc_html( get_the_modified_date() )
			);

			$updatedOn = sprintf(
				baseTheme()->esc_html_x( 'Updated on %s', 'post date' ),
				'<a href="' . esc_url( get_permalink() ) . '" rel="bookmark">' . $time_string . '</a>'
			);

			return '<span class="updated-on">' . $updatedOn . '</span>';
		}

		/**
		 * @return string
		 */
		public static function thumbnail(): string {
			if ( post_password_required() || is_attachment() || ! has_post_thumbnail() ) {
				return '';
			}

			if ( is_singular() ) {
				return get_the_post_thumbnail();
			}

			$thumbnail = '<a class="post-thumbnail" href="'. get_the_permalink() .'" aria-hidden="true" tabindex="-1">';
			$thumbnail .= get_the_post_thumbnail( null, 'post-thumbnail', [
				'alt' => the_title_attribute( [ 'echo' => false ] ),
			] );
			$thumbnail .= '</a>';

			return $thumbnail;
		}

		/**
		 * @return string
		 */
		public static function entryFooter(): string {
			ob_start();

			// Hide category and tag text for pages.
			if ( 'post' === get_post_type() ) {
				/* translators: used between list items, there is a space after the comma */
				$categories_list = get_the_category_list( ', ' );
				if ( $categories_list ) {
					/* translators: 1: list of categories. */
					printf( '<span class="cat-links">' . baseTheme()->esc_html__( 'Posted in %1$s' ) . '</span>', $categories_list ); // WPCS: XSS OK.
				}

				/* translators: used between list items, there is a space after the comma */
				$tags_list = get_the_tag_list( '', baseTheme()->esc_html_x( ', ', 'list item separator' ) );
				if ( $tags_list ) {
					/* translators: 1: list of tags. */
					printf( '<span class="tags-links">' . baseTheme()->esc_html__( 'Tagged %1$s' ) . '</span>', $tags_list ); // WPCS: XSS OK.
				}
			}

			if ( ! is_single() && ! post_password_required() && ( comments_open() || get_comments_number() ) ) {
				echo '<span class="comments-link">';
				comments_popup_link(
					sprintf(
						wp_kses(
							/* translators: %s: post title */
							baseTheme()->__( 'Leave a Comment<span class="screen-reader-text"> on %s</span>' ),
							array(
								'span' => array(
									'class' => array(),
								),
							)
						),
						get_the_title()
					)
				);
				echo '</span>';
			}

			edit_post_link(
				sprintf(
					wp_kses(
						/* translators: %s: Name of current post. Only visible to screen readers */
						baseTheme()->__( 'Edit <span class="screen-reader-text">%s</span>' ),
						array(
							'span' => array(
								'class' => array(),
							),
						)
					),
					get_the_title()
				),
				'<span class="edit-link">',
				'</span>'
			);

			return ob_get_clean();
		}
	}