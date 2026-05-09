<?php

	namespace Theme\BaseTheme\General\AcfFields;

	/**
	 * Class CodeField
	 *
	 * @package Theme\BaseTheme\General\AcfFields
	 */

	class CodeField extends AbstractAcfField {
		/**
		 * @var string Multiple words, can include spaces, visible when selecting a field type
		 */
		public $label = 'ACF code field';
		/**
		 * @var string Single word, no spaces. Underscores allowed
		 */
		public $name = 'acf_code_field';

		public $defaults = array(
			'mode'  => 'javascript',
			'theme' => 'monokai',
		);

		/**
		 * Create the HTML interface for your field
		 *
		 * @param array $field
		 *
		 * @return void
		 */
		public function render_field( array $field ): void {
			// vars
			$o = array( 'id', 'class', 'name', 'placeholder', 'mode', 'theme' );
			$e = '';

			// Populate atts.
			$atts = array();
			foreach ( $o as $k ) {
				$atts[ $k ] = $field[ $k ];
			}

			$atts['theme'] = 'monokai';
			$atts['class'] = 'acf-code-field-box';

			$e .= '<textarea ' . \acf_esc_attrs( $atts ) . '>';
			$e .= esc_textarea( stripslashes( $field['value'] ) );
			$e .= '</textarea>';


			print $e;

			wp_enqueue_style( "codemirror-curr-style-{$atts['theme']}", baseTheme()->themeRootUri() . "/assets/css/admin/acf-fields/{$atts['theme']}.css" );
		}

		/**
		 * Create extra settings for your field. These are visible when editing a field
		 *
		 * @param $field array the $field being edited
		 *
		 * @return void
		 */
		public function render_field_settings( array $field ): void {

			// Default_value.
			acf_render_field_setting( $field, array(
				'label'        => baseTheme()->__( 'Default Value' ),
				'instructions' => baseTheme()->__( 'Appears when creating a new post' ),
				'type'         => 'textarea',
				'class'        => 'acf-code-field-box',
				'name'         => 'default_value',
			) );

			// Placeholder.
			acf_render_field_setting( $field, array(
				'label'        => baseTheme()->__( 'Placeholder Text' ),
				'instructions' => baseTheme()->__( 'Appears within the input'),
				'type'         => 'text',
				'name'         => 'placeholder',
			) );

			acf_render_field_setting( $field, array(
				'label'        => baseTheme()->__( 'Editor mode' ),
				'instructions' => baseTheme()->__( '' ),
				'type'         => 'select',
				'name'         => 'mode',
				'choices'      => array(
					'htmlmixed'               => baseTheme()->__( 'HTML Mixed' ),
					'javascript'              => baseTheme()->__( 'JavaScript' ),
					'text/html'               => baseTheme()->__( 'HTML' ),
					'css'                     => baseTheme()->__( 'CSS' ),
				),
			) );
		}

		public function input_admin_enqueue_scripts() : void {

			if ( version_compare( $GLOBALS['wp_version'], '4.9', '>=' ) ) {
				wp_enqueue_script( 'wp-codemirror' );
				wp_enqueue_style( 'wp-codemirror' );
				wp_enqueue_script( 'csslint' );
				wp_enqueue_script( 'jshint' );
				wp_enqueue_script( 'jsonlint' );
				wp_enqueue_script( 'htmlhint' );
				wp_enqueue_script( 'htmlhint-kses' );

				//Alias wp.CodeMirror to CodeMirror
				wp_add_inline_script( 'wp-codemirror', 'window.CodeMirror = wp.CodeMirror;' );
			}

			// AcfCodeField.js
			wp_enqueue_script( 'acf-input-code-field-input', baseTheme()->themeRootUri() . "/assets/js/admin/acf-fields/AcfCodeField.js", array( 'wp-codemirror' ) );

			// Codemirror modes.
			wp_enqueue_script( 'acf-input-code-field-codemirror-css', baseTheme()->themeRootUri() . "/assets/js/admin/acf-fields/css.js" );
			wp_enqueue_script( 'acf-input-code-field-codemirror-js', baseTheme()->themeRootUri() . "/assets/js/admin/acf-fields/javascript.js" );
			wp_enqueue_script( 'acf-input-code-field-codemirror-htmlmixed', baseTheme()->themeRootUri() . "/assets/js/admin/acf-fields/htmlmixed.js" );
		}
	}