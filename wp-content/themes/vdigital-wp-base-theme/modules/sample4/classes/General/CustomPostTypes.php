<?php

	namespace Theme\Modules\Sample4\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class CustomPostTypes
	 *
	 * @package Theme\Modules\Sample4\General
	 */
	class CustomPostTypes extends ThemeModuleAbstractClass {
		// @ToDo: When you're not adding post types this class can be removed(also unlink within General.php).

		public function init() {
			//$this->registerLogoCarousel();
		}

		private function registerLogoCarousel() {
			/*$labels = [
				'name'               => baseTheme()->__( 'Logo Carousels' ),
				'singular_name'      => baseTheme()->__( 'Logo Carousel' ),
				'menu_name'          => baseTheme()->__( 'Logo Carousels' ),
				'name_admin_bar'     => baseTheme()->__( 'Logo carousel' ),
				'add_new'            => baseTheme()->__( 'Add New' ),
				'add_new_item'       => baseTheme()->__( 'Add New Logo Carousel' ),
				'new_item'           => baseTheme()->__( 'New Logo Carousel' ),
				'edit_item'          => baseTheme()->__( 'Edit Logo Carousel' ),
				'view_item'          => baseTheme()->__( 'View Logo Carousel' ),
				'all_items'          => baseTheme()->__( 'All Logo Carousels' ),
				'search_items'       => baseTheme()->__( 'Search Logo Carousels' ),
				'parent_item_colon'  => baseTheme()->__( 'Parent Logo Carousels:' ),
				'not_found'          => baseTheme()->__( 'No Logo Carousels found.' ),
				'not_found_in_trash' => baseTheme()->__( 'No Logo Carousels found in Trash.' ),
			];

			$arguments = [
				'labels'              => $labels,
				'public'              => true,
				'publicly_queryable'  => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'query_var'           => true,
				'exclude_from_search' => true,
				'rewrite'             => array( 'slug' => 'logo-carousel' ),
				'capability_type'     => 'post',
				'has_archive'         => true,
				'hierarchical'        => false,
				'menu_position'       => null,
				'supports'            => array( 'title' ),
			];

			$this->themeModule->registerPostType( 'logo_carousel', $arguments );
			*/
		}
	}