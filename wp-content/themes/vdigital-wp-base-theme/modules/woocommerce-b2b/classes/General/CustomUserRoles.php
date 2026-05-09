<?php

	namespace Theme\Modules\WoocommerceB2b\General;

	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Modules\WoocommerceB2b;

	/**
	 * Class CustomUserRoles
	 *
	 * @package Theme\Modules\WoocommerceB2b\General
	 *
	 * @property-read WoocommerceB2b $themeModule
	 */
	class CustomUserRoles extends ThemeModuleAbstractClass {

		public function init() {
			$this->AddUserRoles();
		}

		public function AddUserRoles() {
			global $wp_roles;

			foreach ( $this->themeModule->General->getRoles() as $role ) {
				$wp_roles->add_role(
					WoocommerceB2b::B2B_ROLE_PREFIX . $role->post_name,
					$role->post_title,
					[
						'read' => true,
					]
				);
			}
		}
	}