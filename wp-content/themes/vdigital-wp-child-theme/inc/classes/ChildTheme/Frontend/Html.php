<?php

	namespace ChildTheme\ChildTheme\Frontend;

	use ChildTheme\ChildTheme\AbstractClass;
	use ChildTheme\ChildTheme\General\Multisite;
	use Inpsyde\MultilingualPress\Core\Frontend\AltLanguageHtmlLinkTagRenderer;
    use Inpsyde\MultilingualPress\Framework\Api\Translations;
    use Inpsyde\MultilingualPress\Framework\Api\TranslationSearchArgs;
    use Inpsyde\MultilingualPress\Framework\WordpressContext;
    use function Inpsyde\MultilingualPress\resolve;

	class Html extends AbstractClass {
		public function init(): void {
			$this->addActions();
            $this->addFilters();
		}

		public function addActions(): void {
			add_action( 'wp_head', [$this, 'addHrefLangTagsToHead'] );
		}

        public function addFilters() {
			add_filter( AltLanguageHtmlLinkTagRenderer::FILTER_HREFLANG, function() { return ''; });
		}

        public function addDefaultHrefLangTags(): void {
			$translatedUrls = $this->getTranslationUrls();
			foreach ( $translatedUrls as $languageCode => $translatedUrl ) {
				echo "<link rel='alternate' hreflang='{$languageCode}' href='{$translatedUrl}'>";
			}

			$xDefaultTranslatedUrl = $translatedUrls['en'] ?? $translatedUrls['nl'] ?? $translatedUrls['de'] ?? null;

			if ( empty( $xDefaultTranslatedUrl ) ) {
				return;
			}

			echo "<link rel='alternate' hreflang='x-default' href='{$xDefaultTranslatedUrl}'>";
		}

        public function addHrefLangTagsToHead(): void {
			$this->addDefaultHrefLangTags();
		}

        public function getTranslationUrls(): array {
			if ( ! class_exists( 'Inpsyde\MultilingualPress\Framework\Api\TranslationSearchArgs' ) ) {
				return [];
			}

	        $args = TranslationSearchArgs::forContext(
		        new WordpressContext(),
		        [
			        'post_status' => [ 'publish' ],
		        ]
	        )->forSiteId( get_current_blog_id() )->includeBase();

            $translations    = resolve( Translations::class )->searchTranslations($args);
            $translationUrls = [];
	        global $wp_query;

            foreach ( $translations as $translation ) {
	            $isoCode = $translation->language()->isoCode();

				// by default WordPress would translate the search pages to /search/{s} as search page, but it should be /?s={s}
	            // since this is what the plugin seems to use
	            if ( is_search() && ! empty( $wp_query->query['s'] ) && ! empty( $isoCode ) ) {
		            switch_to_blog( $translation->remoteSiteId() );
		            $translationUrls[ $isoCode ] = home_url( '/?s=' . urlencode( $wp_query->query['s'] ) );
		            restore_current_blog();
		            continue;
	            }

				if ( ! empty( $isoCode ) &&
	                 $isoCode === Multisite::getInstance()->getPrefix() ) {

                    $postType = $wp_query->query['post_type'] ?? false;

                    if ( is_post_type_archive() && isset( $postType ) && ! empty( $translation->remoteUrl() ) && ! empty( $isoCode ) ) {
						switch_to_blog( $translation->remoteSiteId() );
                        $translationUrls[ $isoCode ] = get_post_type_archive_link( $postType );
                        restore_current_blog();
                        continue;
                    } elseif ( ! empty( $permalink = get_permalink() ) ) {
                        $translationUrls[ $isoCode ] = $permalink;
                    }
                }

                if ( empty( $isoCode ) ||
                     empty( $translation->remoteUrl() ) ||
                    str_contains($translation->remoteUrl(), 'ww_multi_remove')) {
                    continue;
                }

                $translationUrls[ $isoCode ] = $translation->remoteUrl();
            }

            return $translationUrls;
        }
	}
