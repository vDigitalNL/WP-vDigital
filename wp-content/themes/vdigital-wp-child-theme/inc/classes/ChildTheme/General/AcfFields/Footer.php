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
					'key'   => 'field_footer_custom_logo',
					'name'  => 'footer_custom_logo',
					'label' => baseTheme()->__( 'Logo'),
					'type'              => 'image',
				],
				[
					'key'               => 'field_footer_statement_section',
					'name'              => 'footer_statement_section',
					'label'             => baseTheme()->__('Statement Section'),
					'instructions'      => baseTheme()->__( 'This section is shown at the top of the footer, the text is split into two lines, each having different fonts and markup.' ),
					'type'              => 'group',
					'sub_fields'        => [
						[
							'key'   => 'field_footer_statement_first_line',
							'label' => baseTheme()->__('First Line'),
							'name'  => 'footer_statement_first_line',
							'type'  => 'text',
							'default_value' => 'teams that move',
						],
						[
							'key'   => 'field_footer_statement_second_line',
							'label' => baseTheme()->__('Second Line'),
							'name'  => 'footer_statement_second_line',
							'type'  => 'text',
							'default_value' => 'together',
						],
					],
				],
				[
					'key'               => 'field_footer_custom_column',
					'name'              => 'footer_custom_column',
					'label'             => baseTheme()->__('Footer links'),
					'type'              => 'repeater',
					'layout'            => 'block',
					'button_label'      => baseTheme()->__('New column'),
					'sub_fields'        => [
						[
							'key'   => 'field_footer_custom_column_title',
							'label' => baseTheme()->__('Column title'),
							'name'  => 'footer_custom_column_title',
							'type'  => 'text',
						],
						[
							'key'        => 'field_footer_custom_column_blocks',
							'label'      => baseTheme()->__('Link list'),
							'name'       => 'footer_custom_column_blocks',
							'type'       => 'repeater',
							'layout'     => 'block',
							'sub_fields' => [
								[
									'key'   => 'field_footer_custom_column_block_title',
									'label' => baseTheme()->__('Title'),
									'name'  => 'footer_custom_column_block_title',
									'type'  => 'text',
								],
								[
									'key'          => 'field_footer_custom_column_block_menu',
									'label'        => baseTheme()->__('Links'),
									'name'         => 'footer_custom_column_block_menu',
									'type'         => 'repeater',
									'layout'       => 'row',
									'button_label' => 'New menu item',
									'sub_fields'   => [
										[
											'key'           => 'field_footer_custom_column_block_menu_item',
											'label'         => baseTheme()->__('Link'),
											'name'          => 'footer_custom_column_block_menu_item',
											'type'          => 'link',
											'return_format' => 'array',
										],
									],
								],
							],
						],
					],
				],
				[
					'key'               => 'field_footer_custom_bottom_bar',
					'name'              => 'footer_custom_bottom_bar',
					'label'             => baseTheme()->__('Bottom bar', 'webwhales-multiple-themes'),
					'type'              => 'repeater',
					'layout'            => 'block',
					'sub_fields' => [
						[
							'key'           => 'field_footer_custom_bottom_bar_item',
							'label'         => baseTheme()->__('Link'),
							'name'          => 'footer_custom_bottom_bar_item',
							'type'          => 'link',
							'return_format' => 'array',
						],
					],
				]
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
