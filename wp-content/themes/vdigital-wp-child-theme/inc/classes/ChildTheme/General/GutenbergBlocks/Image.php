<?php

namespace ChildTheme\ChildTheme\General\GutenbergBlocks;

use ChildTheme\ChildTheme\AbstractClass;

final class Image extends AbstractClass {

	public function init(): void {
		add_action( 'init', [ $this, 'addRoundedCornersStyle' ] );
	}

	public function addRoundedCornersStyle(): void {
		register_block_style(
			'core/image',
			[
				'name'  => 'rounded-corners',
				'label' => baseTheme()->__( 'Rounded corners' ),
			]
		);
	}
}