<?php

namespace ChildTheme\ChildTheme\Helpers\Acf;

class Heading
{
	/**
	 * Get heading type field definition
	 *
	 * @param string $baseKey The base key for the field (e.g., 'text_', 'solution_showcase_')
	 * @param string $defaultValue The default heading type (default: 'h2')
	 * @return array The ACF field definition
	 */
	public static function getField( string $baseKey, string $defaultValue = 'h2' ): array {
		$keyPrefix = str_starts_with( $baseKey, 'field_' ) ? '' : 'field_';

		return [
			'key'           => $keyPrefix . $baseKey . 'heading_type',
			'label'         => baseTheme()->__( 'Title heading' ),
			'name'          => $baseKey . 'heading_type',
			'type'          => 'select',
			'choices'       => [
				'h1-default'         => baseTheme()->__( 'H1 - Default' ),
				'h1-small'           => baseTheme()->__( 'H1 - Small' ),
				'h2'                 => baseTheme()->__( 'H2' ),
				'h3-default'         => baseTheme()->__( 'H3 - Default' ),
				'h3-small'           => baseTheme()->__( 'H3 - Small' ),
				'h3-small-with-icon' => baseTheme()->__( 'H3 - Small with icon' ),
				'h4-default'         => baseTheme()->__( 'H4 - Default' ),
			],
			'default_value' => $defaultValue,
		];
	}

	/**
	 * Get HTML tag from heading type
	 *
	 * @param string $headingType The heading type (e.g., 'h1-default', 'h2', 'h3-small')
	 * @return string The HTML tag (e.g., 'h1', 'h2', 'h3', 'h4')
	 */
	public static function getTag( string $headingType ): string {
		return match ( $headingType ) {
			'h1-default', 'h1-small' => 'h1',
			'h3-default', 'h3-small', 'h3-small-with-icon' => 'h3',
			'h4-default' => 'h4',
			default => 'h2',
		};
	}

	/**
	 * Get CSS class from heading type
	 *
	 * @param string $headingType The heading type (e.g., 'h1-default', 'h2', 'h3-small')
	 * @return string The CSS class (e.g., 'title--h1', 'small')
	 */
	public static function getClass( string $headingType ): string {
		return match ( $headingType ) {
			'h1-default' => 'title--h1',
			'h1-small' => 'title--h1-small',
			'h2' => 'title--h2',
			'h3-default' => 'title--h3',
			'h3-small' => 'title--h3-small',
			'h3-small-with-icon' => 'title--h3-small-with-icon',
			'h4-default' => 'title--h4',
			default => 'title--h2',
		};
	}

	/**
	 * Get heading data (tag and class) from heading type
	 * This is useful for the text block which uses an array structure
	 *
	 * @param string $headingType The heading type (e.g., 'h1-default', 'h2', 'h3-small')
	 * @return array Array with 'tag' and 'class' keys
	 */
	public static function getData( string $headingType ): array {
		return match ( $headingType ) {
			'h1-default'         => [ 'tag' => 'h1', 'class' => '' ],
			'h1-small'           => [ 'tag' => 'h1', 'class' => 'small' ],
			'h2'                 => [ 'tag' => 'h2', 'class' => '' ],
			'h3-default'         => [ 'tag' => 'h3', 'class' => '' ],
			'h3-small'           => [ 'tag' => 'h3', 'class' => 'small' ],
			'h3-small-with-icon' => [ 'tag' => 'h3', 'class' => 'small tw-flex tw-items-center tw-gap-3' ],
			'h4-default'         => [ 'tag' => 'h4', 'class' => '' ],
			default              => [ 'tag' => 'h2', 'class' => '' ],
		};
	}
}

