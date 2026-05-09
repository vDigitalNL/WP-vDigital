<?php

	namespace Theme\BaseTheme;

	use Theme\BaseTheme;

	/**
	 * Class AbstractClass
	 *
	 * @package Theme\BaseTheme
	 */
	abstract class ThemeModuleAbstractClass extends AbstractClass {

		/**
		 * @var ThemeModuleAbstractBaseClass
		 */
		protected $themeModule;

		/**
		 * AbstractClass constructor.
		 *
		 * @param BaseTheme                    $baseTheme
		 * @param ThemeModuleAbstractBaseClass $themeModule
		 */
		public function __construct( BaseTheme $baseTheme, ThemeModuleAbstractBaseClass $themeModule ) {
			parent::__construct( $baseTheme );

			$this->themeModule = $themeModule;
		}

		/**
		 * @return static
		 *
		 * @throws \Exception Throws an exception when the theme module class cannot be retrieved from the currently called class
		 */
		public static function getInstance() {
			$class = get_called_class();

			if ( empty( self::$instance[ $class ] ) ) {
				/**
				 * @var ThemeModuleAbstractBaseClass $themeModuleClass
				 */
				$themeModuleClass = static::getThemeModuleClass();

				self::$instance[ $class ] = new static( BaseTheme::getInstance(), $themeModuleClass::getInstance() );
			}

			return self::$instance[ $class ];
		}

		/**
		 * @return string
		 *
		 * @throws \Exception Throws an exception when the theme module class cannot be retrieved from the currently called class
		 */
		private static function getThemeModuleClass() {
			$currentClass     = get_called_class();
			$themeModuleClass = [];

			preg_match( '/(Child)?Theme\\\Modules\\\[^\\\]+/', $currentClass, $themeModuleClass );

			if ( empty( $themeModuleClass[0] ) ) {
				throw new \Exception( 'Could not retrieve theme module class from currently called class' );
			}

			return $themeModuleClass[0];
		}
	}