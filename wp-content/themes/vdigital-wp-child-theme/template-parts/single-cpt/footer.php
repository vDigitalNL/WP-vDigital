<?php
global $post;
$overviewUrl = $args['overviewUrl'] ?? false;
$overviewText = $args['overviewText'] ?? baseTheme()->__( 'All stories' );
$title = $args['title'] ?? baseTheme()->__( 'Other news' );
?>

<div class="tw-bg-gray-01">
    <div class="container--large tw-px-4 tw-pt-10 lg:tw-pt-[57px] tw-pb-10 lg:tw-pb-20">
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-10 lg:tw-mb-6">
            <h2 class="tw-font-bold tw-text-[32px] lg:tw-text-5xl tw-text-gray-black"><?php echo esc_html( $title ); ?></h2>
			<?php
           get_template_part( 'template-parts/buttons/transparent', 'arrow', [
				'url'   => $overviewUrl,
				'title' => $overviewText,
			] );
            ?>
        </div>
		<?php
            get_template_part( 'template-parts/single', 'cpt/recent', [
                'postType' => $post->post_type,
            ] );
		?>
    </div>
</div>