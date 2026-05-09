import 'slick-carousel';


$ = jQuery;

const WooCommerceProductCarousel = {
	toggleSlick: function () {
		let $wooCommerceProductCarousel = $( '.woocommerce-product-carousel' );

		if ( $wooCommerceProductCarousel.length ) {
			let $wooCommerceProductCarouselAmount = 4;

			// @ToDo: Are there bootstrap javascript variables for screen sizes.
			// @ToDo: Use bootstrap breakpoints.
			// @ToDo: Prefix the 'amount-xxx' names.
			if ( $( document ).width() < 992 && $( document ).width() > 767 ) {
				if ( $wooCommerceProductCarousel.data( 'amount-tablet' ) ) {
					$wooCommerceProductCarouselAmount = $wooCommerceProductCarousel.data(
						'amount-tablet' );
				}
			} else if ( $( document ).width() < 768 ) {
				if ( $wooCommerceProductCarousel.data( 'amount-mobile' ) ) {
					$wooCommerceProductCarouselAmount = $wooCommerceProductCarousel.data(
						'amount-mobile' );
				}
			} else {
				if ( $wooCommerceProductCarousel.data( 'amount-desktop' ) ) {
					$wooCommerceProductCarouselAmount = $wooCommerceProductCarousel.data(
						'amount-desktop' );
				}
			}

			$.each(
				$wooCommerceProductCarousel.find( '> .row.slick-slider' ),
				function ( index, data ) {
					$( data ).slick( {
										 arrows: true,
										 prevArrow: '<div class="prev-arrow"></div>',
										 nextArrow: '<div class="next-arrow"></div>',
										 infinite: false,
										 slidesToShow: $wooCommerceProductCarouselAmount,
										 slidesToScroll: 1
									 } );
				}
			);
		}
	}
};

$( document ).on( 'ready', function () {
	WooCommerceProductCarousel.toggleSlick();
} );
