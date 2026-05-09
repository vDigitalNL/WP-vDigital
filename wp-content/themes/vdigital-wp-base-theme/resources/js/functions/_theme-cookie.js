/**
 * @param {string} name
 *
 * @returns {string}
 */
function getCookie( name ) {
	name = name + '=';

	let ca = document.cookie.split( ';' );

	for ( var i = 0; i < ca.length; i++ ) {
		let c = ca[i].trim();

		if ( c.indexOf( name ) === 0 ) {
			return c.substring( name.length, c.length );
		}
	}

	return '';
}

/**
 * @param {string} name
 * @param {mixed} value
 * @param {int} expiresInHours
 * @param {string} path
 */
function writeCookie( name, value, expiresInHours, path ) {
	let endDate = new Date();

	endDate.setHours( endDate.getHours() + expiresInHours );
	endDate.toUTCString();

	document.cookie = name + '=' + value + ';expires=' + endDate + ';path=' + path;
}