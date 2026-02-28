<?php

use ChildTheme\ChildTheme\Frontend\LanguageSwitchNavWalker;
use ChildTheme\ChildTheme\Helpers\Menu;

$topBarItems = get_field('topbar', 'option') ?? [];
?>

<div id="topbar" class="tw-w-full tw-relative tw-z-30 tw-h-1 tw-overflow-hidden lg:tw-overflow-visible lg:tw-h-10 tw-transition-all lg:tw-px-4">
    <div class="gradient--blue-green tw-overflow-hidden tw-absolute tw-w-full tw-h-full tw-left-0 tw-top-0"></div>
    <div class="tw-mx-auto tw-max-w-[1352px] tw-relative tw-justify-end tw-z-10 tw-gap-x-[33px] tw-hidden lg:tw-flex">
        <ul class="tw-flex tw-gap-x-[33px]">
			<?php
			foreach ( $topBarItems['topbar_items'] ?: [] as $topBarItem ) { ?>

                <li class="tw-flex tw-items-center tw-text-white tw-text-base">
                    <a class="hover:tw-underline hover:!tw-text-white <?php echo (Menu::isCurrentPage( $topBarItem['topbar_link']['url'] ) ? 'tw-underline' : '') ?>"
                       href="<?php echo $topBarItem['topbar_link']['url']; ?>"
                       target="<?php echo $topBarItem['topbar_link']['target']; ?>"><?php echo $topBarItem['topbar_link']['title']; ?></a>
                </li>

				<?php
			} ?>
        </ul>

		<?php
		if ( has_nav_menu( 'language_switch' ) ) :
			wp_nav_menu( [
					'menu'           => 'language_switch',
					'theme_location' => 'language_switch',
					'depth'          => 4,
					'menu_class'     => 'tw-relative tw-justify-end tw-z-10 tw-hidden lg:tw-flex !tw-pl-0 ',
					'walker'         => new LanguageSwitchNavWalker()
				]
			);
		endif;
		?>
    </div>
</div>
