<?php

namespace ChildTheme\ChildTheme\General\PostTypes;

use Theme\BaseTheme\AbstractClass;
use Theme\BaseTheme\ThemeFlexClassTrait;

final class Cases extends AbstractClass {
	use ThemeFlexClassTrait;

	public function init(): void {
		add_action( 'manage_cases_posts_custom_column', [ $this, 'fillCustomCasesAdminColumns' ], 10, 2 );
		add_filter( 'manage_cases_posts_columns', [ $this, 'addCustomCasesAdminColumns' ] );
		$this->registerAcfFields();
	}

	public function addCustomCasesAdminColumns(): array {
		return [
			'cb'       => 'cb',
			'title'    => $this->baseTheme->__( 'Title' ),
			'client'   => $this->baseTheme->__( 'Client' ),
			'industry' => $this->baseTheme->__( 'Industry' ),
			'date'     => $this->baseTheme->__( 'Date' ),
		];
	}

	public function fillCustomCasesAdminColumns( $column, $postId ): void {
		switch ( $column ) {
			case 'client':
				echo get_post_meta( $postId, 'case_client_name', true );
				break;
			case 'industry':
				echo get_post_meta( $postId, 'case_industry', true );
				break;
		}
	}

	private function registerAcfFields(): void {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		$fieldKey = 'case_';

		acf_add_local_field_group( [
			'key'                   => 'group_case_header',
			'title'                 => $this->baseTheme->__( 'Case Header' ),
			'fields'                => [
				[
					'key'   => 'field_' . $fieldKey . 'header_tab',
					'label' => $this->baseTheme->__( 'Header Information' ),
					'name'  => $fieldKey . 'header_tab',
					'type'  => 'accordion',
					'open'  => 1,
				],
				[
					'key'   => 'field_' . $fieldKey . 'subtitle',
					'label' => $this->baseTheme->__( 'Subtitle' ),
					'name'  => $fieldKey . 'subtitle',
					'type'  => 'text',
					'instructions' => $this->baseTheme->__( 'A short subtitle displayed above the title' ),
				],
				[
					'key'   => 'field_' . $fieldKey . 'client_name',
					'label' => $this->baseTheme->__( 'Client Name' ),
					'name'  => $fieldKey . 'client_name',
					'type'  => 'text',
				],
				[
					'key'   => 'field_' . $fieldKey . 'client_logo',
					'label' => $this->baseTheme->__( 'Client Logo' ),
					'name'  => $fieldKey . 'client_logo',
					'type'  => 'image',
					'return_format' => 'array',
					'preview_size'  => 'medium',
				],
				[
					'key'   => 'field_' . $fieldKey . 'industry',
					'label' => $this->baseTheme->__( 'Industry' ),
					'name'  => $fieldKey . 'industry',
					'type'  => 'text',
				],
				[
					'key'   => 'field_' . $fieldKey . 'excerpt',
					'label' => $this->baseTheme->__( 'Short Description' ),
					'name'  => $fieldKey . 'excerpt',
					'type'  => 'textarea',
					'rows'  => 3,
					'instructions' => $this->baseTheme->__( 'Brief description shown in the header and overview cards' ),
				],
				[
					'key'   => 'field_' . $fieldKey . 'banner_image',
					'label' => $this->baseTheme->__( 'Banner Image' ),
					'name'  => $fieldKey . 'banner_image',
					'type'  => 'image',
					'return_format' => 'array',
					'preview_size'  => 'large',
					'instructions' => $this->baseTheme->__( 'Background image for the case detail page header' ),
				],
				[
					'key'   => 'field_' . $fieldKey . 'external_link_url',
					'label' => $this->baseTheme->__( 'External Link URL' ),
					'name'  => $fieldKey . 'external_link_url',
					'type'  => 'url',
					'instructions' => $this->baseTheme->__( 'Link to the live project or external site' ),
				],
				[
					'key'   => 'field_' . $fieldKey . 'external_link_label',
					'label' => $this->baseTheme->__( 'External Link Label' ),
					'name'  => $fieldKey . 'external_link_label',
					'type'  => 'text',
					'default_value' => 'Visit Site',
					'instructions' => $this->baseTheme->__( 'Button text for the external link' ),
				],
				[
					'key'   => 'field_' . $fieldKey . 'stats_tab',
					'label' => $this->baseTheme->__( 'Key Stats' ),
					'name'  => $fieldKey . 'stats_tab',
					'type'  => 'accordion',
				],
				[
					'key'          => 'field_' . $fieldKey . 'stats',
					'label'        => $this->baseTheme->__( 'Statistics' ),
					'name'         => $fieldKey . 'stats',
					'button_label' => $this->baseTheme->__( 'Add Stat' ),
					'type'         => 'repeater',
					'max'          => 4,
					'layout'       => 'table',
					'sub_fields'   => [
						[
							'key'   => 'field_' . $fieldKey . 'stat_value',
							'label' => $this->baseTheme->__( 'Value' ),
							'name'  => $fieldKey . 'stat_value',
							'type'  => 'text',
							'wrapper' => [ 'width' => '30' ],
						],
						[
							'key'   => 'field_' . $fieldKey . 'stat_label',
							'label' => $this->baseTheme->__( 'Label' ),
							'name'  => $fieldKey . 'stat_label',
							'type'  => 'text',
							'wrapper' => [ 'width' => '70' ],
						],
					],
				],
				[
					'key'   => 'field_' . $fieldKey . 'tags_tab',
					'label' => $this->baseTheme->__( 'Tags' ),
					'name'  => $fieldKey . 'tags_tab',
					'type'  => 'accordion',
				],
				[
					'key'          => 'field_' . $fieldKey . 'tags',
					'label'        => $this->baseTheme->__( 'Technology Tags' ),
					'name'         => $fieldKey . 'tags',
					'button_label' => $this->baseTheme->__( 'Add Tag' ),
					'type'         => 'repeater',
					'max'          => 8,
					'layout'       => 'table',
					'sub_fields'   => [
						[
							'key'   => 'field_' . $fieldKey . 'tag_name',
							'label' => $this->baseTheme->__( 'Tag' ),
							'name'  => $fieldKey . 'tag_name',
							'type'  => 'text',
						],
					],
				],
			],
			'location'              => [
				[
					[
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'cases',
					],
				],
			],
			'position'              => 'acf_after_title',
			'style'                 => 'default',
			'label_placement'       => 'top',
			'instruction_placement' => 'label',
			'active'                => true,
		] );
	}
}
