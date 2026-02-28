<?php

namespace ChildTheme\ChildTheme\Frontend;

use ChildTheme\ChildTheme\AbstractClass;

final class WordPress extends AbstractClass {
    public function init(): void {
        $this->addFilters();
    }

    private function addFilters(): void {
        add_filter( 'wp_headers', function ( $headers ) {
            if ( isset( $headers['X-Pingback'] ) ) {
                unset( $headers['X-Pingback'] );
            }

            return $headers;
        } );
    }
}