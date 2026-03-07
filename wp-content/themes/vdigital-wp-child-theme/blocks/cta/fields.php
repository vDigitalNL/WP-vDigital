<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$fieldKey = 'cta_';

acf_add_local_field_group( [
	'key'                   => 'group_cta',
	'title'                 => baseTheme()->__( 'CTA block' ),
	'fields'                => [
		[
			'key'   => 'field_' . $fieldKey . 'content_tab',
			'label' => baseTheme()->__( 'Content' ),
			'name'  => $fieldKey . 'content_tab',
			'type'  => 'accordion',
			'open'  => 1,
		],
		[
			'key'   => 'field_' . $fieldKey . 'title',
			'label' => baseTheme()->__( 'Title' ),
			'name'  => $fieldKey . 'title',
			'type'  => 'text',
		],
		[
			'key'   => 'field_' . $fieldKey . 'description',
			'label' => baseTheme()->__( 'Description' ),
			'name'  => $fieldKey . 'description',
			'type'  => 'textarea',
			'rows'  => 3,
		],
		[
			'key'   => 'field_' . $fieldKey . 'buttons_tab',
			'label' => baseTheme()->__( 'Buttons' ),
			'name'  => $fieldKey . 'buttons_tab',
			'type'  => 'accordion',
		],
		[
			'key'          => 'field_' . $fieldKey . 'buttons',
			'label'        => baseTheme()->__( 'Button(s)' ),
			'name'         => $fieldKey . 'buttons',
			'type'         => 'repeater',
			'max'          => 2,
			'layout'       => 'block',
			'button_label' => baseTheme()->__( 'Add button' ),
			'sub_fields'   => [
				...Buttons::getFields(
					$fieldKey . 'buttons_'
				),
			],
		],
		[
			'key'   => 'field_' . $fieldKey . 'contact_tab',
			'label' => baseTheme()->__( 'Contact Info' ),
			'name'  => $fieldKey . 'contact_tab',
			'type'  => 'accordion',
		],
		[
			'key'   => 'field_' . $fieldKey . 'contact_text',
			'label' => baseTheme()->__( 'Contact Text' ),
			'name'  => $fieldKey . 'contact_text',
			'type'  => 'text',
			'instructions' => baseTheme()->__( 'e.g. "Or email us directly at"' ),
		],
		[
			'key'   => 'field_' . $fieldKey . 'contact_link',
			'label' => baseTheme()->__( 'Contact Link' ),
			'name'  => $fieldKey . 'contact_link',
			'type'  => 'link',
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/cta',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
