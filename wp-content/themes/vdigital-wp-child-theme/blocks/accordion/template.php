<?php if ( is_admin() ): ?>
    <h3><?php echo baseTheme()->__( 'Accordion block' ) ?></h3>
<?php endif;

$items = get_field( 'accordion_items' );
$schemaMarkup = get_field( 'accordion_schema_markup' );

if ($schemaMarkup === 'itemList') {
    foreach($items as $item) {
	    $markupClass = new \classes\Markup($item['accordion_title'], $item['accordion_content']);

	    echo '<script type="application/ld+json">';
	    echo json_encode($markupClass->getItemListSchemaMarkup(), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
	    echo '</script>';
    }
} elseif ($schemaMarkup === 'faq') {

    // Store FAQ questions globally to combine all FAQ blocks on the page
    global $global_faq_questions;

    if (!isset($global_faq_questions)) {
        $global_faq_questions = [];
    }

    foreach($items as $item) {
        $markupClass = new \classes\Markup($item['accordion_title'], $item['accordion_content']);
        $global_faq_questions[] = $markupClass->getFaqSchemaMarkup();
    }
}
?>

<div class="accordion tw-flex tw-flex-col">
	<?php foreach ( $items as $index => $item ) {
		$title   = $item['accordion_title'];
		$content = $item['accordion_content'];
		?>
        <div class="accordion__item tw-border-b tw-border-white font--dm-sans">
            <div class="accordion__item__header tw-cursor-pointer tw-h-[120px] tw-flex tw-justify-between tw-items-center ">
                <span class="accordion__item__header__label tw-min-h-[40px] tw-flex tw-justify-start tw-items-center tw-text-xl tw-text-white"><?php echo $title; ?></span>
                <button class="btn button--toggle accordion__item__header__icon-plus">+</button>
                <button class="btn button--toggle accordion__item__header__icon-minus tw-hidden">-</button>
            </div>
            <div class="accordion__item__body tw-pb-8 tw-hidden">
				<?php echo $content ?>
            </div>
        </div>
	<?php } ?>
</div>
