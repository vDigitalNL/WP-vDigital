<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$navbarOptions   = get_field( 'homehero_navbar', 'option' ) ?? [];
$navbarLogo      = $navbarOptions['navbar_logo'] ?? null;
$navbarItems     = $navbarOptions['navbar_items'] ?? [];
$ctaButton       = $navbarOptions['cta_button'] ?? [];

$logoUrl = '';
if (!empty($navbarLogo)) {
    $logoUrl = $navbarLogo['url'] ?? (is_numeric($navbarLogo) ? wp_get_attachment_image_src($navbarLogo, 'full')[0] ?? '' : '');
}
$homeUrl = get_home_url();

?>

<?php $navbarBgClass = is_front_page() ? '' : 'tw-bg-core tw-shadow-lg tw-py-6'; ?>
<?php $navbarPyClass = is_front_page() ? 'tw-py-6' : ''; ?>
<?php $adminBarOffset = is_admin_bar_showing() ? 'tw-top-8' : 'tw-top-0'; ?>
<nav id="home_hero_navbar" class="navbar-new font--jakarta tw-fixed <?php echo $adminBarOffset; ?> tw-left-0 tw-right-0 tw-z-50 <?php echo $navbarPyClass; ?> tw-px-8 tw-transition-all tw-duration-300 <?php echo $navbarBgClass; ?>">
    <div class="tw-mx-auto tw-max-w-[1200px] tw-flex tw-justify-between tw-items-center">
        <!-- Logo -->
        <?php if ( ! empty( $logoUrl ) ) : ?>
            <a href="<?php echo esc_url($homeUrl); ?>" class="tw-flex tw-items-center">
                <img src="<?php echo esc_url($logoUrl); ?>" alt="vDigital" class="tw-h-12 tw-block" />
            </a>
        <?php endif; ?>

        <!-- Menu -->
        <?php if ( ! empty( $navbarItems ) ) : ?>
            <div class="tw-hidden md:tw-flex tw-gap-10 tw-list-none tw-m-0 tw-p-0">
                <?php foreach ( $navbarItems as $item ) : ?>
                    <?php if ( ! empty( $item['navbar_link'] ) ) : ?>
                        <div>
                            <a href="<?php echo esc_url($item['navbar_link']['url']); ?>"
                               target="<?php echo esc_attr($item['navbar_link']['target'] ?? '_self'); ?>"
                               class="tw-text-focus-90 tw-no-underline tw-text-[20px] hover:tw-text-edge tw-transition-colors">
                                <?php echo esc_html($item['navbar_link']['title']); ?>
                            </a>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- CTA Button -->
        <?php if ( ! empty( $ctaButton ) ) : ?>
            <?php Buttons::render( $ctaButton, 'hero_navbar_cta_' ); ?>
        <?php endif; ?>
    </div>
</nav>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('home_hero_navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('tw-bg-core', 'tw-shadow-lg', 'tw-py-4');
            navbar.classList.remove('tw-py-6');
        } else {
            navbar.classList.remove('tw-bg-core', 'tw-shadow-lg', 'tw-py-4');
            navbar.classList.add('tw-py-6');
        }
    });
});
</script>


