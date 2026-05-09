<?php

	namespace Theme\BaseTheme\Backend;

	use Theme\BaseTheme;

	/**
	 * Class Editor
	 *
	 * @package Theme\BaseTheme\Backend
	 */
	final class Editor extends BaseTheme\AbstractClass {

		/**
		 * @param array $buttons
		 *
		 * @return array
		 */
		public function addStyleSelectButtons( array $buttons ): array {
			array_unshift( $buttons, 'styleselect' );

			return $buttons;
		}

		public function init() {
			// Register our callback to the appropriate filter
			add_filter( 'mce_buttons_2', [ $this, 'addStyleSelectButtons' ] );

			//add custom styles to the WordPress editor
			add_filter( 'tiny_mce_before_init', [ $this, 'customStyles' ] );
		}

		/**
		 * @param array $init_array
		 *
		 * @return array
		 */
		public function customStyles( array $init_array ): array {
			$custom_styles = [
				[
					'title'   => 'Lead tekst',
					'block'   => 'span',
					'classes' => 'txt--lead',
					'wrapper' => true,
				],
				[
					'title'   => 'Large tekst',
					'block'   => 'span',
					'classes' => 'txt--lg',
					'wrapper' => true,
				],
				[
					'title'   => 'Small tekst',
					'block'   => 'span',
					'classes' => 'txt--sm',
					'wrapper' => true,
				],
			];
			// Insert the array, JSON ENCODED, into 'style_formats'
			$init_array['style_formats'] = json_encode( $custom_styles );

			return $init_array;
		}
	}