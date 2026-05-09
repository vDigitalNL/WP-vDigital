<?php

	namespace Theme\Helpers;

	define( 'SCANDIR_FILETYPE_BOTH', 0 );
	define( 'SCANDIR_FILETYPE_FILES', 2 );
	define( 'SCANDIR_FILETYPE_FOLDERS', 1 );

	if ( ! defined( 'SCANDIR_SORT_ASCENDING' ) ) {
		define( 'SCANDIR_SORT_ASCENDING', 0 );
	}

	if ( ! defined( 'SCANDIR_SORT_DESCENDING' ) ) {
		define( 'SCANDIR_SORT_DESCENDING', 1 );
	}

	if ( ! defined( 'SCANDIR_SORT_NONE' ) ) {
		define( 'SCANDIR_SORT_NONE', 2 );
	}

	/**
	 * Class File
	 *
	 * @package Theme\Helpers
	 */
	class File {

		/**
		 * Copy a directory recursively
		 *
		 * @param string $source
		 * @param string $destination
		 *
		 * @return bool
		 */
		public static function copyRecursive( string $source, string $destination ): bool {
			// If source is not a directory stop processing
			if ( ! \is_dir( $source ) ) {
				return false;
			}

			// If the destination directory does not exist, create it
			if ( ! \is_dir( $destination ) ) {
				if ( ! \mkdir( $destination, 0755, true ) ) {
					// If the destination directory could not be created stop processing
					return false;
				}
			}

			// Open the source directory to read in files
			$i = new \DirectoryIterator( $source );

			foreach ( $i as $f ) {
				if ( $f->isDot() ) {
					continue;
				}

				if ( $f->isFile() ) {
					if ( ! \copy( $f->getRealPath(), $destination . \DS . $f->getFilename() ) ) {
						return false;
					}
				} elseif ( $f->isDir() ) {
					if ( ! self::copyRecursive( $f->getRealPath(), $destination. \DS . $f ) ) {
						return false;
					}
				}
			}

			return true;
		}

		/**
		 * @param string $pattern
		 * @param int    $flags Does not support the GLOB_BRACE flag
		 *
		 * @uses glob
		 *
		 * @return array
		 */
		public static function globRecursive( $pattern, $flags = 0 ) {
			$files = glob( $pattern, $flags );

			foreach ( glob( dirname( $pattern ) . '/*', GLOB_ONLYDIR | GLOB_NOSORT ) as $dir ) {
				$files = array_merge( $files, static::globRecursive( $dir . '/' . basename( $pattern ), $flags ) );
			}

			return $files;
		}

		/**
		 * Tells whether the filename is a symbolic link. Other than is_link(), is_link_real() also checks if a directory is a symbolic link
		 *
		 * @param string $filename
		 *
		 * @return bool
		 */
		public static function isLinkReal( $filename ) {
			if ( ! is_dir( $filename ) && is_link( $filename ) ) {
				return true;
			} elseif ( is_dir( $filename ) ) {
				if ( substr( $filename, - 1 ) == DIRECTORY_SEPARATOR ) {
					$filename = substr( $filename, 0, - 1 );
				}

				return ( $filename != realpath( $filename ) );
			}

			return false;
		}

		/**
		 * @param string $source
		 * @param string $destination
		 *
		 * @return bool
		 */
		public static function moveRecursive( string $source, string $destination ) {
			// If source is not a directory stop processing
			if ( ! \is_dir( $source ) ) {
				return false;
			}

			// If the destination directory does not exist create it
			if ( ! \is_dir( $destination ) ) {
				if ( ! \mkdir( $destination, 0755, true ) ) {
					// If the destination directory could not be created stop processing
					return false;
				}
			}

			// Open the source directory to read in files
			$i = new \DirectoryIterator( $source );

			foreach ( $i as $f ) {
				if ( $f->isDot() ) {
					continue;
				}

				if ( $f->isFile() ) {
					if ( ! \rename( $f->getRealPath(), $destination . \DS . $f->getFilename() ) ) {
						return false;
					}
				} else if ( $f->isDir() ) {
					if ( ! self::moveRecursive( $f->getRealPath(), $destination. \DS . $f ) ) {
						return false;
					}
				}
			}

			return \is_dir( $source ) ? \rmdir( $source ) : true;
		}

		/**
		 * Function to recursively remove a directory
		 *
		 * @param $dir
		 */
		public static function removeDirRecursively( string $dir ) {

			if ( file_exists( realpath( $dir ) ) ) {
				$wDir  = array_diff( @scandir( realpath( $dir ) ), [ '.', '..' ] );
				$files = array_values( $wDir );

				for ( $i = 0; $i < count( $files ); $i ++ ) {
					if ( is_dir( realpath( $dir ) . \DS . $files[ $i ] ) ) {
						self::removeDirRecursively( realpath( $dir ) . \DS . $files[ $i ] );
					} elseif ( file_exists( realpath( $dir ) . \DS . $files[ $i ] ) ) {
						@unlink( realpath( $dir ) . \DS . $files[ $i ] );
					}
				}

				@closedir( @opendir( $dir ) );
				@rmdir( realpath( $dir ) );
			}
		}

		/**
		 * Lists files and directories with their full paths inside the specified path. Alternative for scandir().
		 *
		 * @param string $directory
		 * @param bool   $exclude_symbolic_links
		 * @param int    $type      Can be SCANDIR_FILETYPE_BOTH, SCANDIR_FILETYPE_FILES or SCANDIR_FILETYPE_FOLDERS
		 * @param bool   $recursive Whether the search will be recursive. When the search is recursive and $type is set to SCANDIR_FILETYPE_BOTH or SCANDIR_FILETYPE_FOLDERS, the folders are included in the resulting array as well it's containing files
		 * @param int    $sorting_order
		 *
		 * @see scandir()
		 *
		 * @return array|bool
		 */
		public static function scanDir( $directory, $exclude_symbolic_links = true, $type = SCANDIR_FILETYPE_BOTH, $recursive = false, $sorting_order = SCANDIR_SORT_ASCENDING ) {
			$output    = array();
			$directory = realpath( $directory );

			if ( $type != SCANDIR_FILETYPE_BOTH && $type != SCANDIR_FILETYPE_FILES && $type != SCANDIR_FILETYPE_FOLDERS ) {
				$type = SCANDIR_FILETYPE_BOTH;
			}

			if ( $directory !== false ) {
				$files = scandir( $directory, $sorting_order );

				if ( $files !== false ) {
					foreach ( $files as $file ) {
						$file = $directory . DIRECTORY_SEPARATOR . $file;
						if ( ! $exclude_symbolic_links || ! static::isLinkReal( $file ) ) {
							if ( $type == SCANDIR_FILETYPE_BOTH || ( $type == SCANDIR_FILETYPE_FILES && is_file( $file ) ) || ( $type == SCANDIR_FILETYPE_FOLDERS && is_dir( $file ) ) ) {
								$output[] = $file;
							}

							if ( $recursive && is_dir( $file ) ) {
								$file = static::scanDir( $file, $exclude_symbolic_links, $type, true, $sorting_order );

								if ( ! empty( $file ) && is_array( $file ) ) {
									$output = array_merge( $output, $file );
								}
							}
						}
					}

					return $output;
				}
			}

			return false;
		}
	}