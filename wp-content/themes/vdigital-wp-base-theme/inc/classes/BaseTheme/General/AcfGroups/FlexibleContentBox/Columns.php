<?php

	namespace Theme\BaseTheme\General\AcfGroups\FlexibleContentBox;

	use Theme\BaseTheme\AbstractClass;
	use Theme\Helpers\Arr;

	/**
	 * Class Columns
	 *
	 * @package Theme\BaseTheme\General\AcfGroups\FlexibleContentBox
	 */
	class Columns extends AbstractClass {

		public function init() {
			$this->registerFlexibleFields();

			\add_filter( 'acf/prepare_field', [ $this, 'removeSelfFromSubFields' ], 1, 1 );
		}

		/**
		 * Remove the "columns" element option from content boxes within column elements, because they don't work
		 *
		 * @param array $field
		 *
		 * @return array
		 */
		public function removeSelfFromSubFields( array $field ): array {
			if ( empty( $field['_clone'] ) ) {
				return $field;
			}

			if ( $field['key'] !== 'field__columns__cols__col_content_field__flexible_content_box__wrapper' ) {
				return $field;
			}

			$layoutToRemove = Arr::searchMultidimensional( $field['layouts'], 'key', 'layout__columns__flexible_content' );

			if ( $layoutToRemove !== false ) {
				unset( $field['layouts'][ $layoutToRemove ] );
			}

			return $field;
		}

		private function registerFlexibleFields() {
			$widthChoices = [
				0      => 'Auto',
				'auto' => $this->baseTheme->__( 'Adjust to Content Width' ),
				1      => '1',
				2      => '2',
				3      => '3',
				4      => '4',
				5      => '5',
				6      => '6',
				7      => '7',
				8      => '8',
				9      => '9',
				10     => '10',
				11     => '11',
				12     => '12',
			];

			$subFields = [];

			foreach ( self::getScreenSizes() as $screenSize ) {
				$screenSize      = $screenSize !== 'xs' ? $screenSize : '';
				$screenSizeAffix = $screenSize ? "_{$screenSize}" : '';

				$colWidthChoices =
					$this->baseTheme->applyFilters( 'flexible_content_box/elements/columns/width_choices',
						$widthChoices, 'col_width' . $screenSizeAffix );

				$subFields[] = [
					'key'           => 'field__columns__cols__col_width' . $screenSizeAffix,
					'label'         => $this->baseTheme->__( 'Column Width' ) . ' ' . $screenSize,
					'name'          => 'field__columns__cols__col_width' . $screenSizeAffix,
					'type'          => 'select',
					'required'      => ! $screenSize,
					'choices'       => ! ! $screenSize ? [ '' => $this->baseTheme->__( 'Inherit' ) ] + $colWidthChoices
						: $colWidthChoices,
					'allow_null'    => 0,
					'default_value' => '',
					'multiple'      => 0,
					'ui'            => 0,
					'return_format' => 'value',
					'ajax'          => 0,
					'wrapper'       => [
						'width' => '20%',
					],
				];
			}

			$columnFields = baseTheme()->applyFilters(
				'flexible_content_box/elements/columns/fields',
				[
					[
						'key'          => 'field__columns__cols',
						'label'        => '',
						'name'         => 'field__columns__cols',
						'type'         => 'repeater',
						'min'          => 1,
						'max'          => 0,
						'layout'       => 'block',
						'button_label' => $this->baseTheme->__( 'New Column' ),
						'sub_fields'   => \array_merge( $subFields, [
							[
								'key'          => 'field__columns__cols__col_content',
								'label'        => $this->baseTheme->__( 'Column Content' ),
								'name'         => 'field__columns__cols__col_content',
								'type'         => 'clone',
								'instructions' => '',
								'required'     => 0,
								'clone'        => [
									0 => 'group__flexible_content_box',
								],
								'display'      => 'seamless',
								'layout'       => 'block',
								'prefix_label' => 0,
								'prefix_name'  => 0,
							],
						] ),
					],
				] );

			$LogoCarouselFlexibleLocation = baseTheme()->applyFilters(
				'group__columns__flexible_location', [] );

			acf_add_local_field_group(
				[
					'key'                   => 'group__columns__flexible',
					'title'                 => baseTheme()->__( 'Logo Carousel' ),
					'fields'                => (array) $columnFields,
					'location'              => [],
					'menu_order'            => 0,
					'position'              => 'normal',
					'style'                 => 'default',
					'label_placement'       => 'top',
					'instruction_placement' => 'label',
					'hide_on_screen'        => '',
					'active'                => 1,
					'description'           => '',
				]
			);

			baseTheme()->addFilter( 'flexible_content_box/layouts', function ( $layouts ) {
				$layouts[] = [
					'key'        => 'layout__columns__flexible_content',
					'name'       => 'layout__columns__flexible_content',
					'label'      => baseTheme()->__( 'Columns' ),
					'display'    => 'block',
					'sub_fields' => [
						[
							'key'               => 'field__columns__flexible_content__columns',
							'label'             => baseTheme()->__( 'Columns' ),
							'name'              => 'field__columns__flexible_content__columns',
							'type'              => 'clone',
							'instructions'      => '',
							'required'          => 0,
							'conditional_logic' => 0,
							'wrapper'           => [
								'width' => '',
								'class' => '',
								'id'    => '',
							],
							'clone'             => [
								0 => 'group__columns__flexible',
							],
							'display'           => 'seamless',
							'layout'            => 'block',
							'prefix_label'      => 0,
							'prefix_name'       => 0,
						],
					],
					'min'        => '',
					'max'        => '',
				];

				return $layouts;
			}, 10, 1 );

			baseTheme()->addFilter( 'flexible_content_box/layouts_template', function ( $templates ) {
				$templates['layout__columns__flexible_content'] = function () {
					$this->baseTheme->Frontend->Html->loadTemplatePart( 'flexible-content-box/elements/columns' );
				};

				return $templates;
			}, 10, 1 );
		}

		public static function getScreenSizes(): array {
			return [ 'xs', 'sm', 'md', 'lg', 'xl' ];
		}
	}