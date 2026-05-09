<?php

namespace Theme\Modules\WoocommerceProductCarousel\General;

use Theme\BaseTheme\ThemeModuleAbstractClass;
use WP_Post;
use WP_Query;

/**
 * Class TemplateHelpers
 *
 * @package Theme\Modules\WoocommerceProductCarousel\General
 */
class TemplateHelpers extends ThemeModuleAbstractClass {
	public function init() {
	}

	/**
	 * @param $categories
	 *
	 * @return array
	 */
	public function retrieveProductByCategories( array $categories ) : array {
		if ( empty ( $categories ) ) {
			return [];
		}

		$productArgs = [
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'tax_query'      => [
				[
					'taxonomy' => 'product_cat',
					'field'    => 'term_id',
					'terms'    => (array) $categories,
					'operator' => 'IN'
				]
			]
		];

		$productObjects = new WP_Query( $productArgs );

		if ( empty ( $productObjects->posts ) ) {
			return [];
		}

		$products = [];

		foreach ( $productObjects->posts as $object ) {
			/**
			 * @var WP_Post $object
			 */
			$products[] = $object->ID;
		}

		return $products;
	}
}