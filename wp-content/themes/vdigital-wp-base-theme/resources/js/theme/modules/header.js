import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const DEFAULTS = {headerSelector : 'header[role=banner]', stickyClass : 'sticky-header', stickyClassActive : 'is-sticky', use_sticky : true, version : 0.1};
const PluginName = 'header';

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Header {
	constructor( options ) {
		this._options = $.extend( true, {}, DEFAULTS, options || {} );
	}

	// Public

	activate() {
		if ( this._useStickyHeader && this._header.length ) {
			this._header.addClass( this._options.stickyClass );
		}
	}

	control() {
		if ( this._useStickyHeader && this._header.length ) {
			if ( $( window ).scrollTop() ) {
				this._header.addClass( this._options.stickyClassActive );
			} else {
				this._header.removeClass( this._options.stickyClassActive );
			}
		}
	}

	deactivate() {
		if ( this._useStickyHeader && this._header.length ) {
			this._header.removeClass( this._options.stickyClass );
		}
	}

	getOptions() { return this._options; }

	init() {
		this._header = $( this._options.headerSelector );
		this._useStickyHeader = (this._options.use_sticky || false) === true;

		if ( this._useStickyHeader && this._header.length ) {
			this._header.addClass( this._options.stickyClass );
			this.control();

			$( window ).on( 'scroll', this.control );
		}
	}
}

export {Header as Plugin, PluginName};