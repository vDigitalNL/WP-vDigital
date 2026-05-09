import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const DEFAULTS = {collapseClass : 'top-nav-collapse', collapseOffset : 50, navbarSelector : '.c-navbar--scrollcollapse', version : 0.1};
const PluginName = 'navbar-scroll-collapse';

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class NavbarScrollCollapse {
	constructor( options ) {
		this._options = $.extend( true, {}, DEFAULTS, options || {} );
	}

	// Public

	collapseNavbar() {
		let $navbar = $( this._options.navbarSelector );

		if ( !$navbar.length ) {
			return;
		}

		if ( $navbar.offset().top > this._options.collapseOffset ) {
			$navbar.addClass( this._options.collapseClass );
		} else {
			$navbar.removeClass( this._options.collapseClass );
		}
	}

	getOptions() { return this._options; }

	init() {
		$( window ).on( 'resize', this.collapseNavbar.bind(this) );
		$( window ).on( 'scroll', this.collapseNavbar.bind(this) );
		$( document ).ready( this.collapseNavbar.bind(this) );
	}
}

export {NavbarScrollCollapse as Plugin, PluginName};