<?php

	namespace Theme\Helpers;

	/**
	 * Class Number
	 *
	 * @package Theme\Helpers
	 */
	class Number {

		const ROUND_MODE_AUTO = 'auto';

		const ROUND_MODE_DOWN = 'down';

		const ROUND_MODE_UP = 'up';

		/**
		 * @var array
		 */
		private static $roundAdvancedTypeOptions = [
			'x.x5',
			'x.x9',
			'x.x0',
			'x.25',
			'x.45',
			'x.49',
			'x.50',
			'x.95',
			'x.99',
			'x.00',
			'4.95',
			'4.99',
			'9.95',
			'9.99',
		];

		/**
		 * @return array
		 */
		public static function getRoundAdvancedTypeOptions()
		{
			return self::$roundAdvancedTypeOptions;
		}

		/**
		 * Check if a numeric value is within a numeric range
		 *
		 * @param float|int $min
		 * @param float|int $max
		 * @param float|int $value
		 *
		 * @return bool
		 */
		public static function isWithinRange($value, $min = 0, $max = 0)
		{
			return (float) $value >= (float) $min && (float) $value <= (float) $max;
		}

		/**
		 * Round a number and make sure it's within a range
		 *
		 * @param float|int $number
		 * @param float|int $min
		 * @param float|int $max
		 * @param int       $precision
		 * @param int       $mode Optional. One of PHP_ROUND_HALF_UP, PHP_ROUND_HALF_DOWN, PHP_ROUND_HALF_EVEN or PHP_ROUND_HALF_ODD. Defaults to PHP_ROUND_HALF_UP
		 *
		 * @return float
		 */
		public static function minMax($number, $min, $max, $precision = 0, $mode = PHP_ROUND_HALF_UP)
		{
			$number = round((float) $number, $precision, $mode);

			return $number < $min ? $min : ($number > $max ? $max : $number);
		}

		/**
		 * @param float|int $number
		 * @param string    $type Can be one of "x.x5", "x.x9", "x.x0", "x.25", "x.45", "x.49", "x.50", "x.95", "x.99", "x.00", "4.95", "4.99", "9.95" or "9.99"
		 * @param string    $mode Optional. Can be one of "auto", "down" or "up". Defaults to "auto"
		 *
		 * @return float
		 */
		public static function roundAdvanced($number, $type, $mode = self::ROUND_MODE_AUTO)
		{
			if (in_array($type, static::getRoundAdvancedTypeOptions())) {
				switch ($type) {
					case 'x.x5':
						$number = static::roundUpDown($number * 20, $mode) / 20;
						break;

					case 'x.x9':
						$number = static::roundUpDown($number, $mode, 1) - .01;
						break;

					case 'x.x0':
						$number = static::roundUpDown($number, $mode, 1);
						break;

					case 'x.25':
						$number = (static::roundUpDown($number * 4, $mode) / 4);
						break;

					case 'x.45':
						$number = (static::roundUpDown($number * 2, $mode) / 2) - .05;
						break;

					case 'x.49':
						$number = (static::roundUpDown($number * 2, $mode) / 2) - .01;
						break;

					case 'x.50':
						$number = static::roundUpDown($number * 2, $mode) / 2;
						break;

					case 'x.95':
						$number = static::roundUpDown($number, $mode) - .05;
						break;

					case 'x.99':
						$number = static::roundUpDown($number, $mode) - .01;
						break;

					case 'x.00':
						$number = static::roundUpDown($number, $mode);
						break;

					case '4.95':
						$number = (static::roundUpDown($number / 5, $mode) * 5) - .05;
						break;

					case '4.99':
						$number = (static::roundUpDown($number / 5, $mode) * 5) - .01;
						break;

					case '9.95':
						$number = (static::roundUpDown($number / 10, $mode) * 10) - .05;
						break;

					case '9.99':
						$number = (static::roundUpDown($number / 10, $mode) * 10) - .01;
						break;
				}
			}

			return (float) $number;
		}

		/**
		 * @param float|int $number
		 * @param string    $mode      Optional. Can be one of "auto", "down" or "up". Defaults to "auto"
		 * @param int       $precision Optional. The number of decimal digits to round to. Defaults to 0
		 *
		 * @return float
		 */
		public static function roundUpDown($number, $mode = self::ROUND_MODE_AUTO, $precision = 0)
		{
			switch ($mode) {
				case static::ROUND_MODE_DOWN:
					$fig    = (int) str_pad('1', $precision + 1, '0');
					$number = floor($number * $fig) / $fig;
					break;
				case static::ROUND_MODE_UP:
					$fig    = (int) str_pad('1', $precision + 1, '0');
					$number = ceil($number * $fig) / $fig;
					break;
				default:
					$number = round($number, $precision);
			}

			return $number;
		}
	}