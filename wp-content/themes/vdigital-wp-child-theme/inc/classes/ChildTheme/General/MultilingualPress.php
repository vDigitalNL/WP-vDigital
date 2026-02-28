<?php

namespace ChildTheme\ChildTheme\General;

use Inpsyde\MultilingualPress\Core\Admin\SiteSettingsRepository;
use function Inpsyde\MultilingualPress\resolve;

use ChildTheme\ChildTheme\AbstractClass;

class MultilingualPress extends AbstractClass
{

	public static function getTranslatedUrlsForPost(int $sourcePostId, ?int $sourceSiteId = null): array
	{
		if (!function_exists('\Inpsyde\MultilingualPress\translationIds')) {
			return [];
		}

		$sourceSiteId = $sourceSiteId ?: get_current_blog_id();

		$idsBySite = \Inpsyde\MultilingualPress\translationIds($sourcePostId, 'post', $sourceSiteId);
		if (!$idsBySite) {
			return [];
		}

		$siteSettings = resolve(SiteSettingsRepository::class);

		$urls = [];
		foreach ($idsBySite as $siteId => $postId) {
			switch_to_blog((int) $siteId);

			try {
				$langTag = (string) $siteSettings->siteLanguageTag((int) $siteId); // bv. en_US, de_DE, nl_NL
				if (!$langTag) {
					$langTag = 'en_US';
				}

				$url = get_permalink((int) $postId);
				if ($url) {
					$urls[$langTag] = $url;
				}
			} finally {
				restore_current_blog();
			}
		}

		return $urls;
	}
}
