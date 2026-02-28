<?php
$image = get_field('field_video_image') ?? null;
if(!empty($image)) {
	$imageId = (is_array($image) && isset($image['ID'])) ? $image['ID'] : $image;
	$image = wp_get_attachment_image_src($imageId, 'full');
}

$imageMobile = get_field('field_video_image_mobile') ?? null;
if(!empty($imageMobile)) {
	$imageIdMobile = (is_array($imageMobile) && isset($imageMobile['ID'])) ? $imageMobile['ID'] : $imageMobile;
	$imageMobile = wp_get_attachment_image_src($imageIdMobile, 'full');
}

$videoUrl = get_field('field_video_link');
if (!empty($videoUrl)) {
    $videoUrl = ChildTheme\ChildTheme\Helpers\Youtube::processYouTubeUrl($videoUrl);
}

$isValidYouTubeUrl = preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $videoUrl);

?>

<div class="video">
	<?php if (is_admin()): ?>
        <h3><?php echo baseTheme()->__('Video block') ?></h3>
	<?php endif; ?>

    <div class="container tw-z-20 tw-flex tw-justify-center tw-items-center">
		<?php if(empty($videoUrl)): ?>
			<p class="tw-text-red-600"><?php echo baseTheme()->__('Please set a video URL'); ?></p>
		<?php else: ?>
        <div class="video__element tw-cursor-pointer tw-relative tw-rounded-[1.25rem] tw-min-w-[100px] tw-min-h-[100px]" data-video-url="<?php echo esc_attr($videoUrl); ?>" data-is-valid="<?php echo $isValidYouTubeUrl ? '1' : '0'; ?>" data-error-message="<?php echo esc_attr(baseTheme()->__('The video was not found.')); ?>">
			<?php if(!empty($imageMobile) && !empty($image)): ?>
                <img src="<?php echo esc_url($imageMobile[0]); ?>" alt="Video mobile image" class="video__element__image tw-block md:tw-hidden tw-rounded-[1.25rem]" loading="lazy" />
                <img src="<?php echo esc_url($image[0]); ?>" alt="Video image" class="video__element__image tw-hidden md:tw-block tw-rounded-[1.25rem]" loading="lazy" />
			<?php elseif(!empty($image)): ?>
                <img src="<?php echo esc_url($image[0]); ?>" alt="Video image" class="video__element__image video__element__image tw-rounded-[1.25rem]" loading="lazy"  />
			<?php endif; ?>

			
			<div class="video-btn tw-inset-0 tw-m-auto tw-absolute tw-flex tw-justify-center tw-items-center tw-scale-[65%] md:tw-scale-[85%] lg:tw-scale-100">
				<button class="btn button--play"> <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M18 10L-8.74228e-07 20L0 -7.86805e-07L18 10Z" fill="white"></path> </svg> </button>
			</div>

        </div>
		<?php endif; ?>
    </div>
</div>