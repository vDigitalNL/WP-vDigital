import 'slick-carousel';

$ = jQuery;

const ProductGalleryNav = {
	toggleSlick : function() {
		let $ProductGalleryNav = $( '.woocommerce-product-gallery .flex-control-nav' );

		if ( $ProductGalleryNav.length ) {
			let $ProductGalleryNavAmount = 4;

			if ( $( document ).width() < 992 && $( document ).width() > 767 ) {
				$ProductGalleryNavAmount = 3;
			} else if ( $( document ).width() < 768 ) {
				$ProductGalleryNavAmount = 2;
			}

			$.each( $ProductGalleryNav, function( index, data ) {
				$( data ).slick( {
					arrows         : true,
					prevArrow      : '<div class="prev-arrow"></div>',
					nextArrow      : '<div class="next-arrow"></div>',
					infinite       : false,
					slidesToShow   : $ProductGalleryNavAmount,
					slidesToScroll : 1,
					touch          : false,
					swipe          : false,
					draggable      : false,
					touchMove      : false
				} );
			} );
		}
	},

	toggleFirstCurrent : function() {
		let $ProductGalleryNav = $( '.woocommerce-product-gallery .flex-control-nav' );

		if ( $ProductGalleryNav.length ) {
			$ProductGalleryNav.find( '.slick-slide' ).first().addClass( 'woocommerce-product-gallery-current' );
		}
	}
};

const ArchiveProductFilters = {
	toggleCorrectPosition : function() {
		let $ArchiveProductFiltersEl = $( '.woocommerce_essentials__archive_filters' );

		if ( $ArchiveProductFiltersEl.length ) {
			let $SiteContent = $( '#site-content' ), $ProductsList = $( '#main ul.products' );

			if ( $SiteContent.length && $ProductsList.length ) {
				let $MarginTop = $ProductsList.offset().top - $SiteContent.offset().top, $MarginTopAddition = 40;

				if ( typeof $MarginTop !== 'undefined' && $MarginTop > 0 ) {
					$ArchiveProductFiltersEl.css( 'margin-top', ($MarginTop + $MarginTopAddition) + 'px' );
				}
			}
		}
	},

	removeMarginTop : function( element ) {
		if ( element.length ) {
			element.css( 'margin-top', '' );
		}
	},

	toggleFilterClosedState : function( clicked ) {
		let $clickedTarget = $( clicked ).prop( 'nodeName' ) === 'ul' ? $( clicked ) : $( clicked ).find( '+ ul, > ul' );

		if ( $( $clickedTarget ).length ) {
			$( clicked ).toggleClass( 'closed' );
			$clickedTarget.toggleClass( 'closed' );
		}
	},

	applyFilterUlHeight : function() {
		let $expandableLists = $( '.height-expandable + ul, .height-expandable > ul' );

		if ( $expandableLists.length ) {
			$.each( $expandableLists, function() {
				let $thisUl = $( this );

				$thisUl.css( 'height', '' );
				$thisUl.css( 'height', $( this ).height() + 'px' );

				if ( $thisUl.hasClass( 'initialize-closed' ) && !$thisUl.hasClass( 'open' ) ) {
					ArchiveProductFilters.addClassWithDelay( $thisUl, 'closed', 10 );
				}
			} );
		}
	},

	addClassWithDelay : function( element, elementClass, elementDelay ) {
		if ( element.length ) {
			setTimeout( function() {
				element.addClass( elementClass );
			}, elementDelay );
		}
	},

	applyClosedParent : function() {
		let $parents = $( '.height-expandable.initialize-closed' );

		if ( window.innerWidth >= 1200 && $parents.length ) {
			$.each( $parents, function( index, data ) {
				if ( !$( data ).hasClass( 'open' ) ) {
					$( data ).addClass( 'closed' );
				}
			} );
		}
	},

	removeFilterUlHeight : function() {
		let $expandableLists = $( '.height-expandable + ul, .height-expandable > ul' );

		if ( $expandableLists.length ) {
			$.each( $expandableLists, function() {
				$( this ).css( 'height', '' );
			} );
		}
	},

	removeFilterUlClosedClass : function() {
		let $expandableLists = $( '.height-expandable + ul, .height-expandable > ul' );

		if ( $expandableLists.length ) {
			$.each( $expandableLists, function() {
				$( this ).removeClass( 'closed' );
			} );
		}
	},

	repositionArchiveFilterSmallerDevices : function() {
		let $wooCommerceFilters = $( '.woocommerce_essentials__archive_filters' ), $originalPosition = $( 'header.woocommerce-products-header' ).closest( '.row' ),
			$mobilePosition = $( '#primary ul.products' );

		if ( $wooCommerceFilters.length && $originalPosition.length && $mobilePosition.length ) {
			if ( window.innerWidth < 1200 ) {
				if ( $originalPosition.find( '> .woocommerce_essentials__archive_filters' ).length ) {
					$mobilePosition.before( $wooCommerceFilters );
					$wooCommerceFilters.addClass( 'is-mobile' ).removeClass( 'open' );
					ArchiveProductFilters.removeFilterUlClosedClass();
					ArchiveProductFilters.removeMarginTop( $wooCommerceFilters );
					ArchiveProductFilters.removeFilterUlHeight();
				}
			} else {
				if ( $wooCommerceFilters.hasClass( 'is-mobile' ) ) {
					ArchiveProductFilters.removeFilterUlHeight();
					ArchiveProductFilters.removeFilterUlClosedClass();
					$wooCommerceFilters.prependTo( $originalPosition ).removeClass( 'is-mobile' );

					ArchiveProductFilters.toggleCorrectPosition();
					ArchiveProductFilters.applyFilterUlHeight();
				}
			}
		}
	},

	toggleMobileFilters : function() {
		let $wooCommerceFilters = $( '.woocommerce_essentials__archive_filters' );

		$wooCommerceFilters.toggleClass( 'open' );

		if ( $wooCommerceFilters.hasClass( 'open' ) ) {
			ArchiveProductFilters.applyFilterUlHeight();
		}
	}
}

