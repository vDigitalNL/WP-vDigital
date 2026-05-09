<?php
/**
 * Created by PhpStorm.
 * User: Johan
 * Date: 8-6-2020
 * Time: 10:57
 */

namespace Theme\Modules\WoocommerceB2b\General;


use Theme\BaseTheme\ThemeModuleAbstractClass;
use Theme\Modules\WoocommerceB2b;

class PostTypes extends ThemeModuleAbstractClass
{

    /**
     * Init new custom post types
     */
    public function init()
    {
        add_action('init', function () {
            $this->themeModule->registerPostType(WoocommerceB2b::B2B_ROLE_POST_TYPE, [
                'label' => $this->baseTheme->__('B2B Customer Role'),
                'labels' => [
                    'name' => $this->baseTheme->__('B2B Customer Roles'),
                    'singular_name' => $this->baseTheme->__('B2B Customer Role'),
                ],
                'public' => true,
                'has_archive' => false,
                'publicly_queryable' => false,
            ]);
        });
    }
}