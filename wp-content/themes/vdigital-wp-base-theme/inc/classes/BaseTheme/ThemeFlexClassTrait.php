<?php

	namespace Theme\BaseTheme;

	/**
	 * Trait ThemeFlexClassTrait
	 *
	 * @package Theme\BaseTheme
	 */
	trait ThemeFlexClassTrait {

		/**
		 * @param $name
		 *
		 * @return mixed
		 */
		function __get( $name ) {
			$classes = array_merge( [get_called_class()], class_parents( get_called_class() ) );

			foreach ( $classes as $class ) {
				$className = '\\' . $class . '\\' . str_replace( '_', '\\', $name );

				if ( class_exists( $className ) ) {
					/**
					 * @var AbstractClass $className
					 */
					return $className::getInstance();
				}
			}

			throw new \InvalidArgumentException( 'Undefined property ' . get_called_class() . '::' . $name );
		}

		/**
		 * @param $name
		 *
		 * @return mixed
		 */
		function __isset( $name ) {
			$className = '\\' . get_called_class() . '\\' . str_replace( '_', '\\', $name );

			return class_exists( $className ) && method_exists( $className, 'getInstance' );
		}

		/**
		 * @param string $name
		 * @param array  $arguments
		 *
		 * @return mixed
		 */
		public static function __callStatic( $name, $arguments ) {
			if ( method_exists( static::getInstance(), $name ) ) {
				return call_user_func_array( [ static::getInstance(), $name ], $arguments );
			}

			try {
				$result = @static::getInstance()->{$name};

				return $result;
			} catch ( \InvalidArgumentException $e ) {
				throw $e;
			} catch ( \Throwable $t ) {
			}

			throw new \BadMethodCallException( 'Call to undefined method ' . get_called_class() . '::' . $name );
		}

		/**
		 * @return static
		 */
		abstract public static function getInstance();
	}