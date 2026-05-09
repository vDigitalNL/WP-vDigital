<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General\GutenbergBlocks\Column;
use ChildTheme\ChildTheme\General\GutenbergBlocks\Image;
use Theme\BaseTheme\ThemeFlexClassTrait;

/**
 * Class GutenbergBlocks
 *
 * @package ChildTheme\ChildTheme\General
 * @property-read Image $Image
 * @property-read Column $Column
 */
class GutenbergBlocks extends AbstractClass {

	use ThemeFlexClassTrait;

	private string $blocksPath;
	public array $blocks;

	/**
	 * Init new Gutenberg blocks with classes within a folder "GutenbergBlocks"
	 */
	public function init(): void {
		$this->setBlocks();
		$this->loadFields();
		$this->addFilters();
		$this->addActions();

		$this->Image->init();
		$this->Column->init();
	}

	private function loadFields(): void {
		foreach ( $this->blocks as $block ) {
            if(file_exists(get_stylesheet_directory() . '/blocks/' . $block['folderName'] . '/fields.php')) {
                require_once get_stylesheet_directory() . '/blocks/' . $block['folderName'] . '/fields.php';
            }
		}
	}

	private function setBlocks(): void {
		$this->blocksPath = get_stylesheet_directory() . '/blocks/';
		$this->blocks     = array_values( array_map( function ( $folderName ) {
			$blockJsonFile = file_get_contents( $this->blocksPath . $folderName . '/block.json' );
			$blockJsonData = json_decode( $blockJsonFile, true );

			return [
				'folderName' => $folderName,
				'blockName'  => $blockJsonData['name'] ?? 'acf/' . $folderName,
			];
		}, array_filter( scandir( $this->blocksPath ) ?: [], function ( $folderName ) {
			return is_dir( $this->blocksPath . $folderName ) && $folderName !== '.' && $folderName !== '..' && file_exists( $this->blocksPath . $folderName . '/block.json' );
		} ) ) );
	}

