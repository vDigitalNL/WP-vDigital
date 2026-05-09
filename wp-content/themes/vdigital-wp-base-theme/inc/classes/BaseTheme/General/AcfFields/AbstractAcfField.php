<?php

	namespace Theme\BaseTheme\General\AcfFields;

	/**
	 * Class AbstractAcfField
	 *
	 * @package Theme\BaseTheme\General\AcfFields
	 */
	abstract class AbstractAcfField extends \acf_field {

		/**
		 * @var string Possible values: basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME
		 */
		public $category = 'theme';

		/**
		 * @var array Array of default settings which are merged into the field object. These are used later in settings
		 */
		public $defaults = [];

		/**
		 * @var array Array of strings that are used in JavaScript. This allows JS strings to be translated in PHP and loaded via: var message = acf._e('FIELD_NAME', 'error');
		 */
		public $l10n = [];

		/**
		 * @var string Multiple words, can include spaces, visible when selecting a field type
		 */
		public $label;

		/**
		 * @var string Single word, no spaces. Underscores allowed
		 */
		public $name;

		/**
		 * @var bool
		 */
		public $public = true;

		/**
		 * @var string[] An array of JS head files that have to be loaded in the admin
		 *
		 * @example ['acf-fields/example.js']
		 */
		protected $adminScriptsFooter = [];

		/**
		 * @var string[] An array of JS head files that have to be loaded in the admin
		 *
		 * @example ['acf-fields/example.js']
		 */
		protected $adminScriptsHead = [];

		/**
		 * @var string[] An array of CSS files that have to be loaded in the admin
		 *
		 * @example ['acf-fields/example.css']
		 */
		protected $adminStyles = [];

		/**
		 * @var string
		 */
		protected $version = '1.0.0';

		/**
		 * ThemeModules constructor.
		 */
		public function __construct() {
			$this->label = baseTheme()->__( $this->label );

			// do not delete!
			parent::__construct();
		}

		/**
		 * This action is fired after a field is deleted from the database
		 *
		 * @param array $field The field array holding all the field options
		 *
		 * @return void
		 */
		public function delete_field( $field ): void {
		}

		/**
		 * This action is fired after a value has been deleted from the db.
		 * Please note that saving a blank value is treated as an update, not a delete
		 *
		 * @param mixed  $post_id The $post_id from which the value was deleted
		 * @param string $key     The $meta_key which the value was deleted
		 *
		 * @return void
		 */
		public function delete_value( $post_id, string $key ): void {
		}

		/**
		 * This action is called in the admin_enqueue_scripts action on the edit screen where your field is edited.
		 * Use this action to add CSS + JavaScript to assist your render_field_options() action.
		 *
		 * @return void
		 */
		public function field_group_admin_enqueue_scripts(): void {
		}

		/**
		 * This action is called in the admin_head action on the edit screen where your field is edited.
		 * Use this action to add CSS and JavaScript to assist your render_field_options() action.
		 *
		 * @return void
		 */
		public function field_group_admin_head() {
		}

		/**
		 * This filter is appied to the $value after it is loaded from the db and before it is returned to the template
		 *
		 * @param mixed $value   The value which was loaded from the database
		 * @param mixed $post_id The $post_id from which the value was loaded
		 * @param array $field   The field array holding all the field options
		 *
		 * @return mixed The modified value
		 */
		public function format_value( $value, $post_id, array $field ) {
			//Bail early if no value
			if ( empty( $value ) ) {
				return $value;
			}

			//Do stuff

			return $value;
		}

		/**
		 * This action is called in the admin_enqueue_scripts action on the edit screen where your field is created.
		 * Use this action to add CSS + JavaScript to assist your render_field() action.
		 *
		 * @return void
		 */
		public function input_admin_enqueue_scripts(): void {
			//Enqueue head scripts
			foreach ( $this->adminScriptsHead as $n => $adminScript ) {
				$adminScriptHandle = "acf-theme-{$this->name}-h-$n";
				$fileSource        = baseTheme()->childThemeRootDir() . '/assets/js/admin/' . $adminScript;
				$fileUrl           = baseTheme()->childThemeRootUri() . '/assets/js/admin/' . $adminScript;

				if ( is_readable( $fileSource ) ) {
					wp_enqueue_script( $adminScriptHandle, $fileUrl, [ 'acf-input' ], filemtime( $fileSource ) );
				}
			}

			//Enqueue footer scripts
			foreach ( $this->adminScriptsFooter as $n => $adminScript ) {
				$adminScriptHandle = "acf-theme-{$this->name}-f-$n";
				$fileSource        = baseTheme()->childThemeRootDir() . '/assets/js/admin/' . $adminScript;
				$fileUrl           = baseTheme()->childThemeRootUri() . '/assets/js/admin/' . $adminScript;

				if ( is_readable( $fileSource ) ) {
					wp_enqueue_script( $adminScriptHandle, $fileUrl, [ 'acf-input' ], filemtime( $fileSource ), true );
				}
			}

			//Enqueue styles
			foreach ( $this->adminStyles as $n => $adminStyle ) {
				$adminStyleHandle = "acf-theme-{$this->name}-$n";
				$fileSource       = baseTheme()->childThemeRootDir() . '/assets/css/admin/' . $adminStyle;
				$fileUrl          = baseTheme()->childThemeRootUri() . '/assets/css/admin/' . $adminStyle;

				if ( is_readable( $fileSource ) ) {
					wp_enqueue_style( $adminStyleHandle, $fileUrl, [ 'acf-input' ], filemtime( $fileSource ) );
				}
			}
		}

		/**
		 * This action is called in the admin_footer action on the edit screen where your field is created.
		 * Use this action to add CSS and JavaScript to assist your render_field() action.
		 *
		 * @return void
		 */
		public function input_admin_footer(): void {
		}

		/**
		 * This action is called in the admin_head action on the edit screen where your field is created.
		 * Use this action to add CSS and JavaScript to assist your render_field() action.
		 *
		 * @return void
		 */
		public function input_admin_head(): void {
		}

		/**
		 *  This function is called once on the 'input' page between the head and footer
		 *  There are 2 situations where ACF did not load during the 'acf/input_admin_enqueue_scripts' and
		 *  'acf/input_admin_head' actions because ACF did not know it was going to be used. These situations are
		 *  seen on comments / user edit forms on the front end. This function will always be called, and includes
		 *  $args that related to the current screen such as $args['post_id']
		 *
		 * @param array $args
		 *
		 * @return void
		 */
		public function input_form_data( array $args ): void {
		}

		/**
		 * This filter is applied to the $field after it is loaded from the database
		 *
		 * @param $field array The field array holding all the field options
		 *
		 * @return array
		 */
		public function load_field( $field ): array {
			return $field;
		}

		/**
		 * This filter is applied to the $value after it is loaded from the db
		 *
		 * @param mixed $value   The value found in the database
		 * @param mixed $post_id The $post_id from which the value was loaded
		 * @param array $field   The field array holding all the field options
		 *
		 * @return mixed
		 */
		public function load_value( $value, $post_id, array $field ) {
			return $value;
		}

		/**
		 * Create the HTML interface for your field
		 *
		 * @param array $field
		 *
		 * @return void
		 */
		abstract public function render_field( array $field ): void;

		/**
		 * Create extra settings for your field. These are visible when editing a field
		 *
		 * @param $field array The $field being edited
		 *
		 * @return void
		 */
		abstract public function render_field_settings( array $field ): void;

		/**
		 * This filter is applied to the $field before it is saved to the database
		 *
		 * @param array $field The field array holding all the field options
		 *
		 * @return array $field
		 */
		public function update_field( array $field ): array {
			return $field;
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
			return $value;
		}

		/**
		 * This filter is used to perform validation on the value prior to saving.
		 * All values are validated regardless of the field's required setting. This allows you to validate and return
		 * messages to the user if the value is not correct
		 *
		 * @param boolean $valid Validation status based on the value and the field's required setting
		 * @param mixed   $value The $_POST value
		 * @param array   $field The field array holding all the field options
		 * @param string  $input The corresponding input name for $_POST value
		 *
		 * @return bool
		 */
		public function validate_value( bool $valid, $value, array $field, string $input ): bool {
			//Do stuff

			return $valid;
		}
	}