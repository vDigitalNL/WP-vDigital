<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

class Color
{
    public static function getCssClass(string $color): string
    {
        return match($color) {
            'white' => 'tw-bg-white tw-text-black-01',
            'transparent' => 'tw-text-black-01',
            'gray' => 'tw-bg-gray-02 tw-text-white',
            'green' => 'tw-bg-green-01 tw-text-white',
            'blue' => 'tw-bg-blue-01 tw-text-white',
            default => ''
        };
    }

    public static function getCssTextClass(string $color): string
    {
		$color = self::convertColorName($color);
        return match($color) {
            'cobalt' => 'tw-text-cobalt',
            'core' => 'tw-text-core',
            'edge' => 'tw-text-edge',
            'forest' => 'tw-text-forest',
            'growth' => 'tw-text-growth',
            'horizon' => 'tw-text-horizon',
            'mist' => 'tw-text-mist',
            'shade' => 'tw-text-shade',
            'sky' => 'tw-text-sky',
            'teal' => 'tw-text-teal',
            'white' => 'tw-text-focus',
            default => $color
        };
    }

    public static function getChoices(): array
    {
	    return [
		    'white'       => baseTheme()->__( 'White' ),
		    'transparent' => baseTheme()->__( 'Transparent' ),
		    'gray'        => baseTheme()->__( 'Gray' ),
		    'green'       => baseTheme()->__( 'Green' ),
		    'blue'        => baseTheme()->__( 'Blue' ),
	    ];
    }

	public static function convertColorName($btnColor): string
	{
		return match ( $btnColor ) {
            'green' => 'growth', 
            'growth' => 'growth', 
            'dark_green' => 'forest',
            'forest' => 'forest',
            'teal' => 'teal',
            'cobalt' => 'cobalt',
			'blue' => 'cobalt',
			default => $btnColor,
		};
	}

}