<?php

namespace classes;

class Glow {
	public static function getGradient(string $type) {
		return match ( $type ) {
			'corner' => get_stylesheet_directory_uri() . '/assets/images/gradients/gradient_01.svg',
			'middle-blue-green' => get_stylesheet_directory_uri() . '/assets/images/gradients/gradient_02.svg',
			'middle-blue-black' => get_stylesheet_directory_uri() . '/assets/images/gradients/gradient_03.svg',
			'middle-green-blue' => get_stylesheet_directory_uri() . '/assets/images/gradients/gradient_04.svg',
			default => '',
		};
	}

	public static function getCssClasses(string $type, string $side) {
		$isRight = $side === 'right';

		$defaultClasses = match ( $type ) {
			'corner' => 'tw-top-[100%]',
			'middle-blue-green' => 'glow--middle-blue-green tw-top-[50%] tw-translate-y-[-50%] tw-min-w-[975px] md:tw-min-w-0 tw-max-w-none md:tw-max-w-[100%]',
			'middle-blue-black' => 'tw-top-[50%] tw-translate-y-[-50%]',
			'middle-green-blue' => 'tw-top-[50%] tw-translate-y-[-50%]',
			default => ''
		};

		$isRightClasses = $isRight ? 'tw-scale-x-[-1]' : '';
		$leftRightClasses = match ( $type ) {
			'corner' => $isRight ? 'tw-translate-x-[25%] tw-translate-y-[-53%]' : 'tw-translate-x-[-25%] tw-translate-y-[-53%]',
			'middle-blue-green' => $isRight ? 'tw-translate-x-[-51%] md:tw-translate-x-[12%]' : 'tw-translate-x-[-27%] md:tw-translate-x-[-10%]',
			'middle-blue-black' => $isRight ? 'tw-translate-x-[-64%] sm:tw-translate-x-[-44%] md:tw-translate-x-[-28%] lg:tw-translate-x-[3%] 3xl:tw-translate-x-[-6%]' : 'tw-translate-x-[-30%] 3xl:tw-translate-x-[-22%]',
			'middle-green-blue' => $isRight ? 'tw-translate-x-[-60%] sm:tw-translate-x-[-44%] md:tw-translate-x-[-28%] lg:tw-translate-x-[-3%]' : 'tw-translate-x-[-21%]',
			default => '',
		};

		return implode(' ', [
			'glow__block tw-pointer-events-none',
			$defaultClasses,
			$isRightClasses,
			$leftRightClasses,
		]);
	}
}