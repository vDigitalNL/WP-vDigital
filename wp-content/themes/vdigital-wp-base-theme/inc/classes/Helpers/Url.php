<?php

	namespace Theme\Helpers;

	/**
	 * URL constants as defined in the PHP Manual under "Constants usable with
	 * http_build_url()".
	 *
	 * @see http://us2.php.net/manual/en/http.constants.php#http.constants.url
	 */
	if (! defined('HTTP_URL_REPLACE')) {
		define('HTTP_URL_REPLACE', 1);
	}

	if (! defined('HTTP_URL_JOIN_PATH')) {
		define('HTTP_URL_JOIN_PATH', 2);
	}

	if (! defined('HTTP_URL_JOIN_QUERY')) {
		define('HTTP_URL_JOIN_QUERY', 4);
	}

	if (! defined('HTTP_URL_STRIP_USER')) {
		define('HTTP_URL_STRIP_USER', 8);
	}

	if (! defined('HTTP_URL_STRIP_PASS')) {
		define('HTTP_URL_STRIP_PASS', 16);
	}

	if (! defined('HTTP_URL_STRIP_AUTH')) {
		define('HTTP_URL_STRIP_AUTH', 32);
	}

	if (! defined('HTTP_URL_STRIP_PORT')) {
		define('HTTP_URL_STRIP_PORT', 64);
	}

	if (! defined('HTTP_URL_STRIP_PATH')) {
		define('HTTP_URL_STRIP_PATH', 128);
	}

	if (! defined('HTTP_URL_STRIP_QUERY')) {
		define('HTTP_URL_STRIP_QUERY', 256);
	}

	if (! defined('HTTP_URL_STRIP_FRAGMENT')) {
		define('HTTP_URL_STRIP_FRAGMENT', 512);
	}

	if (! defined('HTTP_URL_STRIP_ALL')) {
		define('HTTP_URL_STRIP_ALL', 1024);
	}

	/**
	 * Class Url
	 *
	 * @package Theme\Helpers
	 */
	class Url {

		/**
		 * Add a query part to a URL
		 *
		 * @param mixed        $url   (Part(s) of) an URL in form of a string or associative array like parse_url() returns
		 * @param array|string $query The query as an array or as a string
		 *
		 * @return string Returns the URL with the query added to it. When a query parameter already exists in URL, it wil be overwritten
		 */
		public static function addQuery($url, $query)
		{
			if (! is_array($url)) {
				$url = parse_url($url);
			}

			if (! is_array($query)) {
				$query = Str::parse($query);
			}

			$url['query'] =
				http_build_query(array_key_exists('query', $url) ? array_merge(Str::parse($url['query']), $query) :
					$query);

			if ($url['query'] == '') {
				unset($url['query']);
			}

			return rtrim(http_build_url($url), ' =+');
		}

		/**
		 * Build a URL.
		 *
		 * The parts of the second URL will be merged into the first according to
		 * the flags argument.
		 *
		 * @param mixed $url     (part(s) of) an URL in form of a string or
		 *                       associative array like parse_url() returns
		 * @param mixed $parts   same as the first argument
		 * @param int   $flags   a bitmask of binary or'ed HTTP_URL constants;
		 *                       HTTP_URL_REPLACE is the default
		 * @param array $new_url if set, it will be filled with the parts of the
		 *                       composed url like parse_url() would return
		 *
		 * @return string
		 */
		public static function build($url, $parts = [], $flags = HTTP_URL_REPLACE, &$new_url = [])
		{
			if (function_exists('http_build_url')) {
				return http_build_url($url, $parts, $flags, $new_url);
			}

			is_array($url) || $url = parse_url($url);
			is_array($parts) || $parts = parse_url($parts);

			isset($url['query']) && is_string($url['query']) || $url['query'] = null;
			isset($parts['query']) && is_string($parts['query']) || $parts['query'] = null;

			$keys = ['user', 'pass', 'port', 'path', 'query', 'fragment'];

			// HTTP_URL_STRIP_ALL and HTTP_URL_STRIP_AUTH cover several other flags.
			if ($flags & HTTP_URL_STRIP_ALL) {
				$flags |= HTTP_URL_STRIP_USER | HTTP_URL_STRIP_PASS | HTTP_URL_STRIP_PORT | HTTP_URL_STRIP_PATH | HTTP_URL_STRIP_QUERY | HTTP_URL_STRIP_FRAGMENT;
			} elseif ($flags & HTTP_URL_STRIP_AUTH) {
				$flags |= HTTP_URL_STRIP_USER | HTTP_URL_STRIP_PASS;
			}

			// Schema and host are always replaced
			foreach (['scheme', 'host'] as $part) {
				if (isset($parts[$part])) {
					$url[$part] = $parts[$part];
				}
			}

			if ($flags & HTTP_URL_REPLACE) {
				foreach ($keys as $key) {
					if (isset($parts[$key])) {
						$url[$key] = $parts[$key];
					}
				}
			} else {
				if (isset($parts['path']) && ($flags & HTTP_URL_JOIN_PATH)) {
					if (isset($url['path']) && mb_substr($parts['path'], 0, 1) !== '/') {
						$url['path'] =
							rtrim(str_replace(basename($url['path']), '', $url['path']), '/').'/'.ltrim($parts['path'],
								'/');
					} else {
						$url['path'] = $parts['path'];
					}
				}

				if (isset($parts['query']) && ($flags & HTTP_URL_JOIN_QUERY)) {
					if (isset($url['query'])) {
						mb_parse_str($url['query'], $url_query);
						mb_parse_str($parts['query'], $parts_query);

						$url['query'] = http_build_query(array_replace_recursive($url_query, $parts_query));
					} else {
						$url['query'] = $parts['query'];
					}
				}
			}

			foreach ($keys as $key) {
				$strip = 'HTTP_URL_STRIP_'.mb_strtoupper($key);
				if ($flags & constant($strip)) {
					unset($url[$key]);
				}
			}

			$parsed_string = '';

			if (isset($url['scheme'])) {
				$parsed_string .= $url['scheme'].'://';
			}

			if (isset($url['user'])) {
				$parsed_string .= $url['user'];

				if (isset($url['pass'])) {
					$parsed_string .= ':'.$url['pass'];
				}

				$parsed_string .= '@';
			}

			if (isset($url['host'])) {
				$parsed_string .= $url['host'];
			}

			if (isset($url['port'])) {
				$parsed_string .= ':'.$url['port'];
			}

			if (isset($url['path'])) {
				$parsed_string .= $url['path'];
			} else {
				$parsed_string .= '/';
			}

			if (isset($url['query'])) {
				$parsed_string .= '?'.$url['query'];
			}

			if (isset($url['fragment'])) {
				$parsed_string .= '#'.$url['fragment'];
			}

			$new_url = $url;

			return $parsed_string;
		}

		/**
		 * Builds a tracking url using UTM parameters, so external websites can track visitors are coming from this website.
		 *
		 * @param string $url
		 * @param string $campaign
		 * @param string $source
		 * @param string $medium
		 * @param string $content
		 * @param string $term
		 *
		 * @return mixed|string
		 */
		public static function buildTrackingUrl(
			$url,
			$campaign,
			$source = '',
			$medium = 'referral',
			$content = '',
			$term = ''
		) {

			if (! filter_var($url, FILTER_VALIDATE_URL)) {
				return '';
			}

			if ($source == '') {
				$source = $_SERVER['SERVER_NAME'];
				mb_substr($source, 0, 2) == 'ww' && mb_substr($source, 3, 1) == '.' && $source = mb_substr($source, 4);
			}

			if ($medium == '') {
				$medium = 'referral';
			}

			$url = parse_url($url);

			if (isset($url['query']) && $url['query'] != '') {
				$url['query'] = Arr::multiExplode('&', '=', $url['query'], 1);
				unset($url['query']['utm_source'], $url['query']['utm_medium'], $url['query']['utm_term'], $url['query']['utm_content'], $url['query']['utm_campaign']);
			} else {
				$url['query'] = [];
			}

			$url['query']['utm_source']   = $source;
			$url['query']['utm_medium']   = $medium;
			$url['query']['utm_campaign'] = $campaign;

			if ($term != '') {
				$url['query']['utm_term'] = $term;
			}

			if ($content != '') {
				$url['query']['utm_content'] = $content;
			}

			$url['query'] = http_build_query($url['query']);

			$url = http_build_url($url);

			return $url;
		}

		/**
		 * @param string $url
		 *
		 * @return string|FALSE
		 */
		public static function getFinalRedirectUrl($url)
		{
			$ch = curl_init(static::build($url, ['scheme' => 'https']));

			curl_setopt_array($ch, [
				CURLOPT_RETURNTRANSFER => 1,
				CURLOPT_CUSTOMREQUEST  => 'HEAD',
				CURLOPT_NOBODY         => true,
				CURLOPT_FOLLOWLOCATION => true,
				CURLOPT_VERBOSE        => false,
				CURLOPT_HEADER         => true,
				CURLOPT_CONNECTTIMEOUT => 1,
			]);

			curl_exec($ch);

			$statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
			$finalUrl   = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL) ?: $url;

			return $statusCode !== 0 ? $finalUrl : false;
		}

		/**
		 * @param string $url
		 *
		 * @return bool
		 *
		 * @source https://stackoverflow.com/questions/39711014/check-if-a-website-is-http-or-https
		 */
		public function resolvesToHttps($url)
		{
			$url = static::getFinalRedirectUrl($url);

			return $url !== false && mb_stripos($url, 'https') === 0;
		}
	}