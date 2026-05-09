# Changelog

All notable changes to this project will be documented in this file.


## Unreleased


<!--
### :warning: Updated packages

#### `installer/root.zip`

This package includes a new version of the `resources/packages/installer/root.zip` file, with updates to the following files:
- `gulpfile.js` - Make sure to merge it with the gulpfile in existing projects

#### `installer/wp-child-theme.zip`

This package includes a new version of the `resources/packages/installer/wp-child-theme.zip` file, with updates to the following files:
- `inc/classes/ChildTheme/Backend.php`
- `inc/classes/ChildTheme/ThemeOptions.php` - This file was deleted
- `inc/constants.php`
- `resources/sass/admin/acf-fields/.gitkeep` - This file was deleted
- `temporary-modules/.gitkeep`
- `style.css`


### Added


### Changed


### Deprecated


### Removed


### Fixed


### Security

-->


## [v1.3.1 - 2020-09-25](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.3.1)

### :warning: Updated packages

#### `installer/root.zip`

We added an extra package to fix a missing npm dependency.

This package includes a new version of the `resources/packages/installer/root.zip` file, with updates to the following files:
- `package.json` - Make sure to merge it with `package.json` in existing projects


---


### Fixed

- Fixed a small bug in SCSS where missing variables and a missing mixin would lead to errors in the gulp tasks.


## [v1.3.0 - 2020-09-21](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.3.0)

### :warning: Updated packages

#### `installer/root.zip`

We added a `languages` task for Gulp to generate PO and MO files that include language files from Theme Modules. This way, language files can be created for Theme Modules specifically. Make sure to checkout the docs to see how this works.

This package includes a new version of the `resources/packages/installer/root.zip` file, with updates to the following files:
- `gulpfile.js` - Make sure to merge it with `gulpfile.js` in existing projects
- `package.json` - Make sure to merge it with `package.json` in existing projects


---


### Added

- Added a filter `theme_options/header/sub_fields/navbar/color_scheme` to adjust what color schemes are available for the header nav bar.
- Added a filter `wordpress/tinymce/remove_wpautop` which gives a developer the choice whether to remove wpautop from the_content filter.
- Added an include to a template part `footer/branding.php` meant to include a agency branding to the website by default.
  - Do you want to have a custom branding file out of the box included in your release? Please provide us the correct content for this file!
- Added SVG support. It is disabled by default, but this can be enabled using the theme options.
- Added two new default company theme options that can be used for socal links: `company.instagram` and `company.twitter`.
- Added a folder named `acf-json` in the Child Theme by default, in order to use ACF fields sync function out of the box. This package includes a new version of the `resources/packages/themes/wp-child-theme.zip` file, which contains the file `acf-json/.gitkeep`.
- The usage of XML-RPC is now disabled by default. We've also added a theme option to enable XML-RPC again.
- The following theme modules are added to the Base Theme:
  - Logo Carousel - This module offers the functionality of logo carousels.
  - Pre Loader - This module enables the option of adding a pre-loader.
  - Visual Navigation Blocks - This module includes a flexible content block to add visual blocks.
  - WooCommerce Essentials - This module offers multiple functions to WooCommerce, such as templates, theme options, WooCommerce optimization et cetera.
  - Woocommerce Product Carousel - This module offers the functionality of product carousels.


### Changed

- Refactoring the default footer by removing the position absolutes and replacing it with a flexbox.
- The ACF Code Field assets are moved from the Child Theme to the Base Theme.
- Improved the default footer options.
- Improved the default footer CSS.
- Made some PHP functionalities of the theme options re-usable in (for example) theme modules of the child theme.


### Removed
- The pre loader functionality have been removed from the Base Theme core and can now be used by activating the Pre Loader theme module.
- Removed "top menu" since it's mostly not used. If you need it in your website, make sure to add it in the Child Theme.
- Removed some console logs that were added for development purposes in the past.


### Fixed

- Fixed a small bug where `$themeModule` in Theme Module templates would contain the wrong Theme Module instance when using a flexible content element (or another feature of a Theme Module) within another Theme Module.
- Fixed a potential bug where an error could be thrown when an option is requested using dot notation, where a part of the option key does not exists in the options.


## [v1.2.5 - 2020-08-18](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.2.5)

### :warning: Updated packages

#### `installer/root.zip`

