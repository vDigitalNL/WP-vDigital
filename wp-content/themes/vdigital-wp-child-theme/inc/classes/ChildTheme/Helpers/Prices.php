<?php

namespace ChildTheme\ChildTheme\Helpers;

class Prices {
	public static function format(string $price): string {
		$price = number_format( $price, 2, ',', '.' );

		return preg_replace( '/(,[0-9]{2})/', ',-', $price );
	}
}