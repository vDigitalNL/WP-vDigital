# WP-Base-Theme

This is the Web Whales WordPress Base Theme version 2.0.

## Intro

This Base Theme is developed to help our WordPress developers build and develop websites fast and flexible. The Base Theme comes with a installer script, which installs a pre-packaged child theme. In this document you'll find instructions to install and use the theme from a developer perspective.

All development for a website should take place within the child theme. The base theme files should never be touched, except when developing new features for the base theme itself of course. When you require a change in the Base Theme, please [open an issue in Github](https://github.com/WebWhales/WP-Base-Theme/issues). An updated version of the Base Theme can then be installed on the websites.

This document refers to the base/parent theme folder and the child theme folder as respectively [base-theme] and [child-theme].

## Installation

To install the Base Theme (and the child theme), please follow these steps:
1. Download [the latest Base Theme release](https://github.com/WebWhales/WP-Base-Theme/releases) from GitHub.
1. Create an empty project folder
1. Create a folder `webwhales-wp-base-theme` and unzip the release file into that folder.
1. Run `php webwhales-wp-base-theme\install.php` on the terminal in the project folder and follow the instructions. This will:
   - download and install the latest version of WordPress 
   - put the Base Theme into the WordPress themes folder
   - unpack, install and activate the pre-packaged child theme
   - unpack some files to the root project folder
   - run `composer install` within the base theme folder
1. After installation, make sure you run `npm install` and `gulp assets`.

## Usage: The Basics
1. [Base theme vs child theme files][#base-theme-vs-child-theme-files]
1. [Theme  Options][#theme-options]
1. [Theme  Modules][#theme-modules]
1. [Front End: JavaScript][#front-end-javascript]
1. [Front End: Sass/CSS][#front-end-sass-css]
1. [Front End: Building Assets][#front-end-building-assets]

### Base theme vs child theme files
[#base-theme-vs-child-theme-files]: #base-theme-vs-child-theme-files

The base theme files contain all functionality of the same base theme across all websites using it. The base theme files should not be edited within the scope of one site. Child theme files can be edited within one website, except for a few files.

#### Editing the child theme files

Editing the following **child theme files** is **strictly prohibited**:
- `[child-theme]/inc/classes/ChildTheme.php`
- `[child-theme]/inc/classes/ChildTheme/AbstractClass.php`
- `[child-theme]/inc/classes/ChildTheme/ThemeModuleAbstractBaseClass.php.php`
- `[child-theme]/inc/autoload.php`
- `[child-theme]/inc/constants.php`
- `[child-theme]/resources/main.scss`
- `[child-theme]/functions.php`

### Theme options
[#theme-options]: #theme-options

The theme options are divided into base theme options and child theme options. Base theme options are present in every website, while child theme options are specific for one website.

The base theme options can be found in `[base-theme]/inc/classes/BaseTheme/Backend/ThemeOptions.php` (and may not be adjusted).
The child theme options can be found/placed/edited in `[child-theme]/inc/classes/BaseTheme/Backend/ThemeOptions.php`.

#### Storing theme options

Both base theme and child theme options are automatically saved in its own WP option into the database when a theme option page is being saved.

#### Retrieving theme options

Both base theme and child theme options are automatically loaded from their own WP option from the database when the themes are being initialized.

Theme options can be retrieved using the `getOption` method on either the `baseTheme` or the `childTheme` object. So both of the following function calls return the same value:
- `baseTheme()->getOption( 'section.option-name' )`
- `childTheme()->getOption( 'section.option-name' )`

### Theme Modules
[#theme-modules]: #theme-modules

Apart from the WordPress theme basics (blog system, WooCommerce etc.), is our theme split into theme modules. A module could for example contain a review system or a photo gallery. Developing these functionalities in theme modules keep them organized and easy to maintain. You can see theme modules as tiny plugins within the theme.

Modules are placed in the `[base-theme]/modules` or the `[child-theme]/modules` folder. Modules must contain a `module.json` file, which hold some basic details about the modules, like its name or version number. Theme modules can contain PHP code, as well as Sass and JavaScript files. The Sass and JavaScript files will be included in [the build process][#front-end-building-assets] automatically when they are enabled. 

Theme modules can be enabled or disabled in the theme options, or by editing `[base-theme]/modules.json` or the `[child-theme]/modules.json` file. When enabling or disabling a module, its status is saved to the correct `modules.json` file and thus the theme module statuses can be synchronized using version control.

See [the Wiki about Theme Modules](https://github.com/WebWhales/WP-Base-Theme/wiki/).

### Front End: JavaScript
[#front-end-javascript]: #front-end-javascript

Base theme JavaScript source files can be found in `[base-theme]/resources/js`; child theme JavaScript source files in `[child-theme]/resources/js`. Global JavaScript functions can be found and placed in the `functions` folder within the `js` folders.

For both the base theme and the child theme, there are two main JavaScript files: `header.js` and `footer.js`. They will be built and loaded in the frontend automatically.

#### Admin JavaScript files

The theme also support separate admin files. They are not needed to be combined, as they are just loaded in the admin area. These files can be placed in the `[base-theme]/resources/js/admin` and `[child-theme]/resources/js/admin` folders. When a file exists in both the base theme and child theme, the file in the child theme will be copied.

When running the build process, they will be copied to `[child-theme]/assets/js/admin`. Please note that these files will **not** be loaded in the frontend automatically.

### Front End: Sass/CSS
[#front-end-sass-css]: #front-end-sass-css

Base theme Sass source files can be found in `[base-theme]/resources/sass`; child theme Sass source files in `[child-theme]/resources/sass`.

For both the base theme and the child theme, there is one main Sass file: `main.scss`. Compiling the Sass files is being done in the following order:
- Base themes `main.scss`;
- Child themes `main.scss`;
- Base theme modules' `main.scss`;
- Child theme modules' `main.scss`.

After compiling the Sass files, CSS rules are split into the following files automatically based on the media queries' width and height values:
- `main.css` — will contain CSS rules:
  - within media queries where `min-width` is not greater than `576px`;
  - that do not belong to a media query, or that belong to media queries without `min-width` or `max-width` declarations;
- `tablet.css` — will contain CSS rules:
  - within media queries where `min-width >= 576px`, but `min-width` is not greater than `768px`;
  - within media queries where `min-width >= 576px` and `max-width < 768px`;
- `desktop.css` — will contain CSS rules within media queries where `min-width >= 768px`.

#### Admin Sass/CSS files

The theme also support separate admin files. They are not needed to be combined, as they are just loaded in the admin area. These files can be placed in the `[base-theme]/resources/sass/admin` and `[child-theme]/resources/sass/admin` folders. Each file will be processed separately, so be careful when including files in each other. When a file exists in both the base theme and child theme, the file in the child theme will overwrite the first one.

When running the build process, they will be copied to `[child-theme]/assets/css/admin`. Please note that these files will **not** be loaded in the frontend automatically. Admin Sass/CSS files are also **not** split based on media queries. Admin Sass/CSS files **will** be also minified on production environments.

### Front End: Building assets
[#front-end-building-assets]: #front-end-building-assets

Gulp is used for building/compiling JavaScript and Sass files. After installing the theme, a `gulpfile.js` file is copied to the project root. From the root, you can start the build process by running one of the following commands:
- `gulp assets:js` — start the JavaScript build process;
- `gulp assets:sass` — start the Sass build process;
- `gulp assets` — run both `gulp assets:js` and `gulp assets:sass`;
- `gulp watch` — watch for changes in `*.js` or `*.scss` files and start a JavaScript or Sass build process on when a file changes;
- `gulp` — run both `gulp assets` and `gulp watch`.

## Full documentation

For the full documentation, [see the Wiki of this repository](https://github.com/WebWhales/WP-Base-Theme/wiki).
