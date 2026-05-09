<?php

	namespace Theme\Modules\MegaMenu;

	/**
	 * Class MegaMenuWalkerNavMenu
	 *
	 * @package Theme\Modules\MegaMenu
	 */
	final class MegaMenuWalkerNavMenu extends \Walker_Nav_Menu {

		public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
			switch ( $item->type ) {
				case 'column-33' :
					$output .= "<div class='col-6 col-lg-4'><ul class='main-menu-custom-walker__level-2'>";
					break;

				case 'column-50' :
					$output .= "<div class='col-6 col-lg-3'><ul class='main-menu-custom-walker__level-2'>";
					break;

				case 'column-end' :
					$output .= "</div>";
					break;

				default :
					global $wp_query;
					$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

					$value     = '';
					$classes   = empty( $item->classes ) ? array() : (array) $item->classes;
					$classes[] = 'menu-item-' . $item->ID;

					$class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ) );
					$class_names = ' class="' . esc_attr( $class_names ) . '"';

					$id = apply_filters( 'nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args );
					$id = strlen( $id ) ? ' id="' . esc_attr( $id ) . '"' : '';

					$output .= $indent . '<li' . $id . $value . $class_names . '>';

					$attributes = ! empty( $item->attr_title ) ? ' title="' . esc_attr( $item->attr_title ) . '"' : '';
					$attributes .= ! empty( $item->target ) ? ' target="' . esc_attr( $item->target ) . '"' : '';
					$attributes .= ! empty( $item->xfn ) ? ' rel="' . esc_attr( $item->xfn ) . '"' : '';
					$attributes .= ! empty( $item->url ) ? ' href="' . esc_attr( $item->url ) . '"' : '';

					$item_output = $args->before;
					$item_output .= '<a' . $attributes . '>';
					$item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
					$item_output .= '<span>' . apply_filters( 'the_title', $item->title, $item->ID ) . '</span>';
					$item_output .= '</a>';
					$item_output .= $args->after;

					$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
			}
		}

		public function start_lvl( &$output, $depth = 0, $args = array() ) {
			switch ( $depth ) {
				case 0 :
					$output .= "<ul class='dropdown-menu row'>";
					break;

				case 1 :
					$output .= "<ul class='main-menu-custom-walker__level-3'>";
					break;

				default :
					$output .= "<ul class='dropdown-menu'>";
					break;
			}
		}
	}