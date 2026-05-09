<?php

	namespace Theme\BaseTheme\General\AcfGroups;

	use Theme\BaseTheme\AbstractClass;

	final class BodyClass extends AbstractClass {

		/**
		 * @param array $classes
		 *
		 * @return array
		 */
		public function customBodyClass( array $classes ) {
			if ( $value = get_field( 'body_class' ) ) {
				$classes[] = $value;
			}

			return $classes;
		}

		/**
		 * Init ACF admin fields for this module on post edit pages / option pages and adds the newly made class
		 */
		public function init() {
			$this->addFilters();

			$this->addActions();
		}

		private function addActions() {
			add_action( 'init', function () {
				$this->addBodyClassFields();
			} );
		}

		private function addBodyClassFields() {
			if ( ! function_exists( 'acf_add_local_field_group' ) || ! baseTheme()->applyFilters( 'custom_body_class_input/active', true ) ) {
				return;
			}

			acf_add_local_field_group( [
				'key'                   => 'group_5decff3d2cbe5',
				'title'                 => 'Body Class',
				'fields'                => [
					[
						'key'               => 'field_5decff4d10702',
						'label'             => 'Body class',
						'name'              => 'body_class',
						'type'              => 'text',
						'required'          => 0,
						'conditional_logic' => 0,
					],
				],
				'location'              => [
					$this->baseTheme->applyFilters( 'custom_body_class_input/locations',
						[
							[
								'param'    => 'post_type',
								'operator' => '=',
								'value'    => 'all',
							],
						]
					),
				],
				'menu_order'            => 0,
				'position'              => 'side',
				'style'                 => 'default',
				'label_placement'       => 'top',
				'instruction_placement' => 'label',
				'active'                => true,
			] );
		}

		private function addFilters() {
			add_filter( 'body_class', [ $this, 'customBodyClass' ] );
		}
	}