We fixed a bug where jQuery from within node packages would ignore jQuery from WP, what caused node packages to use a different jQuery version than the JS code within the Base Theme and the Child Theme. Therefor, the `browserify-shim` package has been replaced by the `aliasify` package.

This package includes a new version of the `resources/packages/installer/root.zip` file, with updates to the following files:
- `gulpfile.js` - Make sure to merge it with `gulpfile.js` in existing projects
- `package.json` - Make sure to merge it with `package.json` in existing projects


---

### Added

- The `$themeModule` object is now available within post type templates (like `single-{post type}.php`) for post types
 that are registered using the `\Theme\BaseTheme\ThemeModuleAbstractBaseClass::registerPostType()` method.


### Fixed

- Fixed a bug in WP >= 5.5.0 where a new version of PHPMailer with a different namespace was introduced. This caused the
 Mail settings class to fail because of a broken type hint.


## [v1.2.4 - 2020-07-27](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.2.4)

### :warning: Updated packages

#### `installer/root.zip`

This package includes a new version of the `resources/packages/installer/root.zip` file, with updates to the following files:
- `.env`
- `.env.example`
- `.gitignore`
- `wp-content/.gitignore` - The new recommendation is now to include the Base Theme files in GitHub within your projects. This enabled you to use the Base Theme files in your CI/CD pipeline. 

---

### Added
- Added a "Columns" element to the Flexible Content Box that can be used to put Flexible Content Box elements into multiple columns.
- Added the module "WooCommerce B2B" which currently offers the possibility of granting discounts per user role. 
- Added the module "Content Divider" which offers the possibility to further distance content elements from eachother (vertically). 

### Fixed
- Changed a `remove_action` call to a filter for Yoast SEO plugin, to fix an error where a deprecated function was called.


## [v1.2.3 - 2020-07-15](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.2.3)

### :warning: Updated packages
#### `installer/wp-child-theme.zip`
This package includes a new version of the `resources/packages/installer/wp-child-theme.zip` file, with updates to the following files:
- `inc/classes/ChildTheme.php`


### Added
- Added a filter `user_notifications/active` which can be used to disable the usage of the User Notifications class.

  Right now this will disable the following notifications: "Do you want to make changes in the top area of the page?" & "Do you want to make changes in the top area of the page?", which link to the position where you can edit those sections.

  The default behaviour is that the User Notifications are enabled.
- Added a filter `custom_body_class_input/active` to disable displaying the custom body input field. When a custom body class is saved to the database, it will still be used in the frontend.
- Added a filter `custom_body_class_input/locations` to change the locations where the custom body input field is displayed.
- Added a filter `flexible_content_box/active` to disable the Flexible Content Section in the WP Admin.
- Added a filter `theme_options/active` to disable the Theme Options page in the WP Admin.

### Changed
- Improved the way agency admin users are being recognized.

### Fixed
- Fixed a bug where the admin would cause an error when there was no user with ID 1.


## [v1.2.2 - 2020-06-26](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.2.2)
### Module: Mega Menu
#### Added
- Added the possibility to load template parts before and after the menu.


## [v1.2.1 - 2020-06-26](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.2.1)
### Added
- Enabled overwriting of template parts from within the Temporary Modules.
- Added a way to request Theme Module objects through the `BaseTheme` class (and the `baseTheme()` helper function).

### Changed
- Split header and navbar to improve customization abilities (see `template-parts/header.php` and `template-parts/navbar.php`).
- Removed dotted styling from `abbr` elements with both a `title` attribute and a class `required`.
- Changed the way `search.php` is built up. The content is now placed within `template-parts/search.php`. This way the content of `search.php` is overwritable easily.

### Fixed
- Fixed a potential bug in `\Theme\BaseTheme\Backend\Admin::adminFooterText()` when providing `null` values.

### Module: Mega Menu
#### Added
- Added a navbar file to meet the changes in the Base Theme.


## [v1.2.0 - 2020-06-11](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.2.0)
### Added
- Added a sample module which meets the requirements of adding a module. Within this module the flexible content element is also used so this module can serve as a good example for the new modules.
- Added a Mega Menu module

### Fixed
- Fixed an issue within the function `\Theme\BaseTheme\Backend\ThemeOptions::updateAcfThemeOptionField()`. When a field type was equal to 'group' and had an array as input value(what happens when you have an terms ACF field). The array was flattened, this caused the theme setting to not be saved within the themes options. 
- Fixed an issue with the width of the html element. Padding wasn't the same left as right when using containers. I've commented the following line: `html{ width: calc(100% + (100vw - 100%)); }` within `resources/sass/source/base/_core.scss`

