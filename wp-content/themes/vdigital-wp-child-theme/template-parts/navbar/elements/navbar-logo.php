<?php
$navbarLogo = $args['navbarLogo'] ?? null;
$homeUrl = get_home_url();
$linkLogoToHeader = $args['linkLogoToHeader'] ?? true;
$logoUrl = $navbarLogo['url'] ?? (is_numeric($navbarLogo) ? wp_get_attachment_image_src($navbarLogo)[0] ?? '' : '');
$logoLink = $linkLogoToHeader && is_front_page() ? $homeUrl . '#header' : $homeUrl;
?>

<a class="tw-mr-8 tw-flex-grow" href="<?php echo $logoLink; ?>">
    <link rel="preload"
          as="image"
          href="<?php echo $logoUrl ?>">
    <img width="343" height="58" class="tw-hidden lg:tw-block skip-lazy-load" src="<?php echo $logoUrl; ?>"
         alt="Logo vdigital"/>
    <img width="195" height="32" class="tw-block lg:tw-hidden skip-lazy-load" src="<?php echo $logoUrl; ?>"
         alt="Logo vdigital"/>
</a>
