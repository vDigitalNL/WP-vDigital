<?php use ChildTheme\ChildTheme\Helpers\Acf\Buttons;
?>

<div class="salesforce_popup salesforce_popup_<?php echo $args['postId']; ?> tw-fixed tw-z-[100] tw-left-0 tw-top-0 tw-w-full tw-h-full tw-p-4 tw-bg-core-80 tw-flex tw-pt-4 tw-overflow-auto">
    <div class="salesforce_popup__wrapper tw-overflow-hidden tw-transition-all tw-max-w-[1124px] tw-ml-auto tw-mr-auto tw-bg-focus tw-rounded-[20px] tw-w-full tw-flex tw-flex-col lg:tw-flex-row lg:tw-mt-auto tw-mb-auto tw-relative <?php echo $_SERVER['REQUEST_METHOD'] === 'POST' && $args['isAjax'] !== true ? 'tw-hidden' : '' ?>">
        <button class="salesforce_popup__close tw-cursor-pointer tw-absolute btn button--close alternative tw-top-[10px] lg:tw-top-0 tw-right-[10px] lg:tw-right-[-60px]">✕</button>

        <div class="salesforce_popup__wrapper__left dyflexis_popup_content_container tw-overflow-hidden tw-w-full tw-pb-8 tw-px-8 tw-pt-10 lg:tw-w-1/2 lg:tw-py-20 lg:tw-px-15 tw-flex tw-flex-col tw-gap-y-6">
			<?php foreach ( $args['forms'] as $index => $form ) : ?>
				<?php
				$successMessage = $form['form_templates__download-form-inline_forms_success'] ?? [];
				?>

				<?php if ( ! empty( $successMessage ) ) :
					$imageLink = (object) $successMessage['form_templates__download-form-inline_forms_success_image_link'] ?? null;
					$buttonLeft = $successMessage['form_templates__download-form-inline_forms_success_button_left'] ?? [];
                    ?>
                    <div class="salesforce_submit_content" data-key="<?php echo $index ?>">
						<?php if ( ! empty( $successMessage['form_templates__download-form-inline_forms_success_title'] ) ) : ?>
                            <h2 class="tw-font-bold tw-mb-5 lg:tw-leading-10 !tw-text-core/2xl lg:tw-leading-10"><?php echo $successMessage['form_templates__download-form-inline_forms_success_title'] ?></h2>
						<?php endif; ?>
						<?php if ( ! empty( $successMessage['form_templates__download-form-inline_forms_success_description'] ) ) : ?>
                            <div class="tw-text-sm lg:tw-text-lg tw-text-gray-black">
								<?php echo $successMessage['form_templates__download-form-inline_forms_success_description'] ?>
                            </div>
						<?php endif; ?>
                    </div>

					<?php if ( ! empty( (array) $imageLink ) ): ?>
                    <a data-key="<?php echo $index ?>" href="<?php echo $imageLink->url ?? '#' ?>"
                       target="<?php echo $imageLink->target ?? '_self' ?>"
                       class="tw-w-full tw-mt-[46px] lg:tw-mt-auto tw-h-[300px] lg:tw-h-[430px] tw-object-cover tw-rounded-2xl tw-bg-center tw-bg-cover tw-bg-no-repeat tw-p-8 tw-flex salesforce_submit_content tw-hidden"
                       style="background-image: url('<?php echo wp_get_attachment_image_url( $successMessage['form_templates__download-form-inline_forms_success_image'], 'full' ) ?>')">
                        <div class="tw-flex tw-items-center tw-justify-between tw-mt-auto">
                            <span class="tw-text-white tw-text-xl tw-font-bold tw-pr-4"><?php echo $imageLink->title ?? '' ?></span>
                            <svg class="tw-w-10 tw-mt-auto" xmlns="http://www.w3.org/2000/svg" width="24"
                                 height="23.999" viewBox="0 0 24 23.999">
                                <path id="Exclusion_7" data-name="Exclusion 7"
                                      d="M2705,9402a12,12,0,1,1,8.485-3.515A11.922,11.922,0,0,1,2705,9402Zm-7.242-12.991a.73.73,0,0,0-.543.215.758.758,0,0,0,.543,1.3H2710.3l-3.717,3.717a.715.715,0,0,0-.2.519.753.753,0,0,0,1.291.546l5.007-5.01a.757.757,0,0,0,.177-.81.786.786,0,0,0-.177-.252l-5.033-5.033a.706.706,0,0,0-.519-.2.791.791,0,0,0-.543.2.782.782,0,0,0-.24.53.684.684,0,0,0,.215.531l3.742,3.745Z"
                                      transform="translate(-2693 -9378.001)" fill="#fff"></path>
                            </svg>
                        </div>
                    </a>
				<?php endif; ?>

					<?php if ( ! empty( $buttonLeft ) && isset( $buttonLeft[0] ) ):
                    ?>
                        <div class="tw-mt-8 lg:tw-mt-10">
                            <?php Buttons::render( $buttonLeft[0], 'form_templates__download-form-inline_forms_success_button_left_' ); ?>
                        </div>
                    <?php endif; ?>
				<?php endif; ?>

                <div data-key="<?php echo $index ?>" class="salesforce_popup__wrapper__left__text
                dyflexis_element_to_clone dyflexis_popup_hide_on_success salesforce_popup__content salesforce_form_content <?php echo( ! empty( $_GET['salesforce_submit'] ) ? 'tw-hidden' : '' ); ?>">
                    <h2 class="tw-text-gray-black tw-font-bold tw-mb-1 lg:tw-mb-5 tw-text-lg lg:tw-text-3-1/2xl lg:tw-leading-10"><?php echo $form['form_templates__download-form-inline_forms_title'] ?></h2>
                    <div class="tw-text-sm tw-mb-3 lg:tw-text-lg tw-text-gray-black">
						<?php echo $form['form_templates__download-form-inline_forms_description'] ?>
                    </div>
                </div>
			<?php endforeach; ?>
        </div>

		<?php foreach ( $args['forms'] as $index => $form ) : ?>
            <div data-key="<?php echo $index ?>"
                 class="salesforce_submit_content tw-w-full lg:tw-w-1/2 tw-bg-horizon tw-rounded-3xl tw-p-8 lg:tw-py-20 lg:tw-px-10 tw-hidden">
				<?php
				get_template_part( 'template-parts/notices/success', null, [
					'message' => baseTheme()->__( 'Your request has been sent' ) . '.'
				] );
				get_template_part( 'template-parts/popup/elements/results', null, ['getParams' => $args['getParams']] );
				?>
				<?php
                $buttonRight = $successMessage['form_templates__download-form-inline_forms_success_button_right'] ?? [];

				if ( ! empty( $buttonRight ) && isset( $buttonRight[0] ) ): ?>
                <div class="tw-mt-8 lg:tw-mt-10">
                    <?php Buttons::render( $buttonRight[0], 'form_templates__download-form-inline_forms_success_button_right_' ); ?>
                </div>
                <?php endif; ?>
			</div>

            <div data-key="<?php echo $index ?>" class="salesforce_popup__wrapper__right dyflexis_popup_hide_on_success md:tw-min-h-[760px] tw-flex
            dyflexis_popup_content_container custom__scrollbar--vertical tw-transition-all lg:tw-overflow-y-auto salesforce_popup__content salesforce_form_content tw-w-full lg:tw-w-1/2 tw-bg-horizon tw-rounded-3xl tw-rounded-tl-none tw-rounded-bl-[25px] lg:tw-rounded-bl-none tw-p-5 tw-pb-5 lg:tw-p-8 lg:tw-pt-14">
            </div>
		<?php endforeach; ?>
    </div>
</div>