<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceMyAccount
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceMyAccount extends ThemeModuleAbstractClass {

		public function addMainContent() {
			// get orders template from WC
			wc_get_template( 'myaccount/orders.php' );

			$html = '<h3>' . $this->baseTheme->__( 'Factuuradressen' ) . '</h3>';
			$html .= '<hr>';
			echo $html;

			// get addresses template from WC
			wc_get_template( 'myaccount/my-address.php' );
		}

		public function addSidebarContent() {
			$user     = wp_get_current_user();
			$avatar   = get_avatar_url( $user->ID ) ? get_avatar_url( $user->ID ) : get_stylesheet_directory_uri() . '/assets/img/blank-profile.png';
			$name     = get_user_meta( $user->ID, 'billing_first_name', true ) ? get_user_meta( $user->ID, 'billing_first_name', true ) : $user->user_nicename;
			$userData = [];
			if ( get_user_meta( $user->ID, 'billing_first_name', true ) && get_user_meta( $user->ID, 'billing_last_name', true ) ) {
				$userData[] = [
					'label' => $this->baseTheme->__( 'Full name' ),
					'value' => get_user_meta( $user->ID, 'billing_first_name', true ) . ' ' . get_user_meta( $user->ID, 'billing_last_name', true )
				];
			}
			if ( get_user_meta( $user->ID, 'billing_email', true ) ) {
				$userData[] = [ 'label' => $this->baseTheme->__( 'E-mail' ), 'value' => get_user_meta( $user->ID, 'billing_email', true ) ];
			} elseif ( isset( $user->user_email ) ) {
				$userData[] = [ 'label' => $this->baseTheme->__( 'E-mail' ), 'value' => $user->user_email ];
			}
			if ( get_user_meta( $user->ID, 'billing_phone', true ) ) {
				$userData[] = [ 'label' => $this->baseTheme->__( 'Phone number' ), 'value' => get_user_meta( $user->ID, 'billing_phone', true ) ];
			}
			if ( get_user_meta( $user->ID, 'billing_country', true ) ) {
				$userData[] = [ 'label' => $this->baseTheme->__( 'Country' ), 'value' => WC()->countries->countries[ get_user_meta( $user->ID, 'billing_country', true ) ] ];
			}
			if ( get_user_meta( $user->ID, 'billing_postcode', true ) ) {
				$userData[] = [ 'label' => $this->baseTheme->__( 'Postcode' ), 'value' => get_user_meta( $user->ID, 'billing_postcode', true ) ];
			}
			$html = '<img class="woocommerce-MyAccount-sidebar__avatar" src="' . $avatar . '" alt="">';
			$html .= '<h3 class="text-center">' . $this->baseTheme->__( 'Hallo!' ) . ' ' . $name . '</h3>';
			$html .= '<hr>';
			foreach ( $userData as $data ) {
				$html .= '<div class="mb-2">';
				$html .= '<p class="text-muted">' . $data['label'] . '</p>';
				$html .= '<p>' . $data['value'] . '</p>';
				$html .= '</div>';
			}
			$html .= '<div class="woocommerce-MyAccount-sidebar__edit-profile"><a href=' . wc_customer_edit_account_url() . '">' . $this->baseTheme->__( 'Edit profile' ) . '</a></div>';

			echo $html;
		}

		public function init() {
			$this->addActions();
			$this->addFilters();
		}

		private function addFilters() {
			add_filter( 'woocommerce_my_account_my_orders_query', [ $this, 'changeMyAccountOrdersPerPage' ] );
		}

		public function renderNavbarLogin() {
			?>
			<div class="navbar-login">
				<a href="<?php echo wc_get_page_permalink( 'myaccount' ) ?>" class="navbar-login__icon" title="<?php echo $this->baseTheme->__( 'View your account' ); ?>">
					<?php echo $this->baseTheme->applyFilters( 'woocommerce_navbar_login_icon', '<svg xmlns="http://www.w3.org/2000/svg" class="navbar-login__icon__icon" width="18" height="18" viewBox="0 0 18 18"><path d="M8.7 0C11.6 0 13.9 2.4 13.9 5.2 13.9 7 13 8.6 11.7 9.5 15 10.8 17.4 14 17.3 17.7L15.5 17.7C15.5 13.9 12.5 10.8 8.7 10.8 4.9 10.8 1.8 13.9 1.8 17.7L0 17.7C0 13.9 2.4 10.7 5.7 9.5 4.3 8.6 3.5 7 3.5 5.2 3.5 2.4 5.8 0 8.7 0ZM8.7 1.8C6.8 1.8 5.3 3.3 5.3 5.2 5.3 7.1 6.8 8.6 8.7 8.6 10.6 8.6 12.1 7.1 12.1 5.2 12.1 3.3 10.6 1.8 8.7 1.8Z" fill="#192043"/></svg>' ) ?>
					<span><?php echo is_user_logged_in() ? $this->baseTheme->__( 'Account' ) : $this->baseTheme->__( 'Login' ) ?></span>
				</a>
			</div>
			<!-- /.navbar-login -->
			<?php
		}

		public function changeMyAccountOrdersPerPage( $args ) {
			$args['posts_per_page'] = 10;

			return $args;
		}

		private function addActions() {
			add_action( 'woocommerce_account_dashboard_sidebar', [ $this, 'addSidebarContent' ] );
			add_action( 'woocommerce_account_dashboard', [ $this, 'addMainContent' ] );
			$this->baseTheme->addAction( 'childtheme_navbar_right', [ $this, 'renderNavbarLogin' ], 1, 5 );
		}
	}