const ProductVariations = {
	determineFromPriceState : function() {
		let $VariationOptions = $( 'form.variations_form table.variations select[data-attribute_name^="attribute_"]' ), $emptyOptionCount = 0,
			$VariationFromPrice = $( '.woocommerce-product-from-price' );

		if ( $VariationOptions.length && $VariationFromPrice.length ) {
			$.each( $VariationOptions, function() {
				if ( $( this ).val() === '' ) {
					$emptyOptionCount++;
				}
			} );

			if ( $emptyOptionCount === 0 ) {
				$VariationFromPrice.addClass( 'd-none' );
			} else {
				$VariationFromPrice.removeClass( 'd-none' );
			}
		}
	},
}

const CartForm = {
	triggerUpdateCart : function() {
		let $CartUpdateButton = $( '.woocommerce-cart-form button[name="update_cart"]' );

		if ( $CartUpdateButton.length ) {
			$CartUpdateButton.prop( 'disabled', false ).trigger( 'click' );
		}
	}
}

$( document ).on( 'ready', function() {
	ProductGalleryNav.toggleSlick();

	ProductGalleryNav.toggleFirstCurrent();

	ArchiveProductFilters.toggleCorrectPosition();

	ArchiveProductFilters.applyClosedParent();

	if ( window.innerWidth >= 1200 ) {
		ArchiveProductFilters.applyFilterUlHeight();
	}

	ArchiveProductFilters.repositionArchiveFilterSmallerDevices();

} ).on( 'click touchstart', '.woocommerce-product-gallery .slick-slide', function( event ) {
	event.preventDefault();

	let $ProductGalleryNavSlides = $( '.woocommerce-product-gallery .slick-slide' );

	$ProductGalleryNavSlides.removeClass( 'woocommerce-product-gallery-current' );

	$( this ).addClass( 'woocommerce-product-gallery-current' );

} ).on( 'click', '.height-expandable', function( event ) {
	if ( $( event.target ).parent().hasClass( 'prevent-default' ) ) {
		event.preventDefault();
	}

	ArchiveProductFilters.toggleFilterClosedState( $( this ) );

} ).on( 'click', '.woocommerce-toggle-filters button', function() {
	if ( $( '.woocommerce_essentials__archive_filters.is-mobile.open' ).length ) {
		ArchiveProductFilters.removeFilterUlHeight();
		ArchiveProductFilters.removeFilterUlClosedClass();
	}

	ArchiveProductFilters.toggleMobileFilters();

} ).on( 'woocommerce_variation_select_change', 'form.variations_form', function() {
	ProductVariations.determineFromPriceState();

} ).on( 'click', '.woocommerce-product-gallery__image', function( event ) {
	event.preventDefault();
} );

$( document ).ajaxComplete( function( event, xhr, settings ) {
	if ( typeof settings.url != 'undefined' ) {
		switch ( settings.url ) {
			case '/?wc-ajax=add_to_cart':
				CartForm.triggerUpdateCart();

				break;
		}
	}
} );

$( window ).on( 'resize', function() {
	ArchiveProductFilters.repositionArchiveFilterSmallerDevices();
} );
