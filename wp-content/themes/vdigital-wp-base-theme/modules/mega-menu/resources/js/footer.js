import jQuery from 'jquery';

if (jQuery(document).width() < 992) {
    jQuery('.main-menu-custom-walker > .menu-main-menu-container > ul > li.menu-item-has-children > a').click(
        function (e) {
            jQuery('.main-menu-custom-walker > .menu-main-menu-container > ul > li > a').not(this).removeClass('open');
            jQuery('.main-menu-custom-walker > .menu-main-menu-container > ul > li > a').not(this).next().removeClass('open');

            if (jQuery(this).hasClass('open')) {
                jQuery(this).removeClass('open');
                jQuery(this).next().removeClass('open');
            } else {
                jQuery(this).addClass('open');
                jQuery(this).next().addClass('open');
            }
        }
    );
} else {
    jQuery('.main-menu-custom-walker > .menu-main-menu-container > ul > li.menu-item-has-children > a').hover(
        function (e) {
            jQuery('.main-menu-custom-walker > .menu-main-menu-container > ul > li > a').not(this).removeClass('open');
            jQuery('.main-menu-custom-walker > .menu-main-menu-container > ul > li > a').not(this).next().removeClass('open');

            if (jQuery(this).hasClass('open')) {
                jQuery(this).removeClass('open');
                jQuery(this).next().removeClass('open');
            } else {
                jQuery(this).addClass('open');
                jQuery(this).next().addClass('open');
            }
        }
    );
}
