<?php

	namespace Theme\Helpers;

	/**
	 * Class DatePeriodExtended
	 *
	 * @package Theme\Helpers
	 */
	class DatePeriodExtended extends \DatePeriod
	{
		/**
		 * @param null $from
		 *
		 * @return bool|\DateTimeImmutable
		 */
		public function getNextOccurrence($from = null)
		{
			$nextOccurrence = false;
			$fromTimestamp  = ! empty($from) && is_numeric($from) ? $from : strtotime(! empty($from) ? $from : 'now');

			foreach ($this as $datetime) {
				/**
				 * @var \DateTimeImmutable $datetime
				 */
				if ($datetime->getTimestamp() >= $fromTimestamp) {
					$nextOccurrence = $datetime;
					break;
				}
			}

			return $nextOccurrence;
		}
	}