### Deleted
- Removed sample1, sample2, sample3 within the modules folder. These modules were outdated and not complete enough to serve any purpose.


## [v1.1.0 - 2020-05-13](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.1.0)
### Added
- Add the possiblity of working with flexible content blocks within pages, posts and any post type of preference.
  - This was something that we really needed to be able to easily add the developed module blocks.
  - Read more at [Using the Flexible Content Section](https://github.com/WebWhales/WP-Base-Theme/wiki/ACF#using-the-flexible-content-section). Here is an explanation of how to use the filters that enable you to hook into the available blocks within the flexible content section.

### Changed
- Template can now also be loaded from the `temporary-modules/*module_name*/templates/` folder within the child theme. Before this addition this could only be done from the basetheme `/modules/*module_name*/templates` or from the child `/modules/*module_name/templates` within the child theme. 
- The ACF group for user notifications has been placed within the action `init` otherwise this would have been loaded before all the other ACF fields(in this case the Flexible Content Section ACF fields).
- Adding a global vraible `$themModule` to the function `loadTemplateFile()`. This enables you to call functions like `$themeModule->Frontend->Typography->returnTitleByFormat();` from within module templates.

## [v1.0.0 - 2020-04-08](https://github.com/WebWhales/WP-Base-Theme/releases/tag/v1.0.0)

### :warning: Updated packages

#### `installer/root.zip`
This package includes a new version of the `resources/packages/installer/root.zip` file, with updates to the following files:
- `gulpfile.js` - Make sure to merge it with the gulpfile in existing projects

#### `installer/wp-child-theme.zip`
This package includes a new version of the `resources/packages/installer/wp-child-theme.zip` file, with updates to the following files:
- `inc/classes/ChildTheme/Backend.php`
- `inc/classes/ChildTheme/ThemeOptions.php` - This file was deleted
- `inc/constants.php`
- `resources/sass/admin/acf-fields/.gitkeep` - This file was deleted
- `temporary-modules/.gitkeep`
- `style.css`

### Added
- Add the possibility to work with temporary Base theme modules.
  - This gives developers a way to develop new Base Theme modules more easily and quickly.
  - Read more on the [Theme Module Development Wiki page](https://github.com/WebWhales/WP-Base-Theme/wiki/Theme-Module-Development).
- Add an easy and OOP way to work with WordPress images.
  - Read more on the [Images Wiki page](https://github.com/WebWhales/WP-Base-Theme/wiki/Images).
- Add a function to print picture HTML tags with support for multiple images for multiple breakpoints.
  - Read more on the [Images Wiki page](https://github.com/WebWhales/WP-Base-Theme/wiki/Images).
- For custom post types registered in a theme module, support for template files has been extended with support for `paged` template files.
  - Before this version, only `archived` and `single` template files were supported.
- A `Theme\Helpers\Cache` helper class is added as an in-memory cache storage.
  -  :warning: Avoid using the Cache helper in front end template files directly (or use it wisely), as its output will be cached when some sort of page caching is enabled.
- You can modify the Wonolog minimal logging level by using a `LOG_LEVEL` directive in the `.env` file.
- Show user notifications on all admin post edit pages to clarify where (client) admins can adjust (for example) the website header and footer.

### Changed
- Add a new root zip file package containing the latest
- `module.json` files are now stored as pretty-printed JSON files.
- All theme module statuses are now being saved to the `module.json` file in the Child Theme folder.
  - :warning: After upgrading to v1.0.0, you should save the Theme Modules configuration from the Theme Settings and remove the `modules.json` file from the Base Theme folder manually.
- The "Body class" input field is now used for all post types.
- The default Wonolog minimal logging level is set to `ERROR` on production environments, unless set in the `.env` file.
- Changed the usage of `acf_esc_attr()` to `acf_esc_attrs()` since the former is deprecated by ACF.

### Deprecated
- Storing the theme module statuses in the `module.json` file in the Base Theme folder, since all module statuses are now being saved to the `module.json` file in the Child Theme folder. Support for this file will be removed in a future version.

### Removed
- Removed the usage of PHP sessions.
- Removed the `Theme\Helpers\Session` class, since the usage of PHP sessions has been removed.
  - As a (kind of) replacement, the class `Theme\Helpers\Cache` has been added as an in-memory cache storage.
