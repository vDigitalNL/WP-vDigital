<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

class Gradient
{
    public static function getCssClass(string $gradient): string
    {
        return match($gradient) {
            'blue-green-gradient' => 'gradient--blue-green-triangles',
            'blue-gray-gradient' => 'gradient--blue',
            'green-gray-gradient' => 'gradient--green',
            'green-gray-no-white-gradient' => 'gradient--green-no-white',
            'dark-to-blue-green' => 'tw-bg-blue-03',
            default => ''
        };
    }

    public static function getChoices(): array
    {
        return [
            'blue-green-gradient' => baseTheme()->__('Blue/Green'),
            'blue-gray-gradient' => baseTheme()->__('Blue/Gray'),
            'green-gray-gradient' => baseTheme()->__('Green/Gray'),
            'green-gray-no-white-gradient' => baseTheme()->__('Dark green/Green'),
            'dark-to-blue-green' => baseTheme()->__('Dark blue with Blue/Green bottom'),
        ];
    }
}