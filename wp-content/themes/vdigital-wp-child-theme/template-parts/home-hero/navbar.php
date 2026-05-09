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

        <!-- CTA Button (Desktop) -->
        <div class="tw-hidden md:tw-flex tw-items-center tw-gap-4">
            <?php if ( ! empty( $ctaButton ) ) : ?>
                <?php Buttons::render( $ctaButton, 'hero_navbar_cta_' ); ?>
            <?php endif; ?>
        </div>

        <!-- Mobile Menu Toggle -->
        <div class="tw-flex md:tw-hidden tw-items-center">
            <button
                type="button"
                id="mobile_menu_toggle"
                class="tw-p-2 tw-text-white hover:tw-text-edge tw-transition-colors"
                aria-label="Toggle menu"
                aria-expanded="false"
            >
                <svg class="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path class="mobile-menu-open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    <path class="mobile-menu-close tw-hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    </div>

    <!-- Mobile Menu Panel -->
    <div id="mobile_menu_panel" class="tw-hidden md:tw-hidden tw-absolute tw-left-0 tw-right-0 tw-top-full tw-bg-core tw-border-t tw-border-white/10 tw-shadow-xl">
        <div class="tw-px-8 tw-py-6 tw-flex tw-flex-col tw-gap-4">
            <?php if ( ! empty( $navbarItems ) ) : ?>
                <?php foreach ( $navbarItems as $item ) : ?>
                    <?php if ( ! empty( $item['navbar_link'] ) ) : ?>
                        <a href="<?php echo esc_url($item['navbar_link']['url']); ?>"
                           target="<?php echo esc_attr($item['navbar_link']['target'] ?? '_self'); ?>"
                           class="tw-text-focus-90 tw-no-underline tw-text-[18px] hover:tw-text-edge tw-transition-colors tw-py-2">
                            <?php echo esc_html($item['navbar_link']['title']); ?>
                        </a>
                    <?php endif; ?>
                <?php endforeach; ?>
            <?php endif; ?>

            <?php if ( ! empty( $ctaButton ) ) : ?>
                <div class="tw-pt-4 tw-border-t tw-border-white/10">
                    <?php Buttons::render( $ctaButton, 'hero_navbar_cta_' ); ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</nav>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('home_hero_navbar');
    const mobileToggle = document.getElementById('mobile_menu_toggle');
    const mobilePanel = document.getElementById('mobile_menu_panel');
    const openIcon = mobileToggle?.querySelector('.mobile-menu-open');
    const closeIcon = mobileToggle?.querySelector('.mobile-menu-close');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('tw-bg-core', 'tw-shadow-lg', 'tw-py-4');
            navbar.classList.remove('tw-py-6');
        } else {
            navbar.classList.remove('tw-bg-core', 'tw-shadow-lg', 'tw-py-4');
            navbar.classList.add('tw-py-6');
        }
    });

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function() {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            mobilePanel.classList.toggle('tw-hidden');
            openIcon?.classList.toggle('tw-hidden');
            closeIcon?.classList.toggle('tw-hidden');

            // Add dark background when mobile menu is open
            if (!isExpanded) {
                navbar.classList.add('tw-bg-core', 'tw-shadow-lg');
            } else if (window.scrollY <= 50) {
                navbar.classList.remove('tw-bg-core', 'tw-shadow-lg');
            }
        });
    }
});
</script>


