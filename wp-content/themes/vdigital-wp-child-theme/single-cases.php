<?php

use ChildTheme\ChildTheme\Helpers\Image;

get_header();
$overviewUrl = get_post_type_archive_link( 'cases' );
?>

<div class="outer-container single-case">
	<?php
	while ( have_posts() ) :
		the_post();

		$subtitle         = get_post_meta( get_the_ID(), 'case_subtitle', true );
		$clientName       = get_post_meta( get_the_ID(), 'case_client_name', true );
		$clientLogo       = get_field( 'case_client_logo' );
		$industry         = get_post_meta( get_the_ID(), 'case_industry', true );
		$excerpt          = get_post_meta( get_the_ID(), 'case_excerpt', true );
		$stats            = get_field( 'case_stats' ) ?: [];
		$tags             = get_field( 'case_tags' ) ?: [];
		$externalLinkUrl  = get_post_meta( get_the_ID(), 'case_external_link_url', true );
		$externalLinkText = get_post_meta( get_the_ID(), 'case_external_link_label', true ) ?: 'Visit Site';

		$bannerImage = Image::getImageUrl( get_field( 'case_banner_image' ) );
		$imageStyle  = ! empty( $bannerImage )
			? 'background-image: url(' . esc_url( $bannerImage ) . ')'
			: '';
		?>

		<div class="single-case__header tw-px-8 lg:tw-mx-auto break-container-padding tw-relative tw-max-w-[1512px] tw-bg-cover tw-bg-no-repeat tw-bg-center tw-py-16 md:tw-py-24" style="<?php echo $imageStyle; ?>">
			<div class="tw-absolute tw--inset-1 tw-z-0 tw-bg-core tw-opacity-90"></div>

			<div class="tw-mx-auto tw-max-w-[1200px] tw-z-20 tw-relative">
				<div class="tw-mb-8">
					<?php get_template_part( 'template-parts/buttons/back', '', [
						'url'   => $overviewUrl,
						'title' => baseTheme()->__( 'All Cases' ),
						'class' => '!tw-text-[1.25rem]',
					] ); ?>
				</div>

				<div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12 tw-items-start">
					<div class="tw-flex tw-flex-col tw-gap-6">
						<?php if ( $subtitle ) : ?>
							<span class="tw-text-edge tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wider">
								<?php echo esc_html( $subtitle ); ?>
							</span>
						<?php endif; ?>

						<h1 class="tw-text-focus tw-text-3xl md:tw-text-5xl tw-font-extrabold tw-m-0 tw-normal-case tw-tracking-normal">
							<?php the_title(); ?>
						</h1>

						<?php if ( $excerpt ) : ?>
							<p class="tw-text-focus-70 tw-text-lg tw-leading-relaxed tw-m-0">
								<?php echo esc_html( $excerpt ); ?>
							</p>
						<?php endif; ?>

						<?php if ( ! empty( $tags ) ) : ?>
							<div class="tw-flex tw-flex-wrap tw-gap-2">
								<?php foreach ( $tags as $tag ) : ?>
									<span class="tw-border tw-border-white tw-text-focus tw-text-sm tw-font-medium tw-px-4 tw-py-2 tw-rounded-full">
										<?php echo esc_html( $tag['case_tag_name'] ); ?>
									</span>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
					</div>

					<div class="tw-flex tw-flex-col tw-gap-5">
						<?php if ( ! empty( $stats ) ) : ?>
							<div class="tw-flex tw-flex-wrap tw-gap-3">
								<?php foreach ( $stats as $stat ) : ?>
									<div class="tw-bg-gradient-to-br tw-from-edge/20 tw-to-edge/5 tw-backdrop-blur-sm tw-rounded-2xl tw-px-5 tw-py-4 tw-border tw-border-edge/30 tw-flex-1 tw-min-w-[140px]">
										<span class="tw-text-focus tw-text-2xl tw-font-bold tw-block">
											<?php echo esc_html( $stat['case_stat_value'] ); ?>
										</span>
										<span class="tw-text-focus-70 tw-text-xs tw-uppercase tw-tracking-wider">
											<?php echo esc_html( $stat['case_stat_label'] ); ?>
										</span>
									</div>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>

						<?php if ( $clientName || $clientLogo || $industry ) : ?>
							<div class="tw-flex tw-items-start tw-gap-3 tw-pt-2">
								<?php if ( $clientLogo && is_array( $clientLogo ) ) : ?>
									<div class="tw-w-10 tw-h-10 tw-rounded-full tw-bg-white tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-flex-shrink-0">
										<img src="<?php echo esc_url( $clientLogo['url'] ); ?>"
										     alt="<?php echo esc_attr( $clientName ?: '' ); ?>"
										     class="tw-w-6 tw-h-6 tw-object-contain" />
									</div>
								<?php endif; ?>
								<div class="tw-flex tw-items-center tw-gap-2 tw-text-sm">
									<?php if ( $clientName ) : ?>
										<span class="tw-text-focus tw-font-medium"><?php echo esc_html( $clientName ); ?></span>
									<?php endif; ?>
									<?php if ( $clientName && $industry ) : ?>
										<span class="tw-text-mist">·</span>
									<?php endif; ?>
									<?php if ( $industry ) : ?>
										<span class="tw-text-mist"><?php echo esc_html( $industry ); ?></span>
									<?php endif; ?>
								</div>

								<?php if ( $externalLinkUrl ) : ?>
                                    <a href="<?php echo esc_url( $externalLinkUrl ); ?>"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       class="tw-ml-auto tw-inline-flex tw-items-center tw-gap-2.5 tw-px-6 tw-py-3 tw-bg-edge tw-text-core tw-font-semibold tw-text-sm tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-edge/90 hover:tw-shadow-lg hover:tw-shadow-edge/20 hover:tw--translate-y-0.5 tw-group tw-w-fit">
                                        <span><?php echo esc_html( $externalLinkText ); ?></span>
                                        <svg class="tw-w-4 tw-h-4 tw-transition-transform tw-duration-300 group-hover:tw-translate-x-0.5 group-hover:tw--translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                        </svg>
                                    </a>
								<?php endif; ?>
							</div>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>

		<div class="single-case__content tw-mx-auto tw-max-w-[1200px] tw-flex tw-flex-col tw-gap-10 tw-py-16 tw-text-focus">
			<?php the_content(); ?>
		</div>
	<?php
	endwhile;
	?>
</div>
<?php
get_sidebar();
get_footer();
