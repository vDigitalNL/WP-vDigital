import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const DEFAULTS = {headerSelector : 'nav.navbar', secondaryNavigationSelector : '.c-navbar__second', belowNavHeroContentSelector : '.sub-nav-hero', version : 0.1};
const PluginName = 'navbar-auto-hiding';

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class NavbarAutoHiding {
	constructor( options ) {
		this._options = $.extend( true, {}, DEFAULTS, options || {} );

		this._scrolling = false;
		this._previousTop = 0;
		this._currentTop = 0;
		this._scrollDelta = 10;
		this._scrollOffset = 150;

		this._mainHeader = {};
		this._secondaryNavigation = {};
		this._headerHeight = 0;

		//this applies only if secondary nav is below intro section
		this._belowNavHeroContent = {};
	}

	// Public

	autoHideHeader() {
		let currentTop = $( window ).scrollTop();

		this._belowNavHeroContent.length > 0 ? this.checkStickyNavigation( currentTop ) // secondary navigation below intro
		                                     : this.checkSimpleNavigation( currentTop );

		this._previousTop = currentTop;
		this._scrolling = false;
	}

	checkSimpleNavigation( currentTop ) {
		//there's no secondary nav or secondary nav is below primary nav
		if ( this._previousTop - currentTop > this._scrollDelta ) {
			//if scrolling up...
			this._mainHeader.removeClass( 'is-hidden' );
		} else if ( currentTop - this._previousTop > this._scrollDelta && currentTop > this._scrollOffset ) {
			//if scrolling down...
			this._mainHeader.addClass( 'is-hidden' );
		}
	}

	checkStickyNavigation( currentTop ) {
		//secondary nav below intro section - sticky secondary nav
		let secondaryNavOffsetTop = this._belowNavHeroContent.offset().top - this._secondaryNavigation.height() - this._mainHeader.height();

		if ( this._previousTop >= currentTop ) {
			//if scrolling up...
			if ( currentTop < secondaryNavOffsetTop ) {
				//secondary nav is not fixed
				this._mainHeader.removeClass( 'is-hidden' );
				this._secondaryNavigation.removeClass( 'fixed slide-up' );
				this._belowNavHeroContent.removeClass( 'secondary-nav-fixed' );
			} else if ( this._previousTop - currentTop > this._scrollDelta ) {
				//secondary nav is fixed
				this._mainHeader.removeClass( 'is-hidden' );
				this._secondaryNavigation.removeClass( 'slide-up' ).addClass( 'fixed' );
				this._belowNavHeroContent.addClass( 'secondary-nav-fixed' );
			}
		} else {
			//if scrolling down...
			if ( currentTop > secondaryNavOffsetTop + this._scrollOffset ) {
				//hide primary nav
				this._mainHeader.addClass( 'is-hidden' );
				this._secondaryNavigation.addClass( 'fixed slide-up' );
				this._belowNavHeroContent.addClass( 'secondary-nav-fixed' );
			} else if ( currentTop > secondaryNavOffsetTop ) {
				//once the secondary nav is fixed, do not hide primary nav if you haven't scrolled more than scrollOffset
				this._mainHeader.removeClass( 'is-hidden' );
				this._secondaryNavigation.addClass( 'fixed' ).removeClass( 'slide-up' );
				this._belowNavHeroContent.addClass( 'secondary-nav-fixed' );
			}
		}
	}

	onWindowResize() {
		this._headerHeight = this._mainHeader.outerHeight( true ); }

	onWindowScroll() {
		if ( !this._scrolling ) {
			this._scrolling = true;

			if ( !empty( window['requestAnimationFrame'] ) ) {
				setTimeout( this.autoHideHeader, 250 );
			} else {
				requestAnimationFrame( this.autoHideHeader );
			}
		}
	}

	getOptions() { return this._options; }

	init() {
		this._mainHeader = $( this._options.headerSelector );
		this._secondaryNavigation = $( this._options.secondaryNavigationSelector );
		this._headerHeight = this._mainHeader.outerHeight( true );

		//this applies only if secondary nav is below intro section
		this._belowNavHeroContent = $( this._options.belowNavHeroContentSelector );

		$( window ).on( 'resize', this.onWindowResize.bind(this) );
		$( window ).on( 'scroll', this.onWindowScroll.bind(this) );
	}
}

export {NavbarAutoHiding as Plugin, PluginName};