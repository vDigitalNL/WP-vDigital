<?php

	namespace Theme\BaseTheme\General;

	use PHPMailer\PHPMailer\PHPMailer;
	use Theme\BaseTheme\AbstractClass;

	/**
	 * Class Mail
	 *
	 * @package Theme\BaseTheme\General
	 */
	final class Mail extends AbstractClass {

		/**
		 * Filter email from address
		 *
		 * @param PHPMailer $phpMailer
		 */
		public function adjustPhpMailer( $phpMailer ) {
			/*
			 * Check the class of the phpMailer instance
			 *
			 * We cannot do this (yet) with type hinting, because WordPress switched to a new version of PHPMailer
			 *  since WP 5.5. That version contains PHPMailer 6.1, which uses the \PHPMailer\PHPMailer namespace
			 *
			 * @ToDo Convert this back to the type hinted variant when WP < 5.5.0 is out of the picture
			 */
			if ( \class_exists( '\PHPMailer\PHPMailer\PHPMailer' ) && ! $phpMailer instanceof PHPMailer ) {
				// Class check for WP >= 5.5.0
				throw new \UnexpectedValueException(
					'The $phpMailer parameter should be a \PHPMailer\PHPMailer\PHPMailer instance'
				);
			} elseif ( \class_exists( '\PHPMailer' ) && ! $phpMailer instanceof \PHPMailer ) {
				// Class check for WP < 5.5.0
				throw new \UnexpectedValueException(
					'The $phpMailer parameter should be a \PHPMailer instance'
				);
			}

			$emailFromAddress = $this->baseTheme->getOption( 'email.from_address' );

			if ( $emailFromAddress ) {
				$phpMailer->Sender = $emailFromAddress;
			}

			if ( $this->baseTheme->isDevSite() && $this->baseTheme->env( 'MAILTRAP_ACTIVE' ) ) {
				$phpMailer->isSMTP();
				$phpMailer->Host       = $this->baseTheme->env( 'MAILTRAP_HOST' );
				$phpMailer->Port       = $this->baseTheme->env( 'MAILTRAP_PORT' );
				$phpMailer->SMTPAuth   = true;
				$phpMailer->Username   = $this->baseTheme->env( 'MAILTRAP_USER' );
				$phpMailer->Password   = $this->baseTheme->env( 'MAILTRAP_PASS' );
				$phpMailer->SMTPSecure = 'tls';
			}
		}

		/**
		 * Filter email from address
		 *
		 * @param string $from_email
		 *
		 * @return string
		 */
		public function filterEmailFromAddress( $from_email ) {
			$emailFromAddress = $this->baseTheme->getOption( 'email.from_address', $from_email );

			return stripos( $from_email, 'wordpress@' ) !== false ? $emailFromAddress : $from_email;
		}

		/**
		 * Filter email from name
		 *
		 * @param string $from_name
		 *
		 * @return string
		 */
		public function filterEmailFromName( $from_name ) {
			$emailFromName = $this->baseTheme->getOption( 'email.from_name', $from_name );

			return strtolower( $from_name ) == 'wordpress' ? $emailFromName : $from_name;
		}

		public function init() {
			//Filter the default email from name and address which WordPress uses to send it's emails
			add_filter( 'phpmailer_init', [ $this, 'adjustPhpMailer' ], 999 );
			add_filter( 'wp_mail_from', [ $this, 'filterEmailFromAddress' ], 999 );
			add_filter( 'wp_mail_from_name', [ $this, 'filterEmailFromName' ], 999 );
		}
	}