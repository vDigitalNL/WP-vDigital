<?php

namespace ChildTheme\ChildTheme\Helpers;

class Menu {
	public static function isCurrentPage( string $url ): bool {
		$requestPath      = parse_url( $_SERVER["REQUEST_URI"], PHP_URL_PATH );
		$parsedCompareUrl = parse_url( $url );
		$parsedCurrentUrl = parse_url( $_SERVER['REQUEST_SCHEME'] . '://' . "$_SERVER[HTTP_HOST]$requestPath" );
		$comparePath      = str_replace( '/', '', $parsedCompareUrl['path'] ?? '' );
		$currentPath      = str_replace( '/', '', $parsedCurrentUrl['path'] ?? '' );

		if ( str_contains( $url, '#' ) || ( ! empty( $parsedCompareUrl['host'] ?? '' ) && ($parsedCompareUrl['host'] ?? '') !== $_SERVER['SERVER_NAME'] ) ) {
			return false;
		}

		return $comparePath === $currentPath;
	}
}