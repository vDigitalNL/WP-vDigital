<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

class Menu extends AbstractClass {

	use ThemeFlexClassTrait;

	public function init(): void {
		$this->addActions();
	}

	private function addActions(): void {
		add_action( 'init', [ $this, 'registerNavMenus' ], 1 );

		add_action( 'wp_ajax_load_mobile_submenus', [ $this, 'loadMobileSubmenus' ] );
		add_action( 'wp_ajax_nopriv_load_mobile_submenus', [ $this, 'loadMobileSubmenus' ] );

		add_action( 'wp_ajax_load_mobile_menu', [ $this, 'loadMobileMenu' ] );
		add_action( 'wp_ajax_nopriv_load_mobile_menu', [ $this, 'loadMobileMenu' ] );
	}

	public function registerNavMenus(): void {
		register_nav_menus( [
			'language_switch' => __( 'Language switch', \ChildTheme\ChildTheme::TEXT_DOMAIN ),
		] );
	}

	public function loadMobileSubmenus(): void {
		$navbarOptions = get_field( 'navbar', 'option' ) ?? [];
		$navbarItems   = $navbarOptions['navbar_items'] ?? [];

		ob_start();
		if ( ! empty( $navbarItems ) ) : ?>
			<?php foreach ( $navbarItems as $index => $navbarItem ) : ?>
				<?php if ( ! empty( $navbarItem['navbar_submenu_columns'] ) ) : ?>
					<?php get_template_part( 'template-parts/navbar/submenu-mobile', null, [
						'columns'      => $navbarItem['navbar_submenu_columns'],
						'index'        => $index,
						'submenuTitle' => $navbarItem['navbar_link']['title']
					] ); ?>
				<?php endif; ?>
			<?php endforeach; ?>
		<?php endif;

		$response['html'] = ob_get_contents();
		ob_end_clean();
		wp_send_json( $response );
	}

	public function loadMobileMenu(): void {
		$navbarOptions   = get_field( 'navbar', 'option' ) ?? [];
		$navbarItems     = $navbarOptions['navbar_items'] ?? [];
		$navbarLoginLink = $navbarOptions['navbar_login_link'] ?? null;

		ob_start();
		get_template_part( 'template-parts/navbar/menu-mobile', null, [
			'navbarItems' => $navbarItems,
			'loginLink'   => $navbarLoginLink,
		] );

		$response['html'] = ob_get_contents();
		ob_end_clean();
		wp_send_json( $response );
	}
}