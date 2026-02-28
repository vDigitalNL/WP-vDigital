<?php
    use ChildTheme\ChildTheme\Helpers\Acf\Title;

    /** @var array $args */

    $cssClasses = Title::getCssClasses($args['heading_type']);
?>

<<?php echo $args['heading_type']; ?> class="tw-text-center tw-font-bold tw-z-10 <?php echo $cssClasses; ?>">
<?php foreach ( $args['rows'] as $row ) : ?>
    <?php if ( ! $row['type'] ) : ?>
        <span class="tw-block"><?php echo $row['text'] ?></span>
    <?php endif; ?>
    <div class="tw-flex tw-justify-center tw-flex-wrap banner__title-row">
        <?php if ( $row['type'] ) : ?>
            <?php foreach ( $row['sections'] as $section ) : ?>
                <?php if ( ! $section['swapping'] || empty( $section['swap_texts'] ) ) : ?>
                    <span><?php echo $section['text'] ?></span>
                <?php else: ?>
                    <div class="tw-mx-3 tw-flex tw-flex-col tw-justify-center tw-items-center banner-title-slider">
                        <div class="tw-flex tw-flex-shrink-0 tw-whitespace-nowrap tw-pb-[14px] tw--mt-[1px]"><?php echo $section['text'] ?></div>

                        <?php if(!is_admin()): ?>
                            <?php foreach($section['swap_texts'] as $swapText): ?>
                                <div class="tw-flex tw-flex-shrink-0 tw-whitespace-nowrap tw-pb-[14px] tw--mt-[1px]">
                                    <?php echo $swapText; ?>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
<?php endforeach; ?>
</<?php echo $args['heading_type']; ?>>