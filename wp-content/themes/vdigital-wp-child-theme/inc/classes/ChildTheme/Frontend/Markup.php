<?php

namespace ChildTheme\ChildTheme\Frontend;

use ChildTheme\ChildTheme\AbstractClass;

final class Markup extends AbstractClass {
	public function init(): void {
		add_action( 'wp_footer', [ $this, 'outputCombinedFAQSchema' ] );
		add_action( 'wp_footer', [ $this, 'outputCombinedSoftwareApplicationSchema' ] );
	}

	// Printing the schema markup here instead of directly within the
	// block: "/wp-content/themes/vdigital-wp-child-theme/blocks/accordion/template.php" since we need to combine the
	// output whenever multiple blocks are used on one page.
	public function outputCombinedFAQSchema(): void {
		global $global_faq_questions;

		if (!empty($global_faq_questions)) {
			$faqSchema = [
				'@context' => 'https://schema.org',
				'@type' => 'FAQPage',
				'mainEntity' => $global_faq_questions
			];

			echo '<script type="application/ld+json">';
			echo json_encode($faqSchema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
			echo '</script>';
		}
	}

	// Printing the schema markup here instead of directly within the
	// block: "/wp-content/themes/vdigital-wp-child-theme/blocks/price-plan/template.php" since we need to combine the
	// output whenever multiple blocks are used on one page.
	public function outputCombinedSoftwareApplicationSchema(): void {
		global $globalPricePlanFeatures;

		if ( ! empty( $globalPricePlanFeatures ) ) {
			$softwareApplicationSchema = [
				'@context'               => 'https://schema.org',
				'@type'                  => 'SoftwareApplication',
				'name'                   => 'vdigital',
				'applicationCategory'    => 'BusinessApplication',
				'applicationSubCategory' => 'workforce management',
				'operatingSystem'        => [ 'web', 'iOS', 'Android' ],
				'featureList'            => $globalPricePlanFeatures
			];

			echo '<script type="application/ld+json">';
			echo json_encode( $softwareApplicationSchema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
			echo '</script>';
		}
	}
}
