<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'vdigital' );

/** Database username */
define( 'DB_USER', 'vdigital' );

/** Database password */
define( 'DB_PASSWORD', 'vdigital' );

/** Database hostname */
define( 'DB_HOST', 'db:3306' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

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
define( 'AUTH_KEY',         'wZRq X9$<h5Tc1ZM?<_9-`CH>o^@BrDeg5T94?yyk<AH&qV5!dgfZt>[1M<CYA1u' );
define( 'SECURE_AUTH_KEY',  'QUCGS.%|{zxn}GBV{|v0Y?f(kk*;!SNA^H<R[F;x+R te_1FIB,XoN(dHZ1FDz!0' );
define( 'LOGGED_IN_KEY',    'UT&Ky U:zWA`6%xX;Q~%xThTabVwcb*jv?L|fXC}!,x(TRKa&w#.#rJsiJd- dg8' );
define( 'NONCE_KEY',        '!wQ.Zg:)qUe>Li;;Ka!g]Pw/0Ys9aW~ !{gl3!W=b_Srn,gE*dR8IKPsM<+6Syi^' );
define( 'AUTH_SALT',        'V!84PglqS3z03/;y>BZv/Sq{@O{fsmPQjPb;*1J,OBqtQBzO K72HcO]Y~@a}E7x' );
define( 'SECURE_AUTH_SALT', 'm`080D?CI,r;z~N+&c}[8FH~YvV+toYq,I.w !7#B[ (2#9@P3k(UF{=3:`xis@t' );
define( 'LOGGED_IN_SALT',   'ZPI=$mwMn9~6rG~?DnR24Ho0-/IS(gI//hxzOYV7{1p]i4Vn$i4sG kCr}pX{Ok)' );
define( 'NONCE_SALT',       '~/RwVs)- Nvtuoe3I2O*1`K?>4(CGCLl?Mw*OC_pLwZBR}f6h6sg{=J^HEf13iZs' );

/* Multisite */
define( 'MULTISITE', true );
define( 'SUBDOMAIN_INSTALL', false );
define( 'PATH_CURRENT_SITE', '/' );
define( 'SITE_ID_CURRENT_SITE', 1 );
define( 'BLOG_ID_CURRENT_SITE', 1 );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

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
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */

// Increase upload limits
@ini_set( 'upload_max_filesize', '64M' );
@ini_set( 'post_max_size', '64M' );
@ini_set( 'max_execution_time', '300' );



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
