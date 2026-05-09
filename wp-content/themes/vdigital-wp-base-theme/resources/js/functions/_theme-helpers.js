if ( !Object.keys ) {
	Object.keys = (function() {
		'use strict';
		let hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({toString : null}).propertyIsEnumerable( 'toString' ),
			dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'], dontEnumsLength = dontEnums.length;

		return function( o ) {
			if ( typeof o !== 'object' && (typeof o !== 'function' || o === null) ) {
				throw new TypeError( 'Object.keys called on non-object' );
			}

			let res = [], p, i;

			for ( p in o ) {
				if ( hasOwnProperty.call( o, p ) ) {
					res.push( p );
				}
			}

			if ( hasDontEnumBug ) {
				for ( i = 0; i < dontEnumsLength; i++ ) {
					if ( hasOwnProperty.call( o, dontEnums[i] ) ) {
						res.push( dontEnums[i] );
					}
				}
			}

			return res;
		};
	}());
}

if ( !Object.size ) {
	Object.size = function( obj ) {
		let size = 0, key;

		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				size++;
			}
		}

		return size;
	};
}

if ( !String.prototype.format ) {
	String.prototype.format = function() {
		let args = arguments;

		return this.replace( /{(\d+)}/g, function( match, number ) {
			return typeof args[number] !== 'undefined' ? args[number] : match;
		} );
	};
}

if ( !String.prototype.ltrim ) {
	String.prototype.ltrim = function( c ) {
		c = c || ' ';

		return this.replace( new RegExp( '^' + c + '*' ), '' );
	};
}

if ( !String.prototype.rtrim ) {
	String.prototype.rtrim = function( c ) {
		c = c || ' ';

		return this.replace( new RegExp( c + '*$' ), '' );
	};
}