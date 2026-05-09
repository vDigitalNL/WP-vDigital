<?php

	namespace Theme\BaseTheme\General;

	use Theme\BaseTheme\AbstractClass;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class AcfGroups
	 *
	 * @package Theme\BaseTheme\General
	 *
	 * @property-read AcfGroups\BodyClass         $BodyClass
	 * @property-read AcfGroups\UserNotifications $UserNotifications
	 * @property-read AcfGroups\FlexibleContentBox $FlexibleContentBox
	 */
	final class AcfGroups extends AbstractClass {

		use ThemeFlexClassTrait;

		public function init() {
			$this->BodyClass->init();
			$this->FlexibleContentBox->init();
			$this->UserNotifications->init();
		}
	}