<?php use ChildTheme\ChildTheme\Helpers\Acf\Buttons; ?>

<div class="salesforce_popup salesforce_popup_<?php echo $args['postId']; ?> tw-fixed tw-z-[100] tw-left-0 tw-top-0 tw-w-full tw-h-full tw-p-4 tw-bg-core-80 tw-flex tw-pt-4 tw-overflow-auto">
    <div class="salesforce_popup__wrapper tw-transition-all tw-max-w-[1124px] tw-ml-auto tw-mr-auto tw-bg-focus tw-rounded-[20px] tw-w-full tw-flex tw-flex-col lg:tw-flex-row lg:tw-mt-auto tw-mb-auto tw-relative <?php echo $_SERVER['REQUEST_METHOD'] === 'POST' && $args['isAjax'] !== true ? 'tw-hidden' : '' ?>">
        <button class="salesforce_popup__close tw-cursor-pointer tw-absolute btn button--close alternative tw-top-[10px] lg:tw-top-0 tw-right-[10px] lg:tw-right-[-60px]">✕</button>

        <div class="salesforce_popup__wrapper__left vdigital_popup_content_container tw-overflow-hidden tw-w-full tw-pb-8 tw-px-8 tw-pt-10 lg:tw-w-1/2 lg:tw-py-20 lg:tw-px-15 tw-flex tw-flex-col tw-gap-y-6">
            <?php foreach ( $args['forms'] as $index => $form ) : ?>
                <?php
                $successMessage = $form['form_templates_forms_success'] ?? [];
                ?>

                <?php if ( ! empty( $successMessage ) ) :
                    $imageLink = (object) $successMessage['form_templates_forms_success_image_link'] ?? (object) [];
                    ?>
                    <div class="salesforce_submit_content tw-hidden" data-key="<?php echo $index ?>">
                        <?php if ( ! empty( $successMessage['form_templates_forms_success_title'] ) ) : ?>
                            <h2 class="tw-font-bold tw-mb-5 lg:tw-leading-10 !tw-text-core"><?php echo $successMessage['form_templates_forms_success_title'] ?></h2>
                        <?php endif; ?>
                        <?php if ( ! empty( $successMessage['form_templates_forms_success_description'] ) ) : ?>
                            <div>
                                <?php echo $successMessage['form_templates_forms_success_description'] ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <a data-key="<?php echo $index ?>" href="<?php echo $imageLink->url ?? '#' ?>"
                       target="<?php echo $imageLink->target ?? '_self' ?>"
                       class="salesforce_submit_content lg:tw-max-h-[350px] tw-hidden tw-bg-shade tw-py-0 tw-px-0 tw-mr-28 tw-mb-[22px] lg:tw-mb-0 tw-mt-6 lg:tw-mt-auto tw-flex tw-items-center tw-justify-center tw-w-full tw-h-[300px] lg:tw-h-[430px] tw-rounded-4xl">
                        <div class="submenu__column__image gradient--default-overlay-images tw-w-full tw-h-full tw-object-cover tw-bg-center tw-bg-cover tw-bg-no-repeat tw-p-6 tw-flex tw-justify-end tw-rounded-4xl"
                             style="background-image: url('<?php echo wp_get_attachment_image_url( $successMessage['form_templates_forms_success_image']['id'] ?? $successMessage['form_templates_forms_success_image'], 'full' ) ?>')">
                            <div class="tw-flex tw-items-center tw-justify-between tw-mt-auto tw-mb-3 tw-mr-4 tw-z-20">
                                <span class="tw-text-white tw-text-base tw-font-light"><?php echo $imageLink->title ?? '' ?> →</span>
                            </div>
                        </div>
                    </a>
                <?php endif; ?>

                <?php if(!empty($form['form_templates_forms_success_small_enabled'])): ?>
                    <?php $successMessageSmall = $form['form_templates_forms_success_small']; ?>
                    <?php if ( ! empty( $successMessageSmall ) ) :
                        $imageLinkSmall = (object) $successMessageSmall['form_templates_forms_success_small_image_link'];
                        ?>

                        <div class="salesforce_submit_content_small tw-hidden" data-key="<?php echo $index ?>">
                            <?php if ( ! empty( $successMessageSmall['form_templates_forms_success_small_title'] ) ) : ?>
                                <h2 class="tw-font-bold tw-mb-5 lg:tw-leading-10 !tw-text-core"><?php echo $successMessageSmall['form_templates_forms_success_small_title'] ?></h2>
                            <?php endif; ?>
                            <?php if ( ! empty( $successMessageSmall['form_templates_forms_success_small_description'] ) ) : ?>
                                <div>
                                    <?php echo $successMessageSmall['form_templates_forms_success_small_description'] ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <a data-key="<?php echo $index ?>" href="<?php echo $imageLinkSmall->url ?? '#' ?>"
                           target="<?php echo $imageLinkSmall->target ?? '_self' ?>"
                           class="salesforce_submit_content_small tw-hidden tw-bg-shade tw-py-0 tw-px-0 tw-mr-28 tw-mb-[22px] lg:tw-mb-0 tw-mt-6 lg:tw-mt-auto tw-flex tw-items-center tw-justify-center tw-w-full tw-h-[300px] lg:tw-h-[430px] tw-rounded-4xl">
                            <div class="submenu__column__image gradient--default-overlay-images tw-w-full tw-h-full tw-object-cover tw-bg-center tw-bg-cover tw-bg-no-repeat tw-p-6 tw-flex tw-justify-end tw-rounded-4xl"
                                 style="background-image: url('<?php echo wp_get_attachment_image_url( $successMessageSmall['form_templates_forms_success_small_image']['id'] ?? $successMessageSmall['form_templates_forms_success_small_image'], 'full' ) ?>')">
                                <div class="tw-flex tw-items-center tw-justify-between tw-mt-auto tw-mb-3 tw-mr-4 tw-z-20">
                                    <span class="tw-text-white tw-text-base tw-font-light"><?php echo $imageLinkSmall->title ?? '' ?> →</span>
                                </div>
                            </div>
                        </a>
                    <?php endif; ?>
                <?php endif; ?>

                <div data-key="<?php echo $index ?>" class="salesforce_popup__wrapper__left__text
                vdigital_element_to_clone vdigital_popup_hide_on_success salesforce_popup__content salesforce_form_content tw-flex tw-flex-col tw-h-full <?php echo ( ! empty( $_GET['salesforce_submit'] ) ? 'tw-hidden' : '' ); ?>">
                    <h2 class="tw-font-bold tw-mb-1 lg:tw-mb-5"><?php echo $form['form_templates_forms_title'] ?></h2>
                    <div class="tw-mb-4">
                        <?php echo $form['form_templates_forms_description'] ?>
                    </div>

                    <?php if ( ! empty( $form['form_templates_forms_image'] ) ) : ?>
                        <div class="tw-hidden lg:tw-block">
                            <img class="salesforce_popup__wrapper__left__image tw-rounded-2xl tw-max-h-[300px]" src="<?php echo wp_get_attachment_image_url( $form['form_templates_forms_image'], 'full' ); ?>" alt="Image"/>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <?php foreach ( $args['forms'] as $index => $form ) : ?>
            <div data-key="<?php echo $index ?>" class="salesforce_submit_content tw-w-full lg:tw-w-1/2 tw-bg-horizon tw-rounded-3xl tw-p-8 lg:tw-py-20 lg:tw-px-10 tw-hidden">
                <?php
                get_template_part( 'template-parts/notices/success', null, [
                        'message' => baseTheme()->__('Your request has been sent') . '.'
                ] );
                get_template_part( 'template-parts/popup/elements/results', null, ['getParams' => $args['getParams']] );
                ?>

                <div class="tw-mt-5 tw-flex">
	                <?php
                    $button = $successMessage['form_templates_forms_success_button'] ?? null;
                    if ( is_array( $button ) ) {
                        Buttons::renderLink( $button, 'form_templates_forms_success_button_' );
	                } else {
		                $button = (object) $button;
		                if ( ! empty( $button ) && ! empty( $button->url ) && ! empty( $button->title ) ): ?>
                            <a href="<?php echo $button->url ?>"
                               target="<?php echo $button->target ?>"
                               class="tw-bg-blue-01 tw-text-white tw-w-full tw-cursor-pointer tw-py-3 tw-flex tw-justify-center tw-rounded tw-mt-8"><?php echo $button->title ?></a>
		                <?php endif;
	                }
	                ?>
                </div>
            </div>

            <?php if(!empty($form['form_templates_forms_success_small_enabled'])): ?>
                <?php $successMessageSmall = $form['form_templates_forms_success_small']; ?>
                <div data-key="<?php echo $index ?>" class="salesforce_submit_content_small tw-w-full lg:tw-w-1/2 tw-bg-horizon tw-rounded-3xl tw-p-8 lg:tw-p-14 tw-hidden">
                    <?php
                    get_template_part( 'template-parts/notices/success', null, [
                            'message' => baseTheme()->__('Your request has been sent') . '.'
                    ] );
                    get_template_part( 'template-parts/popup/elements/results', null, ['getParams' => $args['getParams']] );
                    ?>

                    <div class="tw-mt-5 tw-flex">
		                <?php
		                $button = $successMessageSmall['form_templates_forms_success_small_button'] ?? null;
		                if ( is_array( $button ) ) {
			                Buttons::renderLink( $button, 'form_templates_forms_success_small_button_' );
		                } else {
			                $button = (object) $button;
			                if ( ! empty( $button ) && ! empty( $button->url ) && ! empty( $button->title ) ): ?>
                                <a href="<?php echo $button->url ?>"
                                   target="<?php echo $button->target ?>"
                                   class="tw-bg-blue-01 tw-text-white tw-w-full tw-cursor-pointer tw-py-3 tw-flex tw-justify-center tw-rounded tw-mt-8"><?php echo $button->title ?></a>
			                <?php endif;
		                }
		                ?>
                    </div>
                </div>
            <?php endif; ?>

            <div data-key="<?php echo $index ?>" class="salesforce_popup__wrapper__right vdigital_popup_hide_on_success md:tw-min-h-[760px] tw-flex
            vdigital_popup_content_container custom__scrollbar--vertical tw-transition-all lg:tw-overflow-y-auto salesforce_popup__content salesforce_form_content tw-w-full lg:tw-w-1/2 tw-bg-horizon tw-rounded-3xl tw-rounded-tl-none tw-rounded-bl-[25px] lg:tw-rounded-bl-none tw-p-5 tw-pb-5 lg:tw-p-8 lg:tw-pt-14">
                <?php echo do_shortcode( "[salesforce form='". $form['form_templates_forms_form']. "']" ); ?>
            </div>
        <?php endforeach; ?>
    </div>
</div>
