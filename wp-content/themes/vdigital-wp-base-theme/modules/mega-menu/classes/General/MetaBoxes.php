<?php

    namespace Theme\Modules\MegaMenu\General;

	use Theme\BaseTheme;
    use Walker_Nav_Menu_Checklist;

    /**
	 * Class MetaBoxes
	 *
	 * @package Theme\BaseTheme\Backend
	 */
	final class MetaBoxes extends BaseTheme\AbstractClass {
		public function init() {
            add_action( 'admin_head-nav-menus.php', [ $this, 'register_column_meta_box_accordion_nav_menus' ] );
		}

        /**
         * Add column divider to menu builder
         */
        public function register_column_meta_box_accordion_nav_menus() {
            add_meta_box( 'column-meta-box', 'Add column', [ $this, 'render_column_meta_box_accordion_nav_menus' ], 'nav-menus', 'side' );
        }

        public function render_column_meta_box_accordion_nav_menus() {
            global $nav_menu_selected_id;

            $my_items = array(
                (object) array(
                    'ID' => 1001,
                    'db_id' => 0,
                    'menu_item_parent' => 0,
                    'object_id' => 1001,
                    'post_parent' => 0,
                    'type' => 'column-50',
                    'object' => 'column',
                    'title' => '1/2 column',
                    'url' => '',
                    'target' => '',
                    'attr_title' => '',
                    'description' => '',
                    'classes' => array(),
                    'xfn' => '',
                ),
                (object) array(
                    'ID' => 1002,
                    'db_id' => 1,
                    'menu_item_parent' => 0,
                    'object_id' => 1002,
                    'post_parent' => 0,
                    'type' => 'column-33',
                    'object' => 'column',
                    'title' => '1/3 column',
                    'url' => '',
                    'target' => '',
                    'attr_title' => '',
                    'description' => '',
                    'classes' => array(),
                    'xfn' => '',
                ),
                (object) array(
                    'ID' => 1003,
                    'db_id' => 2,
                    'menu_item_parent' => 0,
                    'object_id' => 1003,
                    'post_parent' => 0,
                    'type' => 'column-end',
                    'object' => 'column',
                    'title' => 'End column',
                    'url' => '',
                    'target' => '',
                    'attr_title' => '',
                    'description' => '',
                    'classes' => array(),
                    'xfn' => '',
                )
            );

            $walker = new Walker_Nav_Menu_Checklist();
            ?>
            <div id="columns-menu">
                <div id="tabs-panel-columns-menu-all" class="tabs-panel tabs-panel-active">
                    <ul id="columns-menu-checklist-pop" class="categorychecklist form-no-clear" >
                        <?php echo walk_nav_menu_tree( array_map( 'wp_setup_nav_menu_item', $my_items ), 0, (object) array( 'walker' => $walker ) ); ?>
                    </ul>

                    <p class="button-controls">
                        <span class="add-to-menu">
                            <input type="submit"<?php wp_nav_menu_disabled_check( $nav_menu_selected_id ); ?> class="button-secondary submit-add-to-menu right" value="<?php esc_attr_e( 'Add column' ); ?>" name="add-my-plugin-menu-item" id="submit-columns-menu" />
                            <span class="spinner"></span>
                        </span>
                    </p>
                </div>
            <?php
        }
	}