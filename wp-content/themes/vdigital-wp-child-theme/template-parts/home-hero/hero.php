<?php

use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

$contentOptions   = get_field('homehero_content', 'option') ?? [];
$heroTitle = $contentOptions['intro_line'] ?? 'We Build Custom Software That Drives Your Business Forward';
$heroDescription = $contentOptions['explanation_text'] ?? 'Transform your ideas into powerful web applications. We partner with ambitious companies to design, develop, and deploy scalable software solutions.';
$backgroundImage = $contentOptions['background_image'] ?? null;
$heroButtons = $contentOptions['buttons'] ?? [];

$backgroundImageUrl = '';
if ( ! empty( $backgroundImage ) && is_numeric( $backgroundImage ) ) {
    $backgroundImageUrl = wp_get_attachment_image_url( $backgroundImage, 'full' );
} elseif(!empty($backgroundImage) && is_array($backgroundImage)) {
    $backgroundImageUrl = $backgroundImage['url'];
}

?>

<!-- Navbar (fixed, outside hero flow) -->
<?php get_template_part('template-parts/home-hero/navbar'); ?>

<!-- Hero Section -->
<section id="home-hero" class="hero-section font--jakarta tw-relative tw-h-screen tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-py-32 tw-px-8">
    <!-- Background Image -->
    <?php if ( ! empty( $backgroundImageUrl ) ) : ?>
        <div class="tw-absolute tw-inset-0 tw-bg-cover tw-bg-center tw-bg-no-repeat" style="background-image: url('<?php echo esc_url($backgroundImageUrl); ?>');"></div>
    <?php endif; ?>
    
    <!-- Gradient Overlay (matching design: linear-gradient 135deg from core 92% to primary 85%) -->
    <div class="tw-absolute tw-inset-0" style="background: linear-gradient(135deg, rgba(8, 19, 40, 0.92) 0%, rgba(0, 76, 168, 0.85) 100%);"></div>
    
    <!-- Hero Content -->
    <div class="tw-relative tw-z-10 tw-max-w-[900px] tw-mx-auto tw-text-center">
        <!-- Badge -->
        <div class="tw-inline-flex tw-items-center tw-gap-2 tw-bg-white/10 tw-border tw-border-white/20 tw-rounded-full tw-px-5 tw-py-2 tw-mb-8">
            <span class="tw-w-2 tw-h-2 tw-bg-growth tw-rounded-full tw-animate-pulse"></span>
            <span class="tw-text-focus tw-text-sm tw-font-medium">10+ Years of Excellence in Software Development</span>
        </div>
        
        <!-- Title -->
        <h1 class="tw-text-focus tw-text-4xl md:tw-text-5xl lg:tw-text-[3.5rem] tw-font-extrabold tw-leading-tight tw-tracking-tight tw-mb-6 tw-normal-case">
            <?php echo wp_kses($heroTitle, wp_kses_allowed_html('post')); ?>
        </h1>
        
        <!-- Description -->
        <p class="tw-text-white/80 tw-text-lg md:tw-text-xl tw-leading-relaxed tw-max-w-[700px] tw-mx-auto tw-mb-10 tw-font-normal">
            <?php echo wp_kses($heroDescription, wp_kses_allowed_html('post')); ?>
        </p>
        
        <!-- Buttons -->
        <?php if ( ! empty( $heroButtons ) ) : ?>
            <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-4">
                <?php foreach ( $heroButtons as $button ) : ?>
                    <?php Buttons::render( $button, 'hero_content_buttons_' ); ?>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</section>