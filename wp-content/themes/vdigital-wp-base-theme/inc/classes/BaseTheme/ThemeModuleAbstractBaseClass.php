<?php

	namespace Theme\BaseTheme;

	use Theme\BaseTheme;

	/**
	 * Class ThemeModuleAbstractBaseClass
	 *
	 * @package Theme\BaseTheme
	 */
	abstract class ThemeModuleAbstractBaseClass extends AbstractClass {

		use ThemeFlexClassTrait;

		/**
		 * @var string[] Array of registered post types, where the post type is the key and the module base folder that registered the post type as its values
		 */
		private $registeredPostTypes = [];

		/**
		 * @var string
		 */
		private $themeModuleClassPath;

		/**
		 * @var string[] Array of registered post types, where the post type is the key and the module base folder that registered the post type as its values
		 */
		private static $allRegisteredPostTypes = [];

		/**
		 * AbstractClass constructor.
		 *
		 * @param BaseTheme $baseTheme
		 */
		protected function __construct( BaseTheme $baseTheme ) {
			parent::__construct( $baseTheme );

			$this->registerTemplateHierarchyFilters();
		}

		/**
		 * Add theme module template files to the template hierarchy
		 *
		 * This function will add files to the $templates variable in the format:
		 *  modules/{$moduleFolder}/templates/{$templateType}-{$postType}.php
		 *
		 * @param array  $templates
		 * @param string $templateType
		 *
		 * @return array
		 */
		public function filterPostTypeHierarchyTemplates( array $templates, string $templateType ): array {
			foreach ( $this->registeredPostTypes as $postType => $moduleFolder ) {
				if ( in_array( "{$templateType}-{$postType}.php", $templates ) ) {
					// Make the ThemeModule object available in post type templates
					global $themeModule;
					$themeModule = $this;

					// Prepend the templates array with a template for this post type in the current module, so it will
					//  load when it exists
					array_unshift( $templates, "modules/{$moduleFolder}/templates/{$templateType}-{$postType}.php" );

					break;
				}
			}

			return $templates;
		}

		/**
		 * @return string
		 */
		public function getThemeModuleFolder(): string {
			return basename( dirname( $this->getThemeModuleClassPath() ) );
		}

		/**
		 * Get the base folder of this module
		 *
		 * @return string
		 *
		 * @throws \Exception
		 */
		public function getThemeModuleFolderWithBasePath(): string {
			$moduleBaseFolder  = $this->isTemporaryModule() ? 'temporary-modules' : 'modules';
			$themeModuleFolder = "{$moduleBaseFolder}/{$this->getThemeModuleFolder()}";

			return $themeModuleFolder;
		}

		/**
		 * @return string
		 *
		 * @throws \Exception Throws an exception when the currently called class cannot be reflected
		 */
		public function getThemeModulePath(): string {
			return dirname( $this->getThemeModuleClassPath() );
		}

		public function init() {
			if ( isset( $this->General ) ) {
				$this->General->init();
			}

			if ( is_admin() && isset( $this->Backend ) ) {
				$this->Backend->init();
			}

			if ( ! is_admin() && isset( $this->Frontend ) ) {
				$this->Frontend->init();
			}
		}

		/**
		 * @return bool
		 */
		public function isTemporaryModule(): bool {
			return strpos( $this->getThemeModulePath(), 'temporary-modules' ) !== false;
		}

		/**
		 * Load a theme module template file
		 *
		 * @param string      $template
		 * @param null|string $variant
		 */
		public function loadTemplateFile( string $template, ?string $variant = null ) {
			global $themeModule;

			// Save the current state of $themeModule
			$oldThemeModule = $themeModule;

			// Set the current Theme Module to $themeModule
			// Set $themeModule to NULL first, in order to remove the reference with $oldThemeModule
			$themeModule = null;
			$themeModule = $this;

			// Include the template part
			get_template_part( "{$this->getThemeModuleFolderWithBasePath()}/templates/{$template}", $variant );

			// Reset the old state of $themeModule
			// Set $themeModule to NULL first, in order to remove the reference with the current Theme Module
			$themeModule = null;
			$themeModule = $oldThemeModule;
		}

		/**
		 * @param string $postType
		 * @param array  $args
		 *
		 * @return \WP_Error|\WP_Post_Type
		 *
		 * @throws \Exception Throws an exception when the post type is already registered
		 *
		 * @see register_post_type()
		 */
		public function registerPostType( string $postType, array $args ) {
			if ( in_array( $postType, self::$allRegisteredPostTypes ) ) {
				throw new \Exception( "The {$postType} post type is already registered" );
			}

			$this->registeredPostTypes[ $postType ] = $this->getThemeModuleFolder();
			self::$allRegisteredPostTypes[]         = $postType;

			return register_post_type( $postType, $args );
		}

		/**
		 * Register this module folder as a resource for a specific template part
		 *
		 * @param string $templatePart
		 */
		public function registerTemplatePath( string $templatePart ) {
			$moduleFolder = strpos( $this->getThemeModulePath(), 'temporary-modules' ) !== false
				? 'temporary-modules' : 'modules';

			$this->baseTheme->Frontend->Html->registerTemplatePath( $templatePart,
				"{$moduleFolder}/{$this->getThemeModuleFolder()}/template-parts" );
		}

		/**
		 * Retrieve the file path to the theme module class of the currently called class
		 *
		 * @return string
		 *
		 * @throws \Exception Throws an exception when the currently called class cannot be reflected
		 */
		private function getThemeModuleClassPath(): string {
			if ( ! $this->themeModuleClassPath ) {
				try {
					$reflection                 = new \ReflectionClass( $this );
					$this->themeModuleClassPath = $reflection->getFileName();
				} catch ( \Exception $e ) {
					throw new \Exception( 'Could not get the file path of the currently called class' );
				}
			}

			return $this->themeModuleClassPath;
		}

		/**
		 * Add theme module template files to the template hierarchy
		 */
		private function registerTemplateHierarchyFilters() {
			$postTemplateTypes = [ 'archive', 'paged', 'single' ];

			foreach ( $postTemplateTypes as $postTemplateType ) {
				/*
				 * Add theme module template files to the template hierarchy in the format:
				 *  modules/{$moduleFolder}/templates/{$templateType}-{$postType}.php
				 */
				add_filter( "{$postTemplateType}_template_hierarchy",
					function ( array $templates ) use ( $postTemplateType ) {
						return $this->filterPostTypeHierarchyTemplates( $templates, $postTemplateType );
					}, 99 );
			}
			/*
			 * ToDo: Add support for 'category', 'tag', 'taxonomy'
			 */
		}
	}
