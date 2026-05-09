import 'slick-carousel';


$ = jQuery;

const logoCarousel = {
	toggleSlick: function () {
		let $logoCarousel = $( '.logo-carousel' );

		if ( $logoCarousel.length ) {
			let $logoCarouselAmount = 4;

			if ( $( document ).width() < 992 && $( document ).width() > 767 ) {
				if ( $logoCarousel.data( 'amount-tablet' ) ) {
					$logoCarouselAmount = $logoCarousel.data( 'amount-tablet' );
				}
			} else if ( $( document ).width() < 768 ) {
				if ( $logoCarousel.data( 'amount-mobile' ) ) {
					$logoCarouselAmount = $logoCarousel.data( 'amount-mobile' );
				}
			} else {
				if ( $logoCarousel.data( 'amount-desktop' ) ) {
					$logoCarouselAmount = $logoCarousel.data( 'amount-desktop' );
				}
			}

			$.each( $logoCarousel.find( '> .row.slick-slider' ), function ( index, data ) {
				$( data ).slick( {
									 arrows: true,
									 prevArrow: '<div class="prev-arrow"></div>',
									 nextArrow: '<div class="next-arrow"></div>',
									 infinite: false,
									 slidesToShow: $logoCarouselAmount,
									 slidesToScroll: 1
								 } );
			} );
		}
	}
};

$( document ).on( 'ready', function () {
	logoCarousel.toggleSlick();
} );
