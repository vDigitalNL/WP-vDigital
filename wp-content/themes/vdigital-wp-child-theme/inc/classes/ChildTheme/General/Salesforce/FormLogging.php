<?php

namespace ChildTheme\ChildTheme\General\Salesforce;

use Theme\BaseTheme\AbstractClass;
final class FormLogging extends AbstractClass {
	const FORM_LOGGING_CLEANUP_HOOK = 'dyflexis_form_logging_cleanup';
	const FORM_LOGGING_TABLE = 'wp_dyflexis_form_logging';


	public function init(): void {
		add_action( 'salesforce_w2l_after_submit', [ $this, 'logFormEntry' ] );
		add_action( self::FORM_LOGGING_CLEANUP_HOOK, [ FormLogging::class, 'deleteOldLogs' ] );

		if ( ! wp_next_scheduled( self::FORM_LOGGING_CLEANUP_HOOK ) ) {
			wp_schedule_event( time(), 'daily', self::FORM_LOGGING_CLEANUP_HOOK );
		}
	}

	public function logFormEntry( $post ): void {
		if ( empty( $_POST ) || empty( $_POST['form_id'] ?? false ) ) {
			return;
		}

		global $wpdb;
		$userAgent = $_SERVER['HTTP_USER_AGENT'];

		$wpdb->insert( self::FORM_LOGGING_TABLE, [
			'form_id'    => $_POST['form_id'],
			'data'       => json_encode( $post ),
			'user_agent' => strval( $userAgent )
		] );
	}

	public static function deleteOldLogs(): void {
		global $wpdb;
		$table = self::FORM_LOGGING_TABLE;
		$wpdb->query( "DELETE FROM $table WHERE `date` < (NOW() - INTERVAL 3 MONTH)" );
	}
}