<?php

	namespace ChildTheme\ChildTheme;

	use ChildTheme\ChildTheme\General\AcfFields;
	use ChildTheme\ChildTheme\General\AcfGroups;
	use ChildTheme\ChildTheme\General\AutoNoIndex;
	use ChildTheme\ChildTheme\General\CategoryTagPagesPluginReplacement;
	use ChildTheme\ChildTheme\General\ImageSizes;
	use ChildTheme\ChildTheme\General\InfiniteScroll;
	use ChildTheme\ChildTheme\General\Menu;
	use ChildTheme\ChildTheme\General\Multisite;
	use ChildTheme\ChildTheme\General\MultisiteMediaLibrary;
	use ChildTheme\ChildTheme\General\Popup;
	use ChildTheme\ChildTheme\General\PostTypes;
	use ChildTheme\ChildTheme\General\RecaptchaV3;
	use ChildTheme\ChildTheme\General\RSSFeed;
	use ChildTheme\ChildTheme\General\Salesforce;
	use ChildTheme\ChildTheme\General\Search;
	use ChildTheme\ChildTheme\General\Taxonomy;
	use ChildTheme\ChildTheme\General\ThemeOptions;
	use ChildTheme\ChildTheme\General\TinyMCE;
	use ChildTheme\ChildTheme\General\Widgets;
	use ChildTheme\ChildTheme\General\Emojis;
	use Theme\BaseTheme\ThemeFlexClassTrait;

	/**
	 * Class General
	 *
	 * @package ChildTheme\ChildTheme
	 *
	 * @property-read AcfGroups $AcfGroups
	 * @property-read AcfFields $AcfFields
	 * @property-read ThemeOptions $ThemeOptions
	 * @property-read MultisiteMediaLibrary $MultisiteMediaLibrary
	 * @property-read General\GutenbergBlocks $GutenbergBlocks
	 * @property-read Widgets $Widgets
	 * @property-read Multisite $Multisite
     * @property-read Taxonomy $Taxonomy
     * @property-read RecaptchaV3 $RecaptchaV3
     * @property-read InfiniteScroll $InfiniteScroll
     * @property-read Menu $Menu
	 * @property-read RSSFeed $RSSFeed
	 * @property-read TinyMCE $TinyMCE
     * @property-read PostTypes $PostTypes
     * @property-read Search $Search
     * @property-read Popup $Popup
     * @property-read CategoryTagPagesPluginReplacement $CategoryTagPagesPluginReplacement
     * @property-read AutoNoIndex $AutoNoIndex
     * @property-read ImageSizes $ImageSizes
	 * @property-read Emojis $Emojis
	 */
	final class General extends AbstractClass {

		use ThemeFlexClassTrait;

        public static array $emailExtensionBlacklist = ['registry.godaddy', 'godaddy', 'registry'];

		public function init(): void {
			$this->AcfGroups->init();
			$this->AcfFields->init();
            $this->Taxonomy->init();
			$this->ImageSizes->init();
			$this->ThemeOptions->init();
			$this->MultisiteMediaLibrary->init();
			$this->Widgets->init();
			$this->GutenbergBlocks->init();
			$this->Multisite->init();
			$this->RecaptchaV3->init();
			$this->InfiniteScroll->init();
			$this->Menu->init();
			$this->RSSFeed->init();
			$this->TinyMCE->init();
            $this->PostTypes->init();
            $this->Search->init();
            $this->Popup->init();
			$this->CategoryTagPagesPluginReplacement->init();
			$this->AutoNoIndex->init();
			$this->Emojis->init();
		}
	}
