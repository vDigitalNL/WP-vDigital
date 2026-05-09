<?php

	namespace Theme\BaseTheme\General\ThemeOptions;

	/**
	 * Trait ThemeOptionFieldsTrait
	 *
	 * @package Theme\BaseTheme\General\ThemeOptions
	 *
	 * @property-read \Theme\BaseTheme baseTheme
	 */
	trait ThemeOptionFieldsTrait {

		/**
		 * @var array[]
		 */
		private $fields = [];

		/**
		 * @param array  $fields
		 * @param string $optionGroupKey
		 * @param string $optionFieldKey
		 *
		 * @return $this
		 */
		protected function addFields( array $fields, string $optionGroupKey, string $optionFieldKey ) {
			$fields           = $this->formatFields( $fields, $optionGroupKey, $optionFieldKey );
			$fieldKeys        = self::getAllKeys( $fields );
			$currentFieldKeys = self::getAllKeys( $this->fields );

			foreach ( $fieldKeys as $fieldKey ) {
				if ( \in_array( $fieldKey, $currentFieldKeys ) ) {
					throw new \UnexpectedValueException( "The field key '{$fieldKey}' already exists" );
				}

				$currentFieldKeys[] = $fieldKey;
			}

			$this->fields = array_merge( $this->fields, $fields );

			return $this;
		}

		/**
		 * @param string $optionGroupKey
		 * @param string $optionFieldKey
		 * @param string $tabLabel
		 *
		 * @return $this
		 */
		protected function addTab( string $tabLabel, string $optionGroupKey, string $optionFieldKey ) {
			$this->fields = array_merge( $this->fields, $this->formatFields( [
				[
					'key'               => $optionFieldKey,
					'label'             => $tabLabel,
					'type'              => 'tab',
					'required'          => 0,
					'conditional_logic' => 0,
					'placement'         => 'left',
					'endpoint'          => 0,
				]
			], $optionGroupKey, $optionFieldKey ) );

			return $this;
		}

		/**
		 * @return $this
		 */
		protected function registerFields() {
			foreach ( $this->fields as $field ) {
				\acf_add_local_field( $field );
			}

			return $this;
		}

		/**
		 * @param array  $fields
		 * @param string $optionGroupKey
		 * @param string $optionFieldKey
		 *
		 * @return array
		 */
		private function formatFields( array $fields, string $optionGroupKey, string $optionFieldKey ): array {
			foreach ( $fields as & $field ) {
				if ( $field['type'] !== 'tab' && \strpos( $field['key'], "{$optionFieldKey}__" ) !== 0 ) {
					$field['key'] = "{$optionFieldKey}__{$field['key']}";
				}

				$field['parent'] = $optionGroupKey;
				$field['name']   = $field['key'];

				if ( isset( $field['sub_fields'] ) && \is_array( $field['sub_fields'] ) ) {
					$field['sub_fields'] = $this->formatSubFields( $field['sub_fields'], $field['key'] );
				}

				unset( $field );
			}

			return $fields;
		}

		/**
		 * @param array  $fields
		 * @param string $optionFieldKey
		 *
		 * @return array
		 */
		private function formatSubFields( array $fields, string $optionFieldKey ): array {
			foreach ( $fields as & $field ) {
				if ( \strpos( $field['key'], $optionFieldKey ) !== 0 ) {
					$field['key'] = "{$optionFieldKey}__{$field['key']}";
				}

				$field['name'] = substr( $field['key'], \strlen( $optionFieldKey ) );

				if ( isset( $field['sub_fields'] ) && \is_array( $field['sub_fields'] ) ) {
					$field['sub_fields'] = $this->formatSubFields( $field['sub_fields'], $field['key'] );
				}

				unset( $field );
			}

			return $fields;
		}

		/**
		 * @param array[] $fields
		 *
		 * @return string[]
		 */
		private static function getAllKeys( array $fields ): array {
			$keys = [];

			foreach ( $fields as $field ) {
				if ( ! isset( $field['key'] ) ) {
					throw new \UnexpectedValueException( 'Field without key found' );
				}

				$keys[] = $field['key'];

				if ( ! empty( $field['sub_fields'] ) && \is_array( $field['sub_fields'] ) ) {
					$keys = \array_merge( $keys, self::getAllKeys( $field['sub_fields'] ) );
				}
			}

			return $keys;
		}
	}