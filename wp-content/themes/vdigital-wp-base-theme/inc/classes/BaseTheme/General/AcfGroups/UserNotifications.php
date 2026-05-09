<?php

	namespace Theme\BaseTheme\General\AcfGroups;

	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class UserNotifications
	 *
	 * @package Theme\BaseTheme\General\AcfGroups
	 */
	final class UserNotifications extends AbstractClass {

		/**
		 * Init ACF admin fields for this module on post edit pages / option pages
		 */
		public function init() {
			if ( ! function_exists( 'acf_add_local_field_group' ) || ! baseTheme()->applyFilters( 'user_notifications/active', true ) ) {
				return;
			}

			$this->addActions();
		}

		private function addActions() {
			add_action( 'init', [ $this, 'registerGroup' ], 10 );
		}

		public function registerGroup() {
			$notificationsHeaderFooterLocations = baseTheme()->applyFilters( 'user_notifications/header_footer_locations', [
				// Group level => OR
				[
					// Rule level => AND
					[
						'param'    => 'post_type',
						'operator' => '=',
						'value'    => 'all',
					]
				]
			] );

			// Add a group for the header notification
			acf_add_local_field_group( [
				'key'                   => 'group_header_footer_notifications__header',
				'title'                 => $this->baseTheme->__( 'Adjust header' ),
				'fields'                => [
					[
						'key'       => 'field_header_footer_notifications__header',
						'label'     => $this->baseTheme->__(
							'Do you want to make changes in the top area of the page?'
						),
						'name'      => '',
						'type'      => 'message',
						'message'   => $this->baseTheme->__(
							'Click <a href="/wp-admin/admin.php?page=theme-options" target="_blank">here</a> to make changes to the header.'
						),
						'new_lines' => 'br',
						'esc_html'  => 0,
					],
				],
				'location'              => $notificationsHeaderFooterLocations,
				'menu_order'            => - 900000000,
				'position'              => 'acf_after_title',
				'style'                 => 'default',
				'label_placement'       => 'top',
				'instruction_placement' => 'label',
				'active'                => true,
				'description'           => '',
			] );

			// Add a group for the footer notification
			acf_add_local_field_group( [
				'key'                   => 'group_header_footer_notifications__footer',
				'title'                 => $this->baseTheme->__( 'Adjust footer' ),
				'fields'                => [
					[
						'key'       => 'field_header_footer_notifications__footer',
						'label'     => $this->baseTheme->__(
							'Do you want to make changes in the top area of the page?'
						),
						'name'      => '',
						'type'      => 'message',
						'message'   => $this->baseTheme->__(
							'Click <a href="/wp-admin/admin.php?page=theme-options" target="_blank">here</a> to make changes to the footer.'
						),
						'new_lines' => 'br',
						'esc_html'  => 0,
					],
				],
				'location'              => $notificationsHeaderFooterLocations,
				'menu_order'            => 9999999999,
				'position'              => 'normal',
				'style'                 => 'default',
				'label_placement'       => 'top',
				'instruction_placement' => 'label',
				'active'                => true,
			] );
		}
	}