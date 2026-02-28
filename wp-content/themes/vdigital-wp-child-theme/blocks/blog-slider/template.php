<?php use ChildTheme\ChildTheme\Helpers\Acf\Buttons;

if (is_admin()) : ?>
    <h3><?php echo baseTheme()->__('Blog slider') ?></h3>
<?php endif; ?>
<?php

$items = get_field('items');
?>

<div class="blog-slider tw-flex tw-flex-col tw-gap-5 tw-items-start">
    <?php if (empty($items)) : ?>
        <div class="tw-text-red-500"><?php echo baseTheme()->__('No items found for the blog slider block. Please add some items.'); ?></div>
        <?php return; ?>
    <?php endif; ?>

    <div class="blog-slider__label <?php echo esc_html($items[0]['label']['color'] ?? ''); ?>"><?php echo esc_html($items[0]['label']['text'] ?? ''); ?></div>
    <div class="blog-slider__card tw-bg-white tw-p-[40px] tw-rounded-[20px] tw-flex tw-flex-col tw-gap-5">
        <div class="blog-slider__card__navigation tw-flex tw-flex-row tw-items-center tw-justify-between">
            <button class="btn button--navigate prev">←</button>
            <div class="dots tw-flex tw-flex-row tw-gap-[10px] tw-items-center">
                <?php foreach ($items as $item): ?>
                    <div class="dot tw-w-[10px] tw-h-[10px] tw-rounded-full tw-bg-horizon"></div>
                <?php endforeach; ?>
            </div>
            <button class="btn button--navigate next">→</button>
        </div>
        <div class="blog-slider__items">
            <?php foreach ($items as $item):
	            $button = $item['btn'];
                ?>
                <div class="wrapper">
                    <div class="blog-slider__items__item tw-select-none tw-flex tw-flex-col tw-gap-5" data-label="<?php echo esc_html($item['label']['text'] ?? ''); ?>" data-label-color="<?php echo esc_html($item['label']['color'] ?? ''); ?>">
                        <div class="blog-slider__items__item__title title--h2 tw-text-core ">
                            <?php echo esc_html($item['content_title'] ?? ''); ?>
                        </div>
                        <div class="blog-slider__items__item__description tw-text-core tw-text-sm lg:tw-text-base ">
                            <?php echo nl2br(esc_html($item['content_description'] ?? '')); ?>
                        </div>
                        <?php if ( ! empty( $button ) ) : ?>
                            <div class="<?php echo Buttons::DEFAULT_WRAPPER_CLASSES ?>">
                                <?php Buttons::render( $button, 'blog_slider_title_button_' ); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>