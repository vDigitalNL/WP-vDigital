<?php

	namespace Theme\WP;

	/**
	 * Class Walker_Nav_Menu
	 *
	 * @package Theme\Helpers\WP
	 */
	final class WalkerNavMenu extends \Walker_Nav_Menu {

		/**
		 * @param string $classes
		 *
		 * @return int
		 */
		public function check_current( $classes ) {
			return preg_match( '/(current[-_])|active|dropdown/', $classes );
		}

		/**
		 * @param object $element
		 * @param array  $children_elements
		 * @param int    $max_depth
		 * @param int    $depth
		 * @param array  $args
		 * @param string $output
		 */
		public function display_element( $element, &$children_elements, $max_depth, $depth = 0, $args, &$output ) {

			$element->is_dropdown = ( ( ! empty( $children_elements[ $element->ID ] ) && ( ( $depth + 1 ) < $max_depth || ( $max_depth === 0 ) ) ) );
			if ( $element->is_dropdown ) {
				$element->classes[] = 'dropdown';
			} else {
				$element->classes[] = 'nodropdown';
			}
			if ( $element->is_dropdown && ( $depth === 1 ) ) {
				$element->classes[] = 'col-sm-6 menu-col';
			}

			parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
		}

		public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
			$item_html = '';
			parent::start_el( $item_html, $item, $depth, $args );

			if ( $item->is_dropdown && ( $depth === 0 ) ) {
				$item_html = str_replace( '<a', '<a class="dropdown-toggle" data-toggle="dropdown" data-target="#"', $item_html );
				$item_html = str_replace( '</a>', ' <b class="caret"></b></a>', $item_html );
			} elseif ( stristr( $item_html, 'li class="divider' ) ) {
				$item_html = preg_replace( '/<a[^>]*>.*?<\/a>/iU', '', $item_html );
			} elseif ( stristr( $item_html, 'li class="dropdown-header' ) ) {
				$item_html = preg_replace( '/<a[^>]*>(.*)<\/a>/iU', '$1', $item_html );
			}

			$item_html = apply_filters( 'roots_wp_nav_menu_item', $item_html );
			$output .= $item_html;
		}

		public function start_lvl( &$output, $depth = 0, $args = array() ) {
			$output .= ( $depth == 0 ) ? "\n<ul class=\"dropdown-menu\">\n" . "\n<div class=\"megamenu-content\">\n" . "\n<div class=\"row\">\n"
				: "\n<ul class=\"list-unstyled\">\n";
		}
	}