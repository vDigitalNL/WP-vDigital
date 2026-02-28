<?php

namespace ChildTheme\ChildTheme\Frontend;

use ChildTheme\ChildTheme\AbstractClass;

class Login extends AbstractClass {
	public function init(): void {
		$this->addActions();
	}

	public function addActions(): void {
		$this->handleLoginSubmit();
	}

	private function handleLoginSubmit(): void {
		add_action( 'init', function () {
			if ( empty($_POST['wwlogin']) || empty (($companyName = $_POST['wwlogin']))) {
				return;
			}

			$companyNameReplaced = str_replace(' ', '-', $companyName );
			$companyNameLowerCased = strtolower($companyNameReplaced );

			$urlRedirect = "https://app.planning.nu/{$companyNameLowerCased}";
			$response = wp_remote_retrieve_response_code(wp_remote_get($urlRedirect));

			if ( $response === 200 ) {
				wp_redirect( $urlRedirect );
				exit;
			}
		} );
	}
}