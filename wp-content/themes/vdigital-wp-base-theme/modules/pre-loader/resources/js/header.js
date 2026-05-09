import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const DEFAULTS = {
	bodySelector            : 'body',
	preloaderSelector       : '.loader',
	preloaderElement        : '.loader__element',
	preloaderFadeOut        : 'slow',
	preloaderBgFadeoutDelay : '350',
	version                 : 0.1
};
const PluginName = 'preloader';

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Preloader {
	constructor( options ) {
		this._options = $.extend( true, {}, DEFAULTS, options || {} );
	}

	// Public

	getOptions() { return this._options; }

	init() {
		$( this._options.preloaderElement ).fadeOut(); // will first fade out the loading animation
		$( this._options.preloaderSelector ).delay( 350 ).fadeOut( this._options.preloaderFadeOut ); // will fade out the DIV that covers the website.
		$( this._options.bodySelector ).delay( 350 ).css( {'overflow' : 'visible'} );
	}
}

export {Preloader as Plugin, PluginName};
theme.registerPlugin(Preloader.PluginName, Preloader.Plugin);