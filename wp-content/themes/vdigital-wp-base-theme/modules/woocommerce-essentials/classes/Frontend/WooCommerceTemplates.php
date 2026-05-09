<?php

	namespace Theme\Modules\WoocommerceEssentials\Frontend;

	use Exception;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class WooCommerceTemplates
	 *
	 * @package Theme\Modules\WoocommerceEssentials\Frontend
	 */
	class WooCommerceTemplates extends ThemeModuleAbstractClass {

		/**
		 * @param $template
		 * @param $templateName
		 *
		 * @return bool|string
		 */
		public function WooCommerceTemplateOverride( $template, $templateName ): string {
			if ( empty ( $templateName ) ) {
				return $template;
			}

			$locatedTemplate = $this->locateTemplate( $templateName );

			return $locatedTemplate ? $locatedTemplate : $template;
		}

		/**
		 * @param $templatePartPath
		 *
		 * @return bool|string
		 */
		public function WooCommerceTemplatePartOverride( $templatePartPath ): string {
			if ( empty ( $templatePartPath ) ) {
				return $templatePartPath;
			}

			$fileNameExploded = strpos( $templatePartPath, '/templates/' ) !== false ? explode( '/templates/', $templatePartPath ) : false;
			$fileName         = $fileNameExploded !== false ? end( $fileNameExploded ) : false;
			$locatedTemplate  = $this->locateTemplate( $fileName );

			return $locatedTemplate ? $locatedTemplate : $templatePartPath;
		}

		public function init() {
			add_filter( 'wc_get_template_part', [ $this, 'WooCommerceTemplatePartOverride' ], 10, 1 );

			add_filter( 'woocommerce_locate_template', [ $this, 'WooCommerceTemplateOverride' ], 10, 2 );
		}

		/**
		 * @param $templateName
		 *
		 * @return bool|string
		 */
		private function getChildModuleTemplatePath( $templateName ) {
			try {
				return $this->baseTheme->childThemeRootDir() . DIRECTORY_SEPARATOR . 'modules' . DIRECTORY_SEPARATOR . $this->themeModule->getThemeModuleFolder() . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . $templateName;
			} catch ( Exception $e ) {
				return false;
			}
		}

		/**
		 * @param $templateName
		 *
		 * @return bool|string
		 */
		private function getModuleTemplatePath( $templateName ) {
			try {
				return $this->themeModule->getThemeModulePath() . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . $templateName;
			} catch ( Exception $e ) {
				return false;
			}
		}

		private function locateTemplate( $templateName ) {
			if ( ! $templateName ) {
				return false;
			}

			if ( file_exists( $this->getChildModuleTemplatePath( $templateName ) ) ) {
				return $this->getChildModuleTemplatePath( $templateName );
			} else if ( file_exists( $this->getModuleTemplatePath( $templateName ) ) ) {
				return $this->getModuleTemplatePath( $templateName );
			}

			return false;
		}
	}