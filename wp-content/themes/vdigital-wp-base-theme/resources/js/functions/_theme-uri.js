/**
 * @param {string} name
 *
 * @returns {string | null}
 */
function getURLParameter( name ) {
	return decodeURIComponent( (new RegExp( '[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)' ).exec( location.hash ) || [null, ''])[1].replace( /\+/g, '%20' ) ) || null;
}

/**
 * @param {string} uri
 * @param {string} param
 * @param {*} fallback
 * @returns {*}
 */
function extractParamFromUri( uri, param, fallback ) {
	fallback = fallback || '';
	uri = !empty( uri ) ? uri : window.location.href;

	let regex = new RegExp( '[\\?&#]' + param + '=([^&#]*)' ), params = regex.exec( uri );

	if ( params != null ) {
		return decodeURIComponent( params[1] ).replace( /\+/g, ' ' );
	}
	return fallback;
}