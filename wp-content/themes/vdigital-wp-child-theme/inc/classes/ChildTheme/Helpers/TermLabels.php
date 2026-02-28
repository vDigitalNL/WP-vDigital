<?php

namespace ChildTheme\ChildTheme\Helpers;

class TermLabels
{
	public static function getLabels(int $postId, string $taxonomy = 'category', array $additionalLabels = []): array
    {
        $term = self::getPrimaryCategory($postId, $taxonomy);
        $labels = self::getTermLabelTexts($term);

        $result = [];
        foreach ($labels as $text) {
            $result[] = ['text' => $text];
        }

        foreach ($additionalLabels as $additionalLabel) {
            $result[] = $additionalLabel;
        }
		
        $isVideo = SingleCPT::hasVideoBlock($postId);
        if ($isVideo) {
            $result[] = [
                'text' => baseTheme()->__('Video'),
                'isVideoLabel' => true,
            ];
        }

		$result = self::filterUnique($result);
		$result = self::filterUnwantedLabels($result);
        return $result;
    }

	public static function getUnwantedLabelTexts(): array
	{
		return [
			baseTheme()->__('Uncategorized'),
			'Uncategorized',
		];
	}

	public static function filterUnique($labels): array
	{
		$uniqueLabels = [];
		$seenTexts = [];

		foreach ($labels as $label) {
			if (!in_array($label['text'], $seenTexts, true)) {
				$uniqueLabels[] = $label;
				$seenTexts[] = $label['text'];
			}
		}

		return $uniqueLabels;
	}

	public static function filterUnwantedLabels($labels, $unwantedTexts = []): array
	{
		$defaultUnwantedTexts = self::getUnwantedLabelTexts();

		$unwantedTexts = array_merge($defaultUnwantedTexts, $unwantedTexts);

		return array_filter($labels, function ($label) use ($unwantedTexts) {
			return !in_array($label['text'], $unwantedTexts, true);
		});
	}

	public static function getTermLabelTexts($term): array
	{
		if (!$term || is_wp_error($term)) {
			return [];
		}

		$label = get_field('category_label_fields_label', "term_{$term->term_id}");
		if (empty($label)) {
			return [];
		}


		return [$label];
	}

	public static function getPrimaryCategory(int $postId, string $taxonomy = 'category')
	{
		if (function_exists('yoast_get_primary_term_id')) {
			$primaryTermId = yoast_get_primary_term_id($taxonomy, $postId);
			if ($primaryTermId) {
				$term = get_term($primaryTermId);

				if(!empty(self::filterUnwantedLabels([['text' => $term->name]])) 
				&& $term && !is_wp_error($term)) {
					return $term;
				}
			}
		}
		$terms = get_the_terms($postId, $taxonomy);
		$firstTerm = !empty($terms) && !is_wp_error($terms) ? $terms[0] : null;
		return $firstTerm;
	}
}