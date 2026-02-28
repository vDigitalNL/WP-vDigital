<?php

	namespace ChildTheme\ChildTheme;

	use ChildTheme\ChildTheme;
	use Theme\BaseTheme;

	/**
	 * Class AbstractClass
	 *
	 * @package ChildTheme\ChildTheme
	 */
	abstract class ThemeModuleAbstractBaseClass extends BaseTheme\ThemeModuleAbstractBaseClass {

		/**
		 * @var ChildTheme
		 */
		protected $childTheme;

		/**
		 * AbstractClass constructor.
		 *
		 * @param BaseTheme  $baseTheme
		 * @param ChildTheme $childTheme
		 */
		final protected function __construct( BaseTheme $baseTheme, ChildTheme $childTheme ) {
			parent::__construct( $baseTheme );

			$this->childTheme = $childTheme;
		}

		/**
		 * @return static
		 */
		final public static function getInstance() {
			$class = get_called_class();

			if ( empty( self::$instance[$class] ) ) {
				self::$instance[$class] = new static( BaseTheme::getInstance(), ChildTheme::getInstance() );
			}

			return self::$instance[$class];
		}
	}