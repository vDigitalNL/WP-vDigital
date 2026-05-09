import $ from 'jquery';

const BaseTheme = (( $ ) => {
	/**
	 * ------------------------------------------------------------------------
	 * Constants
	 * ------------------------------------------------------------------------
	 */

	const DEFAULTS = {version : 0.1};

	/**
	 * ------------------------------------------------------------------------
	 * Class Definition
	 * ------------------------------------------------------------------------
	 */

	class BaseTheme {
		constructor( options ) {
			let _self = this;

			_self._pluginQueue = [];
			_self._plugins = {};
			_self._options = $.extend( true, {}, options || {}, DEFAULTS );

			$( document ).ready( function() {
				_self.init();
			} );
		}

		// Public

		getOption( option ) {
			let options = this._options, undefined;

			for ( let arg in arguments ) {
				if ( arguments.hasOwnProperty( arg ) && typeof options[arguments[arg]] !== 'undefined' ) {
					options = options[arguments[arg]];
				} else {
					return undefined;
				}
			}

			return typeof option !== 'undefined' ? options : undefined;
		}

		getOptions() { return this._options; };

		getPlugin( id ) {
			if ( !this.hasPlugin( id ) ) {
				throw new Error( 'An plugin with id ' + id + ' does not exist' )
			}

			return this._plugins[id];
		}

		hasPlugin( id ) { return typeof this._plugins[id] !== 'undefined'; }

		init() {
			/*
			 * Initialize plugins
			 */
			for ( let plugin in this._pluginQueue ) {
				let id = this._pluginQueue[plugin];

				if ( typeof this._plugins[id] !== 'undefined' ) {
					let plugin = this._plugins[id];

					if ( !empty( plugin.getOptions ) && isFunction( plugin.getOptions ) ) {
						let pluginOptions = {};

						pluginOptions[id] = plugin.getOptions();

						$.extend( true, this._options, pluginOptions );
					}

					plugin.init.call( plugin );
				}
			}
		}

		queuePlugin( id ) {
			this._pluginQueue.push( id );
		}

		registerPlugin( id, plugin ) {
			if ( typeof this._plugins[id] === 'undefined' ) {
				if ( !isFunction( plugin ) || !isObject( plugin = new plugin() ) ) {
					throw new TypeError( 'The passed plugin argument for plugin ' + id + ' is invalid' );
				} else if ( empty( plugin.init ) || !isFunction( plugin.init ) ) {
					throw new Error( 'Add-on ' + id + ' is missing the "init" function' );
				} else {
					this._plugins[id] = plugin;
				}

				return this._plugins[id];
			} else {
				throw new Error( 'An plugin with id ' + id + ' already exists' );
			}
		}

		unregisterPlugin( id ) {
			if ( typeof this._plugins[id] !== 'undefined' ) {
				try {
					delete this._plugins[id];

					return true;
				} catch ( e ) { }
			}

			return false;
		}
	}

	return BaseTheme;
})( $ );

export default BaseTheme;