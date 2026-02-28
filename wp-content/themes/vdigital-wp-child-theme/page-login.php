<?php
/**
 * Template Name: Login page
 * Template Post Type: page
 */

use classes\Glow;
use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

get_header();

$title       = baseTheme()->__( 'Login' );
$description = baseTheme()->__( 'Once a month, we send our customers the Release Radar. In this, we announce the most important updates for the coming month. This way, you’ll immediately know how to work smarter in Dyflexis and can inform your colleagues.' );
$placeholder = baseTheme()->__( 'System name (Company name)' );
$buttonText  = baseTheme()->__( 'To your system' );

$glowSrc   = Glow::getGradient( 'middle-blue-green' );
$glowClass = Glow::getCssClasses( 'middle-blue-green', 'right' );

$buttonClasses = Buttons::getButtonClass('');
$errorClasses = ( isset( $_POST['submit_url'] ) && ! empty( $_POST['wwlogin'] ) ) ||
                ( isset( $_POST['submit_url'] ) && empty( $_POST['wwlogin'] ) ) ? 'tw-border-red-01' : '';
?>

<div class="outer-container">
    <section class="login-section break-container-padding tw-bg-transparent tw-relative tw-min-h-[500px] lg:tw-min-h-[600px] tw-flex tw-items-center">
        <?php if ( ! empty( $glowSrc ) ): ?>
            <div class="tw-absolute <?php echo esc_attr( $glowClass ); ?> !tw-translate-y-[-38%]">
                <img src="<?php echo esc_url( $glowSrc ); ?>" class="tw-max-w-none" alt="" />
            </div>
        <?php endif; ?>

        <div class="tw-w-full tw-flex tw-flex-col tw-gap-y-8 tw-mx-auto tw-max-w-[1124px] tw-relative tw-py-20 container-padding-mobile lg:tw-px-0 tw-z-10">
            <div class="tw-block">
                <h1 class="tw-text-[32px] md:tw-text-8xl tw-leading-[.95] md:tw-leading-[.95] tw-text-white tw-m-0"><?php echo esc_html( $title ); ?></h1>
            </div>

            <!-- Two-column layout -->
            <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 lg:tw-gap-16 tw-items-start">
                <!-- Left column: Description -->
                <div class="tw-flex tw-w-full">
                    <p class="tw-text-xl tw-text-white tw-m-0">
                        <?php echo nl2br( esc_html( $description ) ); ?>
                    </p>
                </div>

                <!-- Right column: Input field, and Button -->
                <div class="tw-flex tw-flex-col lg:tw-pl-8 md:tw-max-w-[400px] lg:tw-max-w-none">
                    <form method="post" class="tw-w-full tw-relative" id="ww-login-form">
                        <input
                            type="text"
                            id="wwlogin"
                            name="wwlogin"
                            value="<?php echo isset( $_POST['wwlogin'] ) ? esc_attr( $_POST['wwlogin'] ) : ''; ?>"
                            placeholder="<?php echo esc_attr( $placeholder ); ?>"
                            class="login-form__input font--dm-sans tw-font-light tw-text-[18px] tw-leading-[1.2] tw-px-5 tw-py-[19px] tw-bg-core tw-border-2 tw-rounded-[25px] tw-border-mist tw-text-focus placeholder:tw-text-[#ffffff80] focus:placeholder:tw-text-focus focus:tw-outline-none focus:tw-border-edge tw-w-full tw-mb-5 <?php echo $errorClasses; ?>"
                        />

                        <?php if ( isset( $_POST['submit_url'] ) && ! empty( $_POST['wwlogin'] ) ): ?>
                            <?php echo get_template_part( 'template-parts/notices/login', 'error',
                                [ 'title' => baseTheme()->__( 'Unknown system name' ), 'text' => baseTheme()->__( 'Try again or ask your manager for the correct system name' ) ] ); ?>
                        <?php endif; ?>

                        <?php if ( isset( $_POST['submit_url'] ) && empty( $_POST['wwlogin'] ) ): ?>
                            <?php echo get_template_part( 'template-parts/notices/login', 'error', [ 'title' => baseTheme()->__( 'System name not filled in' ), 'text' => baseTheme()->__( 'A system name must be entered.' ) ] ); ?>
                        <?php endif; ?>

                        <button name="submit_url" class="login-form__submit btn <?php echo esc_attr( $buttonClasses ); ?> tw-w-full">
                            <?php echo esc_html( $buttonText ); ?>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <?php
    while ( have_posts() ) {
        the_post();
        get_template_part( 'template-parts/content', 'page' );
    }
    ?>
</div>

<?php
get_footer();