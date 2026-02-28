<?php
$fieldKey     = 'references_';
$categories   = get_terms([
	'taxonomy'   => 'ww_customer_reviews_categories',
]);
$choices = [ null => baseTheme()->__( 'Select'), 'all' => baseTheme()->__( 'All categories' ) ];

foreach ( $categories as $category ) {
	$choices[ $category->term_id ] = $category->name;
}

acf_add_local_field_group([
    'key'      => 'group_references',
    'title'    => 'Reviews',
    'fields'   => [
        [
            'key'      => 'field_' . $fieldKey . 'title',
            'label'    => baseTheme()->__( 'Title' ),
            'name'     => $fieldKey . 'title',
            'type'     => 'text',
            'required' => 1,
        ],
	    [
		    'key'      => 'field_' . $fieldKey . 'category',
		    'label'    => baseTheme()->__( 'Reviews' ),
		    'name'     => $fieldKey . 'category',
		    'type'     => 'select',
		    'ui'       => 1,
		    'required' => 1,
		    'choices'  => $choices,
            'default_value' => 'all',
	    ],
        [
            'key'      => 'field_' . $fieldKey . 'link_to_overview',
            'label'    => baseTheme()->__( 'Link to overview' ),
            'name'     => $fieldKey . 'link_to',
            'type'     => 'url',
            'default_value' => '',
            'required' => 1,
        ],
    ],
    'location' => [
        [
            [
                'param'    => 'block',
                'operator' => '==',
                'value'    => 'acf/references',
            ],
        ],
    ],
    'active'   => true,
]);

add_filter('acf/validate_value/name=' . $fieldKey . 'category', function ( $valid, $value, $field, $input ) {
	if ( ! $valid ) {
		return baseTheme()->__( 'Selecting a review category is required.' );
	}

	return $valid;
}, 10, 4);