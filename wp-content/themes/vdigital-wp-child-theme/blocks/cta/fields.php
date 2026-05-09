<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$fieldKey = 'cta_';

acf_add_local_field_group( [
	'key'                   => 'group_cta',
	'title'                 => baseTheme()->__( 'CTA block' ),
	'fields'                => [
		[
			'key'   => 'field_' . $fieldKey . 'expert_tab',
			'label' => baseTheme()->__( 'Expert' ),
			'name'  => $fieldKey . 'expert_tab',
			'type'  => 'accordion',
			'open'  => 1,
		],
		[
			'key'          => 'field_' . $fieldKey . 'expert_image',
			'label'        => baseTheme()->__( 'Expert Photo' ),
			'name'         => $fieldKey . 'expert_image',
			'type'         => 'image',
			'return_format' => 'array',
			'preview_size' => 'medium',
			'instructions' => baseTheme()->__( 'Upload a photo of the expert (recommended: square, min 200x200px)' ),
		],
		[
			'key'   => 'field_' . $fieldKey . 'expert_name',
			'label' => baseTheme()->__( 'Expert Name' ),
			'name'  => $fieldKey . 'expert_name',
			'type'  => 'text',
		],
		[
			'key'   => 'field_' . $fieldKey . 'expert_role',
			'label' => baseTheme()->__( 'Expert Role' ),
			'name'  => $fieldKey . 'expert_role',
			'type'  => 'text',
			'instructions' => baseTheme()->__( 'e.g. "Senior Consultant"' ),
		],
		[
			'key'   => 'field_' . $fieldKey . 'expert_email',
			'label' => baseTheme()->__( 'Email Address' ),
			'name'  => $fieldKey . 'expert_email',
			'type'  => 'email',
		],
		[
			'key'   => 'field_' . $fieldKey . 'expert_whatsapp',
			'label' => baseTheme()->__( 'WhatsApp Number' ),
			'name'  => $fieldKey . 'expert_whatsapp',
			'type'  => 'text',
			'instructions' => baseTheme()->__( 'Include country code, e.g. "+31612345678"' ),
		],
		[
			'key'   => 'field_' . $fieldKey . 'content_tab',
			'label' => baseTheme()->__( 'Content' ),
			'name'  => $fieldKey . 'content_tab',
			'type'  => 'accordion',
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
