<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

class Margin
{
    public static function getClassName(string $desktopField): string
    {
        $direction = explode('_', $desktopField);
        $direction = end($direction);

	    $mobileValue = self::getMarginValueByText(get_field($desktopField . '_mobile'));
	    $tabletValue = self::getMarginValueByText(get_field($desktopField . '_tablet'));
        $desktopValue = self::getMarginValueByText(get_field($desktopField));

	    return implode( ' ', [
		    'tw-m' . substr( $direction, 0, 1 ) . '-' . $mobileValue,
		    'md:tw-m' . substr( $direction, 0, 1 ) . '-' . $tabletValue,
		    'lg:tw-m' . substr( $direction, 0, 1 ) . '-' . $desktopValue
	    ] );
    }

	private static function getMarginValueByText( string $text = 'small' ): int {
		return match ($text) {
			'small' => 3,
			'medium' => 6,
			'large' => 12,
			'extra-large' => 24,
			default => 0
		};
	}

    public static function tdFields(string $baseKey): array
    {
        $self = new self();

        return [
            ...$self->field($baseKey),
            ...$self->field($baseKey, 'bottom', 'Margin bottom'),
        ];
    }

    private function field(string $baseKey, string $direction = 'top', string $label = 'Margin top'): array
    {
		$choices = [
			'none'        => baseTheme()->__( 'None' ),
			'small'       => baseTheme()->__( '12px' ),
			'medium'      => baseTheme()->__( '24px' ),
			'large'       => baseTheme()->__( '48px' ),
			'extra-large' => baseTheme()->__( '96px' ),
		];
	    $keyPrefix = str_starts_with( $baseKey, 'field_' ) ? '' : 'field_';

	    return [
		    [
			    'key'     => $keyPrefix . $baseKey . 'margin_' . $direction,
			    'label'   => baseTheme()->__( $label ),
			    'name'    => $baseKey . 'margin_' . $direction,
			    'type'    => 'select',
			    'choices' => $choices,
			    'wrapper' => [
				    'width' => '33%',
			    ],
		    ],
		    [
			    'key'     => $keyPrefix . $baseKey . 'margin_' . $direction . '_tablet',
			    'label'   => baseTheme()->__( $label . ' tablet' ),
			    'name'    => $baseKey . 'margin_' . $direction . '_tablet',
			    'type'    => 'select',
			    'choices' => $choices,
			    'wrapper' => [
				    'width' => '33%',
			    ],
		    ],
		    [
			    'key'     => $keyPrefix . $baseKey . 'margin_' . $direction . '_mobile',
			    'label'   => baseTheme()->__( $label . ' mobile' ),
			    'name'    => $baseKey . 'margin_' . $direction . '_mobile',
			    'type'    => 'select',
			    'choices' => $choices,
			    'wrapper' => [
				    'width' => '33%',
			    ],
		    ],
	    ];
    }
}