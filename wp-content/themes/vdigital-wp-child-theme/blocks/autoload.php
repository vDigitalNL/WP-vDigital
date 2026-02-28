<?php

$blocksPath = get_stylesheet_directory() . '/blocks/';
$blocks     = array_values( array_map( function ( $folderName ) use ( $blocksPath ) {
	$blockJsonFile = file_get_contents( $blocksPath . $folderName . '/block.json' );
	$blockJsonData = json_decode( $blockJsonFile, true );

	return [
		'folderName' => $folderName,
		'blockName'  => $blockJsonData['name'] ?? 'acf/' . $folderName,
	];
}, array_filter( scandir( $blocksPath ) ?: [], function ( $folderName ) use ( $blocksPath ) {
	return is_dir( $blocksPath . $folderName ) && $folderName !== '.' && $folderName !== '..' && file_exists( $blocksPath . $folderName . '/block.json' );
} ) ) );

foreach ( $blocks as $block ) {
	$directory = get_stylesheet_directory() . '/blocks/' . $block['folderName'] . '/classes';
	if(!is_dir($directory)) {
		continue;
	}

	$classes   = scandir( $directory );

	foreach ( $classes as $class ) {
		if ( pathinfo( $class, PATHINFO_EXTENSION ) !== 'php' ) {
			continue;
		}

		require_once $directory . '/' . $class;
	}
}