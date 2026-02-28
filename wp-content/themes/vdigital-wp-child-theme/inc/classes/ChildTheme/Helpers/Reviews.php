<?php

namespace ChildTheme\ChildTheme\Helpers;

class Reviews
{
	public static function getLabels(int $postId): array
    {
        return TermLabels::getLabels($postId, 'ww_customer_reviews_categories', []);
    }

    public static function hasVideo(int $postId): bool
	{
		$reviewSettings = get_field('ww_customer_review', $postId);
		$reviewType = $reviewSettings['type'] ?? null;

		return $reviewType === 'video' || SingleCPT::hasVideoBlock($postId);
	}
}
