/**
 * @param {string} element
 * @param {boolean} partially
 * @param {number} offset
 *
 * @returns {boolean}
 */
function elementInWindow( element, partially, offset ) {
	partially = partially || false;
	offset = offset || 0;

	let wH = typeof window.innerHeight !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : jQuery( window ).height();

	if ( jQuery( element ).length ) {
		let docViewTop = jQuery( window ).scrollTop(), docViewBottom = docViewTop + wH, eTop = jQuery( element ).offset().top - offset,
			eBottom = eTop + jQuery( element ).outerHeight() + 2 * offset;

		return (partially !== false) ? (eBottom >= docViewTop && eTop <= docViewBottom) : (eBottom <= docViewBottom && eTop >= docViewTop);
	}

	return false;
}

/**
 * @param {string} container
 * @param {string} selector
 * @param {number} extraHeight
 * @param {number} minimumViewportHeight
 * @param {boolean} resetOnMinimumViewportHeightMismatch
 */

/**
 * BOF
 * originally: function setItemsSameHeight( container, selector, extraHeight, minimumViewportHeight = 0, resetOnMinimumViewportHeightMismatch = true ) {
 * JS crashes on IE, default value in parameter is a feature of ES6 and currently not supported by IE
 * Source: https://stackoverflow.com/questions/38429977/expected-js-error-in-ie-after-assigning-a-value-to-a-function-argument
 */
function setItemsSameHeight( container, selector, extraHeight, minimumViewportHeight, resetOnMinimumViewportHeightMismatch ) {
	if (!minimumViewportHeight) minimumViewportHeight = 0;
	if (!resetOnMinimumViewportHeightMismatch) resetOnMinimumViewportHeightMismatch = true;
	/**
	 *  EOF
	 */

	if ( minimumViewportHeight > 0 && jQuery( window ).width() > minimumViewportHeight ) {
		container.each( function() {
			let minimumHeight = 0, elements = jQuery( this ).find( selector );

			elements.css( 'height', '' );
			elements.each( function() {
				let thisHeight = jQuery( this ).outerHeight( true );

				if ( thisHeight > minimumHeight ) {
					minimumHeight = thisHeight;
				}
			} );

			elements.outerHeight( minimumHeight + extraHeight, true );
		} );
	} else if ( resetOnMinimumViewportHeightMismatch !== false ) {
		jquery( selector, container ).css( 'height', '' );
	}
}

/**
 * @param {string} hideSelector
 * @param {string} showSelector
 * @param {number} animationDuration
 * @param {string} effect
 */

/**
 * BOF
 * originally: function toggleElements( hideSelector, showSelector, animationDuration = 0, effect = 'fade' ) {
 * JS crashes on IE, default value in parameter is a feature of ES6 and currently not supported by IE
 * Source: https://stackoverflow.com/questions/38429977/expected-js-error-in-ie-after-assigning-a-value-to-a-function-argument
 */
function toggleElements( hideSelector, showSelector, animationDuration, effect ) {
	if (!animationDuration) animationDuration = 0;
	if (!effect) effect = 'fade';
	/**
	 * EOF
	 *
	 */
	animationDuration
		= parseFloat( animationDuration ) || 0;
	switch ( effect ) {
		case 'slide':
			jQuery( hideSelector ).filter( ':visible' ).slideUp( animationDuration );
			jQuery( showSelector ).not( ':visible' ).slideDown( animationDuration );
			break;
		case 'fade':
		default:
			jQuery( hideSelector ).hide( animationDuration );
			jQuery( showSelector ).show( animationDuration );
	}
}