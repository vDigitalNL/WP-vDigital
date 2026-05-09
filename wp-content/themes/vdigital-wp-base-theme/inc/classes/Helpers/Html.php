<?php

	namespace Theme\Helpers;

	/**
	 * Class Html
	 *
	 * @package Theme\Helpers
	 */
	class Html {

		/**
		 * Replaces all HTML line breaks in a string with newlines
		 *
		 * @param string $string  The input string
		 * @param string $newLine The newline character
		 *
		 * @return string Returns the altered string
		 */
		public static function br2nlReplace($string, $newLine = "\r\n")
		{
			while (mb_stripos($string, '<br>') !== false || mb_stripos($string, '<br/>') !== false || mb_stripos($string,
					'<br />') !== false) {
				$string = str_ireplace(['<br>', '<br/>', '<br />'], $newLine, $string);
			}

			return $string;
		}

		/**
		 * @param        $string
		 * @param bool   $normalizeAccents
		 * @param bool   $convertNormalChars
		 * @param string $replacement
		 *
		 * @return array|mixed|string
		 */
		public static function convertSpecialChars(
			$string,
			$normalizeAccents = false,
			$convertNormalChars = false,
			$replacement = ''
		) {
			$convertChars = ['–' => '-', '—' => '-'];
			$specialChars = [
				'&',
				'"',
				'\'',
				'‘',
				'’',
				'‚',
				'“',
				'”',
				'„',
				'†',
				'‡',
				'‰',
				'‹',
				'›',
				'♠',
				'♣',
				'♥',
				'♦',
				'‾',
				'←',
				'↑',
				'→',
				'↓',
				'™',
				'“',
				'%',
				'‘',
				'<',
				'>',
				'`',
				'~',
				'¢',
				'£',
				'€',
				'¤',
				'¥',
				'¦',
				'§',
				'¨',
				'©',
				'«',
				'¬',
				'®',
				'°',
				'±',
				'´',
				'¶',
				'·',
				'•',
				'¸',
				'º',
				'»',
				'¼',
				'½',
				'¾',
				'×',
				'Þ',
				'þ',
				'÷',
				'ð',
				'Ð',
			];
			$normal_chars = [
				'!',
				'¡',
				'@',
				'$',
				'#',
				'%',
				'^',
				'*',
				'(',
				')',
				'+',
				'=',
				'[',
				']',
				'{',
				'}',
				'/',
				'\\',
				'|',
				'?',
				'¿',
				'.',
				',',
			];

			$string = static::replaceHtmlSpecialChars($string, true);
			$string = strtr($string, $convertChars);

			if ($normalizeAccents) {
				$string = static::normalizeAccents($string);
			}

			$string = str_replace($specialChars, $replacement, $string);

			if ($convertNormalChars) {
				$string = str_replace($normal_chars, $replacement, $string);
			}

			return $string;
		}

		/**
		 * Return a part of a string, but keep whole words and html tags
		 *
		 * @param string $input        The text string
		 * @param int    $maxLength    The maximum length of the subtracted
		 * @param int    $lengthOffset The variation in how long the text can be. When using html_substr($input, $minimum_length = 200, $length_offset = 10) the text length will be between 200 and 200-10=190 characters
		 * @param bool   $cutWords     Whether to cut words or not
		 * @param bool   $dots         Whether to add three dots when a string was cut off
		 *
		 * @return string
		 */
		public static function html_substr($input, $maxLength, $lengthOffset = 10, $cutWords = false, $dots = true)
		{
			// Reset tag counter & quote checker
			$tagCounter = 0;
			$quotesOn   = true;

			// Check if the text is too long
			if (mb_strlen($input) > $maxLength) {
				// Reset the tag_counter and pass through (part of) the entire text
				$c = 0;

				for ($i = 0; $i < mb_strlen($input); $i++) {
					// Load the current character and the next one
					// if the string has not arrived at the last character
					$currentChar = mb_substr($input, $i, 1);

					if ($i < mb_strlen($input) - 1) {
						$nextChar = mb_substr($input, $i + 1, 1);
					} else {
						$nextChar = "";
					}

					// First check if quotes are on
					if (! $quotesOn) {
						// Check if it's a tag
						// On a "<" add 3 if it's an opening tag (like <a href...)
						// or add only 1 if it's an ending tag (like </a>)
						if ($currentChar == '<') {

							if ($nextChar == '/') {
								$tagCounter += 1;
							} else {
								$tagCounter += 3;
							}
						}

						// Slash signifies an ending (like </a> or ...>)
						// subtract 2
						if ($currentChar == '/' && $tagCounter <> 0) {
							$tagCounter -= 2;
						}

						// On a ">" subtract 1
						if ($currentChar == '>') {
							$tagCounter -= 1;
						}

						// If quotes are encountered, start ignoring the tags
						// (for directory slashes)
						if ($currentChar == '"') {
							$quotesOn = true;
						}
					} else {

						// If quotes are encountered again, turn it back off
						if ($currentChar == '"') {
							$quotesOn = true;
						}
					}

					// Count only the chars outside html tags
					if ($tagCounter == 2 || $tagCounter == 0) {
						$c++;
					}

					// Check if the counter has reached the minimum length yet,
					// then wait for the tag_counter to become 0, and chop the string there
					if ($c > $maxLength - $lengthOffset && $tagCounter == 0 && ($nextChar == ' ' || $cutWords == true)) {
						$input = mb_substr($input, 0, $i + 1);

						if ($dots) {
							$input .= '...';
						}

						return $input;
					}
				}
			}

			return $input;
		}

		/**
		 * Replaces all newlines in a string with HTML line breaks
		 *
		 * @param string $string  The input string
		 * @param bool   $isXhtml Whether to use XHTML compatible line breaks or not
		 *
		 * @return string Returns the altered string
		 */
		public static function nl2brReplace($string, $isXhtml = true)
		{
			while (mb_stripos($string, "\n") !== false || mb_stripos($string, "\r") !== false) {
				$string = str_ireplace([
					"\r\n",
					"\n\r",
					"\n",
					"\r",
					($isXhtml ? '<br>' : '<br />'),
				], ($isXhtml ? '<br />' : '<br>'), $string);
			}

			return $string;
		}

		/**
		 * @param $string
		 *
		 * @return mixed
		 */
		public static function normalizeAccents($string)
		{
			$accentChars = [
				'¹' => '1',
				'²' => '2',
				'³' => '3',
				'µ' => 'u',
				'À' => 'A',
				'Á' => 'A',
				'Â' => 'A',
				'Ã' => 'A',
				'Ä' => 'A',
				'Å' => 'A',
				'Æ' => 'AE',
				'Ç' => 'C',
				'È' => 'E',
				'É' => 'E',
				'Ê' => 'E',
				'Ë' => 'E',
				'Ğ' => 'G',
				'Ì' => 'I',
				'Í' => 'I',
				'Î' => 'I',
				'Ï' => 'I',
				'Ñ' => 'N',
				'Ò' => 'O',
				'Ó' => 'O',
				'Ô' => 'O',
				'Õ' => 'O',
				'Ö' => 'O',
				'Ø' => 'O',
				'Ù' => 'U',
				'Ú' => 'U',
				'Û' => 'U',
				'Ü' => 'U',
				'Ý' => 'Y',
				'ß' => 'ss',
				'à' => 'a',
				'á' => 'a',
				'â' => 'a',
				'ã' => 'a',
				'ä' => 'a',
				'å' => 'a',
				'æ' => 'ae',
				'ç' => 'c',
				'è' => 'e',
				'é' => 'e',
				'ê' => 'e',
				'ë' => 'e',
				'ğ' => 'g',
				'ì' => 'i',
				'í' => 'i',
				'î' => 'i',
				'ï' => 'i',
				'ñ' => 'n',
				'ò' => 'o',
				'ó' => 'o',
				'ô' => 'o',
				'õ' => 'o',
				'ö' => 'o',
				'ø' => 'o',
				'ù' => 'u',
				'ú' => 'u',
				'û' => 'u',
				'ü' => 'u',
				'ý' => 'y',
				'ÿ' => 'y',
			];

			foreach ($accentChars as $key => $value) {
				$string = str_replace($key, $value, $string);
			}

			return $string;
		}

		/**
		 * Replaces html characters with their html codes, or reversed when $reversed is TRUE
		 *
		 * @param array|string $html
		 * @param bool         $reversed
		 *
		 * @return array|string Returns the converted result
		 */
		public static function replaceHtmlSpecialChars($html, $reversed = false)
		{
			/** @noinspection PhpDuplicateArrayKeysInspection */
			$specialChars = [
				'&'  => '&amp;',
				'"'  => '&quot;',
				'"'  => '&#034;',
				'‘'  => '&lsquo;',
				'‘'  => '&#039;',
				'’'  => '&rsquo;',
				'"'  => '&#34;',
				'\'' => '&#39;',
				'\'' => '&#039;',
				'‚'  => '&sbquo;',
				'“'  => '&ldquo;',
				'”'  => '&rdquo;',
				'„'  => '&bdquo;',
				'†'  => '&dagger;',
				'‡'  => '&Dagger;',
				'‰'  => '&permil;',
				'‹'  => '&lsaquo;',
				'›'  => '&rsaquo;',
				'♠'  => '&spades;',
				'♣'  => '&clubs;',
				'♥'  => '&hearts;',
				'♦'  => '&diams;',
				'‾'  => '&oline;',
				'←'  => '&larr;',
				'↑'  => '&uarr;',
				'→'  => '&rarr;',
				'↓'  => '&darr;',
				'™'  => '&trade;',
				'“'  => '&quot;',
				'%'  => '&#37;',
				'<'  => '&lt;',
				'>'  => '&gt;',
				'`'  => '&#96;',
				'~'  => '&#126;',
				'—'  => '-',
				'–'  => '-',
				'-'  => '-',
				'¢'  => '&cent;',
				'£'  => '&pound;',
				'€'  => '&euro;',
				'¤'  => '&curren;',
				'¥'  => '&yen;',
				'¦'  => '&#166;',
				'§'  => '&sect;',
				'¨'  => '&#168;',
				'©'  => '&copy;',
				'ª'  => '&ordf;',
				'«'  => '&laquo;',
				'¬'  => '&not;',
				'®'  => '&reg;',
				'¯'  => '&#175;',
				'°'  => '&deg;',
				'±'  => '&plusmn;',
				'²'  => '&sup2;',
				'³'  => '&sup3;',
				'´'  => '&acute;',
				'µ'  => '&micro;',
				'¶'  => '&para;',
				'·'  => '&middot;',
				'¸'  => '&cedil;',
				'¹'  => '&sup1;',
				'º'  => '&ordm;',
				'»'  => '&raquo;',
				'¼'  => '&frac14;',
				'½'  => '&frac12;',
				'¾'  => '&frac34;',
				'À'  => '&Agrave;',
				'Á'  => '&Aacute;',
				'Â'  => '&Acirc;',
				'Ã'  => '&Atilde;',
				'Ä'  => '&Auml;',
				'Å'  => '&Aring;',
				'Æ'  => '&AElig;',
				'Ç'  => '&Ccedil;',
				'È'  => '&Egrave;',
				'É'  => '&Eacute;',
				'Ê'  => '&Ecirc;',
				'Ë'  => '&Euml;',
				'Ğ'  => '&#286;',
				'Ì'  => '&Igrave;',
				'Í'  => '&Iacute;',
				'Î'  => '&Icirc;',
				'Ï'  => '&Iuml;',
				'Ð'  => '&ETH;',
				'Ñ'  => '&Ntilde;',
				'Ò'  => '&Ograve;',
				'Ó'  => '&Oacute;',
				'Ô'  => '&Ocirc;',
				'Õ'  => '&Otilde;',
				'Ö'  => '&Ouml;',
				'×'  => '&times;',
				'Ø'  => '&Oslash;',
				'Ù'  => '&Ugrave;',
				'Ú'  => '&Uacute;',
				'Û'  => '&Ucirc;',
				'Ü'  => '&Uuml;',
				'Ý'  => '&Yacute;',
				'Þ'  => '&THORN;',
				'ß'  => '&szlig;',
				'à'  => '&agrave;',
				'á'  => '&aacute;',
				'â'  => '&acirc;',
				'ã'  => '&atilde;',
				'ä'  => '&auml;',
				'å'  => '&aring;',
				'æ'  => '&aelig;',
				'ç'  => '&ccedil;',
				'è'  => '&egrave;',
				'é'  => '&eacute;',
				'ê'  => '&ecirc;',
				'ë'  => '&euml;',
				'ğ'  => '&#287;',
				'ì'  => '&igrave;',
				'í'  => '&iacute;',
				'î'  => '&icirc;',
				'ï'  => '&iuml;',
				'ð'  => '&eth;',
				'ñ'  => '&ntilde;',
				'ò'  => '&ograve;',
				'ó'  => '&oacute;',
				'ô'  => '&ocirc;',
				'õ'  => '&otilde;',
				'ö'  => '&ouml;',
				'÷'  => '&divide;',
				'ø'  => '&oslash;',
				'ù'  => '&ugrave;',
				'ú'  => '&uacute;',
				'û'  => '&ucirc;',
				'ü'  => '&uuml;',
				'ý'  => '&yacute;',
				'þ'  => '&thorn;',
				'ÿ'  => '&yuml;',
			];

			if ($reversed === true) {
				$specialChars = array_flip($specialChars);
			}

			if (is_array($html)) {
				foreach ($html as &$data_val) {
					$data_val = static::replaceHtmlSpecialChars($data_val, $reversed);

					unset($data_val);
				}
			} else {
				foreach ($specialChars as $key => $value) {
					$html = str_ireplace($key, $value, $html);
				}
			}

			return $html;
		}
	}