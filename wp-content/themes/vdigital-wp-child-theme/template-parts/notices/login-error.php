<?php
/**
 * @var array $args ['title', 'text']
 */
?>

<div class="ww-login-error tw-bg-core tw-border-2 tw-mb-6 tw-border-warning tw-py-4 tw-px-5 tw-rounded-[25px] md:tw-max-w-[522px] tw-w-full tw-mb-4 tw-relative">
    <div class="tw-flex tw-gap-3">
        <span class="tw-flex-shrink-0 tw-mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                <path id="Path_607" data-name="Path 607"
                      d="M12,2A10,10,0,1,0,22,12,9.991,9.991,0,0,0,12,2Zm5,13.59L15.59,17,12,13.41,8.41,17,7,15.59,10.59,12,7,8.41,8.41,7,12,10.59,15.59,7,17,8.41,13.41,12Z"
                      transform="translate(-2 -2)" fill="#dc012d"/>
            </svg>
        </span>

        <div class="tw-flex-1 tw-text-white">
            <p class="!tw-font-bold tw-text-left tw-mb-2 tw-text-[18px] tw-leading-[1.2]"><?php echo esc_html( $args['title'] ); ?></p>
            <p class="tw-text-left tw-text-[16px] tw-leading-[1.4] tw-font-light"><?php echo esc_html( $args['text'] ); ?></p>
        </div>

        <button class="login-notice__close tw-flex-shrink-0 tw-self-start tw-text-white hover:tw-text-warning tw-transition tw-p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                <path d="M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41Z"
                      transform="translate(-2 -2)" fill="currentColor"/>
            </svg>
        </button>
    </div>
</div>