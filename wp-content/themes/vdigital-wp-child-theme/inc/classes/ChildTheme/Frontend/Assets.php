<?php

namespace ChildTheme\ChildTheme\Frontend;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General;

/**
 * Class Assets
 *
 * @package Theme\ChildTheme\ChildTheme\Frontend
 */
final class Assets extends AbstractClass {
	public function init(): void {
		$this->addActions();
	}

	private function addActions(): void {
		add_action( 'init', [ $this, 'sendDataToScript' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'removeJQuery' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueueVimeoPlayerApi' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueueTrustpilot' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueueIntlTelInput' ] );
	}

	function removeJQuery(): void {
		wp_deregister_script('jquery');
		wp_deregister_script('jquery-core');
		wp_deregister_script('jquery-migrate');
	}

	public function enqueueIntlTelInput(): void {
		wp_enqueue_script(
			'int-tel-input',
			get_stylesheet_directory_uri() . '/resources/js/intlTelInput.min.js',
			[],
			null,
			! empty($_GET['dyflexis_popup']) ? [] : [
				'in_footer' => true,
				'strategy'  => 'defer',
			]
		);
	}

	public function enqueueVimeoPlayerApi(): void {
        if (has_block('acf/video-banner')) {
            wp_enqueue_script(
                'vimeo-player-api',
                'https://player.vimeo.com/api/player.js',
                [],
                null,
                [
                    'in_footer' => true,
                    'strategy'  => 'defer',
                ]
            );
        }
	}

	public function enqueueTrustpilot(): void {
		wp_enqueue_script(
			'trustpilot-widget',
			'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
			[],
			null,
			[
				'in_footer' => true,
				'strategy'  => 'defer',
			]
		);
	}

	public function sendDataToScript(): void {
		// Re-enqueue the footer script so that we can use the localize_script function
		wp_dequeue_script( 'theme-footer' );
		wp_enqueue_script( 'theme-footer', get_stylesheet_directory_uri() . '/assets/js/footer.js', [], filemtime( get_stylesheet_directory() . '/assets/js/footer.js' ), true );
		$this->addExtensionBlackListToScript();
		$this->addTextsToScript();
	}

	public function addExtensionBlackListToScript(): void {
		if ( empty( $emailExtensionBlacklist = General::$emailExtensionBlacklist ) ) {
			return;
		}

		wp_localize_script( 'theme-footer', 'emailExtensionBlacklist', array_map( function ( $extensionField ) {
			return $extensionField;
		}, $emailExtensionBlacklist ) );
	}

	public function addTextsToScript(): void {
		wp_localize_script( 'theme-footer', 'texts', [
			'validation' => [
				'required' => $this->baseTheme->__('This field is required'),
				'companyTooShort' => $this->baseTheme->__('Company name is too short'),
				'firstNameTooShort' => $this->baseTheme->__('Firstname is too short'),
				'lastNameTooShort' => $this->baseTheme->__('Lastname is too short'),
				'phoneNumberTooShort' => $this->baseTheme->__('Phone number is too short'),
				'invalidEmail' => $this->baseTheme->__('E-mail address is not valid'),
				'invalidBusinessEmail' => $this->baseTheme->__('Please enter your business email address'),
			],
		] );

		wp_localize_script( 'theme-footer', 'nonces', [
			'ajax' => wp_create_nonce( 'ajax_nonce' ),
		] );
	}
}
