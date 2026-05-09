<?php
	namespace Theme\Modules\WoocommerceB2b;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;
	use Theme\Modules\WoocommerceB2b;

	/**
	 * Class General
	 *
	 * @package ChildTheme\Modules\WoocommerceB2b
	 *
	 * @property-read General\AcfGroups               $AcfGroups
	 * @property-read General\CustomUserRoles         $CustomUserRoles
	 * @property-read General\CustomUserRoleDiscounts $CustomUserRoleDiscounts
	 * @property-read General\PostTypes               $PostTypes
	 * @property-read General\WooCommerce             $WooCommerce
	 */
	class General extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		/**
		 * @return \WP_Post[]
		 */
		public function getRoles(): array {
			return get_posts( [ 'post_type' => WoocommerceB2b::B2B_ROLE_POST_TYPE, 'posts_per_page' => - 1 ] );
		}

		public function init() {
			$this->PostTypes->init();
			$this->AcfGroups->init();
			$this->CustomUserRoles->init();
			$this->CustomUserRoleDiscounts->init();
			$this->WooCommerce->init();
		}
	}