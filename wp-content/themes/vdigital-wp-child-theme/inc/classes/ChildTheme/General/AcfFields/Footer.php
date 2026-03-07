<?php

namespace ChildTheme\ChildTheme\General\AcfFields;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General\AcfFields;

final class Footer extends AbstractClass {
	public function init(): void {
		$optionFieldKey = 'theme_options__footer';

		acf_add_local_field_group( [
			'key'      => $optionFieldKey,
			'title'    => baseTheme()->__( AcfFields::FOOTER_OPTIONS_PAGE_LABEL),
			'fields'   => [
				[
					'key'   => 'field_footer_brand_tab',
					'label' => baseTheme()->__( 'Brand' ),
					'name'  => 'footer_brand_tab',
					'type'  => 'accordion',
					'open'  => 1,
				],
				[
					'key'   => 'field_footer_custom_logo',
					'name'  => 'footer_custom_logo',
					'label' => baseTheme()->__( 'Logo'),
					'type'  => 'image',
				],
				[
					'key'   => 'field_footer_tagline',
					'name'  => 'footer_tagline',
					'label' => baseTheme()->__( 'Tagline'),
					'type'  => 'textarea',
					'rows'  => 3,
					'instructions' => baseTheme()->__( 'Short description shown below the logo' ),
				],
				[
					'key'   => 'field_footer_columns_tab',
					'label' => baseTheme()->__( 'Link Columns' ),
					'name'  => 'footer_columns_tab',
					'type'  => 'accordion',
				],
				[
					'key'               => 'field_footer_columns',
					'name'              => 'footer_columns',
					'label'             => baseTheme()->__('Footer Columns'),
					'type'              => 'repeater',
					'layout'            => 'block',
					'max'               => 3,
					'button_label'      => baseTheme()->__('Add column'),
					'sub_fields'        => [
						[
							'key'   => 'field_footer_column_title',
							'label' => baseTheme()->__('Column Title'),
							'name'  => 'footer_column_title',
							'type'  => 'text',
						],
						[
							'key'          => 'field_footer_column_links',
							'label'        => baseTheme()->__('Links'),
							'name'         => 'footer_column_links',
							'type'         => 'repeater',
							'layout'       => 'table',
							'button_label' => baseTheme()->__('Add link'),
							'sub_fields'   => [
								[
									'key'           => 'field_footer_column_link',
									'label'         => baseTheme()->__('Link'),
									'name'          => 'footer_column_link',
									'type'          => 'link',
									'return_format' => 'array',
								],
							],
						],
					],
				],
				[
					'key'   => 'field_footer_social_tab',
					'label' => baseTheme()->__( 'Social & Copyright' ),
					'name'  => 'footer_social_tab',
					'type'  => 'accordion',
				],
				[
					'key'   => 'field_footer_linkedin',
					'name'  => 'footer_linkedin',
					'label' => baseTheme()->__( 'LinkedIn URL'),
					'type'  => 'url',
				],
				[
					'key'   => 'field_footer_copyright',
					'name'  => 'footer_copyright',
					'label' => baseTheme()->__( 'Copyright Text'),
					'type'  => 'text',
					'instructions' => baseTheme()->__( 'Use {year} for dynamic year. E.g. "© {year} vDigital. All rights reserved."' ),
					'default_value' => '© {year} vDigital. All rights reserved.',
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
