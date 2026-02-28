<?php

namespace ChildTheme\ChildTheme\General\AcfFields;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General\AcfFields;
use ChildTheme\ChildTheme\General\FormTemplates;
use ChildTheme\ChildTheme\General\FormTemplates\TemplateFields\PopupWithOneForm;
use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

final class Header extends AbstractClass
{
	public function init(): void
	{
		$headerOptionFieldKey = 'theme_options__header';
		$heroOptionFieldKey = 'theme_options__hero';
		$heroOptionsPrefix = 'homehero_';

		acf_add_local_field_group(
			[
				'key'      => $headerOptionFieldKey,
				'title'    => baseTheme()->__(AcfFields::HEADER_OPTIONS_PAGE_LABEL),
				'fields'   => [
					[
						'key'        => 'navbar',
						'label'      => baseTheme()->__('Menu'),
						'name'       => 'navbar',
						'type'       => 'group',
						'sub_fields' => [
							[
								'key'   => 'field_navbar_logo',
								'label' => baseTheme()->__('Logo'),
								'name'  => 'navbar_logo',
								'type'  => 'image',
							],
							[
								'key'        => 'field_navbar_items',
								'label'      => baseTheme()->__('Menu items'),
								'name'       => 'navbar_items',
								'type'       => 'repeater',
								'layout'     => 'row',
								'sub_fields' => [
									[
										'key'      => 'field_navbar_link',
										'label'    => baseTheme()->__('Menu link'),
										'name'     => 'navbar_link',
										'type'     => 'link',
										'required' => 1
									],
								]
							],
						]
					],
				],
				'location' => [
					[
						[
							'param'    => 'options_page',
							'operator' => '==',
							'value'    => AcfFields::HEADER_OPTIONS_PAGE_SLUG,
						],
					],
				],
			],
		);


		acf_add_local_field_group(
			[
				'key'      => $heroOptionFieldKey,
				'title'    => baseTheme()->__(AcfFields::HERO_OPTIONS_PAGE_LABEL),
				'fields'   => [
					[
						'key'        => $heroOptionsPrefix . 'navbar',
						'label'      => baseTheme()->__('Navigation'),
						'name'       => $heroOptionsPrefix . 'navbar',
						'type'       => 'group',
						'sub_fields' => [
							[
								'key'   => 'navbar_logo',
								'label' => baseTheme()->__('Logo'),
								'name'  => 'navbar_logo',
								'type'  => 'image',
								'instructions' => baseTheme()->__('Upload the logo to display in the header (recommended height: 56px)'),
							],
							[
								'key'        => 'field_hero_navbar_items',
								'label'      => baseTheme()->__('Menu items'),
								'name'       => 'navbar_items',
								'type'       => 'repeater',
								'layout'     => 'table',
								'button_label' => baseTheme()->__('Add menu item'),
								'sub_fields' => [
									[
										'key'      => 'field_hero_navbar_link',
										'label'    => baseTheme()->__('Link'),
										'name'     => 'navbar_link',
										'type'     => 'link',
										'required' => 1
									],
								]
							],
							[
								'key'          => 'field_hero_navbar_cta_button',
								'label'        => baseTheme()->__( 'CTA Button' ),
								'name'         => 'cta_button',
								'type'         => 'group',
								'instructions' => baseTheme()->__('The call-to-action button displayed on the right side of the navigation'),
								'sub_fields'   => [
									...Buttons::getFields(
										'hero_navbar_cta_',
										false,
										[]
									),
								],
							],
						]
					],
					// group content, with field for introline, highlighted text, explanation text and background image
					[
						'key'        => $heroOptionsPrefix . 'content',
						'label'      => baseTheme()->__('Content'),
						'name'       => $heroOptionsPrefix . 'content',
						'type'       => 'group',
						'instructions' => baseTheme()->__('Only desktop content can be edited. The texts and image for the mobile version cannot be modified through these settings due to effects and animations that are specifically tailored to the corresponding text.'),
						'sub_fields' => [
							[
								'key'   => 'intro_line',
								'label' => baseTheme()->__('Title introduction'),
								'name'  => 'intro_line',
								'type'  => 'text',
							],
							[
								'key'   => 'highlighted_text',
								'label' => baseTheme()->__('Title highlight'),
								'name'  => 'highlighted_text',
								'type'  => 'text',
							],
							[
								'key'   => 'explanation_text',
								'label' => baseTheme()->__('Text'),
								'name'  => 'explanation_text',
								'type'  => 'textarea',
							],
							[
								'key'   => 'background_image',
								'label' => baseTheme()->__('Background image'),
								'name'  => 'background_image',
								'type'  => 'image',
							],
							[
								'key'          => 'field_hero_content_buttons',
								'label'        => baseTheme()->__( 'Button(s)' ),
								'name'         => 'buttons',
								'type'         => 'repeater',
								'max'          => 2,
								'layout'       => 'block',
								'button_label' => baseTheme()->__( 'Add button' ),
								'sub_fields'   => [
									...Buttons::getFields(
										'hero_content_buttons_',
										false,
										[]
									),
								],
							],
						]
					]

				],
				'location' => [
					[
						[
							'param'    => 'options_page',
							'operator' => '==',
							'value'    => AcfFields::HEADER_OPTIONS_PAGE_SLUG,
						],
					],
				],
			]
		);
	}
}
