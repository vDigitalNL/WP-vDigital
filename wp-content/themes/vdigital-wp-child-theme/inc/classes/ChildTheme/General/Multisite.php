<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;

class Multisite extends AbstractClass {
	private array $languageSites = [
		1 => [ 'prefix' => 'en', 'label' => 'English', 'flag' => '🇬🇧' ],
		2 => [ 'prefix' => 'nl', 'label' => 'Dutch', 'flag' => '🇳🇱' ],
	];

	public function getPrefix( $blogId = null ): string {
		$blogId = $blogId ?? get_current_blog_id();

		return match ( $blogId ) {
			2 => 'nl',
			default => 'en',
		};
	}

	public function getLabel( $blogId = null ): string {
		$blogId = $blogId ?? get_current_blog_id();

		return match ( $blogId ) {
			2 => $this->baseTheme->__( 'Dutch' ),
			default => $this->baseTheme->__( 'English' ),
		};
	}

	public function getFlag( $blogId = null ): string {
		$blogId = $blogId ?? get_current_blog_id();

		return $this->languageSites[ $blogId ]['flag'] ?? $this->languageSites[1]['flag'];
	}

	public function getAllLanguages(): array {
		$languages = [];
		$currentBlogId = get_current_blog_id();

		$sites = get_sites( [ 'number' => 100 ] );

		foreach ( $sites as $site ) {
			$blogId = (int) $site->blog_id;
			$data = $this->languageSites[ $blogId ] ?? null;

			if ( ! $data ) {
				continue;
			}

			$languages[] = [
				'blog_id'    => $blogId,
				'prefix'     => $data['prefix'],
				'label'      => $this->baseTheme->__( $data['label'] ),
				'flag'       => $data['flag'],
				'url'        => get_home_url( $blogId ),
				'is_current' => $blogId === $currentBlogId,
			];
		}

		return $languages;
	}

	public function getCurrentLanguage(): array {
		$currentBlogId = get_current_blog_id();
		$data = $this->languageSites[ $currentBlogId ] ?? $this->languageSites[1];

		return [
			'blog_id' => $currentBlogId,
			'prefix'  => $data['prefix'],
			'label'   => $this->baseTheme->__( $data['label'] ),
			'flag'    => $data['flag'],
		];
	}
}