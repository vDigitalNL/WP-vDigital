/**
 * @param {mixed} value
 *
 * @returns {boolean}
 */
function empty( value ) {
	let undefined, k, i, l, eV = [undefined, null, false, 'false', 0, '', '0'];

	for ( i = 0, l = eV.length; i < l; i++ ) {
		if ( value === eV[i] ) {
			return true;
		}
	}
	return typeof value === 'object' && !Object.size( value );
}

/**
 *
 * @param {object} callbackObject
 */
function executeCallbackFromObject( callbackObject ) {
	if ( !empty( callbackObject['function'] ) ) {
		callbackObject = {0 : callbackObject};
	}

	$.each( callbackObject, function( index, child ) {
		if ( isObject( child ) && !empty( child['function'] ) ) {
			if ( isFunction( child.function ) ) {
				child.function = window[child.function];
				if ( !empty( child['arguments'] ) ) {
					if ( isObject( child.arguments ) && !empty( child['_as_array'] ) ) {
						child.function.apply( null, child.arguments );
					} else {
						child.function.call( null, child.arguments );
					}
				} else {
					child.function.call();
				}
			} else {
				try {
					let func = !empty( child['arguments'] ) ? new Function( child.arguments, child.function ) : new Function( child.function );
					func();
				} catch ( e ) {
				}
			}
		}
	} );
}

/**
 * @param {string} fallbackUri
 */
function historyBackWFallback( fallbackUri ) {
	fallbackUri = fallbackUri || '/';

	let prev = window.location.href;

	if ( isFunction( window.history.go ) ) {
		window.history.go( -1 );
	} else {
		window.location.href = fallbackUri;
	}

	setTimeout( function() {
		if ( window.location.href === prev ) {
			window.location.href = fallbackUri;
		}
	}, 500 );
}

/**
 * @param {function|string} func
 *
 * @returns {boolean}
 */
function isFunction( func ) { return !!(window[func] && window[func].constructor && window[func].call && window[func].apply) || isFunctionNative( func ); }

/**
 * @param {function} func
 *
 * @returns {boolean}
 */
function isFunctionNative( func ) { return !!(func && func.constructor && func.call && func.apply); }

/**
 * @returns {boolean}
 */
function isMobile() { return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent )); }

/**
 * @param {number} number
 *
 * @returns {boolean}
 */
function isNumeric( number ) { return parseFloat( number ) === number && isFinite( number ); }

/**
 * @param {object} object
 *
 * @returns {boolean}
 */
function isObject( object ) { return typeof object === 'object'; }

/**
 * @returns {boolean}
 */
function isTouchDevice() { return ('ontouchstart' in window || 'onmsgesturechange' in window); }

/**
 * @param {string} uri
 */
function loadPage( uri ) { window.location.href = uri; }

/**
 * @param {object} object1
 * @param {object} object2
 *
 * @returns {boolean}
 */
function objectsMatchSimple( object1, object2 ) {
	return typeof object1 !== 'object' || typeof object2 !== 'object' ? false : JSON.stringify( object1 ) === JSON.stringify( object2 );
}

/**
 * @param {int} timeOut
 */
function reloadPage( timeOut ) {
	timeOut = parseInt( timeOut || 0 );

	if ( timeOut ) {
		setTimeout( reloadPage, timeOut );
	} else {
		window.location.reload();
	}
}

/**
 * @param {string} selector1
 * @param {string} selector2
 *
 * @returns {number}
 */
function sortElementsAsc( selector1, selector2 ) { return (jQuery( selector2 ).text().toLowerCase() < jQuery( selector1 ).text().toLowerCase() ? 1 : -1); }

/**
 * @param {string} selector1
 * @param {string} selector2
 *
 * @returns {number}
 */
function sortElementsDesc( selector1, selector2 ) { return (jQuery( selector2 ).text().toLowerCase() > jQuery( selector1 ).text().toLowerCase() ? 1 : -1); }

/**
 * @returns {boolean}
 */
function supportsHistoryApi() { return !!(window.history && history.pushState); }