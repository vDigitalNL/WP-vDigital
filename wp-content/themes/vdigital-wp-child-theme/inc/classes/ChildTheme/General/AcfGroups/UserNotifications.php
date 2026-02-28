<?php

namespace ChildTheme\ChildTheme\General\AcfGroups;

use ChildTheme\ChildTheme\AbstractClass;

final class UserNotifications extends AbstractClass {
	public function init(): void {
		$this->baseTheme->addFilter('user_notifications/active', '__return_false' );
	}
}