<?php

namespace ChildTheme\ChildTheme\General\AcfFields;

use ChildTheme\ChildTheme\AbstractClass;

final class Slider extends AbstractClass {

	public function init(): void {
		acf_add_local_field_group( [
			'key'      => 'group_single-slider',
			'title'    => 'Slider',
			'fields'   => [
				[
					'key'        => 'field_single_slider_images',
					'label'      => baseTheme()->__( 'Images' ),
					'name'       => 'single_slider_images',
					'type'       => 'repeater',
					'required'   => 1,
					'min'        => 10,
					'sub_fields' => [
						[
							'key'      => 'field_single_slider_image',
							'label'    => baseTheme()->__( 'Image' ),
							'name'     => 'single_slider_image',
							'type'     => 'image',
							'required' => 1,
						],
					]
				],
			],
			'location' => [
				[
					[
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'slider',
					],
				],
			],
			'active'   => true,
		] );
	}
}