<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

use ChildTheme\ChildTheme\General\FormTemplates;
use ChildTheme\ChildTheme\General\ThemeOptions\Salesforce;

class Buttons {
    const DEFAULT_WRAPPER_CLASSES = 'tw-flex tw-flex-col md:tw-flex-row tw-flex-wrap tw-gap-5';

	private static function getButtonTypes(): array {
		return [
			''              => baseTheme()->__( 'White button with dark text' ),
			'outline'       => baseTheme()->__( 'Transparent button with blue outline and white text' ),
		];
	}

	public static function getFields( string $baseKey, bool $allowFormButton = true, array $excludedButtonTypes = [], $includeDownload = true ): array {
		$formTypes = [];
		$keyPrefix = str_starts_with( $baseKey, 'field_' ) ? '' : 'field_';

		$buttonTypes = array_diff_key( self::getButtonTypes(), array_flip( $excludedButtonTypes ) );

		foreach ( Salesforce::$formTypes as $formType ) {
			$formTypes[ $formType['key'] ] = $formType['label'];
		}

		$notAlwaysAllowedFields = [];
		if ( $allowFormButton ) {
			$notAlwaysAllowedFields = [
				[
					'key'   => $keyPrefix . $baseKey . 'demo',
					'label' => baseTheme()->__( 'Form button' ),
					'name'  => $baseKey . 'demo',
					'type'  => 'true_false',
					'ui'    => 1,
				],
				[
					'key'               => $keyPrefix . $baseKey . 'template',
					'label'             => baseTheme()->__( 'Form template' ),
					'name'              => $baseKey . 'template',
					'type'              => 'select',
					'choices'           => [],
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'demo',
								'operator' => '==',
								'value'    => '1',
							],
						],
					],
				],
				[
					'key'               => $keyPrefix . $baseKey . 'form_button_title',
					'label'             => baseTheme()->__( 'Button text' ),
					'name'              => $baseKey . 'form_button_title',
					'type'              => 'text',
					'required'          => 1,
					'conditional_logic' => [
						[
							[
								'field'    => $keyPrefix . $baseKey . 'demo',
								'operator' => '==',
								'value'    => '1',
							],
						],
					],
				],
			];
		}
		$downloadBtns = $includeDownload ? self::downloadButtonOptions( $baseKey, $keyPrefix ) : [];
		return [
			[
				'key'     => $keyPrefix . $baseKey . 'button_type',
				'label'   => baseTheme()->__( 'Button style' ),
				'name'    => $baseKey . 'button_type',
				'type'    => 'select',
				'choices' => $buttonTypes,
			],
			...$notAlwaysAllowedFields,
			[
				'key'               => $keyPrefix . $baseKey . 'button_link',
				'label'             => baseTheme()->__( 'Button text & link' ),
				'name'              => $baseKey . 'button_link',
				'type'              => 'link',
				'required'          => 1,
				'conditional_logic' => [
					[
						[
							'field'    => $keyPrefix . $baseKey . 'demo',
							'operator' => '==',
							'value'    => '0',
						],
					],
				],
			],
			 ...$downloadBtns,
		];
	}

	/**
	 * Get only the button style field without URL or form options
	 * Useful for buttons that trigger JavaScript actions instead of navigation
	 *
	 * @param string $baseKey The field key prefix
	 * @param array $excludedButtonTypes Array of button type keys to exclude
	 * @return array ACF field configuration for button style only
	 */
	public static function getStyleOnlyField( string $baseKey, array $excludedButtonTypes = [] ): array {
		$keyPrefix = str_starts_with( $baseKey, 'field_' ) ? '' : 'field_';
		$buttonTypes = array_diff_key( self::getButtonTypes(), array_flip( $excludedButtonTypes ) );

		return [
			[
				'key'     => $keyPrefix . $baseKey . 'button_type',
				'label'   => baseTheme()->__( 'Button style' ),
				'name'    => $baseKey . 'button_type',
				'type'    => 'select',
				'choices' => $buttonTypes,
			],
		];
	}

	public static function downloadButtonOptions( string $baseKey, string $keyPrefix = '' ): array {
		$conditionalLogic = [
			[
				'field'    => $keyPrefix . $baseKey . 'button_type',
				'operator' => '==',
				'value'    => 'download-button',
			]
		];

		return [
			[
				'key'               => $keyPrefix . $baseKey . 'button_subtitle',
				'label'             => baseTheme()->__( 'Subtitle' ),
				'name'              => $baseKey . 'button_subtitle',
				'type'              => 'text',
				'conditional_logic' => [ $conditionalLogic ]
			],
			[
				'key'               => $keyPrefix . $baseKey . 'button_icon',
				'label'             => baseTheme()->__( 'Icon' ),
				'name'              => $baseKey . 'button_icon',
				'type'              => 'select',
				'choices'           => [
					''         => baseTheme()->__( 'Make a choice' ),
					'download' => baseTheme()->__( 'Download' ),
				],
				'conditional_logic' => [ $conditionalLogic ]
			],
			[
				'key'               => $keyPrefix . $baseKey . 'button_full_width',
				'label'             => baseTheme()->__( 'Full width' ),
				'name'              => $baseKey . 'button_full_width',
				'instructions'      => baseTheme()->__( 'The full width size is based on the container the button is placed in.' ),
				'type'              => 'true_false',
				'ui'                => 1,
				'conditional_logic' => [ $conditionalLogic ]
			],
		];
	}

	public static function getButtonClass( $buttonType ): string {
		return match ( $buttonType ) {
			'outline' => 'button--outline',
			'blue' => 'button--blue',
			'dark_outline' => 'button--dark_outline',
			'white_outline' => 'button--white_outline',
			'green' => 'button--green',
			'dark_green' => 'button--dark_green',
			'teal' => 'button--teal',
			'cobalt' => 'button--cobalt',
			default => '',
		};
	}

	public static function render( array $data, string $baseKey ) {
		$buttonLink = $data[ $baseKey . 'button_link' ] ?: [];
		$formButtonTitle = $data[ $baseKey . 'form_button_title' ] ?? '';

		// If demo button is checked, but no template or form is selected, don't render the button
		if ( empty( $buttonLink ) ) {
			return false;
		}

		$arguments = [
			...$buttonLink,
			'formButtonTitle' => $formButtonTitle,
			'classes'         => [self::getButtonClass( $data[ $baseKey . 'button_type' ] )],
			'subtitle'        => $data[ $baseKey . 'button_subtitle' ] ?? '',
			'icon'            => $data[ $baseKey . 'button_icon' ] ?? '',
			'fullWidth'       => $data[ $baseKey . 'button_full_width' ] ?? false,
		];

		return get_template_part( 'template-parts/buttons/button-default', null, $arguments );
	}

	public static function renderLink( array $data, string $baseKey ) {
		$buttonLink = $data[ $baseKey . 'button_link' ] ?? [];

		if ( empty( $buttonLink ) ) {
			return false;
		}

		$arguments = [
			...$buttonLink,
			'demoButton'      => false,
			'formTemplate'    => null,
			'formTemplateTab' => "",
			'classes'         => [self::getButtonClass( $data[ $baseKey . 'button_type' ] )],
			'subtitle'        => $data[ $baseKey . 'button_subtitle' ] ?? '',
			'icon'            => $data[ $baseKey . 'button_icon' ] ?? '',
			'fullWidth'       => $data[ $baseKey . 'button_full_width' ] ?? false,
			'settings'        => [
				'forms' => [],
			]
		];

		get_template_part( 'template-parts/buttons/button-default', null, $arguments );
	}
}
