<?php
get_header();
?>

<div class="outer-container archive-cases">
	<section class="cases-archive font--jakarta tw-py-16 tw-bg-core">
		<div class="tw-mx-auto tw-max-w-[1200px]">
			<div class="tw-text-center tw-mb-12">
				<h1 class="tw-text-focus tw-text-3xl md:tw-text-5xl tw-font-extrabold tw-mb-4 tw-normal-case tw-tracking-normal">
					<?php echo baseTheme()->__( 'Case Studies' ); ?>
				</h1>
				<p class="tw-text-focus-70 tw-text-lg tw-max-w-[600px] tw-mx-auto tw-m-0">
					<?php echo baseTheme()->__( 'Discover how we help businesses transform their ideas into powerful digital solutions.' ); ?>
				</p>
			</div>

			<?php if ( have_posts() ) : ?>
				<div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
					<?php while ( have_posts() ) : the_post();
						$featuredImage = get_the_post_thumbnail_url( get_the_ID(), 'large' );
						$clientName    = get_post_meta( get_the_ID(), 'case_client_name', true );
						$industry      = get_post_meta( get_the_ID(), 'case_industry', true );
						$excerpt       = get_post_meta( get_the_ID(), 'case_excerpt', true );
						$tags          = get_field( 'case_tags' ) ?: [];
						$permalink     = get_permalink();
					?>
						<a href="<?php echo esc_url( $permalink ); ?>" class="case-card tw-group tw-bg-shade tw-rounded-2xl tw-overflow-hidden tw-border tw-border-mist/20 tw-transition-all tw-duration-300 hover:tw-border-edge/50 hover:tw--translate-y-1 tw-no-underline tw-block">
							<?php if ( $featuredImage ) : ?>
								<div class="tw-aspect-video tw-overflow-hidden">
									<img src="<?php echo esc_url( $featuredImage ); ?>"
									     alt="<?php echo esc_attr( get_the_title() ); ?>"
									     class="tw-w-full tw-h-full tw-object-cover tw-transition-transform tw-duration-300 group-hover:tw-scale-105" />
								</div>
							<?php endif; ?>

							<div class="tw-p-6">
								<?php if ( $clientName || $industry ) : ?>
									<div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
										<?php if ( $clientName ) : ?>
											<span class="tw-text-edge tw-text-sm tw-font-medium"><?php echo esc_html( $clientName ); ?></span>
										<?php endif; ?>
										<?php if ( $clientName && $industry ) : ?>
											<span class="tw-text-mist">•</span>
										<?php endif; ?>
										<?php if ( $industry ) : ?>
											<span class="tw-text-mist tw-text-sm"><?php echo esc_html( $industry ); ?></span>
										<?php endif; ?>
									</div>
								<?php endif; ?>

								<h2 class="tw-text-focus tw-text-xl tw-font-bold tw-mb-2 tw-normal-case tw-tracking-normal group-hover:tw-text-edge tw-transition-colors">
									<?php the_title(); ?>
								</h2>

								<?php if ( $excerpt ) : ?>
									<p class="tw-text-mist tw-text-sm tw-leading-relaxed tw-mb-4 tw-line-clamp-2">
										<?php echo esc_html( $excerpt ); ?>
									</p>
								<?php endif; ?>

								<?php if ( ! empty( $tags ) ) : ?>
									<div class="tw-flex tw-flex-wrap tw-gap-2 tw-mb-4">
										<?php foreach ( array_slice( $tags, 0, 3 ) as $tag ) : ?>
											<span class="tw-bg-core tw-text-focus tw-text-xs tw-font-medium tw-px-3 tw-py-1 tw-rounded-full">
												<?php echo esc_html( $tag['case_tag_name'] ); ?>
											</span>
										<?php endforeach; ?>
										<?php if ( count( $tags ) > 3 ) : ?>
											<span class="tw-text-mist tw-text-xs tw-font-medium tw-px-2 tw-py-1">
												+<?php echo count( $tags ) - 3; ?>
											</span>
										<?php endif; ?>
									</div>
								<?php endif; ?>

								<span class="tw-inline-flex tw-items-center tw-gap-2 tw-text-edge tw-text-sm tw-font-medium group-hover:tw-text-focus tw-transition-colors">
									<?php echo baseTheme()->__( 'View Case' ); ?>
									<svg class="tw-w-4 tw-h-4 tw-transition-transform group-hover:tw-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M7 17L17 7M17 7H7M17 7v10"/>
									</svg>
								</span>
							</div>
						</a>
					<?php endwhile; ?>
				</div>

				<div class="tw-mt-12">
					<?php
					the_posts_pagination( [
						'mid_size'  => 2,
						'prev_text' => '← ' . baseTheme()->__( 'Previous' ),
						'next_text' => baseTheme()->__( 'Next' ) . ' →',
						'class'     => 'tw-flex tw-justify-center tw-gap-2',
					] );
					?>
				</div>
			<?php else : ?>
				<p class="tw-text-center tw-text-mist tw-py-12">
					<?php echo baseTheme()->__( 'No cases found.' ); ?>
				</p>
			<?php endif; ?>
		</div>
	</section>
</div>

<?php
get_sidebar();
get_footer();
