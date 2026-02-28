<?php
$message     = $args['message'] ?? '';
$description = $args['description'] ?? '';
$classes     = $args['classes'] ?? [];
$formId      = $args['formId'] ?? null
?>

<div data-form-id="<?php echo $formId; ?>" class="error tw-rounded-md tw-overflow-hidden <?php echo implode( ', ', $classes ) ?>">
    <div class="tw-flex tw-border-red-01 tw-border-l-4 tw-bg-red-03 tw-p-3">
        <svg class="tw-mr-[10px]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path id="Path_607" data-name="Path 607"
                  d="M12,2A10,10,0,1,0,22,12,9.991,9.991,0,0,0,12,2Zm5,13.59L15.59,17,12,13.41,8.41,17,7,15.59,10.59,12,7,8.41,8.41,7,12,10.59,15.59,7,17,8.41,13.41,12Z"
                  transform="translate(-2 -2)" fill="#d30101"/>
        </svg>
        <div class="tw-flex tw-flex-col">
            <span class="tw-font-bold tw-text-black-01 tw-text-[15px]"><?php echo $message ?></span>
            <?php if ( ! empty( $description ) ) : ?>
            <span class="tw-text-black-01 tw-text-[15px] tw-mt-2"><?php echo $description ?></span>
            <?php endif; ?>
        </div>
    </div>
</div>