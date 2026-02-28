<?php

	namespace ChildTheme\ChildTheme\General;

	use ChildTheme\ChildTheme\AbstractClass;
	use ChildTheme\ChildTheme\General\AcfFields\Slider;
	use ChildTheme\ChildTheme\General\AcfFields\Styling;
	use ChildTheme\ChildTheme\General\AcfFields\OptionPages;
	use ChildTheme\ChildTheme\General\AcfFields\Header;
	use ChildTheme\ChildTheme\General\AcfFields\Footer;
	use ChildTheme\ChildTheme\General\AcfFields\LoginPage;
	use ChildTheme\ChildTheme\General\AcfFields\MarketplaceCategoryFields;
	use ChildTheme\ChildTheme\General\AcfFields\MarketplaceOptions;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class AcfFields
	 *
	 * @package ChildTheme\ChildTheme\General
	 * @property-read Slider $Slider
	 * @property-read Styling $Styling
	 * @property-read Header $Header
	 * @property-read Footer $Footer
	 * @property-read MarketplaceCategoryFields $MarketplaceCategoryFields
	 * @property-read MarketplaceOptions $MarketplaceOptions
     */
	final class AcfFields extends AbstractClass {
		use ThemeFlexClassTrait;

		const HERO_OPTIONS_PAGE_LABEL = 'Home hero (desktop)';
		const HEADER_OPTIONS_PAGE_LABEL = 'Header';
		const HEADER_OPTIONS_PAGE_SLUG = 'header-options';

		const FOOTER_OPTIONS_PAGE_LABEL = 'Footer';
		const FOOTER_OPTIONS_PAGE_SLUG = 'footer-options';

		/**
		 * Init new ACF fields with classes within a folder "AcfFields".
		 * They should extend the class \Theme\BaseTheme\General\AcfFields\AbstractAcfField.
		 */
		public function init(): void {
			$this->registerOptionPages();
			$this->Header->init();
			$this->Footer->init();
			$this->MarketplaceCategoryFields->init();
			$this->MarketplaceOptions->init();

			$this->Slider->init();
			$this->Styling->init();

			add_filter('gettext', [ $this, 'changeSelectLinkText' ], 10, 3);
		}

		public function registerOptionPages(): void {
			if ( ! function_exists( 'acf_add_options_page' ) ) {
				return;
			}

			acf_add_options_page( [
				'page_title' => $this->baseTheme->__( 'Header'),
				'menu_title' => $this->baseTheme->__( 'Header'),
				'menu_slug'  => AcfFields::HEADER_OPTIONS_PAGE_SLUG,
				'position'   => 83,
			] );

			acf_add_options_page( [
				'page_title' => $this->baseTheme->__( 'Footer'),
				'menu_title' => $this->baseTheme->__( 'Footer'),
				'menu_slug'  => AcfFields::FOOTER_OPTIONS_PAGE_SLUG,
				'position'   => 83,
			] );

			acf_add_options_page( [
				'network'    => true,
				'post_id'    => 'acf_network_options',
				'page_title' => 'Review opties',
				'menu_title' => 'Review opties'
			] );

			acf_add_options_page( [
				'page_title'  => $this->baseTheme->__( 'Options'),
				'menu_title'  => $this->baseTheme->__( 'Options'),
				'menu_slug'   => 'api-connections-options',
				'parent_slug' => 'edit.php?post_type=ww_api_connections',
			] );

			acf_add_options_page( [
				'page_title'   => $this->baseTheme->__( 'Options' ),
				'menu_title'   => $this->baseTheme->__( 'Options' ),
				'menu_slug'    => 'partner-portal-options',
				'parent_slug'  => 'edit.php?post_type=partner_portal_posts',
			] );
		}

		public function changeSelectLinkText( $translation, $text, $domain ): string {
			if ( $text !== 'Select Link' || $domain !== 'acf' ) {
				return $translation;
			}

			return 'Configure';
		}
	}