	private function addActions(): void {
		add_action( 'init', [ $this, 'registerBlocks' ] );
		add_action( 'wp', [ $this, 'loadScriptsAndStyles' ] );

		/*
		 * Load admin scripts and styles
		 * */
		add_action( 'admin_init', [ $this, 'loadScriptsAndStyles' ] );
		add_action( 'acf/validate_save_post', [ $this, 'doValidationWorkAround' ], 5 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueueScripts' ] );
	}

	public function loadScriptsAndStyles(): void {
		foreach ( $this->blocks as $block ) {
			if ( ! has_block( $block['blockName'], get_post() ?: get_post( $_GET['post'] ?? null ) ) && ! is_admin() ) {
				continue;
			}
			// Script & style handle should be prefixed with 'vd_' to avoid conflicts with other scripts
			wp_register_script(
				'vd_' . $block['folderName'],
				get_stylesheet_directory_uri() . '/blocks/' . $block['folderName'] . '/dist/main.js',
				[],
				false,
				true,
			);

			wp_register_style(
				'vd_' . $block['folderName'],
				get_stylesheet_directory_uri() . '/blocks/' . $block['folderName'] . '/dist/main.css',
			);
		}
	}

	// (on save) validation does not work by default for ACF gutenberg blocks, so we need to validate the fields manually
	// this is a workaround suggested by ACF contributors https://support.advancedcustomfields.com/forums/topic/required-fields-in-gutenberg-editor/
	public function doValidationWorkAround(): void {
		if ( empty( $_POST ) ) {
			return;
		}

		foreach ( $_POST as $key => $value ) {
			if ( ! str_starts_with( $key, 'acf' ) || empty( $value ) ) {
				continue;
			}

			acf_validate_values( $value, $key );
		}
	}

	public function registerBlocks(): void {
		foreach ( $this->blocks as $block ) {
			register_block_type( $this->blocksPath . $block['folderName'], [
				'post_types' => [],
			] );

			if ( ! has_block( $block['blockName'], get_post() ?: get_post( $_GET['post'] ?? null ) ) && ! is_admin() ) {
				continue;
			}

			if ( ! file_exists( $this->blocksPath . $block['folderName'] . '/index.php' ) ) {
				continue;
			}

			require_once get_stylesheet_directory() . '/blocks/' . $block['folderName'] . '/index.php';
		}
	}

	private function addFilters(): void {
//		add_filter( 'allowed_block_types_all', [ $this, 'disableDefaultBlocks' ] );
		add_filter( 'wp_theme_json_get_style_nodes', [ $this, 'disableThemeJsonStyle' ] );
		add_filter( 'tiny_mce_before_init', [ $this, 'loadAcfWysiwygStyle' ] );
		add_filter( 'register_block_type_args', [ $this, 'modifyCoreColumnsCategory' ], 10, 2 );
	}

	public function modifyCoreColumnsCategory( array $args, string $name ): array {
		if ( $name !== 'core/columns' ) {
			return $args;
		}

		$args['category'] = 'ww-layout';
		return $args;
	}

	public function loadAcfWysiwygStyle( $data ): array {
		$data['content_css'] = get_stylesheet_directory_uri() . '/assets/css/admin/acf-fields/wysiwyg.css';
		return $data;
	}

	public function disableThemeJsonStyle( $nodes ): array {
		return array_filter( $nodes, function ( $node ) {
			return isset($node['name']) && in_array( $node['name'], [ 'core/image' ]);
		} );
	}

	public function disableDefaultBlocks(): array {
		return [...array_map( function ( $block ) {
			return $block['blockName'];
		}, $this->blocks ), 'core/image', 'core/paragraph', 'core/columns', 'core/html'];
	}

	public function enqueueScripts(): void {
		wp_enqueue_script(
			'gutenberg-custom-html',
			get_stylesheet_directory_uri() . '/resources/js/admin/gutenberg/custom-html.js',
			[
				'wp-blocks',
				'wp-dom-ready',
			],
			false,
			true
		);

		wp_register_script(
			'gutenberg-columns',
			get_stylesheet_directory_uri() . '/resources/js/admin/gutenberg/columns.js',
			[
				'wp-blocks',
				'wp-dom-ready',
			],
			filemtime(get_stylesheet_directory() . '/resources/js/admin/gutenberg/columns.js'),
			true
		);

		$iconsPath = get_stylesheet_directory() . '/assets/images/columns/';
		wp_localize_script( 'gutenberg-columns', 'columnIcons', [
			'twoColumns'                 => file_get_contents( $iconsPath . '50-50.svg' ),
			'threeColumns'               => file_get_contents( $iconsPath . '33-33-33.svg' ),
			'fourColumns'                => file_get_contents( $iconsPath . '25-25-25-25.svg' ),
			'sixColumns'                 => file_get_contents( $iconsPath . '17-17-17-17-17-17.svg' ),
			'asymmetricSpaceLeftRight'   => file_get_contents( $iconsPath . 'space-41-50.svg' ),
			'asymmetricLeftRight'        => file_get_contents( $iconsPath . '41-space-50.svg' ),
			'asymmetricRightLeft'        => file_get_contents( $iconsPath . '50-space-41.svg' ),
			'asymmetricSpacedColumns'    => file_get_contents( $iconsPath . 'space-33-space-50.svg' ),
			'asymmetricLeftSpacedColumns'=> file_get_contents( $iconsPath . '50-space-33-space.svg' ),
		] );

		wp_enqueue_script( 'gutenberg-columns' );

		add_filter( 'script_loader_tag', function( $tag, $handle ) {
			if ( $handle === 'gutenberg-columns' ) {
				return str_replace( '<script', '<script type="module"', $tag );
			}
			return $tag;
		}, 10, 2 );
	}


	/**
	 * do_blocks does not register the scripts and styles of the blocks that are being rendered.
	 * This function parses the blocks from the content and registers their scripts and styles before rendering the blocks.
	 */
	public static function render_blocks($content): string{
		$rendered = do_blocks($content);
		$blocks = self::get_blocks_from_content_recursively(parse_blocks($content));

		foreach ($blocks as $block) {
			$folderName  = explode('/', $block['blockName'])[1] ?? null;
			wp_register_script(
				'vd_' . $folderName ,
				get_stylesheet_directory_uri() . '/blocks/' . $folderName . '/dist/main.js',
				[],
				false,
				true,
			);

			wp_register_style(
				'vd_' . $folderName,
				get_stylesheet_directory_uri() . '/blocks/' . $folderName . '/dist/main.css',
			);
		}

		return $rendered;
	}

	private static function get_blocks_from_content_recursively($blocks, &$result = []): array {
		foreach ($blocks as $block) {
			if (isset($block['blockName'])) {
				$result[] = $block;
			}
			if (isset($block['innerBlocks']) && is_array($block['innerBlocks'])) {
				self::get_blocks_from_content_recursively($block['innerBlocks'], $result);
			}
		}
		return $result;
	}
}
