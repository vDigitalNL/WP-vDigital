<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class WordPress
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class WordPress extends AbstractClass {

		public function disabledXMLRPCHeader() {
			if ( ! isset( $_SERVER['SCRIPT_FILENAME'] ) ) {
				return;
			}

			if ( basename( $_SERVER['SCRIPT_FILENAME'] ) !== 'xmlrpc.php' ) {
				return;
			}

			http_response_code( 403 );

			wp_die();
		}

		public function init() {
			// Disable the XML-RPC functionality when the theme setting is not being used.
			if ( $this->baseTheme->getOption( 'development.xmlrpc' ) == false ) {
				add_filter( 'xmlrpc_enabled', '__return_false' );

				add_filter( 'xmlrpc_methods', '__return_empty_array' );

				$this->disabledXMLRPCHeader();
			}
		}
	}