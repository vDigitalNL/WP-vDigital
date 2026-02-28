<?php

use ChildTheme\ChildTheme\Helpers\Menu;

$navbarOptions   = get_field( 'navbar', 'option' ) ?? [];
$navbarLogo      = $navbarOptions['navbar_logo'] ?? null;
$navbarLoginLink = $navbarOptions['navbar_login_link'] ?? null;
$navbarItems     = $navbarOptions['navbar_items'] ?? [];
$demoButton      = get_field( 'demo_button', 'option' ) ?? [];


?>

<div id="navbar" class="tw-bg-shade tw-w-full tw-relative tw-z-20 lg:tw-px-4">
    <div class="tw-mx-auto tw-max-w-[1352px] lg:md:tw-px-0 tw-px-10 sm:tw-px-10 tw-h-20 lg:tw-h-full tw-flex tw-items-center tw-w-full">
        <!-- Logo -->
        <?php if ( ! empty( $navbarLogo ) ) : ?>
            <?php get_template_part( 'template-parts/navbar/elements/navbar', 'logo', ['navbarLogo' => $navbarLogo]); ?>
        <?php endif; ?>

        <!-- Desktop menu -->
        <div class="menu--desktop tw-w-auto tw-h-full tw-hidden lg:tw-flex lg:tw-items-center tw-gap-x-[49px]">
            <?php if ( ! empty( $navbarItems ) ) : ?>
                <ul class="tw-ml-auto tw-flex tw-gap-x-[49px]">
                    <?php foreach ( $navbarItems as $index => $navbarItem ) : ?>
                        <?php if ( ! empty( $navbarItem['navbar_link'] && ! empty( $navbarItem['navbar_link']['title'] && ! empty( $navbarItem['navbar_link']['url'] ) ) ) )  : ?>
                            <?php
                            $class = '';
                            if ( ! empty( $navbarItem['navbar_submenu_columns'] ) ) {
                                $class = 'navbar-item--has-submenu';
                            }
                            $link = $navbarItem['navbar_link']['url'];

                            if ($link === '#') {
                                $link = '#header';
                            }

                            ?>
                            <li class="navbar-item <?php echo $class; ?> tw-group/nav-item tw-flex tw-items-center tw-py-12 <?php echo ( ! empty( $navbarItem['navbar_submenu_columns'] ) ) ? 'tw-cursor-default' : 'tw-cursor-pointer' ?>"
                                data-submenu-index="<?php echo $index ?>">
                                <a href="<?php echo $link; ?>"
                                   target="<?php echo $navbarItem['navbar_link']['target'] ?? '_self' ?>"
                                   class="tw-text-base tw-font-light group-hover/nav-item:tw-text-sky gray <?php echo( Menu::isCurrentPage( $navbarItem['navbar_link']['url'] ) ?
                                           '!tw-text-sky navbar-item__link--active' :
                                           '' ) ?> <?php echo ( ! empty( $navbarItem['navbar_submenu_columns'] ) ) ? 'tw-cursor-default' : '' ?>"><?php echo $navbarItem['navbar_link']['title']; ?></a>

                            </li>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>

            <?php if ( ! empty( $navbarLoginLink ) ) : ?>
                <a class="navbar__container__login-link gray hover:tw-text-growth tw-text-base tw-font-medium <?php echo( Menu::isCurrentPage( $navbarLoginLink['url'] ) ?
                        '!tw-text-sky' : '' ) ?>"
                   href="<?php echo $navbarLoginLink['url']; ?>"
                   target="<?php echo $navbarLoginLink['target'] ?>"><?php echo $navbarLoginLink['title'] ?></a>
            <?php endif; ?>
        </div>

        <!-- Mobile nav button -->
        <div class="tw-flex tw-items-center tw-justify-center tw-w-8 lg:tw-hidden tw-ml-auto">

            <svg class="mobile-menu-button--open tw-cursor-pointer" width="25" height="11" viewBox="0 0 25 11"
                 fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0.5" y1="0.5" x2="24.5" y2="0.5" stroke="white" stroke-linecap="round"/>
                <line x1="9.5" y1="5.5" x2="24.5" y2="5.5" stroke="white" stroke-linecap="round"/>
                <line x1="0.5" y1="10.5" x2="24.5" y2="10.5" stroke="white" stroke-linecap="round"/>
            </svg>

            <svg class="mobile-menu-button--close tw-cursor-pointer tw-text-3xl tw-hidden" width="17" height="17"
                 viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0.707107" y1="0.5" x2="16" y2="15.7929" stroke="white" stroke-linecap="round"/>
                <line x1="1" y1="15.7929" x2="16.2929" y2="0.500001" stroke="white" stroke-linecap="round"/>
            </svg>
        </div>
    </div>
</div>

<!-- Sliding content -->
<?php if ( ! empty( $navbarItems ) ) : ?>
    <?php foreach ( $navbarItems as $index => $navbarItem ) : ?>
        <?php if ( ! empty( $navbarItem['navbar_submenu_columns'] ) ) : ?>
            <?php get_template_part( 'template-parts/navbar/submenu-desktop', null, [
                    'columns' => $navbarItem['navbar_submenu_columns'],
                    'index'   => $index,
            ] ); ?>
        <?php endif; ?>
    <?php endforeach; ?>

    <?php get_template_part( 'template-parts/navbar/menu-mobile', null, [
            'navbarItems' => $navbarItems,
            'loginLink'   => $navbarLoginLink,
    ] ); ?>
<?php endif; ?>
