<?php

	namespace Theme\BaseTheme\General\AcfFields;

	/**
	 * Class BootstrapJsModulesField
	 *
	 * @package Theme\BaseTheme\General\AcfFields
	 */
	class BootstrapJsModulesField extends AbstractAcfField {

		/**
		 * @var string Multiple words, can include spaces, visible when selecting a field type
		 */
		public $label = 'Bootstrap JavaScript Modules';

		/**
		 * @var string Single word, no spaces. Underscores allowed
		 */
		public $name = 'bootstrap_js_modules';

		/**
		 * Create the HTML interface for your field
		 *
		 * @param array $field
		 *
		 * @return void
		 */
		public function render_field( array $field ): void {
			$baseTheme = baseTheme();

			$input       = array(
				'type'         => 'checkbox',
				'id'           => $field['id'],
				'name'         => $field['name'],
				'value'        => '1',
				'class'        => $field['class'] . ' acf-switch-input',
				'autocomplete' => 'off'
			);
			$hiddenInput = array(
				'name'  => $field['name'],
				'value' => 0
			);
			$switch      = '<span class="acf-switch-on">' . __( 'Yes', 'acf' ) . '</span><span class="acf-switch-off">' . __( 'No', 'acf' ) . '</span><div class="acf-switch-slider"></div>';

			$html = <<<HTML
				<table class="acf-table">
					<thead>
						<tr>
							<th style="width: 120px;">{$baseTheme->__( 'Active' )}</th>
							<th>{$baseTheme->__( 'Name' )}</th>
							<th>{$baseTheme->__( 'Mandatory' )}</th>
						</tr>
					</thead>
					<tbody>
HTML;


			$bootstrapModules = $baseTheme->Frontend->Assets->getCurrentBootstrapJsModules();
			$mandatoryModules = $baseTheme->Frontend->Assets->getMandatoryBootstrapJsModules();

			ksort( $bootstrapModules );

			//Make sure the mandatory modules are at the top
			$bootstrapModules = array_intersect_key( $bootstrapModules, array_flip( $mandatoryModules ) ) + $bootstrapModules;

			foreach ( $bootstrapModules as $bootstrapModule => $activeState ) {
				$isActive    = $activeState;
				$isMandatory = in_array( $bootstrapModule, $mandatoryModules );

				$_hiddenInput = $hiddenInput;
				$_input       = $input;
				$_switch      = '<div class="acf-switch' . ( $isActive ? ' -on' : '' ) . '">' . $switch . '</div>';

				$_inputName = $_input['name'] . "[{$bootstrapModule}]";

				$_hiddenInput['name'] = $_inputName;
				$_input['name']       = $_inputName;
				$_input['id']         .= '_' . $bootstrapModule;

				if ( $isActive ) {
					$_input['checked'] = 'checked';
				}

				if ( $isMandatory ) {
					$_input['disabled'] = true;
				}

				$_hiddenInput = acf_get_hidden_input( $_hiddenInput );
				$_input       = '<input ' . \acf_esc_attrs( $_input ) . '>';
				$_switch      = acf_esc_html( $_switch );

				$html .= <<<HTML
<tr class="acf-row">
	<td class="acf-field acf-field-true-false" data-type="true_false" data-key="{$_inputName}">
		<div class="acf-input">
			<div class="acf-true-false">
				{$_hiddenInput}
				<label>
					{$_input}
					{$_switch}
				</label>
			</div>
		</div>
	</td>
	<td>{$bootstrapModule}</td>
	<td>{$baseTheme->__( $isMandatory ? 'Yes' : 'No' )}</td>
</tr>
HTML;
			}


			$html .= <<<HTML
	</tbody>
</table>
HTML;

			print $html;
		}

		/**
		 * Create extra settings for your field. These are visible when editing a field
		 *
		 * @param $field array the $field being edited
		 *
		 * @return void
		 */
		public function render_field_settings( array $field ): void {
		}

		/**
		 * This filter is applied to the $value before it is saved in the db
		 *
		 * @param mixed $value   The value found in the database
		 * @param mixed $post_id The $post_id from which the value was loaded
		 * @param array $field   The field array holding all the field options
		 *
		 * @return mixed
		 */
		public function update_value( $value, $post_id, array $field ) {
			if ( ! is_array( $value ) ) {
				throw new \InvalidArgumentException( 'Parameter $value should be an array, ' . gettype( $value ) . ' given instead.' );
			}

			$value = array_map('boolval', $value);

			// Store the JS modules
			baseTheme()->Frontend->Assets->storeCurrentBootstrapJsModules( $value );

			// Return NULL so that no values are stored in the database
			return null;
		}
	}