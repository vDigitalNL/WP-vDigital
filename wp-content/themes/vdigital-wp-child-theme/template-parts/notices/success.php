<?php $message = $args['message'] ?? ''; ?>

<div class="tw-rounded-[10px] tw-overflow-hidden">
    <div class="tw-flex tw-items-center tw-border-growth tw-border-l-4 tw-bg-growth tw-p-3">
        <span class="tw-mr-[10px] font--dm-sans tw-text-lg tw-text-focus">✓</span>
        <span class="font--dm-sans tw-text-lg tw-text-focus"><?php echo $message ?></span>
    </div>
</div>