<?php use ChildTheme\ChildTheme\General\Salesforce; ?>

<div class="tw-pt-12 tw-grid tw-gap-y-[22px] font--dm-sans tw-text-lg">
    <?php $salesforce = Salesforce::getInstance();
    if ( ! empty( $args['getParams']['salutation'] ) && $salutation = $salesforce->getFormattedSalutation( $args['getParams']['salutation'] ) ) : ?>
        <div class="tw-flex tw-flex-col tw-gap-y-[4px]">
            <span class="tw-font-bold tw-text-black-01"><?php echo baseTheme()->__('Salutation') ?></span>
            <span class="tw-text-black-01"><?php echo $salutation ?></span>
        </div>
    <?php endif; ?>

    <?php if ( ! empty( $args['getParams']['firstname'] ) && ! empty( $args['getParams']['lastname'] ) ) : ?>
        <div class="tw-flex tw-flex-col tw-gap-y-[4px]">
            <span class="tw-font-bold tw-text-black-01"><?php echo baseTheme()->__('Name') ?></span>
            <span class="tw-text-black-01"><?php echo urldecode($args['getParams']['firstname']) . ' ' . urldecode($args['getParams']['lastname']) ?></span>
        </div>
    <?php endif; ?>

    <?php if ( ! empty( $args['getParams']['email'] ) ) : ?>
        <div class="tw-flex tw-flex-col tw-gap-y-[4px]">
            <span class="tw-font-bold tw-text-black-01"><?php echo baseTheme()->__('E-mail') ?></span>
            <span class="tw-text-black-01"><?php echo urldecode($args['getParams']['email']) ?></span>
        </div>
    <?php endif; ?>

    <?php if ( ! empty( $args['getParams']['phone'] ) ) : ?>
        <div class="tw-flex tw-flex-col tw-gap-y-[4px]">
            <span class="tw-font-bold tw-text-black-01"><?php echo baseTheme()->__('Phone number') ?></span>
            <span class="tw-text-black-01"><?php echo $args['getParams']['phone'] ?></span>
        </div>
    <?php endif; ?>

    <?php if ( ! empty( $args['getParams']['company'] ) ) : ?>
        <div class="tw-flex tw-flex-col tw-gap-y-[4px]">
            <span class="tw-font-bold tw-text-black-01"><?php echo baseTheme()->__('Company name') ?></span>
            <span class="tw-text-black-01"><?php echo urldecode($args['getParams']['company']) ?></span>
        </div>
    <?php endif; ?>

    <?php if ( ! empty( $args['getParams']['industry'] ) ) : ?>
        <div class="tw-flex tw-flex-col tw-gap-y-[4px]">
            <span class="tw-font-bold tw-text-black-01"><?php echo baseTheme()->__('Sector') ?></span>
            <span class="tw-text-black-01"><?php echo Salesforce::getInstance()->getFormattedIndustry($args['getParams']['id'], $args['getParams']['industry'] ); ?></span>
        </div>
    <?php endif; ?>

    <?php if ( ! empty( $args['getParams']['employees'] ) && $employeeNumbers = $salesforce->getFormattedEmployeeNumbers($args['getParams']['id'], $args['getParams']['employees']) ) : ?>
        <div class="tw-flex tw-flex-col tw-gap-y-[4px]">
            <span class="tw-font-bold tw-text-black-01"><?php echo baseTheme()->__('Number of employees') ?></span>
            <span class="tw-text-black-01"><?php echo $employeeNumbers ?></span>
        </div>
    <?php endif; ?>
</div>
