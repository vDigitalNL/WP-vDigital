<?php

namespace ChildTheme\ChildTheme\General\AcfFields;

use ChildTheme\ChildTheme\AbstractClass;
use ChildTheme\ChildTheme\General\FormTemplates;

final class MarketplaceOptions extends AbstractClass {
	public function init(): void {
		acf_add_local_field_group( [
			'key'      => 'group_marketplace_options',
			'title'    => baseTheme()->__( 'Marketplace Options' ),
			'fields'   => [
				[
					'key'   => 'field_marketplace_missing_connection_title',
					'label' => baseTheme()->__( 'Missing Connection Tile' ),
					'type'  => 'tab',
				],
				[
					'key'   => 'field_marketplace_missing_connection_text',
					'label' => baseTheme()->__( 'Text' ),
					'name'  => 'marketplace_missing_connection_text',
					'type'  => 'text',
				],
				[
					'key'   => 'field_marketplace_missing_connection_form_template',
					'label' => baseTheme()->__( 'Form template (optional)' ),
					'name'  => 'marketplace_missing_connection_form_template',
					'type'  => 'select',
					'choices' => [],
					'allow_null' => 1,
					'instructions' => baseTheme()->__( 'If a form template is selected, the tile will open a popup instead of using the link above.' ),
				],
				[
					'key'   => 'field_marketplace_show_all_title',
					'label' => baseTheme()->__( 'Show All Section' ),
					'type'  => 'tab',
				],
				[
					'key'   => 'field_marketplace_show_all_section_title',
					'label' => baseTheme()->__( 'Title' ),
					'name'  => 'marketplace_show_all_title',
					'type'  => 'text',
				],
				[
					'key'   => 'field_marketplace_show_all_description',
					'label' => baseTheme()->__( 'Description' ),
					'name'  => 'marketplace_show_all_description',
					'type'  => 'wysiwyg',
				],
				[
					'key'           => 'field_marketplace_show_all_image',
					'label'         => baseTheme()->__( 'Image' ),
					'name'          => 'marketplace_show_all_image',
					'type'          => 'image',
					'return_format' => 'array',
					'preview_size'  => 'medium',
				],
			],
			'location' => [
				[
					[
						'param'    => 'options_page',
						'operator' => '==',
						'value'    => 'api-connections-options',
					],
				],
			],
			'active' => true,
		] );
	}
}
