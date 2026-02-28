<?php
namespace ChildTheme\ChildTheme\Helpers;

class SingleCPT {
	public static function hasVideoBlock( int $postId ): bool {
		$blocks = parse_blocks( get_post_field( 'post_content', $postId ) );
		return self::hasBlockRecursive( $blocks, 'acf/video' );
	}

	private static function hasBlockRecursive( array $blocks, string $blockName ): bool {
		foreach ( $blocks as $block ) {
			if ( $block['blockName'] === $blockName ) {
				return true;
			}
			
			if ( ! empty( $block['innerBlocks'] ) && self::hasBlockRecursive( $block['innerBlocks'], $blockName ) ) {
				return true;
			}
		}
		
		return false;
	}
}

