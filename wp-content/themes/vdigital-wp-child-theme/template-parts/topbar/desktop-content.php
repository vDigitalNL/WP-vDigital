<?php
use ChildTheme\ChildTheme\Helpers\Menu;

$topBarItems = get_field('topbar', 'option') ?? []; ?>

<ul class="tw-flex">
    <?php
    foreach ( $topBarItems['topbar_items'] ?? [] as $topBarItem ) { ?>

        <li class="tw-flex tw-items-center tw-text-white tw-text-sm tw-px-4">
            <a class="hover:tw-underline <?php echo (Menu::isCurrentPage( $topBarItem['topbar_link']['url'] ) ? 'tw-underline' : '') ?>"
               href="<?php echo $topBarItem['topbar_link']['url']; ?>"
               target="<?php echo $topBarItem['topbar_link']['target']; ?>"><?php echo $topBarItem['topbar_link']['title']; ?></a>
        </li>

        <?php
    } ?>
</ul>