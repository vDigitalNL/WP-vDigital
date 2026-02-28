<?php

namespace ChildTheme\ChildTheme\General;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General;
use Theme\BaseTheme\ThemeFlexClassTrait;

/**
 * Class Salesforce
 *
 * @package ChildTheme\ChildTheme\General\Salesforce
 *
 * @property-read Salesforce\FormLogging $FormLogging
 */
final class Salesforce extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		$this->addFilters();
		$this->addActions();
		$this->setRefererCookie();

		$this->FormLogging->init();
	}

	private function addFilters(): void {
		add_filter( 'salesforce_w2l_returl', [ $this, 'filterReturnUrl' ] );
		add_filter( 'sfwp2l_validate_field', [ $this, 'validateEmailNotOnBlacklist' ], 10, 4 );
	}

	private function addActions(): void {
		add_action( 'admin_menu', [ $this, 'addSalesforceAdminMenuItem' ] );
		add_action( 'admin_init', [ $this, 'redirectSalesforceMenuItem' ] );
		add_action( 'salesforce_w2l_after_submit', [ $this, 'afterSubmitTags' ], 10, 3 );
	}

	public function addSalesforceAdminMenuItem(): void {
		ob_start();
		get_template_part('template-parts/logos/salesforce');
		$svg = ob_get_contents();
		ob_end_clean();

		add_menu_page(
			$this->baseTheme->__('Salesforce Forms'),
			$this->baseTheme->__('Salesforce Forms'),
			'manage_options',
			'admin-forms',
			function () {},
			'data:image/svg+xml;base64,' . base64_encode( $svg ),
			26
		);
	}

	public function redirectSalesforceMenuItem(): void {
		if ( ($_GET['page'] ?? false) === 'admin-forms' ) {
			wp_redirect( '/' . Multisite::getInstance()->getPrefix() . '/wp-admin/options-general.php?page=salesforce-wordpress-to-lead' );
			exit;
		}
	}

	private function setRefererCookie(): void {
		if ( ! empty( $_COOKIE['httpReferer'] ) ) {
			return;
		}

		if ( !isset($_SERVER['HTTP_REFERER']) || empty( $httpReferer = $_SERVER['HTTP_REFERER'] ) ) {
			return;
		}

		setcookie( 'httpReferer', parse_url( $httpReferer )['host'], time() + 7200, '/' );
	}

	public function filterReturnUrl( $returnUrl ): string {
		return str_replace('#demoSuccess', '', $returnUrl);
	}

	public function getFormattedEmployeeNumbers( $formId, int $employees ): string|false {
        $form = salesforce_get_form($formId);
        if(empty($form) || empty($form['inputs']['employees']) || empty($form['inputs']['employees']['opts'])) {
            return false;
        }

        $options = [];
        foreach(explode("\r\n", $form['inputs']['employees']['opts']) as $option) {
	        $option = explode("|", $option);
	        $label = rtrim($option[0]);
	        foreach(['employees', 'medewerkers', 'Mitarbeiter'] as $employeeLabel) {
		        $label = str_replace($employeeLabel, '', $label);
	        }

	        $options[trim($option[1])] = $label;
        }

        if(isset($options[$employees])) {
            return $options[$employees];
        }

        return false;
	}

	public function getFormattedIndustry( $formId, $industry ): string|false {
		$industry = urldecode($industry);
		$form = salesforce_get_form($formId);
		if(empty($form) || empty($form['inputs']['industry']) || empty($form['inputs']['industry']['opts'])) {
			return $industry;
		}

		$options = [];
		foreach(explode("\r\n", $form['inputs']['industry']['opts']) as $option) {
			$option = explode("|", $option);
			$label = rtrim($option[0]);

			$options[trim($option[1])] = rtrim(str_replace('industry', '', $label));
		}

		if(isset($options[$industry])) {
			return $options[$industry];
		}

		return $industry;
	}

	public function getFormattedSalutation( $salutation ): string|false {
		switch($salutation) {
			case 'Dhr.':
				return $this->baseTheme->__('Mr') . '.';
			case 'Mvr.':
				return $this->baseTheme->__('Ms') . '.';
			case 'other':
				return $this->baseTheme->__('Other');
		}

		return false;
	}

	public function validateEmailNotOnBlacklist( $error, $formId, $fieldValue, $field ): array {
		if ( ! str_contains($field['opts'], 'demo_email_field') ) {
			return $error;
		}

		foreach ( General::$emailExtensionBlacklist as $blacklistItem ) {
			if (! str_contains($fieldValue, $blacklistItem)) {
				continue;
			}

			$error['valid']   = false;
			$error['message'] = $this->baseTheme->__( 'Please enter your business email address' );
		}

		return $error;
	}

	public function afterSubmitTags() {
		// PIXEL: 'demo aanvraag afgerond'
		if ( ! empty( $_POST ) && ! empty( $_POST['form_id'] ) ) {
			if (
				( get_current_blog_id() == 1 && $_POST['form_id'] == '14' ) ||
				( get_current_blog_id() == 4 && $_POST['form_id'] == '12' ) ||
				( get_current_blog_id() == 5 && $_POST['form_id'] == '12' )
			) {
				echo '
	<script type="text/javascript">
	    window.addEventListener("CookiebotOnAccept", function (e) {
	        if (Cookiebot.consent.marketing) {
	            window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
	            window._adftrack.push({
	                HttpHost: "track.adform.net",
	                pm: 2380282,
	                divider: encodeURIComponent("|"),
	                pagename: encodeURIComponent("Dyflexis - Besparingstool Afgerond")
	            });
	            (function () { var s = document.createElement("script"); s.type = "text/javascript"; s.async = true; s.src = "https://s2.adform.net/banners/scripts/st/trackpoint-async.js"; var x = document.getElementsByTagName("script")[0]; x.parentNode.insertBefore(s, x); })();
	
	            var axel = Math.random() + "";
	            var a = axel * 10000000000000;
	            document.write("<iframe src=\'https://10996528.fls.doubleclick.net/activityi;src=10996528;type=conve0;cat=dyfle001;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ord=" + a + "?\' width=\'1\' height=\'1\' frameborder=\'0\' style=\'display:none\'></iframe>");
	        }
	    }, false);
	</script>
	<noscript>
		<p style="margin:0;padding:0;border:0;">
			<img src="https://track.adform.net/Serving/TrackPoint/?pm=2380282&ADFPageName=Dyflexis%20-%20Besparingstool%20Afgerond&ADFdivider=|" width="1" height="1" alt="" />
		</p>
	</noscript>
	<noscript>
		<iframe src="https://10996528.fls.doubleclick.net/activityi;src=10996528;type=conve0;cat=dyfle001;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>
	</noscript>
	';
			} else {
				echo '
	<script type="text/javascript">
	    window.addEventListener("CookiebotOnAccept", function (e) {
	        if (Cookiebot.consent.marketing) {
	            window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
	            window._adftrack.push({
	                HttpHost: "track.adform.net",
	                pm: 2380282,
	                divider: encodeURIComponent("|"),
	                pagename: encodeURIComponent("Dyflexis - Demo Aanvraag Afgerond")
	            });
	            (function () { let s = document.createElement("script"); s.type = "text/javascript"; s.async = true; s.src = "https://s2.adform.net/banners/scripts/st/trackpoint-async.js"; let x = document.getElementsByTagName("script")[0]; x.parentNode.insertBefore(s, x); })();
	        }
	    }, false);
	</script>
	
	<script type="text/javascript">
	    window.addEventListener("CookiebotOnAccept", function (e) {
	        if (Cookiebot.consent.marketing) {
	            const axel = Math.random() + "";
	            const a = axel * 10000000000000;
	            window.jQuery("body").prepend("<iframe src=\'https://10996528.fls.doubleclick.net/activityi;src=10996528;type=conve0;cat=dyfle000;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ord=" + a + "?\' width=\'1\' height=\'1\' frameborder=\'0\' style=\'display:none\'></iframe>");
	        }
	    }, false);
	</script>
	';
			}
		}
	}
}
