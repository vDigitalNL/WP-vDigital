<?php

namespace ChildTheme\ChildTheme\Helpers;

class News
{
	public static function getLabels(int $postId): array
    {
        return TermLabels::getLabels($postId, 'category');
    }
}
