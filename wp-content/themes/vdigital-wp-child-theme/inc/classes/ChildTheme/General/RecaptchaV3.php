<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

final class RecaptchaV3 extends AbstractClass {
	public function init(): void {
		$this->addActions();
	}

	private function addActions(): void {
		add_action( 'salesforce_w2l_before_submit', [ $this, 'submitValidate' ] );
	}

	public function submitValidate(): void {
		$response = json_decode($this->validate());

		if ( $response->success && $response->score >= 0.7 ) {
			$GLOBALS['recaptcha_v3_passed'] = true;
			return;
		}

		$GLOBALS['recaptcha_v3_passed'] = false;
	}

	public function validate(): bool|string {
		$recaptchaApiUrl = 'https://www.google.com/recaptcha/api/siteverify';
		$requestData     = [
			'secret'   => RECAPTCHA_V3_SECRET_KEY,
			'response' => $_POST['g-recaptcha-response'],
		];

		$curlConfig = [
			CURLOPT_URL            => $recaptchaApiUrl,
			CURLOPT_POST           => true,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_POSTFIELDS     => $requestData
		];

		/*
		 * Send request to recaptcha v3 API URL in order to determine
		 * whether the user is a human or a bot
		 * */
		$curl = curl_init();
		curl_setopt_array( $curl, $curlConfig );
		$response = curl_exec( $curl );
		curl_close( $curl );

		return $response;
	}
}
