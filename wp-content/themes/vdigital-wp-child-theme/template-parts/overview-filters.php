<?php
$categories    = $args['categories'] ?? [];
$filterClasses = [
	'overview__filters__category md:tw-pb-2 tw-cursor-pointer tw-mr-8 md:tw-mr-0'
];
?>

<div class="tw-max-w-[1124px] tw-mx-0 tw-relative md:tw-mb-0 tw-z-20">

    <div class="overview__filters__mob input__select md:tw-hidden">
        <label><?php echo baseTheme()->__('Filter category') ?></label>
        <select name="overview__filters__mob" id="overview__filters__mob">
            <option value="all"><?php echo baseTheme()->__('Show all') ?></option>
            <?php foreach ( $categories as $index => $category ): ?>
                <option value="<?php echo $category->term_id; ?>"><?php echo $category->name; ?></option>
            <?php endforeach; ?>
        </select>
    </div>

    <div class="overview__filters tw-hidden md:tw-flex tw-flex-wrap tw-gap-5">
        <div class="overview__filters__wrapper tw-contents">
            <a class="btn button--blue <?php echo implode( ' ', $filterClasses ) ?>"
               data-category="all"><?php echo baseTheme()->__('Show all') ?></a>
            <?php foreach ( $categories as $index => $category ): ?>
                <a class="btn button--outline <?php echo implode( ' ', $filterClasses ) ?>"
                   data-category="<?php echo $category->term_id; ?>"><?php echo $category->name; ?></a>
            <?php endforeach; ?>
        </div>
    </div>
</div>