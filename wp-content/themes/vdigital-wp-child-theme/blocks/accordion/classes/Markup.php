<?php

namespace classes;

use DOMDocument;

class Markup {

	public string $title;

	public string $html;

	public function __construct( string $title, string $html ) {
		$this->title = $title;
		$this->html  = $html;
	}

	public function getItemListSchemaMarkup(): array {
		$dom = new DOMDocument();
		libxml_use_internal_errors( true );
		@$dom->loadHTML( mb_convert_encoding( $this->html, 'HTML-ENTITIES', 'UTF-8' ) );
		libxml_clear_errors();

		$contentItems = $this->extractItems( $dom, 'ul' );
		$contentItems = array_merge( $contentItems, $this->extractItems( $dom, 'ol' ) );

		$itemListElements = array_map( function ( $index, $item ) {
			return [
				'@type'    => 'ListItem',
				'position' => $index + 1,
				'item'     => [
					'@type' => 'Thing',
					'name'  => $item,
				]
			];
		}, array_keys( $contentItems ), array_values( $contentItems ) );

		return [
			'@context'        => 'https://schema.org',
			'@type'           => 'ItemList',
			'itemListOrder'   => 'https://schema.org/ItemListOrderAscending',
			'name'            => $this->title,
			'numberOfItems'   => count( $itemListElements ),
			'itemListElement' => $itemListElements
		];
	}

	public function getFaqSchemaMarkup(): array {
		return [
			'@type' => 'Question',
			'name'  => $this->title,
			'acceptedAnswer' => [
				'@type' => 'Answer',
				'text'  => $this->cleanHtmlForFaqSchema( $this->html )
			]
		];
	}

	private function extractItems( DomDocument $dom, string $tag ): array {
		$items = [];

		foreach ( $dom->getElementsByTagName( $tag ) as $elements ) {
			foreach ( $elements->getElementsByTagName( 'li' ) as $li ) {
				$items[] = trim( $li->textContent );
			}
		}

		return $items;
	}

	private function cleanHtmlForFaqSchema( string $html ): string {
		$cleanText = strip_tags( $html );
		$cleanText = html_entity_decode( $cleanText, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$cleanText = preg_replace( '/\s+/', ' ', $cleanText );

		return trim( $cleanText );
	}
}