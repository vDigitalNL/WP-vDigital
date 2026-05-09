<?php

	namespace Theme\Helpers;

	/**
	 * Class Log
	 *
	 * @package Theme\Helpers
	 */
	class Log {

		const LOGTIME_RETURN_DIFFERENCE = 0;

		const LOGTIME_RETURN_TOTAL_TIME = 1;

		/**
		 * @var array
		 */
		private static $logtime = [
			'logtime_start' => 0,
			'logtime'       => 0,
			'logtimes'      => [],
			'logtime_i'     => - 1,
			'logtime_d'     => 15,
		];

		/**
		 * @param \Throwable $throwable
		 *
		 * @return array
		 */
		public static function generateExceptionData( \Throwable $throwable ): array {
			$exceptionData = [
				'class'   => get_class( $throwable ),
				'file'    => ltrim( str_ireplace( str_replace( '\\', '/', ABSPATH ), '',
					str_replace( '\\', '/', $throwable->getFile() ) ), '/\\' ),
				'line'    => $throwable->getLine(),
				'message' => get_class( $throwable ) . ( ! empty( $throwable->getMessage() ) ? ': ' . $throwable->getMessage() : '' ),
				'trace'   => [],
			];

			$exceptionData['message'] .= ' in ' . $exceptionData['file'] . ':' . $exceptionData['line'];

			$traceN = round( count( $throwable->getTrace() ) / 10, 0, PHP_ROUND_HALF_UP );

			foreach ( $throwable->getTrace() as $n => $trace ) {
				$info = '#' . str_pad( $n, $traceN, '0', STR_PAD_LEFT ) . ' ';

				if ( ! empty( $trace['file'] ) ) {
					$info .= ltrim( str_ireplace( str_replace( '\\', '/', ABSPATH ), '',
							str_replace( '\\', '/', $trace['file'] ) ),
							'/\\' ) . ':';

					if ( ! empty( $trace['line'] ) ) {
						$info .= $trace['line'] . ':';
					}

					$info .= ' ';
				}

				if ( ! empty( $trace['class'] ) && ! empty( $trace['function'] ) ) {
					$info .= $trace['class'] . ( ! empty( $trace['type'] ) ? $trace['type'] : '->' );
				}

				if ( ! empty( $trace['function'] ) ) {
					$info .= $trace['function'] . '(';

					if ( ! empty( $trace['args'] ) ) {
						$info .= implode( ', ', array_map( function ( $v ) {
							if ( is_scalar( $v ) ) {
								return gettype( $v ) . ': ' . $v;
							}

							if ( is_object( $v ) ) {
								return gettype( $v ) . ': ' . get_class( $v );
							}

							return gettype( $v );
						}, (array) $trace['args'] ) );
					}

					$info .= ')';
				}

				$exceptionData['trace'][ $n ] = $info;
			}

			return $exceptionData;
		}

		/**
		 * @param \Throwable $throwable
		 *
		 * @return string
		 */
		public static function generateExceptionMessage( \Throwable $throwable ): string {
			$exceptionData = static::generateExceptionData( $throwable );

			$error = $exceptionData['message'];

			if ( $exceptionData['trace'] ) {
				$error .= "\r\n" . 'Stack trace:' . "\r\n";
				$error .= implode( "\r\n", $exceptionData['trace'] );
			}

			$error .= "\r\n";

			return $error;
		}

		/**
		 * Get a saved logtime
		 *
		 * @param int $key
		 *
		 * @return float|null
		 */
		public static function getLogTime( int $key = 0 ): float {
			if ( ! array_key_exists( $key, self::$logtime['logtimes'] ) ) {
				return null;
			}

			return self::$logtime['logtimes'][ $key ];
		}

		/**
		 * Get one or more saved logtimes
		 *
		 * @param array $keys If empty, this function returns all saved logtimes
		 *
		 * @return array
		 */
		public static function getLogTimes( array $keys = [] ): array {
			$output = [];

			if ( empty( $keys ) ) {
				return self::$logtime['logtimes'];
			}

			foreach ( $keys as $k ) {
				if ( array_key_exists( $k, self::$logtime['logtimes'] ) ) {
					$output[ $k ] = self::$logtime['logtimes'][ $k ];
				}
			}

			return $output;
		}

		/**
		 * Log and mode/print script execution time
		 *
		 * @param bool   $print Whether to print the running time from the last call or not.
		 * @param int    $mode  Whether to mode the total running time or the time from the last call. Accepts Dev::LOGTIME_RETURN_DIFFERENCE or Dev::LOGTIME_RETURN_TOTAL_TIME.
		 * @param string $desc  Optional description
		 *
		 * @return mixed Returns (and prints) the execution time. When called for the first time, the timer starts counting in milliseconds (ms) and returns 0. When called again, this method returns the total running time or the running time from the last call (depending on $mode). When $print is enabled, this method also prints the running time from the last call.
		 */
		public static function logTime( $print = true, $mode = self::LOGTIME_RETURN_DIFFERENCE, $desc = '' ): float {
			$newLogTime = microtime( true );

			if ( empty( self::$logtime['logtime_start'] ) ) {
				self::$logtime['logtime_start'] = $newLogTime;
			}

			if ( ! empty( self::$logtime['logtime'] ) ) {
				$diff = ( $newLogTime - self::$logtime['logtime'] );
			} else {
				$diff = 0;
			}

			$debugBacktrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 1 );

			self::$logtime['logtimes'][] = [
				'time'        => $diff,
				'total_time'  => ( $newLogTime - self::$logtime['logtime_start'] ),
				'file'        => $debugBacktrace[0]['file'],
				'line'        => $debugBacktrace[0]['line'],
				'description' => $desc,
			];
			self::$logtime['logtime']    = $newLogTime;
			self::$logtime['logtime_i'] ++;

			if ( $print ) {
				$text = self::$logtime['logtime_i'] . ': ';
				$text .= sprintf( '%.' . self::$logtime['logtime_d'] . 'f', $diff ) . ' sec';
				$text .= ! empty( $desc ) ? ' (' . $desc . ')' : '';

				self::printr( $text );
			}

			return (float) ( $mode == self::LOGTIME_RETURN_TOTAL_TIME ? $newLogTime - self::$logtime['logtime_start'] : $diff );
		}

		/**
		 * Print a readable version of an exception
		 *
		 * @param \Exception $e
		 * @param array      $extraData
		 * @param bool       $exit   Whether to exit the script after printing $expression. Only effective when $return is omitted or set to FALSE
		 * @param bool       $return Whether to return the output or to print the output on the screen
		 *
		 * @see print_r()
		 *
		 * @return null|string
		 */
		public static function printException( \Exception $e, $extraData = [], $exit = false, $return = false ): ?string {
			$error     = static::generateExceptionMessage( $e );
			$extraData = static::convertData( $extraData );

			if ( ! is_array( $extraData ) && ! ! $extraData ) {
				$extraData = [ $extraData ];
			}

			if ( ! empty( $extraData ) ) {
				$error .= "\r\n" . print_r( $extraData, true );
			}

			if ( $return ) {
				return $error;
			} else {
				print $error;

				if ( $exit ) {
					exit;
				}
			}

			return null;
		}

		/**
		 * @param mixed $data
		 *
		 * @return mixed
		 */
		private static function convertData( $data ) {
			if ( is_object( $data ) && is_callable( [ $data, 'toArray' ] ) ) {
				$data = $data->toArray();
			} elseif ( is_object( $data ) && $data instanceof \Traversable ) {
				$data = (array) $data;
			} else {
				$_expression = @json_encode( $data );
				$data        = $_expression ?: gettype( $data );

				unset( $_expression );
			}

			return $data;
		}
	}