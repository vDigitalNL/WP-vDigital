<?php

add_filter( 'multilingualpress.taxonomy_metaboxes_order', function ( $order ) {
    return 11;
} );
