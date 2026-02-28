<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

class Padding
{
    public static function getClassName(string $desktopField, bool $hideOnMobile = false): string
    {
        $direction = explode('_', $desktopField);
        $direction = end($direction);

	    $mobileValue = self::getPaddingValueByText(get_field($desktopField . '_mobile') ?? '');
	    $tabletValue = self::getPaddingValueByText(get_field($desktopField . '_tablet') ?? '');
        $desktopValue = self::getPaddingValueByText(get_field($desktopField) ?? '');

        if($hideOnMobile) {
            return implode( ' ', [
                'tw-p' . substr( $direction, 0, 1 ) . '-0',
                'sm:tw-p' . substr( $direction, 0, 1 ) . '-' . $mobileValue,
                'md:tw-p' . substr( $direction, 0, 1 ) . '-' . $tabletValue,
                'lg:tw-p' . substr( $direction, 0, 1 ) . '-' . $desktopValue
            ] );
        }

	    return implode( ' ', [
		    'tw-p' . substr( $direction, 0, 1 ) . '-' . $mobileValue,
		    'sm:tw-p' . substr( $direction, 0, 1 ) . '-' . $tabletValue,
		    'lg:tw-p' . substr( $direction, 0, 1 ) . '-' . $desktopValue
	    ] );
    }

	private static function getPaddingValueByText( string $text = 'small' ): int {
		return match ($text) {
			'small' => 2,
			'medium' => 4,
			'large' => 8,
			'extra-large' => 11,
			'xl-48' => 12,
			'xl-70' => 17,
			'xl-80' => 20,
			'xl' => 24,
			'xl-115' => 29,
			'xl-128' => 32,
			'xl-144' => 36,
			'xl-165' => 41,
			'xl-200' => 50,
			'xl-285' => 71,
			'xl-304' => 75,
			default => 0
		};
	}

	public static function tdFields(
		string $baseKey,
		string $defaultDesktop = 'none',
		string $defaultTablet = 'none',
		string $defaultMobile = 'none',
	): array
    {
        $self = new self();

        return [
            ...$self->field(
				$baseKey,
				'top',
				'Top padding',
                $defaultDesktop,
                $defaultTablet,
                $defaultMobile
            ),
            ...$self->field(
				$baseKey,
				'bottom',
				'Bottom padding',
				$defaultDesktop,
				$defaultTablet,
				$defaultMobile
            ),
        ];
    }

    public static function xFields(string $baseKey): array
    {
        $self = new self();

        return [
            ...$self->field($baseKey, 'x', 'Padding left & right'),
        ];
    }

    private function field(string $baseKey, string $direction = 'top', string $label = 'Top padding', string $defaultDesktop = 'none', string $defaultTablet = 'none', string $defaultMobile = 'none'): array
    {
	    $choices = [
		    'none'        => baseTheme()->__( 'None' ),
		    'small'       => baseTheme()->__( '8px' ),
		    'medium'      => baseTheme()->__( '16px' ),
		    'large'       => baseTheme()->__( '32px' ),
		    'extra-large' => baseTheme()->__( '44px' ),
		    'xl-48'       => baseTheme()->__( '48px' ),
		    'xl-70'       => baseTheme()->__( '70px' ),
		    'xl-80'       => baseTheme()->__( '80px' ),
		    'xl'          => baseTheme()->__( '96px' ),
		    'xl-115'      => baseTheme()->__( '115px' ),
		    'xl-128'      => baseTheme()->__( '128px' ),
		    'xl-144'      => baseTheme()->__( '144px' ),
		    'xl-165'      => baseTheme()->__( '165px' ),
		    'xl-200'      => baseTheme()->__( '200px' ),
		    'xl-285'      => baseTheme()->__( '285px' ),
		    'xl-304'      => baseTheme()->__( '304px' ),
	    ];
		$keyPrefix = str_starts_with( $baseKey, 'field_' ) ? '' : 'field_';

	    return [
		    [
			    'key'           => $keyPrefix . $baseKey . 'padding_' . $direction,
			    'label'         => baseTheme()->__( $label . ' (desktop)' ),
			    'name'          => $baseKey . 'padding_' . $direction,
			    'type'          => 'select',
			    'default_value' => $defaultDesktop,
			    'choices'       => $choices,
			    'wrapper'       => [
				    'width' => '33%',
			    ],
		    ],
		    [
			    'key'           => $keyPrefix . $baseKey . 'padding_' . $direction . '_tablet',
			    'label'         => baseTheme()->__( $label . ' (tablet)' ),
			    'name'          => $baseKey . 'padding_' . $direction . '_tablet',
			    'type'          => 'select',
			    'default_value' => $defaultTablet,
			    'choices'       => $choices,
			    'wrapper'       => [
				    'width' => '33%',
			    ],
		    ],
		    [
			    'key'           => $keyPrefix . $baseKey . 'padding_' . $direction . '_mobile',
			    'label'         => baseTheme()->__( $label . ' (mobile)' ),
			    'name'          => $baseKey . 'padding_' . $direction . '_mobile',
			    'type'          => 'select',
			    'default_value' => $defaultMobile,
			    'choices'       => $choices,
			    'wrapper'       => [
				    'width' => '33%',
			    ],
		    ],
	    ];
    }
}