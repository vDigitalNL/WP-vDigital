$ = jQuery;
/**
 * @type {{init: qtyIncrementer}}
 * Used for the quantity plus and minus button on cart and product pages
 */
const qtyIncrementer = {
	init : function() {
		this.domElements();
		this.events();
	},

	domElements : function() {
		$( '.quantity' ).each( function() {
			let $this = $( this ).find( '.qty' );
			if ( !$( this ).find( '.plus' ).length ) {
				$this.after( '<input type="button" value="+" class="plus">' );
			}
			if ( !$( this ).find( '.minus' ).length ) {
				$this.before( '<input type="button" value="-" class="minus">' );
			}
		} );
	},

	events : function() {
		$( document )
			.on( 'click', '.plus', function() {
				qtyIncrementer.plus( $( this ) );
				qtyIncrementer.update( $( this ) );
			} )
			.on( 'click', '.minus', function() {
				qtyIncrementer.minus( $( this ) );
				qtyIncrementer.update( $( this ) );
			} )
			.on( 'change keyup mouseup', 'input.qty', function() {
				if ( jQuery( this ).val() == '' ) {
					return;
				}
				qtyIncrementer.update( $( this ) );
			} );
		$( document.body ).on( 'updated_cart_totals', function() {
			qtyIncrementer.domElements();
		} );
	},

	update : function( $this ) {
		if ( timeout != undefined ) {
			clearTimeout( timeout );
		}
		let timeout = setTimeout( function() {
			$( '[name="update_cart"]' ).prop( 'disabled', false ).trigger( "click" )
		}, 1000 );

	},

	plus : function( $this ) {
		let $value = $this.parent().find( '.qty' ).attr( 'value' ), $max = $this.parent().find( '.qty' ).attr( 'max' ), $step = $this.parent().find( '.qty' ).attr( 'step' ),
			$newValue = parseInt( $value ) + parseInt( $step );
		if ( $value === $max ) {
			return;
		}
		$this.parent().find( '.qty' ).val( $newValue ).attr( 'value', $newValue );
	},

	minus : function( $this ) {
		let $value = $this.parent().find( '.qty' ).attr( 'value' ), $min = $this.parent().find( '.qty' ).attr( 'min' ), $step = $this.parent().find( '.qty' ).attr( 'step' ),
			$newValue = parseInt( $value ) - parseInt( $step );
		if ( $value === $min ) {
			return;
		}
		$this.parent().find( '.qty' ).val( $newValue ).attr( 'value', $newValue );
	}
};
/**
 * @type {{ init: checkoutStepper }}
 * Used for the checkout page
 */
const checkoutStepper = {
	currentStep : 1,

	init : function() {
		this.events();
	},

	events : function() {
		$( document )
			.on( 'click', '.checkout-process-navigation__next', function( e ) {
				e.preventDefault();
				checkoutStepper.next();
			} )
			.on( 'click', '.checkout-process-navigation__previous', function( e ) {
				e.preventDefault();
				checkoutStepper.previous();
			} );
	},

	next : function() {
		if ( checkoutStepper.currentStep === 4 ) {
			return;
		}
		checkoutStepper.currentStep = parseInt( checkoutStepper.currentStep ) + 1;
		checkoutStepper.updateStatus();
	},

	previous : function() {
		if ( checkoutStepper.currentStep === 1 ) {
			return;
		}
		checkoutStepper.currentStep = parseInt( checkoutStepper.currentStep ) - 1;
		checkoutStepper.updateStatus();
	},

	updateStatus : function() {
		$( '.checkout-process-steps__step' )
			.each( function() {
				$( this ).removeClass( 'active' ).removeClass( 'completed' );
			} )
			.each( function() {
				if ( parseInt( $( this ).attr( 'data-step' ) ) === parseInt( checkoutStepper.currentStep ) ) {
					$( this ).addClass( 'active' ).prevAll().addClass( 'completed' );
				}
			} );
		$( '.checkout-process' )
			.each( function() {
				$( this ).removeClass( 'active' )
			} )
			.each( function() {
				if ( parseInt( $( this ).attr( 'data-process-step' ) ) === parseInt( checkoutStepper.currentStep ) ) {
					$( this ).addClass( 'active' );
				}
			} );
		$( 'form[name=checkout]' ).attr( 'data-checkout-step', checkoutStepper.currentStep );
	}
};

/**
 *
 * @type {{init: miniCart.init, events: miniCart.events}}
 */
const miniCart = {
	init : function() {
		this.events();
	},

	events : function() {
		$( document )
			.on( 'mouseover', '.navbar-cart', function( e ) {
				$( '.navbar-cart__mini-cart' ).addClass( 'active' );
			} )
			.on( 'mouseout', '.navbar-cart', function( e ) {
				$( '.navbar-cart__mini-cart' ).removeClass( 'active' );
			} )
			.on( 'click', '.navbar-cart__mini-cart__close', function( e ) {
				e.preventDefault();
				$( this ).parent().removeClass( 'active' );
			} );
	}
}

const couponClone = {
	init : function() {
		this.events();
	},

	events : function() {
		$( '#coupon_code_clone' ).keyup( function() {
			$( '#coupon_code' ).val( $( '#coupon_code_clone' ).val() );
		} );
		$( document.body )
			.on( 'click', '[name=apply_coupon_clone]', function() {

				$( '[name=apply_coupon]' ).click();

			} ).on( 'click', function() {
			$( this ).parent().toggleClass( 'active' );
		} );
		$( 'label[for=coupon_code_clone]' ).on( 'click', function() {
			$( this ).parent().toggleClass( 'active' );
		} );
	}
}

$( document ).on( 'ready', function() {
	qtyIncrementer.init();
	miniCart.init();
	couponClone.init();
	if ( $( '.woocommerce-checkout' ).length ) {
		checkoutStepper.init();
	}
} ).on( 'change', 'input#order-as-company', function() {
	$( 'p#billing_vat-number_field' ).toggleClass( 'hide' );
	$( 'p#billing_company_field' ).toggleClass( 'hide' );
} );

$( document.body ).on( 'updated_cart_totals', function() {
	couponClone.init();
	checkoutStepper.updateStatus();
} );

$( document.body ).on( 'updated_checkout', function() {
	checkoutStepper.updateStatus();
} );