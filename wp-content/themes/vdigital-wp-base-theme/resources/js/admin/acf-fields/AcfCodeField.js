(function( $ ) {
	$( document ).on( 'ready', function() {
		$.each( $( '.acf-code-field-box' ), function() {

			// initialize
			if ( $( this ).parents( ".acf-clone" ).length > 0 ) {
				return;
			}

			var editor = window.CodeMirror.fromTextArea( $( this )[0], {
				lineNumbers: true,
				fixedGutter: false,
				mode: $( this ).attr( 'mode' ),
				theme: $( this ).attr( 'theme' ),
				extraKeys: { "Ctrl-Space": "autocomplete" },
				matchBrackets: true,
				styleSelectedText: true,
				autoRefresh: true,
				value: document.documentElement.innerHTML,
				viewportMargin: Infinity
			} );

			editor.on('change', function(){
				editor.save();
			});
		} );
	} );
})( jQuery );
