<?php

namespace ChildTheme\ChildTheme\Helpers;

class Youtube
{
    public static function processYouTubeUrl($url)
    {
        $url = preg_replace('/[?&]si=[^&]*/', '', $url);

        if (str_contains($url, 'youtube.com/embed/')) {
            return $url;
        }

        $videoId = null;

        if (preg_match('/youtube\.com\/watch\?v=([^&]+)/', $url, $matches)) {
            $videoId = $matches[1];
        } elseif (preg_match('/youtu\.be\/([^?]+)/', $url, $matches)) {
            $videoId = $matches[1];
        } elseif (preg_match('/[a-zA-Z0-9_-]{11}/', $url, $matches)) {
            // If it's just a video ID
            $videoId = $matches[0];
        }

        return $videoId ? "https://www.youtube.com/embed/{$videoId}" : $url;
    }
}
