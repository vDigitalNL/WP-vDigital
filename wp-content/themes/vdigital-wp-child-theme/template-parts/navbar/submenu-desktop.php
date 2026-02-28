<?php

use ChildTheme\ChildTheme\Helpers\Menu;

$columns              = $args[ 'columns' ] ?? array(  );
$index                = $args[ 'index' ] ?? null;
$has_image_column     = ! empty( array_filter( array_column( $columns, 'navbar_submenu_column_type' ) ) );
$regular_column_width = $has_image_column ? 'tw-w-[19%] tw-max-w-[210px]' : 'tw-w-1/4';

?>
<div data-index="<?php echo $index; ?>"
    class="submenu tw-hidden  lg:tw-flex lg:tw-gap-[20px] lg:tw-invisible tw-transition-all tw-duration-500 tw-overflow-hidden tw-rounded-b-4xl tw-bg-shade tw-w-full tw-absolute tw-top-0 tw-m-auto tw-left-0 tw-right-0 tw-shadow-lg tw-z-10 tw-max-h-[400px] tw-max-w-[1512px]">
    <?php

foreach ( $columns as $column ) {
    if ( $column[ 'navbar_submenu_column_type' ] ) {?>

            <a href="<?php echo( $column[ 'navbar_submenu_image_link' ][ 'url' ] ?? '' ); ?>"
                target="<?php echo( $column[ 'navbar_submenu_image_link' ][ 'target' ] ?? '_self' ); ?>"
                class="submenu__column tw-bg-shade tw-py-0 tw-px-0 tw-mr-28 tw-flex tw-items-center tw-justify-center tw-w-[43%] tw-rounded-4xl tw-rounded-tl-none tw-rounded-tr-none">
                <div class="submenu__column__image tw-w-full tw-h-full tw-object-cover tw-bg-center tw-bg-cover tw-bg-no-repeat tw-p-6 tw-flex tw-justify-end tw-rounded-4xl tw-rounded-tl-none tw-rounded-tr-none
                gradient--default-overlay-images dark before:tw-rounded-b-[40px]
                ">

                    <img src="<?php echo wp_get_attachment_image_src( $column[ 'column_image' ][ 'id' ] ?? $column[ 'column_image' ], 'full' )[ 0 ]; ?>" onerror="this.src='data:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='" alt=""
                        class="tw-inset-0 tw-absolute tw-w-full tw-h-full tw-object-cover tw-rounded-t-[20px] tw-rounded-br-[42px] tw-rounded-b-[42px] tw-rounded-tl-none tw-rounded-tr-none tw-z-10 tw-bg-core">

                    <div class="submenu__column__link tw-flex tw-items-center tw-justify-between tw-mt-auto tw-mb-3 tw-mr-4 tw-z-20">
                        <?php

        if ( ! empty( $column[ 'navbar_submenu_image_link' ][ 'title' ] ) ): ?>
                            <span class="tw-text-white tw-text-base tw-font-light"><?php echo $column[ 'navbar_submenu_image_link' ][ 'title' ]; ?> →</span>
                        <?php endif; ?>
                    </div>
                </div>
            </a>
        <?php
continue;}

    ?>
        <div class="submenu__column tw-py-10 tw-pb-17 tw-flex tw-flex-col tw-gap-y-5 <?php echo $regular_column_width; ?>">
            <span class="submenu__column__title tw-block tw-text-white tw-font-bold tw-text-base tw-uppercase "><?php echo $column[ 'navbar_submenu_column_title' ]; ?></span>
            <div class="submenu__column__items tw-flex tw-flex-col tw-gap-y-3">
                <?php

    foreach ( $column[ 'navbar_submenu_items' ] as $columnItem ):

        if ( empty( $columnItem[ 'navbar_link' ] ) || empty( $columnItem[ 'navbar_link' ][ 'url' ] ) || empty( $columnItem[ 'navbar_link' ][ 'title' ] ) ) {
            continue;
        }

    ?>
                    <div class="submenu__column__items__item ">
                        <a class="tw-mb-3 tw-font-bold hover:tw-underline hover:tw-text-blue-01 tw-text-base tw-leading-[1.2] tw-block <?php echo( Menu::isCurrentPage( $columnItem[ 'navbar_link' ][ 'url' ] ) ? 'tw-text-blue-01' : '' ); ?>"
                            href="<?php echo $columnItem[ 'navbar_link' ][ 'url' ]; ?>"
                            target="<?php echo $columnItem[ 'navbar_link' ][ 'target' ]; ?>"><?php echo $columnItem[ 'navbar_link' ][ 'title' ]; ?></a>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php
}

?>
</div>