<?php

namespace ChildTheme\ChildTheme\Helpers;

class Page404
{
    public static function getBtnMarkup(array $links): string
    {
        if (empty($links)) {
            return '';
        }

        $blockBtns = [];
        foreach ($links as $index => $link) {
            $blockBtns[chr(97 + $index)] = [
                "field_text_buttons_button_type" => $index === 0 ? "outline" : "",
                "field_text_buttons_demo" => "0",
                "field_text_buttons_button_link" => [
                    "title" => $link['title'] ?? '',
                    "url" => $link['url'] ?? '',
                    "target" => $link['target'] ?? '',
                ],
            ];
        }

        $block_data = [
            "field_text_buttons" => [
                ...$blockBtns
            ],
        ];
        $json = json_encode($block_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (str_starts_with($json, '{') && str_ends_with($json, '}')) {
            $json = substr($json, 1, -1);
        }

        return $json;
    }

    public static function cleanHtml(string $html): string
    {
        // remove unwanted html tags, they break gutenberg block rendering, but allow basic formatting tags like <br>, <b>, <i>, <em>, <strong>
        $html = wp_kses($html, [
            'br' => [],
            'b' => [],
            'i' => [],
            'em' => [],
            'strong' => [],
        ]);

	    $html = nl2br($html, false);
	    $html = preg_replace('/[ \t]+/', ' ', $html);
        
        // remove excess whitespace and newlines, they break gutenberg block rendering
        $html = trim(preg_replace('/\s+/', ' ', $html));

        return trim($html);
    }
}
