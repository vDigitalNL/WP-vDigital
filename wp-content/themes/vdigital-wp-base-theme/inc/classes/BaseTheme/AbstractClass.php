<?php

	namespace Theme\BaseTheme;

	use Theme\BaseTheme;

	/**
	 * Class AbstractClass
	 *
	 * @package Theme\BaseTheme
	 */
	abstract class AbstractClass {

		/**
		 * @var BaseTheme
		 */
		protected $baseTheme;

		/**
		 * @var static[]
		 */
		protected static $instance = [];

		/**
		 * AbstractClass constructor.
		 *
		 * @param BaseTheme $baseTheme
		 */
		protected function __construct( BaseTheme $baseTheme ) {
			$this->baseTheme = $baseTheme;
		}

		public function init() {
		}

		/**
		 * @return static
		 */
		public static function getInstance() {
			$class = get_called_class();

			if ( empty( self::$instance[$class] ) ) {
				self::$instance[$class] = new static( BaseTheme::getInstance() );
			}

			return self::$instance[$class];
		}
	}