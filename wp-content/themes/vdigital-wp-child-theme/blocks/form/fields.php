<?php

use ChildTheme\ChildTheme\General\FormTemplates;

$fieldKey = 'form_';

acf_add_local_field_group([
	'key'                   => 'group_form',
	'title'                 => 'Form',
	'fields'                => [
		[
			'key'     => 'field_' . $fieldKey . 'heading_type',
			'label'   => baseTheme()->__('Heading type'),
			'name'    => $fieldKey . 'heading_type',
			'type'    => 'select',
			'choices' => [
				'h1' => baseTheme()->__('H1'),
				'h2' => baseTheme()->__('H2'),
			],
			'default_value' => 'h2',
		],
		[
			'key'   => 'field_' . $fieldKey . 'title',
			'label' => baseTheme()->__('Title'),
			'name'  => $fieldKey . 'title',
			'type'  => 'text',
		],
		[
			'key'   => 'field_' . $fieldKey . 'text',
			'label' => baseTheme()->__('Text'),
			'name'  => $fieldKey . 'text',
			'type'  => 'wysiwyg',
		],
		[
			'key'          => 'field_' . $fieldKey . 'template',
			'label'        => baseTheme()->__('Form template'),
			'instructions' => baseTheme()->__('Only templates with the template type "Inline form" are available.'),
			'name'         => $fieldKey . 'template',
			'type'         => 'select',
            'required'     => 1,
			'choices'      => [],
		],
		[
			'key'               => 'field_' . $fieldKey . 'salesforce_form',
			'label'             => baseTheme()->__('Salesforce form'),
			'name'              => $fieldKey . 'salesforce_form',
			'type'              => 'select',
			'choices'           => [],
			'required'          => 1,
			'conditional_logic' => [
				[
					[
						'field'    => 'field_' . $fieldKey . 'template',
						'operator' => '!=empty',
					],
				]
			]
		],
		[
			'key'   => 'field_' . $fieldKey . 'white_background',
			'label' => baseTheme()->__('Add white background'),
			'name'  => $fieldKey . 'white_background',
			'type'  => 'true_false',
			'ui'    => 1,
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/form',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
]);
