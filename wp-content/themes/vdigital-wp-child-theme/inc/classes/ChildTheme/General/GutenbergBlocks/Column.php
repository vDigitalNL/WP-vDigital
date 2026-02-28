<?php

namespace ChildTheme\ChildTheme\General\GutenbergBlocks;

use ChildTheme\ChildTheme\AbstractClass;

final class Column extends AbstractClass {

	public function init(): void {
		add_filter( 'render_block', [ $this, 'addImageColumnClass' ], 10, 2 );
	}

	/**
	 * Add 'column--has-image' class to columns containing images for mobile reordering.
	 * This allows image columns to appear first on mobile via CSS order property.
	 */
	public function addImageColumnClass(string $blockContent, array $block ): string {
		if ( $block['blockName'] !== 'core/column' ) {
			return $blockContent;
		}

		$hasImage = false;

		if ( ! empty( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as $inner_block ) {
				if ( in_array( $inner_block['blockName'], [ 'core/image', 'acf/offset-image' ], true ) ) {
					$hasImage = true;
					break;
				}
			}
		}

		if ( $hasImage ) {
			$blockContent = preg_replace(
				'/class="([^"]*wp-block-column[^"]*)"/',
				'class="$1 column--has-image"',
				$blockContent,
				1
			);
		}

		return $blockContent;
	}
}
