<?php

	namespace Theme\Modules\PreLoader;

	use Theme\BaseTheme\ThemeFlexClassTrait;
	use Theme\BaseTheme\ThemeModuleAbstractClass;

	/**
	 * Class Frontend
	 *
	 * @package ChildTheme\Modules\PreLoader
	 */
	class Frontend extends ThemeModuleAbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->baseTheme->addAction( 'header/before_main_content',[ $this, 'loadPreLoaderTemplate' ] );
		}

		public function loadPreLoaderTemplate() {
			if ( $this->baseTheme->getOption( 'general.pre_loader' ) ) {
				$this->themeModule->loadTemplateFile( 'pre-loader' );
			}
		}
	}