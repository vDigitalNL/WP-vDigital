<?php

namespace ChildTheme\ChildTheme\General\AcfFields;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General\AcfFields;

final class ContactPopup extends AbstractClass {
	public function init(): void {
		$optionFieldKey = 'theme_options__contact_popup';

		acf_add_local_field_group( [
			'key'      => $optionFieldKey,
			'title'    => baseTheme()->__( 'Contact Popup' ),
			'fields'   => [
				[
					'key'   => 'field_popup_content_tab',
					'label' => baseTheme()->__( 'Left Side Content' ),
					'name'  => 'popup_content_tab',
					'type'  => 'accordion',
					'open'  => 1,
				],
				[
					'key'           => 'field_popup_title',
					'name'          => 'popup_title',
					'label'         => baseTheme()->__( 'Title' ),
					'type'          => 'text',
					'default_value' => 'Let\'s Build Something Great Together',
				],
				[
					'key'           => 'field_popup_description',
					'name'          => 'popup_description',
					'label'         => baseTheme()->__( 'Description' ),
					'type'          => 'textarea',
					'rows'          => 4,
					'default_value' => 'Tell us about your project and we\'ll get back to you within 24 hours with a free consultation.',
				],
				[
					'key'   => 'field_popup_features_tab',
					'label' => baseTheme()->__( 'Features List' ),
					'name'  => 'popup_features_tab',
					'type'  => 'accordion',
				],
				[
					'key'          => 'field_popup_features',
					'name'         => 'popup_features',
					'label'        => baseTheme()->__( 'Features' ),
					'type'         => 'repeater',
					'layout'       => 'table',
					'max'          => 5,
					'button_label' => baseTheme()->__( 'Add feature' ),
					'sub_fields'   => [
						[
							'key'   => 'field_popup_feature_text',
							'label' => baseTheme()->__( 'Feature' ),
							'name'  => 'popup_feature_text',
							'type'  => 'text',
						],
					],
				],
				[
					'key'   => 'field_popup_form_tab',
					'label' => baseTheme()->__( 'Form Settings' ),
					'name'  => 'popup_form_tab',
					'type'  => 'accordion',
				],
				[
					'key'          => 'field_popup_default_form_id',
					'name'         => 'popup_default_form_id',
					'label'        => baseTheme()->__( 'Default Form ID' ),
					'type'         => 'text',
					'instructions' => baseTheme()->__( 'Default form ID to use when no specific form is set on the button' ),
				],
			],
			'location' => [
				[
					[
						'param'    => 'options_page',
						'operator' => '==',
						'value'    => AcfFields::FOOTER_OPTIONS_PAGE_SLUG,
					],
				],
			],
		] );
	}
}
