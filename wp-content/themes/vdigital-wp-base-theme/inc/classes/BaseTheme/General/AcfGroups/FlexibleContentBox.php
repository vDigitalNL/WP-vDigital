<?php

	namespace Theme\BaseTheme\General\AcfGroups;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;
	use function is_callable;

	/**
	 * Class FlexibleContentBox
	 *
	 * @package Theme\BaseTheme\General\AcfGroups
	 *
	 * @property-read FlexibleContentBox\Columns $Columns
	 */
	final class FlexibleContentBox extends AbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			if ( ! function_exists( 'acf_add_local_field_group' ) || ! $this->baseTheme->applyFilters( 'flexible_content_box/active', true ) ) {
				return;
			}

			// Register the Flexible Content Box group
			add_action( 'init', [ $this, 'registerGroup' ], 10 );

			// Register a function that takes care of rendering the layouts
			add_filter( 'the_content', [ $this, 'loopFlexibleContent' ] );

			// Register components that are offered out of the box
			$this->Columns->init();
		}

		/**
		 * Looping over the available content blocks within the flexible content element.
		 * The templates are being retrieved with $this->getTemplateByLayout().
		 *
		 * This function hooks into the filter "the_content" the content which is being retrieved
		 * with the following includes is being added to the existing content in "the_content".
		 *
		 * @param string $content
		 *
		 * @return string
		 */
		public function loopFlexibleContent( ?string $content ): string {
			$templates = $this->getTemplateByLayout();

			ob_start();

			while ( have_rows( 'field__flexible_content_box__wrapper' ) ) {
				the_row();

				if ( isset( $templates[ get_row_layout() ] ) ) {
					if ( is_callable( $templates[ get_row_layout() ] ) ) {
						$templates[ get_row_layout() ]();
					} elseif ( file_exists( $templates[ get_row_layout() ] ) ) {
						include( $templates[ get_row_layout() ] );
					}
				}
			}

			return $content . ob_get_clean();
		}

		/**
		 * Registering the group that is being used as flexible content.
		 */
		public function registerGroup() {
			$flexibleContentBoxLayouts   = $this->registerLayouts();
			$flexibleContentBoxLocations = $this->registerLocations();

			// Add an extra field group to be able to hide the editor on the screen for the selected locations
			// ACF only uses the "hide_on_screen" setting from the group with the lowest "menu_order" value.
			acf_add_local_field_group(
				[
					'key'                   => 'group__flexible_content_box__hos',
					'title'                 => '',
					'fields'                => [],
					'location'              => (array) $flexibleContentBoxLocations,
					'menu_order'            => - 990000000,
					'position'              => 'normal',
					'style'                 => 'seamless',
					'label_placement'       => 'hidden',
					'instruction_placement' => '',
					'hide_on_screen'        => $this->baseTheme->applyFilters( 'flexible_content_box/hide_on_screen',
						[ 'the_content' ] ),
					'active'                => true,
					'description'           => '',
				]
			);

			acf_add_local_field_group(
				[
					'key'                   => 'group__flexible_content_box',
					'title'                 => baseTheme()->__( 'Flexible content box' ),
					'fields'                => [
						[
							'key'               => 'field__flexible_content_box__wrapper',
							'label'             => baseTheme()->__( 'Page Content' ),
							'name'              => 'field__flexible_content_box__wrapper',
							'type'              => 'flexible_content',
							'instructions'      => '',
							'required'          => 0,
							'conditional_logic' => 0,
							'wrapper'           => [
								'width' => '',
								'class' => '',
								'id'    => '',
							],
							'layouts'           => (array) $flexibleContentBoxLayouts
						]
					],
					'location'              => (array) $flexibleContentBoxLocations,
					'menu_order'            => 0,
					'position'              => 'normal',
					'style'                 => 'default',
					'label_placement'       => 'top',
					'instruction_placement' => 'label',
					'hide_on_screen'        => [ 'the_content' ],
					'active'                => true,
					'description'           => '',
				]
			);
		}

		/**
		 * This function makes it possible to hook into "flexible_content_box/layouts_template".
		 * The content of this filter can be extended by adding something like the following:
		 *
		 * baseTheme()->addFilter( 'flexible_content_box/layouts_template', function( $templates ) {
		 *      $templates['layout__woocommerce_product_carousel__flexible_content'] = function() {
		 *            $this->themeModule->loadTemplateFile( 'woocommerce-product-carousel' );
		 *        };
		 *
		 *      return $templates;
		 * }, 10, 1 );
		 *
		 * Tip: For an example you could check the existing module "woocommerce-product-carousel".
		 *
		 * @return callable[]|string[]
		 */
		private function getTemplateByLayout(): array {
			return baseTheme()->applyFilters( 'flexible_content_box/layouts_template', [] );
		}

		/**
		 * Adding layouts to the flexible content element.
		 * When adding a layout it makes it possible for admin users to select
		 * a certain group within the flexible content element.
		 *
		 * It is important that the desired layout is appended to the array
		 * within the filter "flexible_content_box/layouts" (don't replace the whole array).
		 *
		 * The format of how to add a layout is documented by ACF itself:
		 *
		 * @link https://www.advancedcustomfields.com/resources/flexible-content/
		 *
		 * Tip: When its not really clear how what fields to include when adding a layout
		 *      add the layout first with the GUI editor(without using the final field names since this will cause conflict).
		 *      Next, export the fields to PHP.
		 * Tip: look at an example within the existing module woocommerce-product-carousel.
		 *
		 * @return array[]
		 */
		private function registerLayouts(): array {
			return baseTheme()->applyFilters( 'flexible_content_box/layouts', [] );
		}

		/**
		 * Registering locations, by default I've added the post & page locations.
		 *
		 * You can change or extend this by hooking into the filters "flexible_content_box/post_types" or "flexible_content_box/locations".
		 *
		 * @return array[]
		 */
		private function registerLocations(): array {
			$postTypes = baseTheme()->applyFilters( 'flexible_content_box/post_types', [ 'post', 'page' ] );
			$locations = [];

			foreach ( $postTypes as $postType ) {
				$locations[] = [
					[
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => $postType,
					]
				];
			}

			return baseTheme()->applyFilters( 'flexible_content_box/locations', $locations );
		}
	}