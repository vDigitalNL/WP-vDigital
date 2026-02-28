<?php if (is_admin()): ?>
    <h3><?php echo baseTheme()->__('List block') ?></h3>
<?php endif; ?>
<?php

use ChildTheme\ChildTheme\Helpers\Acf\Padding;

$uspItems = get_field( 'small-usps_items' ) ?? [];

$classes = [
	Padding::getClassName( 'small-usps_padding_top' ),
	Padding::getClassName( 'small-usps_padding_bottom' ),
];

?>

<div class="small-usp-items tw-flex tw-flex-col <?php echo implode(' ', $classes); ?>">
	<?php foreach ($uspItems as $uspItem):
        $icon = match ($uspItem['small-usps_icon']) {
            'checkmark' => '<svg xmlns="http://www.w3.org/2000/svg" height="30" width="30" viewBox="0 0 512 512"><path opacity="1" fill="#32AA00" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM241 337l-17 17-17-17-80-80L161 223l63 63L351 159 385 193 241 337z"/></svg>',
            'cross' => '<svg xmlns="http://www.w3.org/2000/svg" height="30" width="30" viewBox="0 0 512 512"><path fill="#D30101" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
            default => 'checkmark',
        };

        ?>
		<div class="tw-flex tw-items-center tw-mb-3 tw-text-xl">
            <div class="tw-mr-3"><?php echo $icon; ?></div>
            <?php echo $uspItem['small-usps_text']; ?>
        </div>
	<?php endforeach; ?>
</div>
