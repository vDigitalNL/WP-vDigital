<?php

$fieldKey = 'field_video_';
acf_add_local_field_group( [
	'key'                   => 'group_video',
	'title'                 => 'Video',
	'layout'                => 'table',
	'fields'                => [
		[
			'key'          => $fieldKey . 'link',
			'label'        => $this->baseTheme->__( 'YouTube URL' ),
			'instructions' => $this->baseTheme->__( 'Go to the youtube video in the browser, select share, and copy the last part of the url (without "https://youtu.be/", "https://youtube.com", etc.).' ),
			'name'         => $fieldKey . 'link',
			'type'         => 'text',
			'required'     => 1,
			'wrapper'      => [
				'width' => '50%',
			],
		],
		[
			'key'      => $fieldKey . 'image',
			'label'    => $this->baseTheme->__( 'Image' ),
			'name'     => $fieldKey . 'image',
			'type'     => 'image',
			'required' => 1,
			'wrapper'  => [
				'width' => '50%',
			],
		],
		[
			'key'     => $fieldKey . 'image_mobile',
			'label'   => baseTheme()->__( 'Image (mobile)' ),
			'name'    => $fieldKey . 'image_mobile',
			'type'    => 'image',
			'wrapper' => [
				'width' => '50%',
			],
		],
	],
	'location'              => [
		[
			[
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'acf/video',
			],
		],
	],
	'position'              => 'normal',
	'style'                 => 'default',
	'label_placement'       => 'top',
	'instruction_placement' => 'label',
	'active'                => true,
] );
