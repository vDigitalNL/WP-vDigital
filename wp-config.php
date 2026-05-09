<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wp_cjke9' );

/** Database username */
define( 'DB_USER', 'wp_4rhr9' );

/** Database password */
define( 'DB_PASSWORD', '#7@dl^0_c2U6#%uD' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', '~f[0Z&B2V(0~X@My4#WL8J]T]pUXn(@iJqY_3%#K3xC[6:;x/4k335n3@lw:]6fF');
define('SECURE_AUTH_KEY', 'c+VrKbsMj61|M+|6LvA]x71l~/~3k~t[1QWNdgMa#:hO7;Czx;&0+ylx5@V#N-!U');
define('LOGGED_IN_KEY', '4xcP|zF(c[luSj(7%pziM45@Nu%/#DpC]0J3:]|C0wk@01Ge6g%_;YXbK09G7Dbg');
define('NONCE_KEY', 'Cq1+!Z211[*8vOS(162Q~74kzCU1RV%aFVE|]+Uhl;g9S86A]d~fIoouuAB7Ut3M');
define('AUTH_SALT', '8Hb6b~dD*a9Y(@M09t5wVt[tk4#wf):6MH%i6&J9GX3j5k72O52~OY5c7|)DLm9w');
define('SECURE_AUTH_SALT', '~[e+]c60ene~/+;w;1#_eh-*pL-+Zt3p;EYPg-_QG:QS+N%K@ZGrY30a84D8S35q');
define('LOGGED_IN_SALT', ':05ks8c9+g5qnP8E89|Yfh7t_9D+@(9~]VY_bs#CG+6QW&gRn2a_&[Ii*]%@N)4E');
define('NONCE_SALT', 'bv&j2Azl92!)27L%/6)[6:)])UtW(7Ogo#:T108kZnqD&5m6A%-/~]K|;WyOu;+F');

/* Multisite */
define( 'MULTISITE', true );
define( 'SUBDOMAIN_INSTALL', false );
define( 'PATH_CURRENT_SITE', '/' );
define( 'SITE_ID_CURRENT_SITE', 2 );
define( 'BLOG_ID_CURRENT_SITE', 2 );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'aQNlH5YJ_';


/* Add any custom values between this line and the "stop editing" line. */

define('WP_ALLOW_MULTISITE', true);
/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'DOMAIN_CURRENT_SITE', 'vdigital.nl' );
define( 'DISALLOW_FILE_EDIT', true );
define( 'CONCATENATE_SCRIPTS', false );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
